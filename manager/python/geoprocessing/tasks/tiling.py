import os
import dramatiq.results
import traceback

from utils import pool, logger, init_gdal_config
from lib.register_table import (
    register_raster_tile,
)
from lib.raster_tiling import raster_tiling


@dramatiq.actor(store_results=True)
def tiling(
    object_key,
    uploader,
    raster_alias,
    minzoom,
    maxzoom,
    bucket=os.environ.get("STORAGE_S3_BUCKET"),
    **kwargs,
):
    init_gdal_config()
    try:
        (layer_id, xmin, ymin, xmax, ymax, minzoom, maxzoom) = raster_tiling(
            bucket, object_key, minzoom, maxzoom
        )
        conn = pool.getconn()
        register_raster_tile(
            conn,
            layer_id,
            raster_alias,
            xmin,
            ymin,
            xmax,
            ymax,
            minzoom,
            maxzoom,
            uploader,
        )
        pool.putconn(conn)
        return {
            "layer_id": layer_id,
            "lon_min": xmin,
            "lat_min": ymin,
            "lon_max": xmax,
            "lat_max": ymax,
            "z_min": minzoom,
            "z_max": maxzoom,
        }

    except Exception as err:
        error_message = str(err)
        error_traceback = traceback.format_exc()
        logger.error(error_traceback)
        return {"error": error_message, "traceback": error_traceback}
