export default ({ schedule }, { database }) => {
  schedule("*/30 * * * *", async () => {
    try {
      // Directly delete expired items from the vector_tile_cache table
      await database("vector_tile_cache")
        .where("expired_at", "<", new Date())
        .delete();
    } catch (error) {
      console.error("Error in scheduled cache cleanup:", error);
    }
  });
};
