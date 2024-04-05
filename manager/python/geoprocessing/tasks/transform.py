import os
import shutil
import traceback

import dramatiq
from dramatiq.middleware import TimeLimitExceeded
from osgeo import gdal

from lib.create_table import create_table_from_header_info
from lib.fill_table import fill_table_with_layer_feature
from lib.get_header_info import get_header_info
from lib.register_table import (
    register_table_to_directus,
)
from utils import (
    logger,
    pool,
    is_dev_mode,
    init_gdal_config,
    generate_local_temp_dir_path,
    generate_vrt_path,
)


@dramatiq.actor(store_results=True)
def transform(
    object_key: str,
    uploader: str,
    format_file: str,
    is_zipped: bool,
    table_name: str,
    additional_config: dict | None,
    **kwargs
):
    try:
        init_gdal_config()
        bucket = os.environ.get("STORAGE_S3_BUCKET")
        table_name = table_name or os.path.splitext(os.path.basename(object_key))[0]
        if not bucket:
            raise Exception("S3 bucket not configured")
        header_info, data_source = get_header_info(
            format_file, bucket, object_key, is_zipped, table_name
        )
        conn = pool.getconn()
        create_table_from_header_info(conn, header_info, table_name)
        fill_table_with_layer_feature(data_source, header_info, conn, table_name)
        register_table_to_directus(
            conn, table_name, header_info, uploader, additional_config, not is_dev_mode()
        )
        pool.putconn(conn)
        return header_info
    except Exception as err:
        error_traceback = traceback.format_exc()
        if isinstance(err, TimeLimitExceeded):
            error_message = "Time limit exceeded. File might be too big to process."
        else:
            error_message = str(err)
            logger.error(error_traceback)
        return {"error": error_message, "traceback": error_traceback}
    finally:
        # cleanup
        temp_dir_path = generate_local_temp_dir_path(object_key)
        vrt_path = generate_vrt_path(object_key)
        if os.path.isdir(temp_dir_path):
            shutil.rmtree(temp_dir_path)
        if gdal.VSIStatL(vrt_path, gdal.VSI_STAT_EXISTS_FLAG):
            gdal.Unlink(vrt_path)
