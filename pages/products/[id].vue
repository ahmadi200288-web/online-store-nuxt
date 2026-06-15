<template>
  <div class="product-page-container">

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading product...</p>
    </div>

    <div v-else-if="product" class="product-details-layout">

      <!-- Left: Image -->
      <div class="product-image-card">
        <img :src="product.image" :alt="product.name" />
      </div>

      <!-- Right: Info -->
      <div class="product-info-card">

        <h1 class="product-name">{{ product.name }}</h1>

        <p class="product-meta">
          <span>Category: <strong>{{ product.category }}</strong></span>
          <span class="meta-divider">|</span>
          <span>Brand: <strong>{{ product.brand }}</strong></span>
        </p>

        <!-- Flash Sale -->
        <div v-if="product.flashInfo" class="flash-sale-badge">
          ⚡️ Flash Sale | Ends in: {{ product.flashInfo.timeLeft }}
        </div>

        <!-- Prices -->
        <div class="price-section">
          <template v-if="product.flashInfo">
            <span class="original-price">${{ product.price }}</span>
            <span class="discounted-price">${{ product.flashInfo.discountPrice }}</span>
          </template>
          <template v-else>
            <span class="current-price">${{ product.price }}</span>
          </template>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="btn btn-primary add-to-cart-btn" @click="addToCartHandler">
            Add to Cart
          </button>
          <button class="btn btn-secondary wishlist-btn" @click="toggleWishlist">
            {{ isInWishlist(product.id) ? '❤️ In Wishlist' : '🤍 Add to Wishlist' }}
          </button>
        </div>

        <!-- Description -->
        <div class="product-description" v-if="product.description">
          <h3>Description</h3>
          <p>{{ product.description }}</p>
        </div>

      </div>

    </div>

    <!-- Not Found State -->
    <div v-else class="empty-state">
      <h2>Product Not Found</h2>
      <p>We couldn't find the product you're looking for.</p>
      <button @click="router.push('/')" class="btn btn-primary">Return to Home</button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useCartStore } from '~/store/cart'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const product = ref<any>(null)
const flashSales = ref<any[]>([])
const loading = ref(true)
let timer: any = null

const loadProduct = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const [pRes, fRes] = await Promise.all([
      axios.get(`/api/products/${id}`),
      axios.get(`/api/flashSale`)
    ])

    product.value = pRes.data
    flashSales.value = fRes.data

    const flash = flashSales.value.find((f: any) => String(f.productId) === String(id))
    if (flash) {
      product.value.flashInfo = flash
      startTimer()
    }

  } catch (err) {
    console.error("Failed to load product:", err)
  } finally {
    loading.value = false
  }
}

const startTimer = () => {
  if (timer) clearInterval(timer)

  timer = setInterval(() => {
    if (!product.value?.flashInfo) return

    const now = Date.now()
    const dist = product.value.flashInfo.endTime - now

    if (dist <= 0) {
      product.value.flashInfo = null
      clearInterval(timer)
      return
    }

    const h = String(Math.floor(dist / 3600000)).padStart(2, '0')
    const m = String(Math.floor((dist % 3600000) / 60000)).padStart(2, '0')
    const s = String(Math.floor((dist % 60000) / 1000)).padStart(2, '0')
    product.value.flashInfo.timeLeft = `${h}:${m}:${s}`
  }, 1000)
}

const addToCartHandler = () => {
  const price = product.value.flashInfo
    ? product.value.flashInfo.discountPrice
    : product.value.price

  cartStore.addToCart(
    {
      id: product.value.id,
      name: product.value.name,
      price: product.value.price,
      image: product.value.image,
      quantity: 1,
      priceAtPurchase: price
    },
    price
  )
}

const isInWishlist = (id: string | number) => cartStore.isInWishlist(id)

const toggleWishlist = () => {
  cartStore.addToWishlist({
    id: product.value.id,
    name: product.value.name,
    price: product.value.price,
    image: product.value.image,
    category: product.value.category,
    brand: product.value.brand
  })
}

onMounted(loadProduct)
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.product-page-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

.product-details-layout {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 40px;
  align-items: flex-start;
}

.product-image-card, .product-info-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 30px;
  box-shadow: var(--shadow-sm);
}

.product-image-card img {
  width: 100%;
  height: auto;
  max-height: 450px;
  object-fit: contain;
  border-radius: var(--radius);
}

.product-name {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 12px;
  color: var(--text);
}

.product-meta {
  font-size: 1rem;
  color: var(--subtext);
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.meta-divider { color: var(--border); }

.flash-sale-badge {
  background-color: var(--danger);
  color: white;
  padding: 8px 14px;
  border-radius: var(--radius);
  font-weight: 700;
  margin-bottom: 24px;
  display: inline-block;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 30px;
}

.current-price, .discounted-price {
  font-size: 2rem;
  font-weight: 800;
  color: var(--primary);
}

.original-price {
  text-decoration: line-through;
  color: var(--subtext);
  font-size: 1.2rem;
}

.action-buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 30px;
}

.btn {
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 700;
  border-radius: var(--radius);
  cursor: pointer;
  border: none;
}

.btn-primary.add-to-cart-btn {
  background-color: var(--primary);
  color: white;
  flex-grow: 1;
}

.btn-secondary.wishlist-btn {
  background-color: transparent;
  border: 1px solid var(--border);
  color: var(--subtext);
}

.btn:hover {
  opacity: 0.9;
}

.product-description {
  margin-top: 30px;
  color: var(--text);
}

.product-description h3 {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 12px;
  border-bottom: 2px solid var(--border);
  padding-bottom: 8px;
}

.product-description p {
  line-height: 1.7;
  font-size: 1rem;
}

/* Loading and Empty States */
.loading-state, .empty-state {
  text-align: center;
  padding: 80px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 5px solid var(--bg);
  border-top: 5px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .product-details-layout {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  .product-name { font-size: 1.8rem; }
  .price-section span { font-size: 1.5rem; }
}
</style>
