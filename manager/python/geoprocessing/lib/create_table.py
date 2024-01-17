import logging

logger = logging.getLogger(__name__)


def create_table_from_header_info(conn, header_info: dict, table_name: str):
    # Mapping shapefile field types to PostgreSQL column types
    type_mapping = {
        "String": "TEXT",
        "Real": "DOUBLE PRECISION",
        "Integer64": "BIGINT",
        "Integer": "INTEGER",
        "DateTime": "TIMESTAMPTZ",
    }

    fields = header_info["fields"]
    # Adding an auto-incrementing primary key column and geom column for geometry; assuming 2D geometries in WGS 84 for now
    columns_sql = ", ".join(
        ["ogc_fid SERIAL PRIMARY KEY"]
        + [
            f'"{field["name"].lower()}" {type_mapping[field["type"]]}'
            for field in fields
        ]
        + ["geom GEOMETRY(Geometry, 4326)"]
    )

    create_table_sql = f"""CREATE TABLE {table_name} ({columns_sql}); 
        CREATE INDEX IF NOT EXISTS {table_name}_geom_geom_idx ON {table_name} USING gist (geom);"""

    with conn:
        with conn.cursor() as cur:
            cur.execute(create_table_sql)
    logger.info("Create table based on header info")
