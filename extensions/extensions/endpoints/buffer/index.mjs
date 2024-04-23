import { ServiceUnavailableError } from "@directus/errors";

export default (router, { database, logger }) => {
  router.patch("/", async (req, res, next) => {
    const { points, radius, layer, type, column } = req.body;

    // Construct the array part of the SQL for points
    const pointParams = points
      .map((point) => `ST_MakePoint(${point[0]}, ${point[1]})`)
      .join(", ");

    const baseSQL = `
        WITH buffer AS (
            SELECT ST_Buffer(ST_SetSRID(ST_Collect(ARRAY[${pointParams}]), 4326)::geography, ${radius})::geometry AS geom
        )
    `;

    // Build the SQL
    let sql;
    if (type === "simple") {
      sql = `${baseSQL}
               SELECT COUNT(*) FROM "${layer}", buffer
               WHERE ST_Intersects("${layer}".geom, buffer.geom);
        `;
    } else if (type === "categorical") {
      sql = `${baseSQL}
               SELECT "${column}" as category, COUNT(*) FROM "${layer}", buffer
               WHERE ST_Intersects("${layer}".geom, buffer.geom)
               GROUP BY "${column}";
        `;
    }
    let result;
    try {
      result = (await database.raw(sql)).rows;
    } catch (error) {
      if (error.code === "FORBIDDEN") {
        return next(error);
      } else {
        logger.error(error);
        return next(
          new ServiceUnavailableError({
            service: "buffer-analysis",
            reason: "Failed to apply buffer analysis",
          })
        );
      }
    }
    return res.json(result);
  });
};
