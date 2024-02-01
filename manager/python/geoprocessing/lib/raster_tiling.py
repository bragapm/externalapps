import os
import shutil
from uuid import uuid4

from minio.deleteobjects import DeleteObject
from osgeo import gdal, osr
from osgeo_utils import gdal2tiles

from utils import minio_client


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
    delete_object_list = map(
        lambda x: DeleteObject(x.object_name),
        minio_client.list_objects(bucket, f"raster-tiles/{layer_id}/", recursive=True),
    )
    errors = minio_client.remove_objects(bucket, delete_object_list)
    return errors


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
            raise Exception("Min zoom must be defined when max zoom is defined")
        elif min_zoom > max_zoom:
            raise Exception("Min zoom must be lower than or equal to max_zoom")

    gdal2tiles_opts = GDAL2TilesOptions(min_zoom, max_zoom)
    layer_id = str(uuid4())
    input_file = f"/vsis3/{bucket}/{object_key}"
    output_dir = f"/vsis3/{bucket}/raster-tiles/{layer_id}"

    dataset: gdal.Dataset = gdal.Open(input_file)
    xmin, xres, _, ymax, _, yres = dataset.GetGeoTransform()
    xmax = xmin + (dataset.RasterXSize * xres)
    ymin = ymax + (dataset.RasterYSize * yres)

    src_srs: osr.SpatialReference = dataset.GetSpatialRef()
    target_srs = osr.SpatialReference()
    target_srs.ImportFromEPSG(4326)

    # Transform the points
    transform = osr.CoordinateTransformation(src_srs, target_srs)
    transformed_bounds: tuple[float, float, float, float] = transform.TransformBounds(
        xmin, ymin, xmax, ymax, 21
    )

    del transform
    del target_srs
    del src_srs
    del dataset

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
    shutil.rmtree(os.path.dirname(conf.src_file))

    return (
        layer_id,
        transformed_bounds[1],
        transformed_bounds[3],
        transformed_bounds[0],
        transformed_bounds[2],
        min_zoom,
        max_zoom,
    )
