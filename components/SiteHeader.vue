<template>
  <header class="header">
    <div class="header-container">

      <!-- Logo -->
      <div class="logo" @click="router.push('/')">
        <img src="/images/logo.jpg" alt="Logo Site">
      </div>

      <!-- Navigation -->
      <nav class="nav">
        <div class="dropdown">
          <span class="drop-btn">Mobiles ▾</span>
          <div class="dropdown-content">
            <NuxtLink to="/products/mobile/all">All Mobiles</NuxtLink>
            <NuxtLink to="/products/mobile/samsung">Samsung</NuxtLink>
            <NuxtLink to="/products/mobile/apple">Apple</NuxtLink>
          </div>
        </div>

        <div class="dropdown">
          <span class="drop-btn">Laptops ▾</span>
          <div class="dropdown-content">
            <NuxtLink to="/products/laptop/all">All Laptops</NuxtLink>
            <NuxtLink to="/products/laptop/hp">HP</NuxtLink>
            <NuxtLink to="/products/laptop/dell">Dell</NuxtLink>
          </div>
        </div>
      </nav>

      <!-- Search -->
      <div class="search-section" ref="searchContainer">
        <div>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search..."
            @input="handleSearch"
          />

          <div v-if="searchResults.length > 0" class="search-results">
            <div
              v-for="p in searchResults"
              :key="p.id"
              @click="goToProduct(p.id)"
              class="result-item"
            >
              {{ p.name }}
            </div>
          </div>
        </div>
      </div>

      <!-- Icons -->
      <div class="actions">
        <div class="icons">

          <div class="icon-box" @click="router.push('/wishlist')">
            <span class="icon">❤</span>
            <span class="badge" v-if="cartStore.wishlistCount">
              {{ cartStore.wishlistCount }}
            </span>
          </div>

          <div class="icon-box" @click="router.push('/cart')">
            <span class="icon">🛒</span>
            <span class="badge" v-if="cartStore.cartCount">
              {{ cartStore.cartCount }}
            </span>
          </div>

        </div>
      </div>

      <!-- Login / Register -->
      <div class="login-register">

        <div v-if="userStore.user" class="user-info">
          <span class="welcome-msg">Hi, {{ userStore.user.name }}</span>
          <button @click="handleLogout" class="logout-btn">Log Out</button>
        </div>

        <div v-else class="auth-links">
          <NuxtLink to="/login">Login</NuxtLink>
          <span class="sep"> | </span>
          <NuxtLink to="/register">Register</NuxtLink>
        </div>

      </div>

    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useCartStore } from '~/store/cart'
import { useUserStore } from '~/store/user'

interface SearchProduct {
  id: string | number
  name: string
  [key: string]: any
}

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const searchQuery = ref("")
const searchResults = ref<SearchProduct[]>([])
const searchContainer = ref<HTMLElement | null>(null)

let timeout: any = null

const handleSearch = () => {
  if (timeout) clearTimeout(timeout)

  timeout = setTimeout(async () => {
    if (searchQuery.value.length < 2) {
      searchResults.value = []
      return
    }

    try {
      const res = await axios.get(
        `http://localhost:3000/products?name_like=${searchQuery.value}`
      )
      searchResults.value = res.data.slice(0, 5)
    } catch (error) {
      console.error("Search error:", error)
    }
  }, 700)
}

const goToProduct = (id: string | number) => {
  router.push(`/products/${id}`)
  searchQuery.value = ""
  searchResults.value = []
}

const handleLogout = () => {
  userStore.logout()
  cartStore.clearCart()
  router.push("/")
}

const handleClickOutside = (event: MouseEvent) => {
  if (searchContainer.value && !searchContainer.value.contains(event.target as Node)) {
    searchQuery.value = ""
    searchResults.value = []
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>



<style scoped>
.header {
  background: rgba(230, 226, 226, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 2000;
  padding: 15px 0;
  transition: all 0.3s ease;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 25px;
  gap: 20px;
}

.logo {
  flex-shrink: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.logo img {
  height: 70px;
  width: auto;
  object-fit: contain;
  mix-blend-mode: multiply;
  border-radius: 50%;
}

.nav {
  display: flex;
  gap: 25px;
  font-weight: 500;
  font-size: 0.95rem;
  position: relative;
  z-index: 1001;
}

.dropdown {
  position: relative;
  padding: 10px 0;
}

.drop-btn {
  cursor: pointer;
  color: var(--dark);
  transition: color 0.2s;
}

.drop-btn:hover { color: var(--primary); }

.dropdown-content {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  min-width: 200px;
  border-radius: var(--radius);
  box-shadow: var(--shadow-hover);
  border: 1px solid var(--border);
  overflow: hidden;
  z-index: 9999;
  animation: slideDown 0.2s ease;
}

.dropdown:hover .dropdown-content { display: block; }

.dropdown-content a {
  display: block;
  padding: 12px 15px;
  color: var(--dark);
  font-size: 0.9rem;
}

.dropdown-content a:hover {
  background: #f9fafb;
  color: var(--primary);
}

.search-section {
  flex: 1;
  max-width: 500px;
  position: relative;
  z-index: 1;
}

.search-section input {
  width: 100%;
  padding: 12px 20px;
  border-radius: 50px;
  border: 1px solid var(--border);
  background: #f9fafb;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.3s;
}

.search-results {
  position: absolute;
  top: 55px;
  left: 0;
  width: 100%;
  background: white;
  z-index: 100;
  border-radius: var(--radius);
  box-shadow: var(--shadow-hover);
  border: 1px solid var(--border);
}

.actions { display: flex; align-items: center; }
.icons { display: flex; gap: 20px; }

.icon-box {
  position: relative;
  cursor: pointer;
  font-size: 1.4rem;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--danger);
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 20px;
}

.logout-btn {
  background: white;
  border: 1px solid var(--danger);
  color: var(--danger);
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 900px) {
  .header-container {
    flex-wrap: wrap;
  }

  .logo img {
    height: 50px;
  }

  .nav {
    order: 3;
    width: 100%;
    justify-content: center;
    gap: 15px;
    margin-top: 10px;
    border-top: 1px solid var(--border);
    padding-top: 10px;
    z-index: 10;
  }

  .search-section {
    order: 4;
    width: 100%;
    max-width: none;
    margin-top: 10px;
    z-index: 1;
  }

  .login-register {
    display: none;
  }
}
</style>