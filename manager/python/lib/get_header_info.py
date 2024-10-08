import os
from typing import TypedDict

from osgeo import ogr, gdal, osr

from lib.get_input_data import (
    get_input_data_with_vsi,
    get_input_data_without_vsi_with_vrt,
    get_input_data_with_vsi_with_vrt,
)
from utils import logger, create_bbox_polygon


class Fields(TypedDict):
    name: str
    type: str


class HeaderInfo(TypedDict):
    num_features: int
    projection: str
    srs_name: str
    srs_code: str
    fields: list[Fields]
    geom_name: str
    bbox: dict


def get_header_info_from_data_source(
    data_source: gdal.Dataset,
) -> HeaderInfo:
    layer: ogr.Layer = data_source.GetLayer()
    geom_type: ogr.wkbUnknown = layer.GetGeomType()
    temp_geom = ogr.Geometry(geom_type or 3)
    geom_name = temp_geom.GetGeometryName()

    # if "Z" in str(temp_geom):
    #     geom_name = f"{geom_name}Z"

    srs: osr.SpatialReference = layer.GetSpatialRef()
    if srs:
        projection = srs.ExportToWkt()
        srs_name = srs.GetAuthorityName(None)
        srs_code = srs.GetAuthorityCode(None)
    else:
        projection = "null from data source, set default to WGS 84"
        srs_name = "EPSG"
        srs_code = "4326"

    # Get the bounding box and convert it to GeoJSON format
    bbox = layer.GetExtent()
    if srs:
        target_srs = osr.SpatialReference()
        target_srs.ImportFromEPSG(4326)
        if not target_srs.IsSame(srs, ["IGNORE_DATA_AXIS_TO_SRS_AXIS_MAPPING=YES"]):
            transform = osr.CoordinateTransformation(srs, target_srs)
            new_bbox = transform.TransformBounds(bbox[0], bbox[2], bbox[1], bbox[3], 21)
            bbox = (new_bbox[1], new_bbox[3], new_bbox[0], new_bbox[2])
    bbox_geojson = create_bbox_polygon(bbox[0], bbox[2], bbox[1], bbox[3])

    fields: list[Fields] = []
    defn: ogr.FeatureDefn = layer.GetLayerDefn()
    for n in range(defn.GetFieldCount()):
        field: ogr.FieldDefn = defn.GetFieldDefn(n)
        fields.append({"name": field.GetName(), "type": field.GetTypeName()})

    header_info: HeaderInfo = {
        "num_features": layer.GetFeatureCount(),
        "projection": projection,
        "srs_name": srs_name,
        "srs_code": srs_code,
        "fields": fields,
        "geom_name": geom_name,
        "bbox": bbox_geojson,
    }
    logger.info("Get header info from data source")
    return header_info


def get_driver_short_name(format_file: str):
    match format_file:
        case "shapefile":
            return "ESRI Shapefile"
        case "kml":
            return "KML"
        case _:
            raise Exception(f"Unexpected file format: {str}")


def get_gdb_directory(bucket: str, object_key: str):
    storage_root = (
        os.environ.get("STORAGE_S3_ROOT", "") + "/"
        if os.environ.get("STORAGE_S3_ROOT")
        else ""
    )
    src_path = f"/vsizip//vsis3/{bucket}/{storage_root}{object_key}"
    gdb_directory = gdal.ReadDir(src_path)

    return f"{object_key}/{gdb_directory[0]}"


def get_header_info(
    format_file: str, bucket: str, object_key: str, is_zipped: bool, table_name: str
):
    match format_file:
        case "xls":
            data_source = get_input_data_without_vsi_with_vrt(
                bucket, object_key, is_zipped, "XLS", table_name
            )
            header_info = get_header_info_from_data_source(data_source)
        case "xlsx":
            data_source = get_input_data_with_vsi_with_vrt(
                bucket, object_key, is_zipped, "XLSX", table_name
            )
            header_info = get_header_info_from_data_source(data_source)
        case "csv":
            data_source = get_input_data_with_vsi(
                bucket,
                object_key,
                is_zipped,
                "CSV",
                ["X_POSSIBLE_NAMES=lon", "Y_POSSIBLE_NAMES=lat"],
            )
            header_info = get_header_info_from_data_source(data_source)
        case "geojson":
            data_source = get_input_data_with_vsi(
                bucket,
                object_key,
                is_zipped,
                "GeoJSON",
                ["FLATTEN_NESTED_ATTRIBUTES=YES"],
            )
            header_info = get_header_info_from_data_source(data_source)
        case "gdb":
            object_key_gdb = get_gdb_directory(bucket, object_key)
            data_source = get_input_data_with_vsi(
                bucket, object_key_gdb, is_zipped, "OpenFileGDB"
            )
            header_info = get_header_info_from_data_source(data_source)
        case "dxf":
            data_source = get_input_data_with_vsi(bucket, object_key, is_zipped, "DXF")
            header_info = get_header_info_from_data_source(data_source)
        case _:
            data_source = get_input_data_with_vsi(
                bucket, object_key, is_zipped, get_driver_short_name(format_file)
            )
            header_info = get_header_info_from_data_source(data_source)

    return header_info, data_source
