export async function up(knex) {
  await knex.transaction(async (trx) => {
    await trx.raw(`CREATE TABLE IF NOT EXISTS backup_logs (
  backup_id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  status character varying,
  date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP
)`);
    await trx("directus_collections").insert({
      collection: "backup_logs",
      icon: "backup_table",
      color: "#E35169",
      group: "internal",
    });
    await trx("directus_fields").insert([
      {
        collection: "backup_logs",
        field: "backup_id",
        special: "uuid",
        interface: "input",
        readonly: true,
        hidden: true,
      },
      {
        collection: "backup_logs",
        field: "status",
        interface: "select-dropdown",
        options: {
          choices: [
            { text: "Success", value: "success" },
            { text: "Failed", value: "failed" },
          ],
        },
        display: "labels",
        display_options: {
          choices: [
            {
              text: "Success",
              value: "success",
              foreground: "#FFFFFF",
              background: "#2ECDA7",
            },
            {
              text: "Failed",
              value: "failed",
              foreground: "#FFFFFF",
              background: "#E35169",
            },
          ],
        },
        readonly: true,
      },
      {
        collection: "backup_logs",
        field: "date_created",
        special: "date-created",
        interface: "datetime",
        display: "datetime",
        display_options: { relative: true },
        readonly: true,
        hidden: true,
      },
    ]);
  });
}

export async function down(knex) {
  await knex.transaction(async (trx) => {
    await trx("directus_fields").where("collection", "backup_logs").del();
    await trx("directus_collections").where("collection", "backup_logs").del();
    await trx.raw("DROP TABLE IF EXISTS backup_logs");
  });
}
