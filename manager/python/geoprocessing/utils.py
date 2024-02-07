import dramatiq_pg
import dramatiq.results
import logging
import os
import psycopg2.pool

from dotenv import load_dotenv
from minio import Minio
from osgeo import gdal
from urllib.parse import urlparse

load_dotenv()

logger = logging.getLogger(__name__)

pool = psycopg2.pool.ThreadedConnectionPool(
    8, 8, dsn=os.environ.get("DB_CONNECTION_STRING")
)
dramatiq.set_broker(
    dramatiq_pg.PostgresBroker(pool=pool, schema="public", table="geoprocessing_queue")
)

urlparsed_s3_endpoint = urlparse(os.environ.get("STORAGE_S3_ENDPOINT", ""))
s3_endpoint = (
    urlparsed_s3_endpoint.netloc
    if urlparsed_s3_endpoint.scheme
    else urlparsed_s3_endpoint.path
)

minio_client = Minio(
    endpoint=s3_endpoint,
    access_key=os.environ.get("STORAGE_S3_KEY"),
    secret_key=os.environ.get("STORAGE_S3_SECRET"),
    region=os.environ.get("STORAGE_S3_REGION"),
    secure=False if urlparsed_s3_endpoint.scheme == "http" else True,
)


def init_gdal_config():
    logger.info("Initializing GDAL config")

    gdal.AllRegister()
    gdal.UseExceptions()
    gdal.SetConfigOption("AWS_ACCESS_KEY_ID", os.environ.get("STORAGE_S3_KEY"))
    gdal.SetConfigOption("AWS_SECRET_ACCESS_KEY", os.environ.get("STORAGE_S3_SECRET"))
    gdal.SetConfigOption("AWS_S3_ENDPOINT", s3_endpoint)
    gdal.SetConfigOption("AWS_REGION", os.environ.get("STORAGE_S3_REGION"))
    gdal.SetConfigOption(
        "AWS_HTTPS", "NO" if urlparsed_s3_endpoint.scheme == "http" else "YES"
    )
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


def generate_local_temp_dir_path(object_key: str):
    return os.path.join("/tmp", f"geodashboard_{object_key}")


def generate_vrt_path(object_key: str):
    return f"/vsimem/{object_key}.vrt"
