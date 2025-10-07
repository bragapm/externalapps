export default ({ filter, action }, { logger, services, env }) => {
  // GET NIK from provider payload
  filter("auth.update", async (payload, meta) => {
    const { provider, providerPayload } = meta;
    logger.info(`auth.update triggered`);

    if (provider !== "ugems") return payload;

    const { userInfo, accessToken } = providerPayload;

    let newPayload = { ...payload };
    newPayload.nik = userInfo.nik;
    newPayload.auth_data.provider_token = accessToken;

    return newPayload;
  });
  filter("auth.create", async (payload, meta) => {
    const { provider, providerPayload } = meta;
    logger.info(`auth.create triggered`);
    if (provider !== "ugems") return payload;

    const { userInfo, accessToken } = providerPayload;

    let newPayload = { ...payload };
    newPayload.nik = userInfo.nik;
    newPayload.auth_data.provider_token = accessToken;
    return newPayload;
  });

  // GET ISAFE from ESB
  action("users.create", async (meta, { schema, accountability }) => {
    const { UsersService } = services;
    const { payload, key } = meta;
    const { email } = payload;
    let accessToken;
    try {
      const res = await fetch(`${env.ESB_BASE_URL}/external/getToken`, {
        headers: {
          Authorization: `Bearer ${env.ESB_TOKEN}`,
        },
      });
      if (!res.ok) throw new Error("Res is not OK!");
      const resp = await res.json();
      accessToken = resp.token;
    } catch (error) {
      logger.error("Failed to get Token from ESB");
      logger.error(error);
    }
    let data;
    try {
      const res = await fetch(
        `${env.ESB_BASE_URL}/external/simperlist/getAll?email=${email}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!res.ok) throw new Error("Res is not OK!");

      const resp = await res.json();
      const { simper } = resp;

      if (simper.length > 0) {
        data = simper[0];
      }
    } catch (error) {
      logger.error("Failed to get simperlist");
      logger.error(error);
    }

    if (data) {
      const usersService = new UsersService({ schema, accountability });
      usersService.updateOne(key, {
        nik: data.nik,
        isafe_no: data.isafe_no,
      });
    }
  });
};
