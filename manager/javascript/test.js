const { quickAddJob } = require('graphile-worker');
require('dotenv').config()

async function enqueueGenerateSprites() {
    await quickAddJob(
        { connectionString: process.env.DB_CONNECTION_STRING },
        "generateSprites",
        { name: "Bobby Tables" },
    )
}

const test = async () => { enqueueGenerateSprites() }
test()