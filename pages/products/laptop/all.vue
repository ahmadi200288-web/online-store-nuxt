<template>
  <div class="products-page-container">
    <div class="header-section">
      <h1 class="page-title">Laptops</h1>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading products...</p>
    </div>

    <div v-else-if="filteredProducts.length" class="products-grid">
      <div v-for="product in filteredProducts" :key="product.id" class="product-card">

        <div v-if="product.flashInfo" class="sale-badge">⚡️ SALE</div>

        <button class="wishlist-btn" @click.stop="toggleWishlist(product)">
          {{ isInWishlist(product.id) ? '❤️' : '🤍' }}
        </button>

        <div class="product-image-container" @click="goToProduct(product.id)">
          <img :src="product.image" :alt="product.name" class="product-image" />
        </div>

        <div class="card-content">
          <h3 class="product-name" @click="goToProduct(product.id)">{{ product.name }}</h3>

          <div class="price-container">
            <template v-if="product.flashInfo">
              <span class="original-price">${{ product.price }}</span>
              <span class="discounted-price">${{ product.flashInfo.discountPrice }}</span>
            </template>
            <template v-else>
              <span class="current-price">${{ product.price }}</span>
            </template>
          </div>

          <div class="card-actions">
            <button class="btn btn-primary" @click="addToCartHandler(product)">Add to Cart</button>
            <button class="btn btn-secondary" @click="goToProduct(product.id)">Details</button>
          </div>
        </div>

      </div>
    </div>
    
    <div v-else class="empty-state">
        <h2>No products found</h2>
        <p>This category is currently empty.</p>
        <button @click="router.push('/')" class="btn btn-primary">Return Home</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useCartStore } from '~/store/cart'

const router = useRouter()
const cartStore = useCartStore()

const category = 'laptop'

const allProducts = ref([])
const flashSales = ref([])
const loading = ref(true)
let timer: any = null

const loadAllData = async () => {
  loading.value = true
  try {
    const [pRes, fRes] = await Promise.all([
      axios.get("/api/products"),
      axios.get("/api/flashSale")
    ])
    allProducts.value = pRes.data
    flashSales.value = fRes.data
    startTimer()
  } finally {
    loading.value = false
  }
}

const filteredProducts = computed(() => {
  return allProducts.value
    .filter((p: any) => String(p.category).toLowerCase() === category)
    .map((p: any) => {
      const flash = flashSales.value.find((f: any) => String(f.productId) === String(p.id))
      return { ...p, flashInfo: flash || null }
    })
})

const startTimer = () => {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    const now = Date.now()
    flashSales.value = flashSales.value.map(item => {
        const dist = item.endTime - now
        if (dist < 0) return { ...item, timeLeft: 'Ended' }
        const h = String(Math.floor(dist / 3600000)).padStart(2, '0')
        const m = String(Math.floor((dist % 3600000) / 60000)).padStart(2, '0')
        const s = String(Math.floor((dist % 60000) / 1000)).padStart(2, '0')
        return { ...item, timeLeft: `${h}:${m}:${s}` }
    }).filter(item => item.timeLeft !== 'Ended');
  }, 1000)
}

const goToProduct = (id: string | number) => router.push(`/products/${id}`)
const isInWishlist = (id: string | number) => cartStore.isInWishlist(id)

const toggleWishlist = (p: any) => cartStore.addToWishlist(p)

const addToCartHandler = (p: any) => {
  const price = p.flashInfo ? p.flashInfo.discountPrice : p.price
  cartStore.addToCart(
    { ...p, quantity: 1, priceAtPurchase: price },
    price
  )
}

onMounted(loadAllData)
onUnmounted(() => timer && clearInterval(timer))
</script>

<style scoped>
.products-page-container {
  padding: 40px 1rem;
}

.header-section { margin-bottom: 25px; text-align: center; }
.page-title { font-size: 2.5rem; font-weight: 800; color: var(--text); }

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  max-width: 1200px;
  margin: 0 auto;
}

.product-card {
  background: var(--surface);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  position: relative;
}

.product-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-md); }

.product-image-container { width: 100%; padding-top: 100%; position: relative; cursor: pointer; }
.product-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; padding: 1rem; }

.sale-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background-color: var(--danger);
  color: white;
  padding: 6px 10px;
  border-radius: var(--radius);
  font-size: 0.8rem;
  font-weight: 700;
  z-index: 1;
}

.wishlist-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--border);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 1.2rem;
  z-index: 1;
}

.wishlist-btn:hover { background: white; }

.card-content { padding: 18px; display: flex; flex-direction: column; flex-grow: 1; }
.product-name { font-size: 1.1rem; font-weight: 600; color: var(--text); margin-bottom: 12px; cursor: pointer; flex-grow: 1; }
.price-container { display: flex; align-items: baseline; gap: 8px; margin-bottom: 16px; }
.current-price, .discounted-price { font-size: 1.25rem; font-weight: 700; color: var(--primary); }
.original-price { text-decoration: line-through; color: var(--subtext); font-size: 0.9rem; }
.card-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: auto; }

.loading-state, .empty-state { text-align: center; padding: 100px 0; }
.spinner { width: 40px; height: 40px; border: 4px solid #eee; border-top: 4px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state h2 { font-size: 1.8rem; margin-bottom: 10px; }
.empty-state p { margin-bottom: 20px; color: var(--subtext); }
</style>
