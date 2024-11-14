import os
import shutil
import traceback

import dramatiq
from dramatiq.middleware import TimeLimitExceeded
from osgeo import gdal

from lib.create_table import create_table_from_header_info
from lib.fill_table import fill_table_with_layer_feature
from lib.get_header_info import get_gdal_dataset, get_header_info_from_data_layer
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
    sanitize_table_name,
)


@dramatiq.actor(store_results=True)
def vector_transform(
    object_key: str,
    uploader: str,
    format_file: str,
    is_zipped: bool,
    table_name: str,
    additional_config: dict | None,
    **kwargs,
):
    conn = None
    try:
        init_gdal_config()
        bucket = os.environ.get("STORAGE_S3_BUCKET")
        if not bucket:
            raise Exception("S3 bucket not configured")
        table_name = table_name or os.path.splitext(os.path.basename(object_key))[0]
        dataset = get_gdal_dataset(
            format_file, bucket, object_key, is_zipped, table_name
        )

        layer_count = dataset.GetLayerCount()
        is_single_layer = layer_count == 1
        conn = pool.getconn()
        processed_tables = []
        error_tables = []
        for i in range(layer_count):
            try:
                layer = dataset.GetLayerByIndex(i)
                layer_name = layer.GetName()
                if layer_name == "layer_styles":
                    continue
                final_table_name = (
                    table_name
                    if is_single_layer
                    else sanitize_table_name(table_name + "_" + layer_name)
                )

                layer_header_info = get_header_info_from_data_layer(layer)
                create_table_from_header_info(conn, layer_header_info, final_table_name)
                fill_table_with_layer_feature(
                    layer,
                    layer_header_info,
                    conn,
                    final_table_name,
                    (
                        None
                        if additional_config is None
                        else additional_config.get("source_srs", None)
                    ),
                )
                register_table_to_directus(
                    conn,
                    final_table_name,
                    layer_header_info,
                    uploader,
                    additional_config,
                    not is_dev_mode(),
                )
                processed_tables.append(final_table_name)
            except Exception as e:
                # Log the error or handle it as needed, then continue with the next layer
                error_tables.append(final_table_name)
        return {"processed tables": processed_tables, "error tables": error_tables}
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
        if conn:
            pool.putconn(conn)
        temp_dir_path = generate_local_temp_dir_path(object_key)
        vrt_path = generate_vrt_path(object_key)
        if os.path.isdir(temp_dir_path):
            shutil.rmtree(temp_dir_path)
        if gdal.VSIStatL(vrt_path, gdal.VSI_STAT_EXISTS_FLAG):
            gdal.Unlink(vrt_path)
