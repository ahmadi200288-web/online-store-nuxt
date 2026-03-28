<template>
  <div class="auth-page">
    <h1>Register</h1>

    <form @submit.prevent="handleRegister" novalidate>
      <div>
        <label for="name">Name</label>
        <input id="name" v-model="name" required autocomplete="name" aria-label="Name" />
      </div>

      <div>
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" required autocomplete="email" aria-label="Email" />
      </div>

      <div>
        <label for="password">Password</label>
        <input id="password" v-model="password" type="password" required autocomplete="new-password" aria-label="Password" />
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Registering...' : 'Register' }}
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

interface RegisterFormData {
  name: string
  email: string
  password: string
  role: string
}

interface RegisterResponse {
  id: string | number
  name: string
  email: string
  role: string
}

const name = ref<string>('')
const email = ref<string>('')
const password = ref<string>('')

const isLoading = ref<boolean>(false)
const errorMessage = ref<string>('')

const router = useRouter()
const userStore = useUserStore()

const validateEmail = (value: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(value)
}

const handleRegister = async (): Promise<void> => {
  errorMessage.value = ''

  // Basic client-side validation
  if (!name.value.trim() || !email.value.trim() || !password.value) {
    errorMessage.value = 'لطفاً همهٔ فیلدها را پر کنید.'
    return
  }

  if (!validateEmail(email.value)) {
    errorMessage.value = 'ایمیل وارد شده معتبر نیست.'
    return
  }

  isLoading.value = true

  try {
    const payload: RegisterFormData = {
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
      role: 'user'
    }

    const res = await axios.post<RegisterResponse>('http://localhost:3000/users', payload)

    // Store only safe user info in the store (do not store password)
    const safeUser = {
      id: res.data.id,
      name: res.data.name,
      email: res.data.email,
      role: res.data.role || 'user'
    }

    userStore.login(safeUser as any)

    // Redirect to home
    await router.push('/')
  } catch (err) {
    const axiosErr = err as AxiosError
    if (axiosErr.response) {
      // server returned an error status
      errorMessage.value = 'ثبت نام ناموفق بود. پاسخ نامعتبر از سرور.'
    } else if (axiosErr.request) {
      // request made but no response
      errorMessage.value = 'ارتباط با سرور برقرار نشد. لطفاً اتصال اینترنت را بررسی کنید.'
    } else {
      errorMessage.value = 'خطایی رخ داد. دوباره تلاش کنید.'
    }
    // eslint-disable-next-line no-console
    console.error('Register error:', axiosErr)
  } finally {
    isLoading.value = false
    // Clear password for security
    password.value = ''
  }
}
</script>


<style scoped>
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