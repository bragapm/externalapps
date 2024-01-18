import os
import dramatiq.results
import traceback

from utils import pool, logger
from lib.register_table import (
    register_raster_tile,
)
from lib.raster_tiling import raster_tiling


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
