from osgeo import osr, gdal
from typing import Any

from utils import logger


def detect_and_import_srs(srs_string: str):
    """
    Detects the type of input SRS string (EPSG, Proj4, or WKT) and imports it into an osr.SpatialReference object.

    :param srs_string: The input SRS string provided by the user (EPSG code, Proj4 string, or WKT string)
    :return: osr.SpatialReference object with the correct SRS loaded
    """
    srs = osr.SpatialReference()

    # Check if it's an EPSG code (e.g., "EPSG:4326" or "4326")
    if srs_string.lower().startswith("epsg:"):
        epsg_code = int(srs_string.split(":")[1])
        srs.ImportFromEPSG(epsg_code)
        print(f"Detected EPSG: {epsg_code}")

    elif srs_string.isdigit():
        # Handle case where the user only provides the EPSG code (e.g., "4326")
        epsg_code = int(srs_string)
        srs.ImportFromEPSG(epsg_code)
        print(f"Detected EPSG: {epsg_code}")

    # Check if it's a Proj4 string (starts with "+proj=")
    elif srs_string.startswith("+proj="):
        srs.ImportFromProj4(srs_string)
        print("Detected Proj4 string")

    # Assume it's a WKT string otherwise
    else:
        try:
            srs.ImportFromWkt(srs_string)
            print("Detected WKT string")
        except Exception as e:
            raise ValueError(
                "Invalid SRS string format. Could not interpret input."
            ) from e

    return srs


def fill_table_with_layer_feature(
    data_source: gdal.Dataset,
    header_info: dict,
    conn: Any,
    table_name: str,
    srs_string: str | None,
):
    layer = data_source.GetLayer()
    fields = header_info["fields"]

    # Define the source and target spatial reference systems
    source_srs = detect_and_import_srs(
        srs_string if srs_string is not None else header_info["srs_code"]
    )  # Source SRS
    target_srs = osr.SpatialReference()
    target_srs.ImportFromEPSG(4326)  # Target SRS (WGS 84)
    target_srs.SetAxisMappingStrategy(osr.OAMS_TRADITIONAL_GIS_ORDER)

    # Create a coordinate transformation object
    coord_transform = osr.CoordinateTransformation(source_srs, target_srs)

    need_transform = (
        int(header_info["srs_code"]) is not None
        and int(header_info["srs_code"]) != 4326
    )

    with conn:
        with conn.cursor() as cur:
            for feature in layer:
                wkt_geom = "NULL"
                geometry = feature.GetGeometryRef()
                if geometry:
                    if need_transform:
                        geometry.Transform(coord_transform)
                    geometry.FlattenTo2D()
                    wkt_geom = geometry.ExportToWkt()

                columns = []
                values = []
                for field in fields:
                    columns.append(f'"{field["name"].lower()}"')
                    values.append(feature.GetField(field["name"]))
                columns_str = ", ".join(["geom"] + columns)
                geom_and_placeholders = ", ".join(
                    [f"ST_GeomFromText('{wkt_geom}', 4326)"] + ["%s" for _ in values]
                )
                insert_sql = f"INSERT INTO {table_name} ({columns_str}) VALUES ({geom_and_placeholders});"
                cur.execute(insert_sql, values)

    logger.info("Fill table with layer feature")
