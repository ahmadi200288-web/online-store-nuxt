
<template>
  <div class="home-page">
    <!-- Hero Slider -->
    <section class="hero-slider" v-if="slides.length > 0">
      <div class="slider-container">
        <div
          v-for="(slide, index) in slides"
          :key="slide.id"
          :class="['slide', { active: index === currentSlide }]"
        >
          <img :src="slide.image" :alt="slide.title" />
          <div class="slide-content">
            <h1>{{ slide.title }}</h1>
            <a v-if="slide.link" :href="slide.link" class="cta-btn">Shop Now</a>
          </div>
        </div>

        <button @click="prevSlide" class="nav-btn prev">❮</button>
        <button @click="nextSlide" class="nav-btn next">❯</button>
      </div>
    </section>

    <!-- Flash Sales Section -->
    <div v-if="flashSaleProducts.length > 0" class="content-section">
      <h2 class="section-title">⚡️ Flash Sales</h2>
      <div class="products-grid-layout">
        <div v-for="product in flashSaleProducts" :key="product.id" class="product-card">

          <div class="sale-badge">⏱ {{ product.flashInfo?.timeLeft }}</div>

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
                <span class="original-price">${{ product.price }}</span>
                <span class="discounted-price">${{ product.flashInfo.discountPrice }}</span>
            </div>

            <div class="card-actions">
              <button class="btn btn-primary" @click="addToCart(product)">
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

    <!-- New Arrival Products -->
    <div class="content-section">
      <h2 class="section-title">New Arrivals</h2>
      <div class="products-grid-layout">
        <div v-for="product in newArrivalProducts" :key="product.id" class="product-card">
          
          <div v-if="product.flashInfo" class="sale-badge">⚡️ SALE</div>

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
            
            <p class="product-brand">{{ product.brand }}</p>

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
              <button class="btn btn-primary" @click="addToCart(product)">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useCartStore } from "~/store/cart";

const router = useRouter()
const cartStore = useCartStore()

/* ------------------ Interfaces ------------------ */
interface Slide { id: string | number; title: string; image: string; link?: string; }
interface FlashSale { id: string | number; productId: string | number; discountPrice: number; endTime: number; timeLeft?: string; }
interface Product { id: string | number; name: string; image: string; price: number; category: string; brand: string; [key: string]: any; }
interface ProductWithFlash extends Product { flashInfo: FlashSale | null; }

/* ------------------ State ------------------ */
const slides = ref<Slide[]>([])
const allProducts = ref<Product[]>([])
const flashSales = ref<FlashSale[]>([])
const currentSlide = ref<number>(0)

let sliderTimer: any = null
let flashTimer: any = null

/* ------------------ Computed ------------------ */
const flashSaleProducts = computed(() => {
  const now = Date.now()
  return allProducts.value
    .map((p) => {
      const flash = flashSales.value.find(f => String(f.productId) === String(p.id))
      if (flash && flash.endTime > now) return { ...p, flashInfo: flash }
      return null
    })
    .filter(Boolean) as ProductWithFlash[]
})

const newArrivalProducts = computed(() => {
  const now = Date.now();
  return allProducts.value.slice(0, 4).map(p => {
    const flash = flashSales.value.find(f => String(f.productId) === String(p.id) && f.endTime > now);
    return { ...p, flashInfo: flash || null };
  }) as ProductWithFlash[];
})

/* ------------------ Navigation ------------------ */
const goToProduct = (id: string | number) => router.push(`/products/${id}`)

/* ------------------ Wishlist ------------------ */
const isInWishlist = (id: string | number) => cartStore.isInWishlist(id)
const toggleWishlist = (p: ProductWithFlash) => cartStore.addToWishlist(p)


/* ------------------ Load Data ------------------ */
const loadData = async () => {
  try {
    const [sRes, pRes, fRes] = await Promise.all([
      axios.get('/api/slides'),
      axios.get('/api/products'),
      axios.get('/api/flashSale')
    ])
    slides.value = sRes.data
    allProducts.value = pRes.data
    flashSales.value = fRes.data
    startFlashTimer()
  } catch (err) { console.error('Error loading data:', err) }
}

/* ------------------ Cart ------------------ */
const addToCart = (p: ProductWithFlash) => {
  const price = p.flashInfo ? p.flashInfo.discountPrice : p.price;
  cartStore.addToCart({ ...p, quantity: 1, priceAtPurchase: price }, price);
}

/* ------------------ Slider ------------------ */
const nextSlide = () => { if (slides.value.length === 0) return; currentSlide.value = (currentSlide.value + 1) % slides.value.length; }
const prevSlide = () => { if (slides.value.length === 0) return; currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length; }
const startSliderTimer = () => { if (sliderTimer) clearInterval(sliderTimer); sliderTimer = setInterval(nextSlide, 5000); }

