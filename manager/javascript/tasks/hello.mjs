export default async function (payload, helpers) {
  const { withPgClient } = helpers;
  const {
    rows: [row],
  } = await withPgClient((pgClient) =>
    pgClient.query(`select '${payload.name}' as name`)
  );
  console.log(row);
  console.log(`Hello, ${payload.name}!`);
}
