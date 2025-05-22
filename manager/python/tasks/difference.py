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
                            sql.Literal(table) for table in input_table[:1]
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
                total_input_table = len(input_table)
                if total_input_table == 2:
                    select_query = sql.SQL(
                        """ SELECT *
                            FROM (
                              SELECT {input_fields},
                                ST_Multi(
                                  CASE
                                    WHEN ST_CoveredBy({table_a}.geom, u.geom) THEN NULL

                                    WHEN ST_Intersects({table_a}.geom, u.geom) THEN 
                                      ST_CollectionExtract(
                                        ST_Difference({table_a}.geom, u.geom),
                                        %s
                                      )

                                    ELSE {table_a}.geom
                                  END
                                ) AS geom
                              FROM 
                                {table_a}, ( SELECT
                                                ST_Union (geom) geom
                                            FROM {table_b} ) AS u
                            ) differenced
                            WHERE geom IS NOT NULL """
                    ).format(
                        input_fields=sql.SQL(",").join(
                            sql.Identifier(table_name, col_name)
                            for table_name, columns in table_columns
                            for col_name in columns
                        ),
                        table_a=sql.Identifier(input_table[0]),
                        table_b=sql.Identifier(input_table[1]),
                    )
                else:
                    # Create difference for first 2 tables in a CTE
                    table_columns_selected = table_columns[0:2]
                    cte_queries = [
                        sql.SQL(
                            "WITH cte_1 AS (SELECT {input_fields}, ST_Difference({table_a}.geom, {table_b}.geom) geom FROM {table_a} INNER JOIN {table_b} ON ST_Intersects({table_a}.geom, {table_b}.geom))"
                        ).format(
                            input_fields=sql.SQL(",").join(
                                sql.SQL("{} {}").format(
                                    sql.Identifier(table_name, col_name),
                                    sql.Identifier(f"{col_name}_{table_name}"),
                                )
                                for table_name, columns in table_columns_selected
                                for col_name in columns
                            ),
                            table_a=sql.Identifier(input_table[0]),
                            table_b=sql.Identifier(input_table[1]),
                        )
                    ]

                    # Process the rest of the tables
                    cte_count = 2
                    for i, table_column in enumerate(table_columns[2:], 2):
                        current_table_name, current_columns = table_column
                        if i != total_input_table - 1:
                            # Append to CTE query if not the last input table
                            cte_queries.append(
                                sql.SQL(
                                    "{cte_name} AS (SELECT {input_fields}, ST_Difference({table_a}.geom, {table_b}.geom) geom FROM {table_a} INNER JOIN {table_b} ON ST_Intersects({table_a}.geom, {table_b}.geom))"
                                ).format(
                                    cte_name=sql.Identifier(f"cte_{cte_count}"),
                                    input_fields=sql.SQL(",").join(
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
                                                sql.Identifier(
                                                    current_table_name, col_name
                                                ),
                                                sql.Identifier(
                                                    f"{col_name}_{current_table_name}"
                                                ),
                                            )
                                            for col_name in current_columns
                                        ]
                                    ),
                                    table_a=sql.Identifier(current_table_name),
                                    table_b=sql.Identifier(f"cte_{cte_count - 1}"),
                                )
                            )
                            table_columns_selected.append(table_column)
                            cte_count += 1
                        else:
                            # Set the last input table as the final select query
                            final_query = sql.SQL(
                                """ SELECT *
                                    FROM (
                                      SELECT {input_fields}, ST_Multi(CASE WHEN ST_Covers({table_a}.geom, {table_b}.geom) 
                                      THEN ST_Difference({table_a}.geom, {table_b}.geom) 
                                      ELSE ST_CollectionExtract(ST_Difference({table_a}.geom, {table_b}.geom), %s) 
                                      END) geom
                                      FROM {table_a}
                                      INNER JOIN {table_b} ON ST_Intersects({table_a}.geom, {table_b}.geom)
                                    ) differenced
                                    WHERE NOT ST_IsEmpty(geom)"""
                            ).format(
                                input_fields=sql.SQL(",").join(
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
                                            sql.Identifier(
                                                current_table_name, col_name
                                            ),
                                            sql.Identifier(
                                                f"{col_name}_{current_table_name}"
                                            ),
                                        )
                                        for col_name in current_columns
                                    ]
                                ),
                                table_a=sql.Identifier(current_table_name),
                                table_b=sql.Identifier(f"cte_{cte_count - 1}"),
                            )
                    select_query = sql.SQL("{} {}").format(
                        sql.SQL(",").join(cte_queries), final_query
                    )

                # Execute the query
                cur.execute(
                    sql.SQL(
                        "INSERT INTO {output_table} ({output_fields}, geom) {select_query}"
                    ).format(
                        output_table=output_table_ident,
                        output_fields=sql.SQL(",").join(
                            sql.Identifier(f"{col_name}_{table_name}")
                            for table_name, columns in table_columns
                            for col_name in columns
                        ),
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
    except TimeLimitExceeded:
        logger.error(traceback.format_exc())
        return {"error": "Time limit exceeded. Data might be too big to process."}
    except Exception as err:
        error_traceback = traceback.format_exc()
        error_message = str(err)
        logger.error(error_traceback)
        return {"error": error_message, "traceback": error_traceback}
    finally:
        if conn:
            pool.putconn(conn)
