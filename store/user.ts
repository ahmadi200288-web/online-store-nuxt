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

  // Load user from localStorage (Nuxt-safe)
  const loadUser = () => {
    if (process.client) {
      const raw = localStorage.getItem("user");
      if (raw) {
        try {
          user.value = JSON.parse(raw);
        } catch {
          user.value = null;
        }
      }
    }
  };

  const login = (data: User) => {
    user.value = data;
    if (process.client) {
      localStorage.setItem("user", JSON.stringify(data));
    }
  };

  const logout = () => {
    user.value = null;
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
    isAdmin
  };
});
