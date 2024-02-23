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
        // delete per 1000 objects
        const chunkSize = 1000;
        const chunks = Array.from(
          new Array(Math.ceil(objectKeys.length / chunkSize)),
          (_, i) => objectKeys.slice(i * chunkSize, i * chunkSize + chunkSize)
        );
        for (const chunk of chunks) {
          try {
            await minioClient.removeObjects(env.STORAGE_S3_BUCKET, chunk);
          } catch (error) {
            logger.error(error);
          }
        }
      });
    }
  });
};