/* ------------------ Flash Timer ------------------ */
const startFlashTimer = () => {
  if (flashTimer) clearInterval(flashTimer)
  flashTimer = setInterval(() => {
    const now = Date.now()
    flashSales.value = flashSales.value.map((sale) => {
      const dist = sale.endTime - now
      if (dist > 0) {
        const h = String(Math.floor(dist / 3600000)).padStart(2, '0')
        const m = String(Math.floor((dist % 3600000) / 60000)).padStart(2, '0')
        const s = String(Math.floor((dist % 60000) / 1000)).padStart(2, '0')
        sale.timeLeft = `${h}:${m}:${s}`
      }
      return sale
    }).filter(sale => sale.endTime > now)
  }, 1000)
}

/* ------------------ Lifecycle ------------------ */
onMounted(() => { loadData(); startSliderTimer(); })
onUnmounted(() => { if (sliderTimer) clearInterval(sliderTimer); if (flashTimer) clearInterval(flashTimer); })
</script>

<style scoped>
.home-page { width: 100%; }

.content-section {
  width: 100%;
  padding: 40px 2rem;
  box-sizing: border-box;
}

.section-title { font-size: 2.2rem; font-weight: 800; color: var(--text); margin-bottom: 25px; text-align: center; }

/* Full-width Hero Slider */
.hero-slider {
  width: 100%;
  height: 500px; 
  position: relative; 
  overflow: hidden; 
  background: #000; 
  margin-bottom: 2rem; 
}
.slider-container { position: relative; width: 100%; height: 100%; }
.slide { position: absolute; width: 100%; height: 100%; opacity: 0; transition: opacity 0.5s ease-in-out; }
.slide.active { opacity: 1; }
.slide img { width: 100%; height: 100%; object-fit: cover; }
.slide-content { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; text-align: center; z-index: 2; }
.slide-content h1 { font-size: 3rem; font-weight: 800; margin-bottom: 20px; text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.6); }
.cta-btn { display: inline-block; padding: 12px 30px; background: var(--primary); color: white; border-radius: var(--radius); text-decoration: none; font-weight: 600; transition: all 0.3s ease; }
.cta-btn:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.nav-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255, 255, 255, 0.7); border: none; width: 50px; height: 50px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; z-index: 3; }
.nav-btn:hover { background: white; }
.nav-btn.prev { left: 20px; }
.nav-btn.next { right: 20px; }

/* Grids & Cards */
.products-grid-layout { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
  gap: 25px;
  width: 100%;
  margin: 0 auto;
  max-width: 1280px; /* Adding a max-width for large screens */
}
.product-card { background: var(--surface); border-radius: var(--radius); border: 1px solid var(--border); overflow: hidden; box-shadow: var(--shadow-sm); transition: transform 0.2s ease, box-shadow 0.2s ease; display: flex; flex-direction: column; position: relative; }
.product-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-md); }
.product-image-container { width: 100%; padding-top: 100%; position: relative; cursor: pointer; background-color: var(--bg); }
.product-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; padding: 1rem; }
.sale-badge { position: absolute; top: 12px; left: 12px; background-color: var(--danger); color: white; padding: 6px 10px; border-radius: var(--radius); font-size: 0.8rem; font-weight: 700; z-index: 1; }
.wishlist-btn { position: absolute; top: 12px; right: 12px; background: rgba(255, 255, 255, 0.8); border: 1px solid var(--border); border-radius: 50%; width: 36px; height: 36px; display: flex; justify-content: center; align-items: center; cursor: pointer; font-size: 1.2rem; z-index: 1; }
.wishlist-btn:hover { background: white; }
.card-content { padding: 18px; display: flex; flex-direction: column; flex-grow: 1; }
.product-name { font-size: 1.1rem; font-weight: 600; color: var(--text); margin-bottom: 8px; cursor: pointer; }
.product-brand { font-size: 0.9rem; color: var(--subtext); margin-bottom: 12px; }
.price-container { display: flex; align-items: baseline; gap: 8px; margin-bottom: 16px; flex-grow: 1; align-items: flex-end; }
.current-price, .discounted-price { font-size: 1.25rem; font-weight: 700; color: var(--primary); }
.original-price { text-decoration: line-through; color: var(--subtext); font-size: 0.9rem; }
.card-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.btn-primary { background-color: var(--primary); color: white; }
.btn-secondary { background-color: transparent; border: 1px solid var(--border); color: var(--subtext); }

/* Responsive Design */
@media (max-width: 1024px) { .hero-slider { height: 400px; } }
@media (max-width: 768px) {
  .hero-slider { height: 300px; }
  .slide-content h1 { font-size: 1.8rem; }
  .section-title { font-size: 1.8rem; }
}
@media (max-width: 480px) {
  .hero-slider { height: 220px; }
  .slide-content h1 { font-size: 1.3rem; }
  .cta-btn { padding: 8px 20px; font-size: 0.9rem; }
}

</style>
