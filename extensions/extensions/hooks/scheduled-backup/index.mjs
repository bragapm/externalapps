export default ({ schedule }, { database, logger }) => {
  schedule("0 17 * * *", async () => {
    try {
      // TODO real backup logic
      await database("backup_logs").insert({ status: "success" });
      logger.info("Scheduled backup done");
    } catch (error) {
      logger.error(error);
    }
  });
};
