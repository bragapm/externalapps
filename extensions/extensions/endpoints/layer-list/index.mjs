import { InvalidQueryError, ServiceUnavailableError } from "@directus/errors";

export default (router, { database, logger }) => {
  router.get("/", async (req, res, next) => {
    const { accountability } = req;
    const { state = "listed", group_by: groupBy = "type" } = req.query;

    if (!["active", "listed"].includes(state)) {
      return next(
        new InvalidQueryError({ reason: `${state} is not a valid state query` })
      );
    }
    if (!["type", "category"].includes(groupBy)) {
      return next(
        new InvalidQueryError({
          reason: `${groupBy} is not a valid group_by query`,
        })
      );
    }

    // TODO group by category
    try {
      const [threeDResult, twoDResult, terrainResult] = await Promise.all([
        database.raw(threeDQuery(state, accountability)),
        database.raw(twoDQuery(state, accountability)),
        database.raw(terrainQuery(state, accountability)),
      ]);

      return res.json({
        "3d": threeDResult.rows[0]?.three_d || {},
        "2d": twoDResult.rows[0]?.two_d || {},
        terrain: terrainResult.rows[0]?.terrain || {},
      });
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

function threeDQuery(state, accountability) {
  let allowedRoleJoin = "";
  let permissionFilter = "";
  if (accountability.admin) {
  } else if (accountability.role) {
    allowedRoleJoin = `INNER JOIN three_d_tiles_directus_roles ON three_d_tiles_layer_id = layer_id AND directus_roles_id = '${accountability.role}'`;
    permissionFilter = "AND permission_type IN ('roles','roles+public')";
  } else {
    permissionFilter = "AND permission_type = 'roles+public'";
  }

  return `WITH active_3d_tiles AS (
    SELECT layer_id,layer_alias,category,opacity,point_size,point_color,visible
    FROM three_d_tiles
    ${allowedRoleJoin}
    WHERE ${state} IS TRUE
    ${permissionFilter}
  ), category_3d AS (
    SELECT category,to_jsonb(l2) layers
    FROM (
      SELECT category,'three_d_tiles' source,layer_id,layer_alias,opacity,point_size,point_color,visible
      FROM active_3d_tiles
      ORDER BY layer_alias
    )l,
    LATERAL (
      VALUES (source,layer_id,layer_alias,opacity,point_size,point_color,visible)
    ) AS l2(source,layer_id,layer_alias,opacity,point_size,point_color,visible)
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

function twoDQuery(state, accountability) {
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

  return `WITH active_vector_tiles AS (
    SELECT layer_id id,circle_style,symbol_style,fill_style,line_style
    FROM vector_tiles
    ${allowedRoleVectorJoin}
    WHERE ${state} IS TRUE
    ${permissionFilter}
  ), layer_styles AS (
    SELECT l.id,to_jsonb(circle.*) layer_style
    FROM active_vector_tiles l,circle
    WHERE circle.id=circle_style
    UNION ALL
    SELECT l.id,to_jsonb(symbol.*) layer_style
    FROM active_vector_tiles l,symbol
    WHERE symbol.id=symbol_style
    UNION ALL
    SELECT l.id,to_jsonb(fill.*) layer_style
    FROM active_vector_tiles l,fill
    WHERE fill.id=fill_style
    UNION ALL
    SELECT l.id,to_jsonb(line.*) layer_style
    FROM active_vector_tiles l,line
    WHERE line.id=line_style
  ), category_vector AS (
    SELECT category,to_jsonb(l2) layers
    FROM (
      SELECT category,'vector_tiles' source,layer_id,layer_name,geometry_type,bounds,minzoom,maxzoom,layer_alias,preview,click_popup_columns,image_columns,feature_detail_template,feature_detail_attachments,layer_style
      FROM layer_styles
      INNER JOIN vector_tiles ON layer_id=id
      ORDER BY COALESCE(layer_alias,layer_name)
    ) l,
    LATERAL (
      VALUES (source,layer_id,layer_name,geometry_type,bounds,minzoom,maxzoom,layer_alias,preview,click_popup_columns,image_columns,feature_detail_template,feature_detail_attachments,layer_style)
    ) AS l2(source,layer_id,layer_name,geometry_type,bounds,minzoom,maxzoom,layer_alias,preview,click_popup_columns,image_columns,feature_detail_template,feature_detail_attachments,layer_style)
  ), active_raster_tiles AS (
    SELECT layer_id,bounds,minzoom,maxzoom,terrain_rgb,layer_alias,category,visible
    FROM raster_tiles
    ${allowedRoleRasterJoin}
    WHERE active IS TRUE
    AND terrain_rgb IS FALSE
    ${permissionFilter}
  ), category_raster AS (
    SELECT category,to_jsonb(l2) layers
    FROM (
      SELECT category,'raster_tiles' source,layer_id,bounds,minzoom,maxzoom,layer_alias,visible
      FROM active_raster_tiles
      ORDER BY layer_alias
    )l,
    LATERAL (
      VALUES (source,layer_id,bounds,minzoom,maxzoom,layer_alias,visible)
    ) AS l2(source,layer_id,bounds,minzoom,maxzoom,layer_alias,visible)
  )
  SELECT json_object_agg(COALESCE(category::text,'uncategorized'),v) two_d
  FROM (
    SELECT category,jsonb_build_object('category_name',category_name,'layers',layers) v
    FROM (
      SELECT category,array_agg(layers) layers
      FROM (
        SELECT *
        FROM category_vector
        UNION ALL
        SELECT *
        FROM category_raster
      ) c
      GROUP BY category
    ) g
    LEFT JOIN categories ON category_id = category
    ORDER BY category_name
  ) cg`;
}

function terrainQuery(state, accountability) {
  let allowedRoleJoin = "";
  let permissionFilter = "";
  if (accountability.admin) {
  } else if (accountability.role) {
    allowedRoleJoin = `INNER JOIN raster_tiles_directus_roles ON raster_tiles_layer_id = layer_id AND directus_roles_id = '${accountability.role}'`;
    permissionFilter = "AND permission_type IN ('roles','roles+public')";
  } else {
    permissionFilter = "AND permission_type = 'roles+public'";
  }

  return `WITH active_terrain AS (
    SELECT layer_id,bounds,minzoom,maxzoom,terrain_rgb,layer_alias,category,visible
    FROM raster_tiles
    ${allowedRoleJoin}
    WHERE ${state} IS TRUE
    AND terrain_rgb IS TRUE
    ${permissionFilter}
  ), category_terrain AS (
    SELECT category,to_jsonb(l2) layers
    FROM (
      SELECT category,'raster_tiles' source,layer_id,bounds,minzoom,maxzoom,layer_alias,visible
      FROM active_terrain
      ORDER BY layer_alias
    )l,
    LATERAL (
      VALUES (source,layer_id,bounds,minzoom,maxzoom,layer_alias,visible)
    ) AS l2(source,layer_id,bounds,minzoom,maxzoom,layer_alias,visible)
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
