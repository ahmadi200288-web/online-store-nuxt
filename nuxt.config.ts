export default defineNuxtConfig({
  devServer: {
    port: 3001
  },
  compatibilityDate: '2025-07-15',
  modules: ['@pinia/nuxt'],
  css: ['~/style.css'],
  devtools: { enabled: true },
  routeRules: {
    // ہر درخواستی کہ با api/ شروع شود به پورت 3005 (محل اجرای json-server) پروکسی می‌شود
    '/api/**': { proxy: 'http://127.0.0.1:3005/**' },
  }
})
