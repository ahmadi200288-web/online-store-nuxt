<template>
  <div class="products-page-container">
    <div class="header-section">
      <h1 class="page-title">All Products</h1>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading products...</p>
    </div>

    <div v-else class="products-grid">
      <div v-for="product in products" :key="product.id" class="product-card">
        <div v-if="product.flashInfo" class="sale-badge">
          ⚡️ SALE
        </div>

        <button class="wishlist-btn" @click.stop="toggleWishlist(product)">
          {{ isInWishlist(product.id) ? '❤️' : '🤍' }}
        </button>

        <div class="product-image-container" @click="goToProduct(product.id)">
          <img :src="product.image" :alt="product.name" class="product-image" />
        </div>

        <div class="card-content">
          <h3 class="product-name" @click="goToProduct(product.id)">
            {{ product.name }}
          </h3>

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
            <button class="btn btn-primary" @click="addToCartHandler(product)">
              Add to Cart
            </button>
            <button class="btn btn-secondary" @click="goToProduct(product.id)">
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useCartStore } from '~/store/cart'

const router = useRouter()
const cartStore = useCartStore()

const allProducts = ref([])
const flashSales = ref([])
const loading = ref(true)
let timer: any = null

const loadData = async () => {
  loading.value = true
  try {
    const [pRes, fRes] = await Promise.all([
      axios.get("/api/products"),
      axios.get("/api/flashSale")
    ])
    allProducts.value = pRes.data
    flashSales.value = fRes.data
    startTimer()
  } catch (error) {
    console.error("Error loading data:", error)
  } finally {
    loading.value = false
  }
}

const products = computed(() => {
  return allProducts.value.map((p: any) => {
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

const toggleWishlist = (p: any) => {
  cartStore.addToWishlist(p)
}

const addToCartHandler = (p: any) => {
  const price = p.flashInfo ? p.flashInfo.discountPrice : p.price
  cartStore.addToCart(
    { ...p, quantity: 1, priceAtPurchase: price },
    price
  )
}

onMounted(loadData)
onUnmounted(() => {
    if(timer) clearInterval(timer)
})
</script>

<style scoped>
.products-page-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 15px;
}

.header-section {
  margin-bottom: 25px;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  justify-content: center;
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

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.product-image-container {
  width: 100%;
  padding-top: 100%; /* Aspect Ratio 1:1 */
  position: relative;
  cursor: pointer;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 1rem;
}

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
  transition: background-color 0.2s ease;
}

.wishlist-btn:hover { background: white; }

.card-content {
  padding: 18px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 12px;
  cursor: pointer;
  flex-grow: 1;
}

.price-container {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 16px;
}

.current-price, .discounted-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
}

.original-price {
  text-decoration: line-through;
  color: var(--subtext);
  font-size: 0.9rem;
}

.card-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: auto; /* Pushes buttons to the bottom */
}

.btn {
  padding: 10px;
  font-size: 0.95rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: var(--primary);
  animation: spin 1s ease infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
