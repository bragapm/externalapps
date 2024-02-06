import os
import shutil
import traceback

import dramatiq
from osgeo import gdal

from lib.create_table import create_table_from_header_info
from lib.fill_table import fill_table_with_layer_feature
from lib.get_header_info import get_header_info
from lib.get_input_data import generate_local_temp_dir_path, generate_vrt_path
from lib.register_table import (
    register_table_to_directus,
)
from utils import pool, is_dev_mode, logger, init_gdal_config


@dramatiq.actor(store_results=True)
def transform(object_key, uploader, format_file, is_zipped, table_name, **kwargs):
    init_gdal_config()
    bucket = os.environ.get("STORAGE_S3_BUCKET")
    table_name = table_name or os.path.splitext(os.path.basename(object_key))[0]
    try:
        if not bucket:
            raise Exception("S3 bucket not configured")
        header_info, data_source = get_header_info(
            format_file, bucket, object_key, is_zipped, table_name
        )
        conn = pool.getconn()
        create_table_from_header_info(conn, header_info, table_name)
        fill_table_with_layer_feature(data_source, header_info, conn, table_name)
        register_table_to_directus(
            conn, table_name, header_info, uploader, not is_dev_mode()
        )
        pool.putconn(conn)
        return header_info
    except Exception as err:
        error_message = str(err)
        error_traceback = traceback.format_exc()  # This captures the full traceback
        logger.error(error_traceback)  # Log the full traceback
        return {"error": error_message, "traceback": error_traceback}
    finally:
        # cleanup
        temp_dir_path = generate_local_temp_dir_path(object_key)
        vrt_path = generate_vrt_path(object_key)
        if os.path.isdir(temp_dir_path):
            shutil.rmtree(temp_dir_path)
        if gdal.VSIStatL(vrt_path, gdal.VSI_STAT_EXISTS_FLAG):
            gdal.Unlink(vrt_path)
