import { pipeline } from "node:stream/promises";

import { DriverS3 } from "@directus/storage-driver-s3";
import {
  createError,
  InvalidQueryError,
  ServiceUnavailableError,
  RouteNotFoundError,
} from "@directus/errors";

const validateUuid = (input) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(input);
};

const TileNotFoundError = createError(
  "TILE_NOT_FOUND",
  (ext) =>
    `Tile ${ext.z},${ext.x},${ext.y} for raster_id ${ext.raster_id} not found`,
  404
);

export default (router, { database, env, logger }) => {
  const driverS3 = new DriverS3({
    key: env.STORAGE_S3_KEY,
    secret: env.STORAGE_S3_SECRET,
    bucket: env.STORAGE_S3_BUCKET,
    endpoint: env.STORAGE_S3_ENDPOINT,
    region: env.STORAGE_S3_REGION,
    forcePathStyle: env.STORAGE_S3_FORCE_PATH_STYLE,
  });

  router.get("/:rasterId", async (req, res, next) => {
    const { accountability } = req;
    let { z, x, y } = req.query;
    const { rasterId } = req.params;

    // validate uuid
    if (!validateUuid(rasterId)) {
      return next(new RouteNotFoundError({ path: "/raster-tiles" + req.path }));
    }

    let rasterTileRows;
    // get raster tile entry
    try {
      ({ rows: rasterTileRows } = await database.raw(
        `
        WITH allowed_roles_query AS (
          SELECT ARRAY_AGG(directus_roles_id) allowed_roles
          FROM raster_tiles_directus_roles
          WHERE raster_tiles_raster_id = :rasterId
        )
        SELECT permission_type, allowed_roles
        FROM raster_tiles, allowed_roles_query
        WHERE raster_id = :rasterId
      `,
        { rasterId }
      ));
    } catch (error) {
      logger.error(error);
      return next(
        new ServiceUnavailableError({
          service: "raster-tiles",
          reason: "Failed to fetch raster tile entry",
        })
      );
    }

    if (!rasterTileRows.length) {
      return next(new RouteNotFoundError({ path: "/raster-tiles" + req.path }));
    }

    switch (rasterTileRows[0].permission_type) {
      case "admin":
        if (!accountability.admin) {
          return next(
            new RouteNotFoundError({ path: "/raster-tiles" + req.path })
          );
        }
        break;

      case "roles":
        if (
          !accountability.admin &&
          (!accountability.role ||
            !Array.isArray(rasterTileRows[0].allowed_roles) ||
            !rasterTileRows[0].allowed_roles.includes(accountability.role))
        ) {
          return next(
            new RouteNotFoundError({ path: "/raster-tiles" + req.path })
          );
        }
        break;

      case "roles+public":
        if (
          !accountability.admin &&
          accountability.role &&
          (!Array.isArray(rasterTileRows[0].allowed_roles) ||
            !rasterTileRows[0].allowed_roles.includes(accountability.role))
        ) {
          return next(
            new RouteNotFoundError({ path: "/raster-tiles" + req.path })
          );
        }
        break;

      default:
        return next(
          new ServiceUnavailableError({
            service: "raster-tiles",
            reason: `Unexpected uploaded raster tile permission type for ${rasterId}: ${rasterTileRows[0].permission_type}`,
          })
        );
    }

    z = parseInt(z);
    x = parseInt(x);
    y = parseInt(y);

    if (isNaN(z) || isNaN(x) || isNaN(y) || z < 0 || x < 0 || y < 0) {
      return next(new InvalidQueryError({ reason: "Invalid z, x, y" }));
    }

    const objectKey = `raster-tiles/${rasterId}/${z}/${x}/${y}.png`;

    let tileExists;
    try {
      tileExists = await driverS3.exists(objectKey);
    } catch (error) {
      logger.error(error);
      return next(
        new ServiceUnavailableError({
          service: "raster-tiles",
          reason: "Failed to fetch tile availability",
        })
      );
    }

    if (tileExists) {
      let fileStream;
      try {
        fileStream = await driverS3.read(objectKey);
      } catch (error) {
        logger.error(error);
        return next(
          new ServiceUnavailableError({
            service: "raster-tiles",
            reason: "Failed to fetch tile",
          })
        );
      }

      try {
        res.setHeader("Content-Type", "image/png");
        await pipeline(fileStream, res);
      } catch (error) {
        logger.error(error);
      }
    } else {
      return next(new TileNotFoundError({ z, x, y, raster_id: rasterId }));
    }
  });
};
