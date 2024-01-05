import { join } from "node:path";

import { DriverS3 } from "@directus/storage-driver-s3";

export default ({ action }, { env }) => {
  action(
    "raster_tiles.items.delete",
    async ({ keys }) => {
      const driverS3 = new DriverS3({
        key: env.STORAGE_S3_KEY,
        secret: env.STORAGE_S3_SECRET,
        bucket: env.STORAGE_S3_BUCKET,
        endpoint: env.STORAGE_S3_ENDPOINT,
        region: env.STORAGE_S3_REGION,
        forcePathStyle: env.STORAGE_S3_FORCE_PATH_STYLE,
      });

      // override function so we could delete objects with trailing slash (folder)
      driverS3.fullPath = (path) => {
        return join(driverS3.root, path);
      };

      for (const rasterId of keys) {
        const rasterTilePath = `raster-tiles/${rasterId}/`;
        // we need to empty its content first
        // list contents
        const objectKeys = [];
        for await (const objectKey of driverS3.list(rasterTilePath)) {
          objectKeys.push(objectKey);
        }
        // delete in reverse
        for (let i = objectKeys.length - 1; i >= 0; i--) {
          const objectKey = objectKeys[i];
          await driverS3.delete(objectKey);
        }
        await driverS3.delete(rasterTilePath);
      }
    }
  );
};
