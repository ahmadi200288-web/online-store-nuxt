<template>
  <header class="header">
    <div class="header-container">

      <!-- Mobile: Hamburger Icon -->
      <button class="hamburger" @click="toggleMobileNav">
        <span class="line"></span>
        <span class="line"></span>
        <span class="line"></span>
      </button>

      <!-- Logo -->
      <div class="logo" @click="router.push('/')">
        <img src="/images/logo.jpg" alt="Logo Site">
      </div>

      <!-- Desktop: Main Navigation -->
      <nav class="nav desktop-nav">
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
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search for products..."
          @input="handleSearch"
        />
        <div v-if="searchResults.length > 0" class="search-results">
          <div
            v-for="p in searchResults"
            :key="p.id"
            @click="goToProduct(p.id)"
            class="result-item"
          >{{ p.name }}</div>
        </div>
      </div>

      <!-- User Actions Group -->
      <div class="user-actions-group">
        <div class="actions">
          <NuxtLink to="/wishlist" class="icon-box">
            <span class="icon">❤</span>
            <span class="badge" v-if="cartStore.wishlistCount">{{ cartStore.wishlistCount }}</span>
          </NuxtLink>
          <NuxtLink to="/cart" class="icon-box">
            <span class="icon">🛒</span>
            <span class="badge" v-if="cartStore.cartCount">{{ cartStore.cartCount }}</span>
          </NuxtLink>
        </div>
        <!-- Auth section for desktop -->
        <div class="login-register">
          <div v-if="userStore.user" class="user-info">
            <span>Hi, {{ userStore.user.name }}</span>
            <button @click="handleLogout" class="logout-btn">Log Out</button>
          </div>
          <div v-else class="auth-links">
            <NuxtLink to="/login">Login</NuxtLink>
            <span class="sep">|</span>
            <NuxtLink to="/register">Register</NuxtLink>
          </div>
        </div>
      </div>

    </div>

    <!-- Mobile: Navigation Drawer -->
    <div class="overlay" v-show="isMobileNavOpen" @click="closeMobileNav"></div>
    <nav class="mobile-nav" :class="{ 'is-open': isMobileNavOpen }">
      <!-- Auth Section for Mobile -->
      <div class="mobile-auth">
        <div v-if="userStore.user" class="user-info">
          <span class="user-name">Hi, {{ userStore.user.name }}</span>
          <button @click="handleLogout" class="logout-btn">Log Out</button>
        </div>
        <div v-else class="auth-links-mobile">
          <NuxtLink to="/login" @click="closeMobileNav" class="btn btn-primary">Login</NuxtLink>
          <NuxtLink to="/register" @click="closeMobileNav" class="btn btn-secondary">Register</NuxtLink>
        </div>
      </div>

      <!-- Mobile Navigation Links -->
      <div class="mobile-nav-group">
        <h3 class="mobile-nav-heading">Mobiles</h3>
        <NuxtLink to="/products/mobile/all" @click="closeMobileNav">All Mobiles</NuxtLink>
        <NuxtLink to="/products/mobile/samsung" @click="closeMobileNav">Samsung</NuxtLink>
        <NuxtLink to="/products/mobile/apple" @click="closeMobileNav">Apple</NuxtLink>
      </div>

      <div class="mobile-nav-group">
        <h3 class="mobile-nav-heading">Laptops</h3>
        <NuxtLink to="/products/laptop/all" @click="closeMobileNav">All Laptops</NuxtLink>
        <NuxtLink to="/products/laptop/hp" @click="closeMobileNav">HP</NuxtLink>
        <NuxtLink to="/products/laptop/dell" @click="closeMobileNav">Dell</NuxtLink>
      </div>
    </nav>

  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useCartStore } from '~/store/cart'
import { useUserStore } from '~/store/user'

interface SearchProduct { id: string | number; name: string; [key: string]: any; }

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const isMobileNavOpen = ref(false)
const searchQuery = ref("")
const searchResults = ref<SearchProduct[]>([])
const searchContainer = ref<HTMLElement | null>(null)

const toggleMobileNav = () => isMobileNavOpen.value = !isMobileNavOpen.value
const closeMobileNav = () => isMobileNavOpen.value = false

let timeout: any = null

const handleSearch = () => {
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(async () => {
    if (searchQuery.value.length < 2) {
      searchResults.value = []
      return
    }
    try {
      const res = await axios.get(`/api/products?name_like=${searchQuery.value}`)
      searchResults.value = res.data.slice(0, 5)
    } catch (error) { console.error("Search error:", error) }
  }, 300)
}

const goToProduct = (id: string | number) => {
  router.push(`/products/${id}`)
  searchQuery.value = ""
  searchResults.value = []
  closeMobileNav()
}

const handleLogout = () => {
  userStore.logout()
  cartStore.clearCart()
  router.push("/")
  closeMobileNav()
}

