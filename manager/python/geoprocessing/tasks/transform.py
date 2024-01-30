import dramatiq
import os
import traceback

from utils import pool, is_dev_mode, logger, init_gdal_config
from lib.get_input_data import (
    delete_local_temp_dir,
)
from lib.get_header_info import (
    get_header_info,
)
from lib.create_table import create_table_from_header_info
from lib.fill_table import fill_table_with_layer_feature
from lib.register_table import (
    register_table_to_directus,
)


@dramatiq.actor(store_results=True)
def transform(
    object_key,
    uploader,
    format_file,
    is_zipped,
    table_name,
    bucket=os.environ.get("STORAGE_S3_BUCKET"),
    **kwargs,
):
    init_gdal_config()

    table_name = table_name or os.path.splitext(os.path.basename(object_key))[0]
    try:
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

        # Remove local file for xls file format
        if format_file == "xls":
            delete_local_temp_dir(object_key)

        return header_info

    except Exception as err:
        error_message = str(err)
        error_traceback = traceback.format_exc()  # This captures the full traceback
        logger.error(error_traceback)  # Log the full traceback
        return {"error": error_message, "traceback": error_traceback}
