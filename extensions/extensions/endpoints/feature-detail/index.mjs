import { ServiceUnavailableError, RouteNotFoundError } from "@directus/errors";

export default (router, { database, logger, services }) => {
  const { ItemsService } = services;
  router.get("/:layerName/:layerId", async (req, res, next) => {
    const { accountability } = req;
    const { layerName, layerId } = req.params;

    const layerItemService = new ItemsService(layerName, {
      accountability,
      schema: req.schema,
      knex: database,
    });
    const vectorTilesService = new ItemsService("vector_tiles", {
      schema: req.schema,
      knex: database,
    });

    let markdown = "";
    let attachments = [];
    try {
      const layerConfig = await vectorTilesService.readByQuery({
        filter: { layer_name: { _eq: layerName } },
        fields: ["feature_detail", "feature_detail_attachment"],
        limit: 1,
      });
      if (layerConfig.length) {
        markdown = layerConfig[0].feature_detail;
        attachments = layerConfig[0].feature_detail_attachment;
      } else {
        return next(
          new RouteNotFoundError({ path: "/feature-detail" + req.path })
        );
      }
    } catch (error) {
      logger.error(error);
      return next(
        new ServiceUnavailableError({
          service: "feature-detail",
          reason: "Failed to fetch feature detail markdown",
        })
      );
    }

    if (markdown) {
      try {
        const featureData = await layerItemService.readOne(layerId);
        markdown = markdown.replace(
          /{{\s{1}(\w+)\s{1}}}/g,
          (match, propName) => {
            if (featureData.hasOwnProperty(propName)) {
              return featureData[propName];
            } else {
              return match;
            }
          }
        );
        attachments = attachments.map((attachment) => ({
          ...attachment,
          url: featureData[attachment.url_column] ?? "#",
        }));
        return res.json({
          markdown,
          attachments,
        });
      } catch (error) {
        if (error.code === "FORBIDDEN") {
          return next(error);
        } else {
          logger.error(error);
          return next(
            new ServiceUnavailableError({
              service: "feature-detail",
              reason: "Failed to fetch feature detail",
            })
          );
        }
      }
    } else {
      return res.json({ markdown, attachments });
    }
  });
};
