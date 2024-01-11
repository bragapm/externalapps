// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  colorMode: {
    preference: "light",
  },
  css: ["~/assets/css/main.css"],
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@pinia/nuxt", "@nuxt/image", "nuxt-svgo"],
  pinia: {
    storesDirs: ["./stores/**"],
  },
  image: {
    dir: "assets/images",
  },
  nitro: {
    routeRules: {
      "/panel/**": {
        proxy:
          process.env.NODE_ENV === "production"
            ? "http://directus:8055/**"
            // : "https://latest.geodashboard.io/panel/**",
            : "http://localhost:8055/**",
      },
    },
  },
});
