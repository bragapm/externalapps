import logging
import os
from urllib import request
from psycopg2.extras import Json


logger = logging.getLogger(__name__)


def register_table_to_directus(
    conn, table_name, header_info, uploader, with_invalidate=True
):
    with conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO vector_tiles(layer_name, geometry_type, user_created, bounds) VALUES(%s, %s, %s, %s)",
                [
                    table_name,
                    "MULTIPOLYGON"
                    if header_info["geom_name"] == "POLYGON"
                    else header_info["geom_name"],
                    uploader,
                    Json(header_info["bbox"]),
                ],
            )
    logger.info("Register to vector_tiles")

    if with_invalidate:
        url = "http://directus:8055/utils/cache/clear?access_token=" + os.environ.get(
            "ADMIN_TOKEN"
        )
        request.urlopen(request.Request(url, method="POST"))
        logger.info("Clear directus table schema cache")


def insert_into_spatial_data_raster_tile_uploaded_list(
    conn,
    raster_id: str,
    raster_alias: str,
    lon_min: float,
    lat_min: float,
    lon_max: float,
    lat_max: float,
    z_min: int,
    z_max: int,
    uploader: str,
):
    with conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO spatial_data_raster_tile_uploaded_list(raster_id, raster_alias, lon_min, lat_min, lon_max, lat_max, z_min, z_max, user_created)
            VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                [
                    raster_id,
                    raster_alias,
                    lon_min,
                    lat_min,
                    lon_max,
                    lat_max,
                    z_min,
                    z_max,
                    uploader,
                ],
            )
    logger.info("Register to spatial_data_raster_tile_uploaded_list")
