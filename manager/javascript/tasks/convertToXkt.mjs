import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

import configs from "@xeokit/xeokit-convert/convert2xkt.conf.js";
import { convert2xkt } from "@xeokit/xeokit-convert/dist/convert2xkt.cjs.js";

import minioClient from "../utils/minioClient.mjs";

export default async function ({ objectKey }, helpers) {
  const bucketName = process.env.STORAGE_S3_BUCKET;
  const tempDir = path.join(os.tmpdir(), `geodashboard_xkt_${objectKey}`);
  const tempInputPath = path.join(tempDir, objectKey);
  const tempOutputPath = tempInputPath + ".xkt";

  try {
    await minioClient.fGetObject(bucketName, objectKey, tempInputPath);
    await convert2xkt({
      configs,
      source: tempInputPath,
      output: tempOutputPath,
      log: (msg) => {
        console.log(msg);
      },
    });
    const xktObjectKey = `xkt/${crypto.randomUUID()}.xkt`;
    console.log(`Uploading XKT as ${xktObjectKey}`);
    await minioClient.fPutObject(bucketName, xktObjectKey, tempOutputPath);
    console.log(`XKT uploaded`);
  } catch (error) {
    console.error(error);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
