import { InvalidQueryError, ServiceUnavailableError } from "@directus/errors";

export default (router, { database, logger }) => {
  router.get("/", async (req, res, next) => {
    const { accountability } = req;
    const {
      state = "listed",
      group_by: groupBy = "type",
      sort_dir: sortDir = "asc",
    } = req.query;

    if (!["active", "listed"].includes(state)) {
      return next(
        new InvalidQueryError({ reason: 'state must be "active" or "listed"' })
      );
    }
    if (!["type", "category"].includes(groupBy)) {
      return next(
        new InvalidQueryError({
          reason: 'group_by must be "type" or "category"',
        })
      );
    }
    if (!["asc", "desc"].includes(sortDir)) {
      return next(
        new InvalidQueryError({
          reason: 'sort_dir must be "asc" or "desc"',
        })
      );
    }

    try {
      if (groupBy === "category") {
        const result = await database.raw(
          allByCategoriesQuery(state, accountability, sortDir)
        );
        return res.json({ data: result.rows[0]?.all_by_categories || {} });
      } else {
        const [threeDResult, twoDResult, terrainResult] = await Promise.all([
          database.raw(threeDQuery(state, accountability, sortDir)),
          database.raw(twoDQuery(state, accountability, sortDir)),
          database.raw(terrainQuery(state, accountability, sortDir)),
        ]);

        return res.json({
          data: {
            "3d": threeDResult.rows[0]?.three_d || {},
            "2d": twoDResult.rows[0]?.two_d || {},
            terrain: terrainResult.rows[0]?.terrain || {},
          },
        });
      }
    } catch (error) {
      logger.error(error);
      return next(
        new ServiceUnavailableError({
          service: "layer-list",
          reason: "Failed to fetch layer list",
        })
      );
    }
  });
};

function threeDQuery(state, accountability, sortDir) {
  let allowedRoleJoin = "";
  let permissionFilter = "";
  if (accountability.admin) {
  } else if (accountability.role) {
    allowedRoleJoin = `INNER JOIN three_d_tiles_directus_roles ON three_d_tiles_layer_id = layer_id AND directus_roles_id = '${accountability.role}'`;
    permissionFilter = "AND permission_type IN ('roles','roles+public')";
  } else {
    permissionFilter = "AND permission_type = 'roles+public'";
  }

  return `WITH three_d_tiles_list AS (
    SELECT layer_id,layer_alias,preview,description,category,opacity,point_size,point_color,visible
    FROM three_d_tiles
    ${allowedRoleJoin}
    WHERE ${state} IS TRUE
    ${permissionFilter}
  ), category_3d AS (
    SELECT category,to_jsonb(l2) layers
    FROM (
      SELECT category,'three_d_tiles' source,layer_id,layer_alias,preview,description,opacity,point_size,point_color,visible,'3D' layer_type
      FROM three_d_tiles_list
      ORDER BY layer_alias ${sortDir}
    )l,
    LATERAL (
      VALUES (source,layer_id,layer_alias,preview,description,opacity,point_size,point_color,visible,layer_type)
    ) AS l2(source,layer_id,layer_alias,preview,description,opacity,point_size,point_color,visible,layer_type)
  )
  SELECT json_object_agg(COALESCE(category::text,'uncategorized'),v) three_d
  FROM (
    SELECT category,jsonb_build_object('category_name',category_name,'layers',layers) v
    FROM (
      SELECT category,array_agg(layers) layers
      FROM category_3d
      GROUP BY category
    ) g
    LEFT JOIN categories ON category_id = category
    ORDER BY category_name
  ) cg`;
}

