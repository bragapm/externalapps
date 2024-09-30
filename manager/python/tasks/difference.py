import traceback
from uuid import uuid4

import dramatiq
from dramatiq.middleware import TimeLimitExceeded
from psycopg2 import sql

from lib.clear_directus_cache import clear_directus_cache
from lib.fetch_geoprocessing_default_values import (
    fetch_geoprocessing_default_values,
)
from utils import (
    logger,
    pool,
    is_dev_mode,
)


@dramatiq.actor(store_results=True, time_limit=1800000)
def difference(
    input_table: list[str],
    output_table: str,
    user_id: str,
):
    conn = None
    try:
        conn = pool.getconn()
        with conn:
            with conn.cursor() as cur:
                (category_id, fill_style) = fetch_geoprocessing_default_values(
                    cur, "Difference"
                )

                # fetch input layer configuration
                cur.execute(
                    sql.SQL(
                        "SELECT geometry_type FROM vector_tiles WHERE layer_name IN ({})"
                    ).format(
                        sql.SQL(",").join(sql.Literal(table) for table in input_table)
                    ),
                )
                layer_configs = cur.fetchall()
                geom_types = [row[0] for row in layer_configs]

                # set lowest geometry dimension as output dimension
                dim = 3
                output_geom_type = "MULTIPOLYGON"
                for geom_type in geom_types:
                    if geom_type in ["POINT", "MULTIPOINT"]:
                        dim = 1
                        output_geom_type = "MULTIPOINT"
                        break
                    elif geom_type in ["LINESTRING", "MULTILINESTRING"]:
                        dim = 2
                        output_geom_type = "MULTILINESTRING"
                logger.info("Layer config fetched")

                # fetch input table column names and types except geom column
                cur.execute(
                    sql.SQL(
                        "SELECT table_name,json_object_agg(column_name,data_type) FROM information_schema.columns WHERE table_schema='public' AND table_name IN ({input_tables}) AND column_name<>'geom' GROUP BY table_name"
                    ).format(
                        input_tables=sql.SQL(",").join(
                            sql.Literal(table) for table in input_table
                        )
                    )
                )
                table_columns = cur.fetchall()
                logger.info("Columns fetched")

                # create table with serial fid
                columns_sql = ", ".join(
                    ["ogc_fid serial PRIMARY KEY"]
                    + [
                        f'"{col_name}_{table_name}" {col_type}'
                        for table_name, columns in table_columns
                        for col_name, col_type in columns.items()
                    ]
                    + ["geom geometry(Geometry, 4326)"]
                )
                output_table_ident = sql.Identifier(output_table)
                cur.execute(
                    sql.SQL("CREATE TABLE {output_table} ({columns_sql})").format(
                        output_table=output_table_ident,
                        columns_sql=sql.SQL(columns_sql),
                    )
                )
                cur.execute(
                    sql.SQL(
                        "CREATE INDEX IF NOT EXISTS {idx_name} ON {output_table} USING gist (geom)"
                    ).format(
                        idx_name=sql.Identifier(f"{output_table}_geom_geom_idx"),
                        output_table=output_table_ident,
                    )
                )
                logger.info("Table created")

                # insert data
                def build_difference_query(
                    table_a, table_b, input_fields, is_final=False
                ):
                    """
                    Build SQL query for calculating the difference of two tables' geometries, with handling for covers and differences.
                    """
                    return sql.SQL(
                        """SELECT {input_fields}, 
                        ST_Multi(CASE WHEN ST_Covers({table_a}.geom, {table_b}.geom) THEN NULL
                                      ELSE ST_CollectionExtract(ST_Difference({table_a}.geom, {table_b}.geom), %s)
                                 END) AS geom
                        FROM {table_a}
                        LEFT JOIN {table_b} ON ST_Intersects({table_a}.geom, {table_b}.geom)"""
                        + (""" WHERE NOT ST_IsEmpty(geom)""" if is_final else "")
                    ).format(
                        input_fields=input_fields,
                        table_a=sql.Identifier(table_a),
                        table_b=sql.Identifier(table_b),
                    )

                def format_input_fields(table_columns_selected):
                    """
                    Format the input fields by concatenating table and column names.
                    """
                    return sql.SQL(",").join(
                        sql.SQL("{} {}").format(
                            sql.Identifier(table_name, col_name),
                            sql.Identifier(f"{col_name}_{table_name}"),
                        )
                        for table_name, columns in table_columns_selected
                        for col_name in columns
                    )

                # Main logic
                total_input_table = len(input_table)

                if total_input_table == 2:
                    input_fields = format_input_fields(table_columns[:2])
                    select_query = build_difference_query(
                        input_table[0], input_table[1], input_fields, is_final=True
                    )

                else:
                    # Handle case with more than 2 tables
                    cte_queries = []
                    table_columns_selected = table_columns[:2]

                    # First CTE for first two tables
                    input_fields = format_input_fields(table_columns_selected)
                    cte_queries.append(
                        sql.SQL("WITH cte_1 AS ({query})").format(
                            query=build_difference_query(
                                input_table[0], input_table[1], input_fields
                            )
                        )
                    )

                    # Process remaining tables
                    cte_count = 2
                    for i, (current_table_name, current_columns) in enumerate(
                        table_columns[2:], 2
                    ):
                        input_fields = sql.SQL(",").join(
                            [
                                sql.Identifier(
                                    f"cte_{cte_count - 1}",
                                    f"{col_name}_{table_name_sel}",
                                )
                                for table_name_sel, columns_sel in table_columns_selected
                                for col_name in columns_sel
                            ]
                            + [
                                sql.SQL("{} {}").format(
                                    sql.Identifier(current_table_name, col_name),
                                    sql.Identifier(f"{col_name}_{current_table_name}"),
                                )
                                for col_name in current_columns
                            ]
                        )

                        cte_queries.append(
                            sql.SQL("{cte_name} AS ({query})").format(
                                cte_name=sql.Identifier(f"cte_{cte_count}"),
                                query=build_difference_query(
                                    f"cte_{cte_count - 1}",
                                    current_table_name,
                                    input_fields,
                                ),
                            )
                        )
                        table_columns_selected.append(
                            (current_table_name, current_columns)
                        )
                        cte_count += 1

                    # Final CTE handling
                    final_query = build_difference_query(
                        f"cte_{cte_count - 1}",
                        input_table[-1],
                        input_fields,
                        is_final=True,
                    )
                    select_query = sql.SQL("{} {}").format(
                        sql.SQL(",").join(cte_queries), final_query
                    )

                # Insert result into the output table
                cur.execute(
                    sql.SQL(
                        "INSERT INTO {output_table} ({output_fields}, geom) {select_query}"
                    ).format(
                        output_table=output_table_ident,
                        output_fields=format_input_fields(table_columns),
                        select_query=select_query,
                    ),
                    [dim],
                )
                logger.info("Data inserted")

                # get new bounding box
                cur.execute(
                    sql.SQL(
                        "SELECT ST_AsGeoJSON(ST_Extent(geom)::geometry) FROM {output_table}"
                    ).format(output_table=output_table_ident)
                )
                (new_bounds,) = cur.fetchone()
                if new_bounds is None:
                    raise Exception("Geoprocessing result does not have any geometry")

                # set new data
                layer_id = str(uuid4())
                new_layer_config = [
                    output_geom_type,
                    new_bounds,
                    category_id,
                    True,
                    "admin",
                    fill_style,
                    output_table,
                    user_id,
                    output_table.replace("_", " ").title(),
                    layer_id,
                ]

                # register to vector_tiles
                cur.execute(
                    sql.SQL(
                        "INSERT INTO vector_tiles(geometry_type,bounds,category,listed,permission_type,fill_style,layer_name,user_created,layer_alias,layer_id) VALUES({})"
                    ).format(
                        sql.SQL(",").join(sql.Placeholder() * len(new_layer_config))
                    ),
                    new_layer_config,
                )
                logger.info("Registered to vector_tiles")

        if not is_dev_mode():
            clear_directus_cache()

        return {"layer_id": layer_id}
    except Exception as err:
        error_traceback = traceback.format_exc()
        if isinstance(err, TimeLimitExceeded):
            error_message = "Time limit exceeded. File might be too big to process."
        else:
            error_message = str(err)
            logger.error(error_traceback)
        return {"error": error_message, "traceback": error_traceback}
    finally:
        if conn:
            pool.putconn(conn)
