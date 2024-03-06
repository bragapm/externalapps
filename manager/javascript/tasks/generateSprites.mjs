import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { execa } from "execa";

import { LAYER_ICONS_FOLDER_ID } from "../utils/const.mjs";
import minioClient from "../utils/minioClient.mjs";

export default async function ({ queueId }, helpers) {
  const bucketName = process.env.STORAGE_S3_BUCKET;

  const { withPgClient, logger } = helpers;
  logger.info(`Received generateSprites job with queue ID: ${queueId}`);

  // Use fs.mkdtemp() to create a unique temporary directory within the OS-specific temp directory
  const tempDirPrefix = path.join(os.tmpdir(), "geodashboard_sprites_");
  const spritesDir = await fs.promises.mkdtemp(tempDirPrefix);

  try {
    await withPgClient((pgClient) =>
      pgClient.query(
        `UPDATE sprite_generation_queue SET date_updated = CURRENT_TIMESTAMP, status = 'consumed' WHERE id = '${queueId}';`
      )
    );

    const { rows } = await withPgClient((pgClient) =>
      pgClient.query(
        `SELECT filename_disk, filename_download, title FROM directus_files WHERE folder = '${LAYER_ICONS_FOLDER_ID}' AND type = 'image/svg+xml'`
      )
    );
    const iconKeys = rows.map(({ filename_disk }) => filename_disk);

    logger.info("Downloading all icons");
    await Promise.all(
      iconKeys.map(async (key) => {
        return new Promise((resolve, reject) => {
          const filePath = path.join(spritesDir, key);
          const fileStream = fs.createWriteStream(filePath);
          minioClient.getObject(bucketName, key, (err, stream) => {
            if (err) {
              reject(err);
              return;
            }
            stream.pipe(fileStream).on("finish", resolve).on("error", reject);
          });
        });
      })
    );

    for (const pxRatio of [1, 2, 4]) {
      logger.info(`Generating sprite with pixel ratio ${pxRatio}`);
      const filePath = path.resolve(spritesDir, `sprite@${pxRatio}x`);
      const args = [
        "--ratio",
        pxRatio,
        "--unique",
        "--minify-index-file",
        "--sdf",
        spritesDir,
        filePath,
      ];
      await execa(`spreet`, args);

      logger.info("Uploading PNG and JSON");
      // Upload JSON and PNG to MinIO
      await minioClient.fPutObject(
        bucketName,
        `sprites/sprite@${pxRatio}x.png`,
        filePath + ".png",
        { "Content-Type": "image/png" }
      );
      logger.info(`Upload PNG ${pxRatio} Success`);

      await minioClient.fPutObject(
        bucketName,
        `sprites/sprite@${pxRatio}x.json`,
        filePath + ".json",
        { "Content-Type": "application/json" }
      );
      logger.info(`Upload JSON ${pxRatio} Success`);
    }

    await withPgClient((pgClient) =>
      pgClient.query(
        `UPDATE sprite_generation_queue SET date_updated = CURRENT_TIMESTAMP, status = 'done' WHERE id = '${queueId}';`
      )
    );
  } catch (error) {
    await withPgClient((pgClient) =>
      pgClient.query(
        `UPDATE sprite_generation_queue SET date_updated = CURRENT_TIMESTAMP, status = 'done', errors = '${error.stack}' WHERE id = '${queueId}';`
      )
    );
    logger.error(error);
  } finally {
    // Clean up the temporary directory after use
    fs.rmSync(spritesDir, { recursive: true, force: true });
  }
}
