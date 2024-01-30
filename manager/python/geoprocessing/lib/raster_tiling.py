import shutil
import os
from osgeo import ogr, gdal, osr
from osgeo_utils import gdal2tiles
from uuid import uuid4
from .get_input_data import minio_client
from utils import logger

ogr.RegisterAll()
gdal.UseExceptions()


class GDAL2TilesOptions:
    xyz = True
    tiledriver = "PNG"
    verbose = False
    tilesize = 256
    mpi = False
    resampling = "average"
    webviewer = "none"
    kml = False
    srcnodata = None
    s_srs = None
    profile = "mercator"
    quiet = True
    resume = False
    exclude_transparent = True
    # nb_processes = cpu_count()

    def __init__(self, min_zoom: int | None = None, max_zoom: int | None = None):
        self.zoom = (min_zoom, max_zoom)


def delete_generated_tiles(bucket, layer_id: str):
    object_keys: list[str] = []
    objects = minio_client.list_objects(
        bucket,
        f"raster-tiles/{layer_id}/",
        True,
    )
    for obj in objects:
        object_keys.append(obj.object_name)

    # remove in reverse
    for object_key in reversed(object_keys):
        minio_client.remove_object(bucket, object_key)


def raster_tiling(
    bucket: str,
    object_key: str,
    min_zoom: int | None,
    max_zoom: int | None,
):
    min_zoom = int(min_zoom) if min_zoom is not None else min_zoom
    max_zoom = int(max_zoom) if max_zoom is not None else max_zoom

    if max_zoom is not None:
        if min_zoom is None:
            return "error: Min zoom must be defined when max zoom is defined"
        elif min_zoom > max_zoom:
            return "error: Min zoom must be lower than or equal to max_zoom"

    gdal2tiles_opts = GDAL2TilesOptions(min_zoom, max_zoom)
    layer_id = str(uuid4())
    input_file = f"/vsis3/{bucket}/{object_key}"
    output_dir = f"/vsis3/{bucket}/raster-tiles/{layer_id}"

    try:
        dataset: gdal.Dataset = gdal.Open(input_file)
        xmin, xres, _, ymax, _, yres = dataset.GetGeoTransform()
        xmax = xmin + (dataset.RasterXSize * xres)
        ymin = ymax + (dataset.RasterYSize * yres)

        src_srs: osr.SpatialReference = dataset.GetSpatialRef()
        target_srs = osr.SpatialReference()
        target_srs.ImportFromEPSG(4326)

        # Transform the points
        transform = osr.CoordinateTransformation(src_srs, target_srs)
        ymin_transformed, xmin_transformed, _ = transform.TransformPoint(xmin, ymin)
        ymax_transformed, xmax_transformed, _ = transform.TransformPoint(xmax, ymax)

        del transform
        del target_srs
        del src_srs
        del dataset
    except Exception as err:
        print(err)
        # delete_temp_file(object_key)
        return f"error: Failed to get raster bounds"

    try:
        conf, tile_details = gdal2tiles.worker_tile_details(
            input_file, output_dir, gdal2tiles_opts
        )

        # update min max zoom
        if min_zoom is None:
            min_zoom = conf.tminz
        if max_zoom is None:
            max_zoom = conf.tmaxz

        for tile_detail in tile_details:
            gdal2tiles.create_base_tile(conf, tile_detail)

        if getattr(gdal2tiles.threadLocal, "cached_ds", None):
            del gdal2tiles.threadLocal.cached_ds

        for base_tz in range(conf.tmaxz, conf.tminz, -1):
            base_tile_groups = gdal2tiles.group_overview_base_tiles(
                base_tz, output_dir, conf
            )
            for base_tiles in base_tile_groups:
                gdal2tiles.create_overview_tile(
                    base_tz, base_tiles, output_dir, conf, gdal2tiles_opts
                )
        print(conf)
        shutil.rmtree(os.path.dirname(conf.src_file))

    except gdal2tiles.Gdal2TilesError as err:
        del_err_msg = ""
        try:
            delete_generated_tiles(bucket, layer_id)
        except Exception:
            del_err_msg = " + Failed to delete half generated tiles. Please delete it manually via S3 console"
        return f"error: {err}{del_err_msg}"
    except Exception as err:
        print(err)
        del_err_msg = ""
        try:
            delete_generated_tiles(bucket, layer_id)
        except Exception:
            del_err_msg = " + Failed to delete half generated tiles. Please delete it manually via S3 console"
        return f"error: Unexpected error {del_err_msg}"
    # finally:
    #     delete_temp_file(object_key)

    return (
        layer_id,
        xmin_transformed,
        ymin_transformed,
        xmax_transformed,
        ymax_transformed,
    )
