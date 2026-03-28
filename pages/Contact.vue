<template>
  <div class="contact-page">
    <div class="container">
      <h1>Contact Us</h1>

      <form @submit.prevent="handleSubmit" novalidate>
        <div>
          <label for="name">Name:</label>
          <input
            id="name"
            name="name"
            v-model="form.name"
            type="text"
            required
            aria-label="Your name"
            autocomplete="name"
          />
        </div>

        <div>
          <label for="email">Email:</label>
          <input
            id="email"
            name="email"
            v-model="form.email"
            type="email"
            required
            aria-label="Your email"
            autocomplete="email"
          />
        </div>

        <div>
          <label for="message">Message:</label>
          <textarea
            id="message"
            name="message"
            v-model="form.message"
            required
            aria-label="Your message"
            rows="6"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="isSending">
            {{ isSending ? 'Sending...' : 'Send' }}
          </button>
        </div>

        <p v-if="successMessage" class="success-msg">{{ successMessage }}</p>
        <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

interface ContactForm {
  name: string
  email: string
  message: string
}

const form = ref<ContactForm>({
  name: '',
  email: '',
  message: ''
})

const isSending = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const handleSubmit = async (): Promise<void> => {
  successMessage.value = ''
  errorMessage.value = ''

  // Basic client-side validation
  if (!form.value.name.trim() || !form.value.email.trim() || !form.value.message.trim()) {
    errorMessage.value = 'لطفاً همهٔ فیلدها را پر کنید.'
    return
  }

  if (!validateEmail(form.value.email)) {
    errorMessage.value = 'ایمیل وارد شده معتبر نیست.'
    return
  }

  isSending.value = true

  try {
    // تغییر آدرس به endpoint واقعی در صورت نیاز
    await axios.post('http://localhost:3000/contacts', {
      name: form.value.name,
      email: form.value.email,
      message: form.value.message,
      createdAt: Date.now()
    })

    successMessage.value = 'پیام شما با موفقیت ارسال شد. متشکریم!'
    form.value = { name: '', email: '', message: '' }
  } catch (err) {
    console.error('Contact submit error:', err)
    errorMessage.value = 'ارسال پیام با خطا مواجه شد. دوباره تلاش کنید.'
  } finally {
    isSending.value = false
  }
}
</script>

<style scoped>
.container { max-width: 720px; margin: 0 auto; padding: 1rem; }
.form-actions { margin-top: 1rem; }
.success-msg { color: #0a8; margin-top: 0.8rem; }
.error-msg { color: #d00; margin-top: 0.8rem; }
button[disabled] { opacity: 0.6; cursor: not-allowed; }
.contact-page {
  padding: 60px 0;
  min-height: 80vh;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
}

h1 {
  font-size: 2rem;
  font-weight: 800;
  color: var(--dark);
  margin-bottom: 30px;
  text-align: center;
}

form {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: var(--shadow);
}

div {
  margin-bottom: 20px;
}

label {
  display: block;
  font-weight: 600;
  color: var(--dark);
  margin-bottom: 8px;
}

input,
textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  outline: none;
  font-family: inherit;
}

input:focus,
textarea:focus {
  border-color: var(--primary);
  background: white;
}

textarea {
  resize: vertical;
  min-height: 120px;
}

button {
  width: 100%;
  padding: 14px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

button:hover {
  background: var(--primary-dark);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}
</style>