<template>
  <div class="products-page">
    <div class="header-section">
      <h2 class="category-title">
        mobile / samsung
      </h2>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading products...</p>
    </div>

    <div v-else-if="filteredProducts.length > 0" class="products-grid">
      <div v-for="product in filteredProducts" :key="product.id" class="product-card">
        
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

    <div v-else class="empty-state">
      <p>No products found.</p>
      <button @click="router.push('/')" class="home-btn">Return Home</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useCartStore } from '~/store/cart'

const router = useRouter()
const cartStore = useCartStore()

// ثابت‌ها
const category = 'mobile'
const brand = 'samsung'

const allProducts = ref([])
const flashSales = ref([])
const loading = ref(true)
let timer: any = null

const loadAllData = async () => {
  loading.value = true
  try {
    const [pRes, fRes] = await Promise.all([
      axios.get("http://localhost:3000/products"),
      axios.get("http://localhost:3000/flashSale")
    ])
    allProducts.value = pRes.data
    flashSales.value = fRes.data
    startTimer()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const filteredProducts = computed(() => {
  return allProducts.value
    .filter((p: any) => {
      const cMatch = String(p.category).toLowerCase() === category
      const bMatch = String(p.brand).toLowerCase() === brand
      return cMatch && bMatch
    })
    .map((p: any) => {
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

const goToProduct = (id: string | number) => {
  router.push(`/products/${id}`)
}

const isInWishlist = (productId: string | number) => {
  return cartStore.isInWishlist(productId)
}

const toggleWishlist = (product: any) => {
  cartStore.addToWishlist({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    category: product.category,
    brand: product.brand
  })
}

const addToCartHandler = (product: any) => {
  const price = product.flashInfo ? product.flashInfo.discountPrice : product.price
  cartStore.addToCart(
    {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      priceAtPurchase: price
    },
    price
  )
  alert(`${product.name} به سبد خرید اضافه شد!`)
}

onMounted(() => loadAllData())

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.products-page {
  padding: 40px 5%;
  min-height: 80vh;
}

.header-section {
  border-bottom: 1px solid var(--border);
  margin-bottom: 30px;
  padding-bottom: 10px;
}

.category-title {
  text-transform: uppercase;
  color: var(--dark);
  font-size: 1.8rem;
  font-weight: 800;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 30px;
}

.product-card {
  background: white;
  border: 1px solid transparent;
  border-radius: var(--radius);
  padding: 20px;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-hover);
  border-color: var(--primary);
}

.img-wrapper {
  width: 100%;
  height: 200px;
  cursor: pointer;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.img-wrapper img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: 0.3s;
}
.product-card:hover .img-wrapper img { transform: scale(1.05); }

.sale-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  background: var(--danger);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: bold;
  z-index: 2;
}

.wishlist-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  border: 1px solid var(--border);
  background: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  padding: 0;
}

.wishlist-btn:hover {
  border-color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
}

.card-info { flex-grow: 1; display: flex; flex-direction: column; }

.name {
  font-size: 1rem;
  margin: 0 0 10px 0;
  cursor: pointer;
  color: var(--dark);
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price-box { margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
.new-price { font-size: 1.25rem; font-weight: 800; color: var(--primary); }
.old-price { text-decoration: line-through; color: var(--light); font-size: 0.9rem; }

.actions { display: flex; gap: 10px; margin-top: auto; }

.add-btn {
  flex: 2;
  background: var(--dark);
  color: white;
  border: none;
  padding: 10px;
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
