<template>
  <div class="page-container">
    <div class="content-wrapper">
      <h1 class="page-title">My Wishlist</h1>

      <div v-if="!cartStore.wishlist || cartStore.wishlist.length === 0" class="empty-state">
        <h2>Your wishlist is empty.</h2>
        <p>Add your favorite products here to keep track of them.</p>
        <NuxtLink to="/" class="btn btn-primary">Discover Products</NuxtLink>
      </div>

      <div v-else class="products-grid-layout">
        <div v-for="product in cartStore.wishlist" :key="product.id" class="product-card">

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
              <button 
                type="button"
                @click="addToCartHandler(product)" 
                class="btn btn-primary"
              >
                Add to Cart
              </button>
              <button
                type="button"
                @click="cartStore.addToWishlist(product)"
                class="btn btn-secondary"
                title="Remove"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../store/cart.js'

const cartStore = useCartStore()
const router = useRouter()

const goToProduct = (id: string | number) => {
  router.push(`/products/${id}`)
}

const addToCartHandler = (product: any) => {
    const price = product.flashInfo ? product.flashInfo.discountPrice : product.price;
    cartStore.addToCart(
        { ...product, quantity: 1, priceAtPurchase: price },
        price
    );
}
</script>

<style scoped>
/* Using shared styles for consistency */
.page-container {
  width: 100vw;
  min-height: 100vh;
  padding: 40px 1rem;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  position: relative;
  box-sizing: border-box;
}

.content-wrapper { 
  max-width: 1200px; 
  margin: 0 auto; 
  padding: 0 20px; 
}

.page-title { 
  font-size: 2.5rem; 
  font-weight: 800; 
  color: var(--text); 
  margin-bottom: 30px; 
  text-align: center;
}

.products-grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
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
  padding-top: 100%;
  position: relative;
  cursor: pointer;
  background-color: var(--bg);
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
  grid-template-columns: 2fr 1fr;
  gap: 10px;
  margin-top: auto;
}

.empty-state { 
  text-align: center; 
  padding: 80px 0; 
  background-color: var(--surface);
  border-radius: var(--radius);
}
.empty-state h2 { font-size: 1.8rem; margin-bottom: 10px; }
.empty-state p { margin-bottom: 20px; color: var(--subtext); }
</style>