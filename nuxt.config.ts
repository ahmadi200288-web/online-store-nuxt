export default defineNuxtConfig({
  devServer: {
    port: 3001
  },
  compatibilityDate: '2025-07-15',
  modules: ['@pinia/nuxt'],
  css: ['~/style.css'],
  devtools: { enabled: true }
})
