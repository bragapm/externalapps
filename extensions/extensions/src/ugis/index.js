import {
  InvalidPayloadError,
  ServiceUnavailableError,
  ForbiddenError,
} from "@directus/errors";

export default (router, { env }) => {
  router.post("/login", async (req, res, next) => {
    const { accountability } = req;
    if (!accountability.user) {
      return next(new ForbiddenError());
    }

    try {
      const resp = await fetch(env.UGIS_BASE_URL + "/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: env.UGIS_EMAIL,
          password: env.UGIS_PASSWORD,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const response = await resp.json();

      return res.json(response);
    } catch (error) {
      return next(
        new ServiceUnavailableError({
          service: "ugis",
          reason: "Failed to login to UGIS",
        })
      );
    }
  });
};
