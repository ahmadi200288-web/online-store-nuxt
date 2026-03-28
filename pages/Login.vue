<template>
  <div class="auth-page">
    <h1>Login</h1>

    <form @submit.prevent="handleLogin" novalidate>
      <div>
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          aria-label="Email"
        />
      </div>

      <div>
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          aria-label="Password"
        />
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </div>

      <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user.js'
import { useCartStore } from '../store/cart.js'

interface LoginResponse {
  id: string | number
  name: string
  email: string
  password?: string
  role?: string
}

const email = ref<string>('')
const password = ref<string>('')

const isLoading = ref<boolean>(false)
const errorMessage = ref<string>('')

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const handleLogin = async (): Promise<void> => {
  errorMessage.value = ''

  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'لطفاً ایمیل و رمز عبور را وارد کنید.'
    return
  }

  isLoading.value = true

  try {
    // فقط بر اساس ایمیل فیلتر می‌کنیم (json-server اینجا مطمئن کار می‌کند)
    const res = await axios.get<LoginResponse[]>('http://localhost:3000/users', {
      params: { email: email.value.trim() }
    })

    if (!res.data || res.data.length === 0) {
      errorMessage.value = 'ایمیل اشتباه است.'
      return
    }

    const user = res.data[0] as LoginResponse

    // چک کردن پسورد در سمت کلاینت
    if (user.password !== password.value) {
      errorMessage.value = 'رمز عبور اشتباه است.'
      return
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'user'
    }

    userStore.login(safeUser as any)

    try {
      await cartStore.loadUserCart()
    } catch (cartErr) {
      console.warn('Failed to load user cart:', cartErr)
    }

    await router.push('/')
  } catch (err) {
    const axiosErr = err as AxiosError
    if (axiosErr.response) {
      errorMessage.value = 'خطا در ورود: پاسخ نامعتبر از سرور.'
    } else if (axiosErr.request) {
      errorMessage.value = 'ارتباط با سرور برقرار نشد. لطفاً اتصال اینترنت را بررسی کنید.'
    } else {
      errorMessage.value = 'خطایی رخ داد. دوباره تلاش کنید.'
    }
    console.error('Login error:', axiosErr)
  } finally {
    isLoading.value = false
    password.value = ''
  }
}

</script>

<style>
.auth-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  flex-direction: column;
}

h1 { 
  margin-bottom: 30px; 
  color: var(--dark); 
  font-weight: 800; 
}

form {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: var(--shadow-hover);
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--dark);
  margin-bottom: 8px;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #f9fafb;
  outline: none;
  transition: 0.3s;
}

input:focus { 
  border-color: var(--primary); 
  background: white; 
}

button {
  width: 100%;
  padding: 14px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: bold;
  margin-top: 10px;
  transition: 0.3s;
  cursor: pointer;
}

button:hover { 
  background: var(--primary-dark); 
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); 
}
</style>