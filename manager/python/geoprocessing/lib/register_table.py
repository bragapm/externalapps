import os
from urllib import request
from uuid import uuid4

from psycopg2.extras import Json

from utils import logger, create_bbox_polygon


def register_table_to_directus(
    conn, table_name, header_info, uploader, with_invalidate=True
):
    with conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO vector_tiles(layer_id, layer_name, geometry_type, user_created, bounds) VALUES(%s, %s, %s, %s, %s)",
                [
                    str(uuid4()),
                    table_name,
                    (
                        "MULTIPOLYGON"
                        if header_info["geom_name"] == "POLYGON"
                        else header_info["geom_name"]
                    ),
                    uploader,
                    Json(header_info["bbox"]),
                ],
            )
    logger.info("Register to vector_tiles")

    if with_invalidate:
        url = "http://directus:8055/utils/cache/clear?access_token=" + os.environ.get(
            "ADMIN_TOKEN", ""
        )
        request.urlopen(request.Request(url, method="POST"))
        logger.info("Clear directus table schema cache")


def register_raster_tile(
    conn,
    layer_id: str,
    raster_alias: str,
    lon_min: float,
    lat_min: float,
    lon_max: float,
    lat_max: float,
    z_min: int,
    z_max: int,
    uploader: str,
    is_terrain: bool,
):
    with conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO raster_tiles(layer_id, layer_alias, bounds, minzoom, maxzoom, terrain_rgb, user_created)
            VALUES(%s, %s, %s, %s, %s, %s, %s)""",
                [
                    layer_id,
                    raster_alias,
                    Json(create_bbox_polygon(lon_min, lat_min, lon_max, lat_max)),
                    z_min,
                    z_max,
                    is_terrain,
                    uploader,
                ],
            )
    logger.info("Register to raster tiles")


def register_3d_tile(conn, layer_id: str, three_d_alias: str, uploader: str):
    with conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO raster_tiles(layer_id, layer_alias, user_created)
            VALUES(%s, %s, %s)""",
                [layer_id, three_d_alias, uploader],
            )
