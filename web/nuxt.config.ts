// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  colorMode: {
    preference: 'light'
  },
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxt/image', 'nuxt-svgo'],
  pinia: {
    storesDirs: ['./stores/**'],
  },
  image: {
    dir: 'assets/images'
  }
})
