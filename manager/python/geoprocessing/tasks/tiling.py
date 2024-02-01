import os
import traceback

import dramatiq.results

from lib.raster_tiling import delete_generated_tiles, raster_tiling
from lib.register_table import (
    register_raster_tile,
)
from utils import pool, logger, init_gdal_config


@dramatiq.actor(store_results=True)
def tiling(
    object_key,
    uploader,
    raster_alias,
    minzoom,
    maxzoom,
    bucket=os.environ.get("STORAGE_S3_BUCKET", ""),
    **kwargs,
):
    init_gdal_config()
    layer_id = ""
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
        del_errs = []
        if layer_id:
            del_err_generator = delete_generated_tiles(bucket, layer_id)
            for del_err in del_err_generator:
                del_errs.append(del_err)
        error_message = str(err)
        if len(del_errs):
            error_message += f" Error deleting half generated tiles. Please delete manually via S3 console: {str(del_errs)}"
        error_traceback = traceback.format_exc()
        logger.error(error_traceback)
        return {"error": error_message, "traceback": error_traceback}
