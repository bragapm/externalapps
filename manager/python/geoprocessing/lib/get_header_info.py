from osgeo import ogr, gdal, osr
from lib.get_input_data import (
    get_input_data_with_vsi,
    get_input_data_without_vsi_with_vrt,
    get_input_data_with_vsi_with_vrt,
    get_gdb_directory,
)
from utils import logger, create_bbox_polygon


def get_header_info_from_data_source(
    data_source: gdal.Dataset,
) -> dict:
    try:
        layer: ogr.Layer = data_source.GetLayer()
        geom_type = layer.GetGeomType()
        temp_geom = ogr.Geometry(geom_type)
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

        header_info = {
            "num_features": layer.GetFeatureCount(),
            "projection": projection,
            "srs_name": srs_name,
            "srs_code": srs_code,
            "fields": [
                {"name": field.name, "type": field.GetTypeName()}
                for field in layer.schema
            ],
            "geom_name": geom_name,
            "bbox": bbox_geojson,
        }
        logger.info("Get header info from data source")
        return header_info

    except Exception as err:
        raise Exception("Error:", err)


def get_driver_short_name(format_file: str):
    match format_file:
        case "shapefile":
            return "ESRI Shapefile"
        case "kml":
            return "KML"


def get_header_info(format_file, bucket, object_key, is_zipped, table_name):
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
        case _:
            data_source = get_input_data_with_vsi(
                bucket, object_key, is_zipped, get_driver_short_name(format_file)
            )
            header_info = get_header_info_from_data_source(data_source)

    return header_info, data_source
