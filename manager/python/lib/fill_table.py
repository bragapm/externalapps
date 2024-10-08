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
        srs_string or header_info["srs_code"]
    )  # Source SRS
    target_srs = osr.SpatialReference()
    target_srs.ImportFromEPSG(4326)  # Target SRS (WGS 84)
    target_srs.SetAxisMappingStrategy(osr.OAMS_TRADITIONAL_GIS_ORDER)

    # Create a coordinate transformation object
    coord_transform = osr.CoordinateTransformation(source_srs, target_srs)

    need_transform = (
        header_info["srs_code"] is not None and "4326" in header_info["srs_code"]
    ) or (srs_string is not None and "4326" in srs_string)

    # Process in batches
    batch_size = 1000  # Adjust based on your system's capability
    batch = []
    batch_count = 0

    for feature in layer:
        geometry = feature.GetGeometryRef()
        if geometry:
            if need_transform:
                geometry.Transform(coord_transform)
            geometry.FlattenTo2D()
            wkt_geom = geometry.ExportToWkt()

        columns = [f'"{field["name"].lower()}"' for field in fields]
        values = [feature.GetField(field["name"]) for field in fields]
        geom_text = f"ST_GeomFromText('{wkt_geom}', 4326)" if wkt_geom else "NULL"
        geom_and_placeholders = ", ".join([geom_text] + ["%s" for _ in values])
        insert_sql = f"INSERT INTO {table_name} ({', '.join(['geom'] + columns)}) VALUES ({geom_and_placeholders});"
        batch.append((insert_sql, values))

        if len(batch) >= batch_size:
            with conn.cursor() as cur:
                for sql, vals in batch:
                    cur.execute(sql, vals)
                conn.commit()
            batch = []
            batch_count = batch_count + 1
            logger.info(f"Insert batch number {batch_count} completed")

    # Insert remaining items
    if batch:
        with conn.cursor() as cur:
            for sql, vals in batch:
                cur.execute(sql, vals)
            conn.commit()

    logger.info("Fill table with layer feature completed")
