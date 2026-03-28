import { defineStore } from "pinia";
import axios, { AxiosError } from "axios";

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  priceAtPurchase?: number;
  image?: string;
  [key: string]: any;
}

interface WishlistItem {
  id: string | number;
  name: string;
  price: number;
  currentPrice?: number;
  isSale?: boolean;
  image?: string;
  [key: string]: any;
}

interface CartData {
  id: string;
  userId: string;
  items: CartItem[];
  wishlist: WishlistItem[];
}

interface FlashSaleItem {
  id: string | number;
  productId: string | number;
  discountPrice: number;
  endTime: number;
}

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [] as CartItem[],
    wishlist: [] as WishlistItem[]
  }),

  getters: {
    totalPrice: (state): number =>
      state.items.reduce((sum, item) => {
        const price = item.priceAtPurchase || item.price;
        return sum + price * (item.quantity || 1);
      }, 0),

    cartCount: (state): number => state.items.length,
    wishlistCount: (state): number => state.wishlist.length
  },

  actions: {
    // Load from localStorage (Nuxt-safe)
    loadLocal() {
      if (process.client) {
        this.items = JSON.parse(localStorage.getItem("cart") || "[]");
        this.wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      }
    },

    save() {
      if (process.client) {
        localStorage.setItem("cart", JSON.stringify(this.items));
        localStorage.setItem("wishlist", JSON.stringify(this.wishlist));
      }
      this.saveToServer();
    },

    addToCart(product: CartItem, customPrice: number | null = null) {
      const existing = this.items.find(i => String(i.id) === String(product.id));
      const priceToUse = customPrice ?? product.price;

      if (existing) {
        existing.quantity++;
        existing.priceAtPurchase = priceToUse;
      } else {
        this.items.push({
          ...product,
          quantity: 1,
          priceAtPurchase: priceToUse
        });
      }

      this.save();
    },

    removeFromCart(productId: string | number) {
      this.items = this.items.filter(i => String(i.id) !== String(productId));
      this.save();
    },

    clearCart() {
      this.items = [];
      this.wishlist = [];
      if (process.client) {
        localStorage.removeItem("cart");
        localStorage.removeItem("wishlist");
      }
      this.saveToServer();
    },

    addToWishlist(product: WishlistItem) {
      const index = this.wishlist.findIndex(p => String(p.id) === String(product.id));
      if (index === -1) {
        this.wishlist.push(product);
      } else {
        this.wishlist.splice(index, 1);
      }
      this.save();
    },

    isInWishlist(productId: string | number): boolean {
      return this.wishlist.some(p => String(p.id) === String(productId));
    },

    async loadUserCart() {
      if (!process.client) return;

      const userStr = localStorage.getItem("user");
      if (!userStr) return;

      const user = JSON.parse(userStr);
      const userId = String(user.id);

      try {
        const res = await axios.get(`http://localhost:3000/carts/${userId}`);
        if (res.data) {
          this.items = res.data.items || [];
          this.wishlist = res.data.wishlist || [];
          this.save();
        }
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status !== 404) {
          console.error("Error loading cart:", error);
        }
      }
    },

    async validateCartPrices() {
      try {
        const [flashRes, prodRes] = await Promise.all([
          axios.get("http://localhost:3000/flashSale"),
          axios.get("http://localhost:3000/products")
        ]);

        const flashSales: FlashSaleItem[] = flashRes.data;
        const allProducts: any[] = prodRes.data;
        const now = Date.now();
        let changed = false;

        // Cart items
        this.items.forEach(item => {
          const sale = flashSales.find(f => String(f.productId) === String(item.id));
          const valid = sale && sale.endTime > now;

          if (valid) {
            if (item.priceAtPurchase !== sale.discountPrice) {
              item.priceAtPurchase = sale.discountPrice;
              changed = true;
            }
          } else {
            if (item.priceAtPurchase !== item.price) {
              item.priceAtPurchase = item.price;
              changed = true;
            }
          }
        });

        // Wishlist
        this.wishlist.forEach(w => {
          const sale = flashSales.find(f => String(f.productId) === String(w.id));
          const original = allProducts.find(p => String(p.id) === String(w.id));
          const valid = sale && sale.endTime > now;

          if (valid) {
            w.currentPrice = sale.discountPrice;
            w.isSale = true;
            changed = true;
          } else if (original) {
            w.currentPrice = original.price;
            w.isSale = false;
            changed = true;
          }
        });

        if (changed) this.save();
      } catch (error) {
        console.error("Price validation error:", error);
      }
    },

    async saveToServer() {
      if (!process.client) return;

      const userStr = localStorage.getItem("user");
      if (!userStr) return;

      const user = JSON.parse(userStr);
      const userId = String(user.id);

      const cartData: CartData = {
        id: userId,
        userId,
        items: this.items,
        wishlist: this.wishlist
      };

      try {
        await axios.put(`http://localhost:3000/carts/${userId}`, cartData);
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          await axios.post(`http://localhost:3000/carts`, cartData);
        }
      }
    }
  }
});