function twoDQuery(state, accountability, sortDir) {
  let allowedRoleVectorJoin = "";
  let allowedRoleRasterJoin = "";
  let permissionFilter = "";
  if (accountability.admin) {
  } else if (accountability.role) {
    allowedRoleVectorJoin = `INNER JOIN vector_tiles_directus_roles ON vector_tiles_layer_id = layer_id AND directus_roles_id = '${accountability.role}'`;
    allowedRoleRasterJoin = `INNER JOIN raster_tiles_directus_roles ON raster_tiles_layer_id = layer_id AND directus_roles_id = '${accountability.role}'`;
    permissionFilter = "AND permission_type IN ('roles','roles+public')";
  } else {
    permissionFilter = "AND permission_type = 'roles+public'";
  }

  return `WITH vector_tiles_list AS (
    SELECT layer_id id,circle_style,symbol_style,fill_style,line_style
    FROM vector_tiles
    ${allowedRoleVectorJoin}
    WHERE ${state} IS TRUE
    ${permissionFilter}
  ), layer_styles AS (
    SELECT l.id,to_jsonb(circle.*) layer_style,'Circle' layer_type
    FROM vector_tiles_list l,circle
    WHERE circle.id=circle_style
    UNION ALL
    SELECT l.id,to_jsonb(symbol.*) layer_style,'Symbol' layer_type
    FROM vector_tiles_list l,symbol
    WHERE symbol.id=symbol_style
    UNION ALL
    SELECT l.id,to_jsonb(fill.*) layer_style,'Polygon' layer_type
    FROM vector_tiles_list l,fill
    WHERE fill.id=fill_style
    UNION ALL
    SELECT l.id,to_jsonb(line.*) layer_style,'Line' layer_type
    FROM vector_tiles_list l,line
    WHERE line.id=line_style
  ), category_vector AS (
    SELECT category,to_jsonb(l2) layers
    FROM (
      SELECT category,'vector_tiles' source,layer_id,layer_name,bounds,minzoom,maxzoom,layer_alias,preview,description,click_popup_columns,image_columns,feature_detail_template,feature_detail_attachments,layer_style,layer_type
      FROM layer_styles
      INNER JOIN vector_tiles ON layer_id=id
    ) l,
    LATERAL (
      VALUES (source,layer_id,layer_name,bounds,minzoom,maxzoom,layer_alias,preview,description,click_popup_columns,image_columns,feature_detail_template,feature_detail_attachments,layer_style,layer_type)
    ) AS l2(source,layer_id,layer_name,bounds,minzoom,maxzoom,layer_alias,preview,description,click_popup_columns,image_columns,feature_detail_template,feature_detail_attachments,layer_style,layer_type)
  ), raster_tiles_list AS (
    SELECT layer_id,bounds,minzoom,maxzoom,layer_alias,preview,description,category,visible
    FROM raster_tiles
    ${allowedRoleRasterJoin}
    WHERE ${state} IS TRUE
    AND terrain_rgb IS FALSE
    ${permissionFilter}
  ), category_raster AS (
    SELECT category,to_jsonb(l2) layers
    FROM (
      SELECT category,'raster_tiles' source,layer_id,bounds,minzoom,maxzoom,layer_alias,preview,description,visible,'Raster' layer_type
      FROM raster_tiles_list
    )l,
    LATERAL (
      VALUES (source,layer_id,bounds,minzoom,maxzoom,layer_alias,preview,description,visible,layer_type)
    ) AS l2(source,layer_id,bounds,minzoom,maxzoom,layer_alias,preview,description,visible,layer_type)
  )
  SELECT json_object_agg(COALESCE(category::text,'uncategorized'),v) two_d
  FROM (
    SELECT category,jsonb_build_object('category_name',category_name,'layers',layers) v
    FROM (
      SELECT category,array_agg(layers) layers
      FROM (
        SELECT *
        FROM (
          SELECT *
          FROM category_vector
          UNION ALL
          SELECT *
          FROM category_raster
        ) o
        ORDER BY category,COALESCE(layers ->> 'layer_alias',layers ->> 'layer_name') ${sortDir}
      ) c
      GROUP BY category
    ) g
    LEFT JOIN categories ON category_id = category
    ORDER BY category_name
  ) cg`;
}

function terrainQuery(state, accountability, sortDir) {
  let allowedRoleJoin = "";
  let permissionFilter = "";
  if (accountability.admin) {
  } else if (accountability.role) {
    allowedRoleJoin = `INNER JOIN raster_tiles_directus_roles ON raster_tiles_layer_id = layer_id AND directus_roles_id = '${accountability.role}'`;
    permissionFilter = "AND permission_type IN ('roles','roles+public')";
  } else {
    permissionFilter = "AND permission_type = 'roles+public'";
  }

  return `WITH terrain_list AS (
    SELECT layer_id,bounds,minzoom,maxzoom,layer_alias,preview,description,category,visible
    FROM raster_tiles
    ${allowedRoleJoin}
    WHERE ${state} IS TRUE
    AND terrain_rgb IS TRUE
    ${permissionFilter}
  ), category_terrain AS (
    SELECT category,to_jsonb(l2) layers
    FROM (
      SELECT category,'raster_tiles' source,layer_id,bounds,minzoom,maxzoom,layer_alias,preview,description,visible,'Terrain' layer_type
      FROM terrain_list
      ORDER BY layer_alias ${sortDir}
    )l,
    LATERAL (
      VALUES (source,layer_id,bounds,minzoom,maxzoom,layer_alias,preview,description,visible,layer_type)
    ) AS l2(source,layer_id,bounds,minzoom,maxzoom,layer_alias,preview,description,visible,layer_type)
  )
  SELECT json_object_agg(COALESCE(category::text,'uncategorized'),v) terrain
  FROM (
    SELECT category,jsonb_build_object('category_name',category_name,'layers',layers) v
    FROM (
      SELECT category,array_agg(layers) layers
      FROM category_terrain
      GROUP BY category
    ) g
    LEFT JOIN categories ON category_id = category
    ORDER BY category_name
  ) cg`;
}

