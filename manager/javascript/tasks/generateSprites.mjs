// tasks/generateSprites.js
import spritezero from "@mapbox/spritezero";
import fs from "fs";
import path from "path";
import os from "os";
import * as Minio from "minio";

// Configure MinIO client
const minioClient = new Minio.Client({
  endPoint: "localhost", // Use your MinIO or S3 endpoint
  port: 9000, // Default MinIO port, for S3 use 443 and set useSSL to true
  useSSL: false, // Set to true for S3 or if your MinIO is set up with SSL
  accessKey: "YOUR_ACCESS_KEY",
  secretKey: "YOUR_SECRET_KEY",
});

// Adjust the endpoint, port, and useSSL according to whether you're connecting to MinIO or AWS S3

export default async function (payload, helpers) {
  const { bucketName, iconKeys, spriteName } = payload;
  const { withPgClient } = helpers;

  // Temporary directory for downloaded icons and generated sprites
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sprites-"));

  try {
    // Step 2: Download icons from S3
    await Promise.all(
      iconKeys.map(async (key) => {
        return new Promise((resolve, reject) => {
          const filePath = path.join(tempDir, key);
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

    // Step 3: Generate sprites using spritezero
    const svgs = iconKeys.map((key) => {
      return {
        svg: fs.readFileSync(path.join(tempDir, key)),
        id: path.basename(key, ".svg"),
      };
    });

    // Generate both 1x and 2x sprites
    [1, 2].forEach((pixelRatio) => {
      const pngPath = path.join(tempDir, `${spriteName}${pixelRatio}x.png`);
      spritezero.generateLayout(
        { imgs: svgs, pixelRatio, format: true },
        (err, layout) => {
          if (err) throw err;
          spritezero.generateImage(layout, (err, image) => {
            if (err) throw err;
            fs.writeFileSync(pngPath, image);
            // Step 4: Upload generated sprites back to S3
            minioClient.fPutObject(
              bucketName,
              `${spriteName}${pixelRatio}x.png`,
              pngPath,
              "image/png",
              (err, etag) => {
                if (err) {
                  console.log("Upload Error:", err);
                  return;
                }
                console.log("Upload Success, ETag:", etag);
              }
            );
          });
        }
      );
    });
  } finally {
    // Clean up the temporary directory
    fs.rmdirSync(tempDir, { recursive: true });
  }
}
