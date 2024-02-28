import fs from "fs";
import os from "os";
import path from "path";

import spritezero from "@elastic/spritezero";

import { LAYER_ICONS_FOLDER_ID } from "../utils/const.mjs";
import minioClient from "../utils/minioClient.mjs";

function generateLayoutAsync(svgs, pixelRatio, format, sdf) {
  return new Promise((resolve, reject) => {
    spritezero.generateLayout(
      { imgs: svgs, pixelRatio, format, sdf },
      (err, layout) => {
        if (err) reject(err);
        else resolve(layout);
      }
    );
  });
}

function generateImageAsync(layout) {
  return new Promise((resolve, reject) => {
    spritezero.generateImage(layout, (err, image) => {
      if (err) reject(err);
      else resolve(image);
    });
  });
}

export default async function (payload, helpers) {
  const bucketName = process.env.STORAGE_S3_BUCKET;

  // Use fs.mkdtemp() to create a unique temporary directory within the OS-specific temp directory
  const tempDirPrefix = path.join(os.tmpdir(), "sprites-");
  const spritesDir = await fs.promises.mkdtemp(tempDirPrefix);

  try {
    const { withPgClient } = helpers;
    const { rows } = await withPgClient((pgClient) =>
      pgClient.query(
        `select filename_disk, filename_download, title from public.directus_files where folder = '${LAYER_ICONS_FOLDER_ID}' and type = 'image/svg+xml'`
      )
    );
    const iconKeys = rows.map(({ filename_disk }) => filename_disk);

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
      const svgs = iconKeys.map((key) => ({
        svg: fs.readFileSync(path.join(spritesDir, key)),
        id: path.basename(key, ".svg"),
      }));

      const pngPath = path.resolve(spritesDir, `sprite@${pxRatio}x.png`);
      const jsonPath = path.resolve(spritesDir, `sprite@${pxRatio}x.json`);

      // Generate image layout for PNG sprite image
      const imageLayout = await generateLayoutAsync(svgs, pxRatio, false, true);
      const image = await generateImageAsync(imageLayout);
      fs.writeFileSync(pngPath, image);

      // Generate data layout for JSON sprite manifest
      const dataLayout = await generateLayoutAsync(svgs, pxRatio, true, true);
      fs.writeFileSync(jsonPath, JSON.stringify(dataLayout));

      // Upload JSON and PNG to MinIO
      await minioClient.fPutObject(
        bucketName,
        `sprites/sprite@${pxRatio}x.png`,
        pngPath,
        { "Content-Type": "image/png" }
      );
      console.log(`Upload PNG ${pxRatio} Success`);

      await minioClient.fPutObject(
        bucketName,
        `sprites/sprite@${pxRatio}x.json`,
        jsonPath,
        { "Content-Type": "application/json" }
      );
      console.log(`Upload JSON ${pxRatio} Success`);
    }
  } catch (error) {
    console.log(error);
  } finally {
    // Clean up the temporary directory after use
    fs.rmSync(spritesDir, { recursive: true, force: true });
  }
}
