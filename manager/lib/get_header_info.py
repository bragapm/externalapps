import logging
from osgeo import ogr, gdal, osr
from lib.get_input_data import (
    get_input_data_with_vsi,
    get_input_data_without_vsi_with_vrt,
    get_input_data_with_vsi_with_vrt,
    get_gdb_directory,
)

logger = logging.getLogger(__name__)


def get_driver_short_name(format_file: str):
    match format_file:
        case "shapefile":
            return "ESRI Shapefile"
        case "kml":
            return "KML"
        case "xls":
            return "XLS"
        case "xlsx":
            return "XLSX"
        case "csv":
            return "CSV"
        case "geojson":
            return "GeoJSON"
        case "gdb":
            return "OpenFileGDB"


def get_header_info_from_datasource(
    dataSource: gdal.Dataset,
) -> dict:
    try:
        layer: ogr.Layer = dataSource.GetLayer()
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
            projection = "null from datasource, set default to WGS 84"
            srs_name = "EPSG"
            srs_code = "4326"
        
        # Get the bounding box and convert it to GeoJSON format
        bbox = layer.GetExtent()
        bbox_geojson = {
            "type": "Polygon",
            "coordinates": [[
                [bbox[0], bbox[2]],  # Lower left
                [bbox[0], bbox[3]],  # Upper left
                [bbox[1], bbox[3]],  # Upper right
                [bbox[1], bbox[2]],  # Lower right
                [bbox[0], bbox[2]]   # Close the polygon (back to Lower left)
            ]]
        }

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
            "bbox": bbox_geojson
        }
        logger.info("Get header info from datasource")
        return header_info

    except Exception as err:
        raise Exception("Error:", err)


def get_header_info(format_file, bucket, object_key, is_zipped, table_name):
    driver_short_name = get_driver_short_name(format_file)
    match format_file:
        case "xls":
            dataSource = get_input_data_without_vsi_with_vrt(
                bucket, object_key, is_zipped, driver_short_name, table_name
            )
            header_info = get_header_info_from_datasource(dataSource)
        case "xlsx":
            dataSource = get_input_data_with_vsi_with_vrt(
                bucket, object_key, is_zipped, driver_short_name, table_name
            )
            header_info = get_header_info_from_datasource(dataSource)
        case "csv":
            dataSource = get_input_data_with_vsi(
                bucket,
                object_key,
                is_zipped,
                driver_short_name,
                ["X_POSSIBLE_NAMES=lon", "Y_POSSIBLE_NAMES=lat"],
            )
            header_info = get_header_info_from_datasource(dataSource)
        case "geojson":
            dataSource = get_input_data_with_vsi(
                bucket,
                object_key,
                is_zipped,
                driver_short_name,
                ["FLATTEN_NESTED_ATTRIBUTES=YES"],
            )
            header_info = get_header_info_from_datasource(dataSource)
        case "gdb":
            object_key_gdb = get_gdb_directory(bucket, object_key)
            dataSource = get_input_data_with_vsi(
                bucket, object_key_gdb, is_zipped, driver_short_name
            )
            header_info = get_header_info_from_datasource(dataSource)
        case _:
            dataSource = get_input_data_with_vsi(
                bucket, object_key, is_zipped, driver_short_name
            )
            header_info = get_header_info_from_datasource(dataSource)

    return header_info, dataSource
