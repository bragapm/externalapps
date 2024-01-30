import minioClient from "../../utils/minioClient.mjs";

export default ({ action }, { env, logger }) => {
  action("raster_tiles.items.delete", async ({ keys }) => {
    for (const layerId of keys) {
      const rasterTilePath = `raster-tiles/${layerId}/`;

      const objectKeys = [];
      const listStream = minioClient.listObjectsV2(
        env.STORAGE_S3_BUCKET,
        rasterTilePath,
        true
      );
      listStream.on("data", (item) => {
        objectKeys.push(item.name);
      });
      listStream.on("error", (error) => {
        logger.error(error);
      });
      listStream.on("end", async () => {
        try {
          await minioClient.removeObjects(env.STORAGE_S3_BUCKET, objectKeys);
        } catch (error) {
          logger.error(error);
        }
      });
    }
  });
};
