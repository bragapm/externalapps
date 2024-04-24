import { InvalidPayloadError, ServiceUnavailableError } from "@directus/errors";

export default (router, { database, logger }) => {
  router.patch("/", async (req, res, next) => {
    const { points, radius, layer, type, column } = req.body;

    // Construct the array part of the SQL for points
    let p = 0;
    const pointBindings = {};
    const makePointQueries = [];
    for (const point of points) {
      const bindingName0 = `point${p++}`;
      const bindingName1 = `point${p++}`;
      pointBindings[bindingName0] = point[0];
      pointBindings[bindingName1] = point[1];
      makePointQueries.push(`ST_MakePoint(:${bindingName0},:${bindingName1})`);
    }

    const baseSQL = `
        WITH buffer AS (
            SELECT ST_Buffer(ST_SetSRID(ST_Collect(ARRAY[${makePointQueries.join(
              ","
            )}]), 4326)::geography, :radius)::geometry AS geom
        )
    `;

    // Build the SQL
    let sql;
    if (type === "simple") {
      sql = `${baseSQL}
               SELECT 'All' as category, COUNT(*) FROM :layer:, buffer
               WHERE ST_Intersects(:layer:.geom, buffer.geom);
        `;
    } else if (type === "categorical") {
      sql = `${baseSQL}
               SELECT :column: as category, COUNT(*) FROM :layer:, buffer
               WHERE ST_Intersects(:layer:.geom, buffer.geom)
               GROUP BY :column:;
        `;
    } else {
      return next(
        new InvalidPayloadError({
          reason: 'type must be "simple" or "categorical"',
        })
      );
    }

    try {
      const { rows } = await database.raw(sql, {
        ...pointBindings,
        radius,
        layer,
        column,
      });
      return res.json(rows);
    } catch (error) {
      logger.error(error);
      return next(
        new ServiceUnavailableError({
          service: "buffer-analysis",
          reason: "Failed to apply buffer analysis",
        })
      );
    }
  });
};
