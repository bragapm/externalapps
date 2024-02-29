import { quickAddJob } from "graphile-worker";
import dotenv from "dotenv";

dotenv.config();

async function enqueueGenerateSprites() {
  await quickAddJob(
    { connectionString: process.env.DB_CONNECTION_STRING },
    "generateSprites",
    { queueId: crypto.randomUUID() }
  );
}

const test = async () => {
  enqueueGenerateSprites();
};
test();
