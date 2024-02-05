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

    let template = "";
    try {
      const layerConfig = await vectorTilesService.readByQuery({
        filter: { layer_name: { _eq: layerName } },
        fields: ["feature_detail"],
        limit: 1,
      });
      if (layerConfig.length) {
        template = layerConfig[0].feature_detail;
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
          reason: "Failed to fetch feature detail template",
        })
      );
    }

    if (template) {
      try {
        const featureData = await layerItemService.readOne(layerId);
        template = template.replace(
          /{{\s{1}(\w+)\s{1}}}/g,
          (match, propName) => {
            if (featureData.hasOwnProperty(propName)) {
              return featureData[propName];
            } else {
              return match;
            }
          }
        );
        return res.json({ data: template });
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
      return res.json({ data: template });
    }
  });
};