function allByCategoriesQuery(state, accountability, sortDir) {
  let allowedRole3dJoin = "";
  let allowedRoleVectorJoin = "";
  let allowedRoleRasterJoin = "";
  let permissionFilter = "";
  if (accountability.admin) {
  } else if (accountability.role) {
    allowedRole3dJoin = `INNER JOIN three_d_tiles_directus_roles ON three_d_tiles_layer_id = layer_id AND directus_roles_id = '${accountability.role}'`;
    allowedRoleVectorJoin = `INNER JOIN vector_tiles_directus_roles ON vector_tiles_layer_id = layer_id AND directus_roles_id = '${accountability.role}'`;
    allowedRoleRasterJoin = `INNER JOIN raster_tiles_directus_roles ON raster_tiles_layer_id = layer_id AND directus_roles_id = '${accountability.role}'`;
    permissionFilter = "AND permission_type IN ('roles','roles+public')";
  } else {
    permissionFilter = "AND permission_type = 'roles+public'";
  }

  return `WITH three_d_tiles_list AS (
      SELECT layer_id,layer_alias,preview,description,category,opacity,point_size,point_color,visible
      FROM three_d_tiles
      ${allowedRole3dJoin}
      WHERE ${state} IS TRUE
      ${permissionFilter}
    ), category_3d AS (
      SELECT category,to_jsonb(l2) layers
      FROM (
        SELECT category,'three_d_tiles' source,layer_id,layer_alias,preview,description,opacity,point_size,point_color,visible,'3D' layer_type
        FROM three_d_tiles_list
      )l,
      LATERAL (
        VALUES (source,layer_id,layer_alias,preview,description,opacity,point_size,point_color,visible,layer_type)
      ) AS l2(source,layer_id,layer_alias,preview,description,opacity,point_size,point_color,visible,layer_type)
    ), vector_tiles_list AS (
      SELECT layer_id id,circle_style,symbol_style,fill_style,line_style
      FROM vector_tiles
      ${allowedRoleVectorJoin}
      WHERE ${state} IS TRUE
      ${permissionFilter}
    ), layer_styles AS (
      SELECT l.id,to_jsonb(circle.*) layer_style,'Circle' layer_type
      FROM vector_tiles_list l,circle
      WHERE circle.id=circle_style
      UNION ALL
      SELECT l.id,to_jsonb(symbol.*) layer_style,'Symbol' layer_type
      FROM vector_tiles_list l,symbol
      WHERE symbol.id=symbol_style
      UNION ALL
      SELECT l.id,to_jsonb(fill.*) layer_style,'Polygon' layer_type
      FROM vector_tiles_list l,fill
      WHERE fill.id=fill_style
      UNION ALL
      SELECT l.id,to_jsonb(line.*) layer_style,'Line' layer_type
      FROM vector_tiles_list l,line
      WHERE line.id=line_style
    ), category_vector AS (
      SELECT category,to_jsonb(l2) layers
      FROM (
        SELECT category,'vector_tiles' source,layer_id,layer_name,bounds,minzoom,maxzoom,layer_alias,preview,description,click_popup_columns,image_columns,feature_detail_template,feature_detail_attachments,layer_style,layer_type
        FROM layer_styles
        INNER JOIN vector_tiles ON layer_id=id
      ) l,
      LATERAL (
        VALUES (source,layer_id,layer_name,bounds,minzoom,maxzoom,layer_alias,preview,description,click_popup_columns,image_columns,feature_detail_template,feature_detail_attachments,layer_style,layer_type)
      ) AS l2(source,layer_id,layer_name,bounds,minzoom,maxzoom,layer_alias,preview,description,click_popup_columns,image_columns,feature_detail_template,feature_detail_attachments,layer_style,layer_type)
    ), raster_tiles_list AS (
      SELECT layer_id,bounds,minzoom,maxzoom,layer_alias,preview,description,category,visible,terrain_rgb
      FROM raster_tiles
      ${allowedRoleRasterJoin}
      WHERE ${state} IS TRUE
      ${permissionFilter}
    ), category_raster AS (
      SELECT category,to_jsonb(l2) layers
      FROM (
        SELECT category,'raster_tiles' source,layer_id,bounds,minzoom,maxzoom,layer_alias,preview,description,visible,CASE WHEN terrain_rgb IS TRUE THEN 'Terrain' ELSE 'Raster' END layer_type
        FROM raster_tiles_list
      )l,
      LATERAL (
        VALUES (source,layer_id,bounds,minzoom,maxzoom,layer_alias,preview,description,visible,layer_type)
      ) AS l2(source,layer_id,bounds,minzoom,maxzoom,layer_alias,preview,description,visible,layer_type)
    )
    SELECT json_object_agg(COALESCE(category::text,'uncategorized'),v) all_by_categories
    FROM (
      SELECT category,jsonb_build_object('category_name',category_name,'layers',layers) v
      FROM (
        SELECT category,array_agg(layers) layers
        FROM (
          SELECT *
          FROM (
            SELECT *
            FROM category_3d
            UNION ALL
            SELECT *
            FROM category_vector
            UNION ALL
            SELECT *
            FROM category_raster
          ) o
          ORDER BY category,COALESCE(layers ->> 'layer_alias',layers ->> 'layer_name') ${sortDir}
        ) c
        GROUP BY category
      ) g
      LEFT JOIN categories ON category_id = category
      ORDER BY category_name
    ) cg`;
}
