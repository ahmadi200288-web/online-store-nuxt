<template>
  <div class="page-container">
    <div class="content-wrapper">
      <h1 class="page-title">Shopping Cart</h1>

      <div v-if="cartStore.items.length === 0" class="empty-state">
        <h2>Your cart is empty!</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <button type="button" @click="router.push('/')" class="btn btn-primary">Go Shopping</button>
      </div>

      <div v-else class="cart-layout">
        <!-- Cart Items -->
        <div class="cart-items-list">
          <div class="list-header">
            <span>Product</span>
            <span class="text-center">Quantity</span>
            <span class="text-right">Total</span>
            <span></span>
          </div>

          <div class="cart-item" v-for="item in cartStore.items" :key="item.id">
            <div class="item-product">
              <img :src="item.image" :alt="item.name" class="product-image"/>
              <div class="product-details">
                <h3>{{ item.name }}</h3>
                <p>Unit Price: ${{ (item.priceAtPurchase || item.price).toFixed(2) }}</p>
              </div>
            </div>

            <div class="item-quantity">
              <span>{{ item.quantity }}</span>
            </div>

            <div class="item-total text-right">
              ${{ ((item.priceAtPurchase || item.price) * item.quantity).toFixed(2) }}
            </div>

            <div class="item-action">
              <button type="button" @click="cartStore.removeFromCart(item.id)" class="btn btn-danger">
                Remove
              </button>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="order-summary">
          <h2>Order Summary</h2>
          <div class="summary-row">
            <span>Subtotal</span>
            <span>${{ cartStore.totalPrice.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div class="summary-total">
            <span>Total</span>
            <span>${{ cartStore.totalPrice.toFixed(2) }}</span>
          </div>
          <button type="button" class="btn btn-primary btn-full">Proceed to Checkout</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../store/cart.js'

const router = useRouter()
const cartStore = useCartStore()

onMounted(async (): Promise<void> => {
  await cartStore.validateCartPrices()
})
</script>

<style scoped>
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

.content-wrapper { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

.page-title { 
  font-size: 2.5rem; 
  font-weight: 800; 
  color: var(--text); 
  margin-bottom: 30px; 
  text-align: center;
}

.cart-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  align-items: start;
}

.cart-items-list {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 25px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
}

.list-header {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr auto;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--border);
  font-weight: 600;
  color: var(--subtext);
  text-transform: uppercase;
  font-size: 0.9rem;
  margin-bottom: 15px;
  gap: 20px;
}

.cart-item {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr auto;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
  border-bottom: 1px solid var(--border);
}
.cart-item:last-child { border-bottom: none; }

.item-product { display: flex; align-items: center; gap: 15px; }
.product-image { width: 70px; height: 70px; object-fit: contain; border-radius: var(--radius); background: var(--bg); padding: 5px; }
.product-details h3 { font-size: 1.1rem; color: var(--text); margin: 0 0 4px; }
.product-details p { font-size: 0.9rem; color: var(--subtext); margin: 0; }

.item-quantity { text-align: center; font-size: 1.1rem; }
.item-total { font-weight: 700; font-size: 1.1rem; color: var(--text); }
.item-action { text-align: right; }

.text-center { text-align: center; }
.text-right { text-align: right; }

.order-summary {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 25px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  position: sticky;
  top: 20px;
}

.order-summary h2 { font-size: 1.5rem; margin-bottom: 20px; color: var(--text); }
.summary-row, .summary-total { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 1rem; }
.summary-row span:first-child, .summary-total span:first-child { color: var(--subtext); }
.summary-row span:last-child, .summary-total span:last-child { font-weight: 600; }
.summary-total { font-size: 1.2rem; font-weight: 700; color: var(--text); border-top: 2px solid var(--border); padding-top: 15px; margin-top: 15px; }

.empty-state { 
  text-align: center; 
  padding: 80px 0; 
  background-color: var(--surface);
  border-radius: var(--radius);
}
.empty-state h2 { font-size: 1.8rem; margin-bottom: 10px; }
.empty-state p { margin-bottom: 20px; color: var(--subtext); }

/* Generic Button Styles */
.btn {
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: var(--radius);
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
  border-color: var(--primary);
}
.btn-primary:hover { opacity: 0.9; }

.btn-danger {
  background-color: transparent;
  color: var(--danger);
  border-color: var(--border);
}
.btn-danger:hover {
  background-color: var(--danger);
  color: white;
  border-color: var(--danger);
}

.btn-full { 
  width: 100%; 
  padding: 12px;
  font-size: 1.1rem;
}

@media (max-width: 992px) {
  .cart-layout { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .list-header { display: none; }
  .cart-item { grid-template-columns: 1fr; text-align: center; gap: 15px; }
  .item-product { flex-direction: column; }
  .item-quantity, .item-total, .item-action { text-align: center; }
  .btn-danger { margin: 10px auto 0; }
}
</style>
