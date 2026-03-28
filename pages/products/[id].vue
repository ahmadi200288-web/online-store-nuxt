<template>
  <div class="products-page">

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading product...</p>
    </div>

    <div v-else-if="product" class="single-product">

      <!-- Image -->
      <div class="single-img-wrapper">
        <img :src="product.image" :alt="product.name" />
      </div>

      <!-- Info -->
      <div class="single-info">

        <h2 class="single-name">{{ product.name }}</h2>

        <p class="single-meta">
          Category: <strong>{{ product.category }}</strong> |
          Brand: <strong>{{ product.brand }}</strong>
        </p>

        <!-- Flash Sale -->
        <div v-if="product.flashInfo" class="sale-badge single-sale">
          SALE | {{ product.flashInfo.timeLeft }}
        </div>

        <!-- Prices -->
        <div class="price-box">
          <template v-if="product.flashInfo">
            <span class="old-price">${{ product.price }}</span>
            <span class="new-price">${{ product.flashInfo.discountPrice }}</span>
          </template>

          <template v-else>
            <span class="new-price">${{ product.price }}</span>
          </template>
        </div>

        <!-- Actions -->
        <div class="actions">
          <button class="add-btn" @click="addToCartHandler">
            Add to Cart
          </button>

          <button class="details-btn" @click="toggleWishlist">
            {{ isInWishlist(product.id) ? '❤️' : '🤍' }}
          </button>
        </div>

        <!-- Description -->
        <p class="single-desc" v-if="product.description">
          {{ product.description }}
        </p>

      </div>

    </div>

    <div v-else class="empty-state">
      <p>Product not found.</p>
      <button @click="router.push('/')" class="home-btn">Return Home</button>
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
      axios.get(`http://localhost:3000/products/${id}`),
      axios.get(`http://localhost:3000/flashSale`)
    ])

    product.value = pRes.data
    flashSales.value = fRes.data

    const flash = flashSales.value.find((f: any) => String(f.productId) === String(id))
    if (flash) product.value.flashInfo = flash

    startTimer()
  } catch (err) {
    console.error(err)
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

    if (dist < 0) {
      product.value.flashInfo = null
      return
    }

    const h = Math.floor(dist / 3600000)
    const m = Math.floor((dist % 3600000) / 60000)
    const s = Math.floor((dist % 60000) / 1000)
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
onUnmounted(() => timer && clearInterval(timer))
</script>

<style scoped>
/* از همان استایل کارت‌ها استفاده می‌کنیم */

.products-page {
  padding: 40px 5%;
  min-height: 80vh;
}

.single-product {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.single-img-wrapper {
  width: 350px;
  height: 350px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow);
}

.single-img-wrapper img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.single-info {
  flex: 1;
}

.single-name {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 10px;
  color: var(--dark);
}

.single-meta {
  color: var(--light);
  margin-bottom: 20px;
}

.single-sale {
  position: static;
  margin-bottom: 15px;
}

.single-desc {
  margin-top: 20px;
  color: var(--dark);
  line-height: 1.6;
}

/* بقیه استایل‌ها از فایل کارت‌ها کپی شده */
.price-box { margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
.new-price { font-size: 1.25rem; font-weight: 800; color: var(--primary); }
.old-price { text-decoration: line-through; color: var(--light); font-size: 0.9rem; }

.actions { display: flex; gap: 10px; margin-top: 20px; }

.add-btn {
  flex: 2;
  background: var(--dark);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.3s;
}
.add-btn:hover { background: var(--primary); }

.details-btn {
  flex: 1;
  background: var(--bg);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: var(--dark);
  font-weight: 600;
  transition: 0.3s;
}
.details-btn:hover { background: var(--border); }

.loading-state, .empty-state { text-align: center; padding: 100px 0; }
.spinner { width: 40px; height: 40px; border: 4px solid #eee; border-top: 4px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.home-btn { 
  padding: 10px 20px; 
  background: var(--primary); 
  color: white; 
  border: none; 
  border-radius: 8px;
  cursor: pointer;
}
</style>