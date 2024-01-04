import logging
from osgeo import ogr
from osgeo import osr

logger = logging.getLogger(__name__)


def fill_table_with_layer_feature(dataSource, header_info, conn, table_name):
    layer = dataSource.GetLayer()
    fields = header_info["fields"]

    # Define the source and target spatial reference systems
    source_srs = osr.SpatialReference()
    source_srs.ImportFromEPSG(int(header_info["srs_code"]))  # Source SRS

    target_srs = osr.SpatialReference()
    target_srs.ImportFromEPSG(4326)  # Target SRS (WGS 84)
    target_srs.SetAxisMappingStrategy(osr.OAMS_TRADITIONAL_GIS_ORDER)

    need_transform = (
        int(header_info["srs_code"]) is not None
        and int(header_info["srs_code"]) != 4326
    )
    # Create a coordinate transformation object
    if need_transform:
        coord_transform = osr.CoordinateTransformation(source_srs, target_srs)

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
                columns_str = ", ".join(columns)
                placeholders = ", ".join(["%s" for _ in values])
                insert_sql = f"INSERT INTO {table_name} (geom, {columns_str}) VALUES (ST_GeomFromText('{wkt_geom}', 4326), {placeholders});"
                cur.execute(insert_sql, values)

    logger.info("Fill table with layer feature")
