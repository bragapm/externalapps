const { addJob, quickAddJob } = require('graphile-worker');

async function enqueueSpriteGeneration() {
    await addJob('generateSprites', {
        bucketName: 'your-s3-bucket-name',
        iconKeys: ['icons/icon1.svg', 'icons/icon2.svg'], // Keys of your icons in S3
        spriteName: 'mysprite' // Base name for the generated sprite
    });
}

async function enqueueHello() {
    await quickAddJob(
        // makeWorkerUtils options
        { connectionString: process.env.DB_CONNECTION_STRING },

        // Task identifier
        "hello",

        // Payload
        { name: "Bobby Tables" },
    )
}

const test = async () => { enqueueHello() }
test()