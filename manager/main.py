import logging
import os
import pdb
import sys
import dramatiq.results
import psycopg2.pool
import dramatiq_pg
import traceback

from dotenv import load_dotenv

load_dotenv()

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
    insert_into_spatial_data_raster_tile_uploaded_list,
)
from lib.raster_tiling import raster_tiling


logger = logging.getLogger(__name__)

pool = psycopg2.pool.ThreadedConnectionPool(
    8, 8, dsn=os.environ.get("DB_CONNECTION_STRING")
)
dramatiq.set_broker(
    dramatiq_pg.PostgresBroker(pool=pool, schema="public", table="geoprocessing_queue")
)


def is_dev_mode():
    dev_mode = os.getenv(
        "DEV_MODE", "false"
    )  # Default to 'false' if the environment variable is not set
    return dev_mode.lower() == "true"


@dramatiq.actor(store_results=True)
def transform(
    object_key,
    uploader,
    format_file,
    is_zipped,
    bucket=os.environ.get("STORAGE_S3_BUCKET"),
    **kwargs,
):
    table_name = kwargs.get(
        "table_name", os.path.splitext(os.path.basename(object_key))[0]
    )
    try:
        header_info, dataSource = get_header_info(
            format_file, bucket, object_key, is_zipped, table_name
        )
        conn = pool.getconn()
        create_table_from_header_info(conn, header_info, table_name)
        fill_table_with_layer_feature(dataSource, header_info, conn, table_name)
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


@dramatiq.actor(store_results=True)
def tiling(
    object_key,
    uploader,
    raster_alias,
    min_zoom,
    max_zoom,
    bucket=os.environ.get("STORAGE_S3_BUCKET"),
    **kwargs,
):
    try:
        (raster_id, xmin, ymin, xmax, ymax) = raster_tiling(
            bucket, object_key, min_zoom, max_zoom
        )
        conn = pool.getconn()
        insert_into_spatial_data_raster_tile_uploaded_list(
            conn,
            raster_id,
            raster_alias,
            xmin,
            ymin,
            xmax,
            ymax,
            min_zoom,
            max_zoom,
            uploader,
        )
        pool.putconn(conn)
        return {
            "raster_id": raster_id,
            "lon_min": xmin,
            "lat_min": ymin,
            "lon_max": xmax,
            "lat_max": ymax,
        }

    except Exception as err:
        error_message = str(err)
        error_traceback = traceback.format_exc()
        logger.error(error_traceback)
        return {"error": error_message, "traceback": error_traceback}


def main():
    transform(
        uploader="4a2311b7-b442-4464-8235-bfd7e39234e7",
        is_zipped=True,
        object_key="9d329b75-0e5c-416d-b571-63f1009d8bc3.zip",
        table_name="sp_data_fasosum",
        format_file="shapefile",
    )


if "__main__" == __name__:
    logging.basicConfig(
        level=logging.DEBUG,
        format="%(levelname)1.1s: %(message)s",
    )

    try:
        exit(main())
    except (pdb.bdb.BdbQuit, KeyboardInterrupt):
        logger.info("Interrupted.")
    except Exception:
        logger.exception("Unhandled error:")
        if sys.stdout.isatty():
            logger.debug("Dropping in debugger.")
            pdb.post_mortem(sys.exc_info()[2])

    exit(os.EX_SOFTWARE)
