import minioClient from "../../utils/minioClient.mjs";

export default ({ action }, { env, logger }) => {
  action("xkt.items.delete", async ({ keys }) => {
    for (const xktId of keys) {
      const xktPath = `xkt/${xktId}.xkt`;

      try {
        await minioClient.removeObject(env.STORAGE_S3_BUCKET, xktPath);
      } catch (error) {
        logger.error(error);
      }
    }
  });
};
