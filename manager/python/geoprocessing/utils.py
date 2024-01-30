import logging
import os
import dramatiq.results
import psycopg2.pool
import dramatiq_pg

from osgeo import gdal, osr
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

pool = psycopg2.pool.ThreadedConnectionPool(
    8, 8, dsn=os.environ.get("DB_CONNECTION_STRING")
)
dramatiq.set_broker(
    dramatiq_pg.PostgresBroker(pool=pool, schema="public", table="geoprocessing_queue")
)


def init_gdal_config():
    logger.info("Initializing GDAL config")
    parsed_url = urlparse(os.environ.get("STORAGE_S3_ENDPOINT"))
    s3_endpoint = parsed_url.netloc if parsed_url.scheme else parsed_url.path

    gdal.AllRegister()
    gdal.UseExceptions()
    osr.UseExceptions()
    gdal.SetConfigOption("AWS_ACCESS_KEY_ID", os.environ.get("STORAGE_S3_KEY"))
    gdal.SetConfigOption("AWS_SECRET_ACCESS_KEY", os.environ.get("STORAGE_S3_SECRET"))
    gdal.SetConfigOption("AWS_S3_ENDPOINT", s3_endpoint)
    gdal.SetConfigOption("AWS_REGION", os.environ.get("STORAGE_S3_REGION"))
    gdal.SetConfigOption("AWS_HTTPS", "NO" if parsed_url.scheme == "http" else "YES")
    gdal.SetConfigOption(
        "AWS_VIRTUAL_HOSTING", "TRUE" if s3_endpoint == "s3.amazonaws.com" else "FALSE"
    )
    gdal.SetConfigOption("PG_USE_COPY", "YES")


def is_dev_mode():
    dev_mode = os.getenv(
        "DEV_MODE", "false"
    )  # Default to 'false' if the environment variable is not set
    return dev_mode.lower() == "true"


def create_bbox_polygon(lon_min, lat_min, lon_max, lat_max):
    # Define the polygon coordinates for the bounding box
    coordinates = [
        [
            [lon_min, lat_min],  # Bottom left
            [lon_min, lat_max],  # Top left
            [lon_max, lat_max],  # Top right
            [lon_max, lat_min],  # Bottom right
            [lon_min, lat_min],  # Closing the loop
        ]
    ]

    # Create a GeoJSON Polygon
    return {"type": "Polygon", "coordinates": coordinates}
