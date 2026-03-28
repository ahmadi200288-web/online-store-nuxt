<template>
  <div class="products-page">
    <div class="header-section">
      <h2 class="category-title">All Products</h2>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading products...</p>
    </div>

    <div v-else class="products-grid">
      <div v-for="product in products" :key="product.id" class="product-card">

        <div v-if="product.flashInfo" class="sale-badge">
          SALE | {{ product.flashInfo.timeLeft }}
        </div>

        <button class="wishlist-btn" @click.stop="toggleWishlist(product)">
          {{ isInWishlist(product.id) ? '❤️' : '🤍' }}
        </button>

        <div class="img-wrapper" @click="goToProduct(product.id)">
          <img :src="product.image" :alt="product.name" />
        </div>

        <div class="card-info">
          <h3 class="name" @click="goToProduct(product.id)">
            {{ product.name }}
          </h3>

          <div class="price-box">
            <template v-if="product.flashInfo">
              <span class="old-price">${{ product.price }}</span>
              <span class="new-price">${{ product.flashInfo.discountPrice }}</span>
            </template>
            <template v-else>
              <span class="new-price">${{ product.price }}</span>
            </template>
          </div>

          <div class="actions">
            <button class="add-btn" @click="addToCartHandler(product)">
              Add to Cart
            </button>
            <button class="details-btn" @click="goToProduct(product.id)">
              View
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
      axios.get("http://localhost:3000/products"),
      axios.get("http://localhost:3000/flashSale")
    ])
    allProducts.value = pRes.data
    flashSales.value = fRes.data
    startTimer()
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
    flashSales.value = flashSales.value.filter((item: any) => {
      const dist = item.endTime - now
      if (dist < 0) return false
      const h = Math.floor(dist / 3600000)
      const m = Math.floor((dist % 3600000) / 60000)
      const s = Math.floor((dist % 60000) / 1000)
      item.timeLeft = `${h}:${m}:${s}`
      return true
    })
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
onUnmounted(() => timer && clearInterval(timer))
</script>
