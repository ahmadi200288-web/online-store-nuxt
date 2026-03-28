import { useUserStore } from '~/store/user'

export default defineNuxtRouteMiddleware(() => {
  // فقط روی کلاینت اجرا شود
  if (process.server) return

  const userStore = useUserStore()

  // قبل از چک کردن، یوزر را از localStorage لود کن
  userStore.loadUser()

  if (!userStore.isAuthenticated()) {
    return navigateTo('/login')
  }

  if (!userStore.isAdmin()) {
    return navigateTo('/')
  }
})
