import logging
import os
import pdb
import sys
import dramatiq.results
import psycopg2.pool
import dramatiq_pg
import traceback
from osgeo import gdal
from urllib.parse import urlparse


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
    register_raster_tile,
)
from lib.raster_tiling import raster_tiling


logger = logging.getLogger(__name__)

pool = psycopg2.pool.ThreadedConnectionPool(
    8, 8, dsn=os.environ.get("DB_CONNECTION_STRING")
)
dramatiq.set_broker(
    dramatiq_pg.PostgresBroker(pool=pool, schema="public", table="geoprocessing_queue")
)

parsed_url = urlparse(os.environ.get("STORAGE_S3_ENDPOINT"))
s3_endpoint = parsed_url.netloc if parsed_url.scheme else parsed_url.path

# Set S3 configuration for GDAL
gdal.SetConfigOption("AWS_ACCESS_KEY_ID", os.environ.get("STORAGE_S3_KEY"))
gdal.SetConfigOption("AWS_SECRET_ACCESS_KEY", os.environ.get("STORAGE_S3_SECRET"))
gdal.SetConfigOption("AWS_S3_ENDPOINT", s3_endpoint)
gdal.SetConfigOption("AWS_REGION", os.environ.get("STORAGE_S3_REGION"))
gdal.SetConfigOption("AWS_HTTPS", "NO" if parsed_url.scheme == "http" else "YES")
gdal.SetConfigOption(
    "AWS_VIRTUAL_HOSTING", "TRUE" if s3_endpoint == "s3.amazonaws.com" else "FALSE"
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


@dramatiq.actor(store_results=True)
def tiling(
    object_key,
    uploader,
    raster_alias,
    min_zoom,
    max_zoom,
    bucket=os.environ.get("STORAGE_S3_BUCKET"),
):
    try:
        (raster_id, xmin, ymin, xmax, ymax) = raster_tiling(
            bucket, object_key, min_zoom, max_zoom
        )
        conn = pool.getconn()
        register_raster_tile(
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
    tiling(
        object_key="b0e271ae-8d03-4810-b7ea-7f409cfff2f2.tif",
        uploader="49015332-8717-411c-bb40-b589d4273a8a",
        raster_alias="raster_bali13",
        min_zoom=5,
        max_zoom=15,
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
