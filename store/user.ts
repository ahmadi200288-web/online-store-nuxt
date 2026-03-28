import { defineStore } from "pinia";
import { ref } from "vue";

interface User {
  id: string | number;
  name: string;
  email: string;
  role: "admin" | "user";
  [key: string]: any;
}

export const useUserStore = defineStore("user", () => {
  const user = ref<User | null>(null);

  // Load user from cookie (works on SSR) with localStorage fallback (client)
  const loadUser = () => {
    try {
      // Try cookie first (available on server & client)
      const cookie = useCookie("user");
      if (cookie && cookie.value) {
        // cookie.value may be object or string depending on serialization
        user.value =
          typeof cookie.value === "string" ? JSON.parse(cookie.value) : cookie.value;
        return;
      }

      // Fallback to localStorage on client
      if (process.client) {
        const raw = localStorage.getItem("user");
        if (raw) {
          user.value = JSON.parse(raw);
        } else {
          user.value = null;
        }
      }
    } catch (e) {
      user.value = null;
    }
  };

  const login = (data: User) => {
    user.value = data;

    // Persist to cookie so SSR/middleware can read it
    const cookie = useCookie("user", { path: "/", maxAge: 60 * 60 * 24 * 7 }); // 7 days
    cookie.value = data;

    // Also persist to localStorage for client-only operations
    if (process.client) {
      localStorage.setItem("user", JSON.stringify(data));
    }
  };

  const logout = () => {
    user.value = null;

    // Remove cookie (works both server & client)
    const cookie = useCookie("user");
    cookie.value = null;

    // Remove localStorage on client
    if (process.client) {
      localStorage.removeItem("user");
    }
  };

  const isAuthenticated = () => !!user.value;
  const isAdmin = () => user.value?.role === "admin";

  // auto-load on store init
  loadUser();

  return {
    user,
    login,
    logout,
    loadUser,
    isAuthenticated,
    isAdmin,
  };
});