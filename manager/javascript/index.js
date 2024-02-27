const { run } = require("graphile-worker");
require('dotenv').config()

async function main() {
    const runner = await run({
        connectionString: process.env.DB_CONNECTION_STRING,
        maxPoolSize: 10,
        pollInterval: 2000,
        preparedStatements: true,
        schema: "graphile_worker",
        crontabFile: "crontab",
        concurrentJobs: 3,
        fileExtensions: [".js", ".cjs", ".mjs"],
        taskDirectory: `${__dirname}/tasks`,
    });
    await runner.promise;
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