const handleClickOutside = (event: MouseEvent) => {
  if (searchContainer.value && !searchContainer.value.contains(event.target as Node)) {
    searchResults.value = []
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
/* =================================== */
/*          BASE & MOBILE             */
/* =================================== */
.header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  display: grid;
  grid-template-areas:
    "hamburger logo actions"
    "search search search";
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.5rem 1rem;
  padding: 0.75rem 1rem;
  width: 100%;
  box-sizing: border-box;
}

.hamburger { grid-area: hamburger; justify-self: start; }
.logo { grid-area: logo; justify-self: center; }
.user-actions-group { grid-area: actions; justify-self: end; }
.search-section { grid-area: search; position: relative; }

.desktop-nav, .user-actions-group .login-register { display: none; }

.logo img { height: 40px; cursor: pointer; border-radius: 50%; }

/* --- Hamburger Button FIX --- */
.hamburger {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  -webkit-tap-highlight-color: transparent; /* Remove tap highlight */
}
.hamburger:focus, .hamburger:active {
  outline: none;
  box-shadow: none;
}
.hamburger .line { width: 24px; height: 3px; background: var(--text); border-radius: 3px; }

.user-actions-group .actions { display: flex; align-items: center; gap: 1.5rem; }

.icon-box { position: relative; color: var(--subtext); text-decoration: none; display: flex; }
.icon { font-size: 1.5rem; }
.badge { position: absolute; top: -4px; right: -8px; background: var(--danger); color: white; font-size: 0.65rem; font-weight: 600; padding: 2px 5px; border-radius: 50%; }

.search-section input { width: 100%; padding: 10px; border-radius: var(--radius); border: 1px solid var(--border); }

/* --- Mobile Navigation REWORK --- */
.mobile-nav {
  position: fixed;
  top: 0;
  left: -300px; /* Start hidden OFF-SCREEN */
  width: 300px;
  height: 100%;
  background: var(--surface);
  box-shadow: var(--shadow-lg);
  transition: left 0.35s ease;
  z-index: 102;
  display: flex;
  flex-direction: column;
  gap: 0; /* No gap, use borders for separation */
  box-sizing: border-box;
  overflow-y: auto; /* Allow scrolling if content is too long */
}
.mobile-nav.is-open { left: 0; }

.overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 101; }

.mobile-auth {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}
.auth-links-mobile { display: flex; gap: 0.75rem; }
.mobile-auth .user-info { display: flex; flex-direction: column; gap: 1rem; }

.mobile-nav-group {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
}

.mobile-nav-heading {
  padding: 0.25rem 1rem 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
}

.mobile-nav-group a {
  display: block;
  font-size: 1rem;
  text-decoration: none;
  padding: 0.6rem 1rem 0.6rem 2rem; /* Indented links */
  color: var(--subtext);
  border-radius: 0;
}
.mobile-nav-group a:hover {
  background-color: var(--bg);
  color: var(--primary);
}

/* Hide the old separator class */
.mobile-nav-separator { display: none; }

/* =================================== */
/*             DESKTOP                 */
/* =================================== */
@media (min-width: 1024px) {
  .header-container { display: flex; align-items: center; gap: 2rem; padding: 0.5rem 2rem; }
  .hamburger, .mobile-nav, .overlay, .mobile-auth { display: none; }
  .desktop-nav, .user-actions-group .login-register { display: flex; align-items: center; }

  .desktop-nav { gap: 1.5rem; }
  .auth-links { display: flex; align-items: center; gap: 0.75rem; white-space: nowrap; }

  /* Auth Links Styling */
  .auth-links a {
    font-weight: 500;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 4px;
    color: var(--subtext);
    transition: color 0.2s ease;
  }
  .auth-links a:hover {
    color: var(--primary);
  }

  .logo, .desktop-nav { flex-shrink: 0; }
  .search-section { flex-grow: 1; min-width: 100px; }
  .user-actions-group { flex-shrink: 0; display: flex; align-items: center; gap: 2rem; }

  /* --- FINAL DROPDOWN FIX --- */
  .dropdown { position: relative; }
  .dropdown .drop-btn { font-weight: 500; color: var(--subtext); cursor: pointer; }
  .dropdown .drop-btn:hover { color: var(--primary); }

  .dropdown-content {
    display: none;
    position: absolute;
    top: 100%; /* Position directly below parent */
    left: 0;
    background: var(--surface);
    min-width: 180px;
    border-radius: var(--radius);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border);
    z-index: 1000;
    padding: 0.5rem;
    margin-top: 0; /* NO GAP ensures stable hover */
  }

  .dropdown:hover .dropdown-content { display: block; }

  .dropdown-content a { display: block; padding: 10px 12px; color: var(--text); text-decoration: none; border-radius: var(--radius); }
  .dropdown-content a:hover { background: var(--bg); color: var(--primary); }
}
</style>
