<template>
  <div class="site-wrapper">
    <SiteHeader />
    <main class="main-content-area">
      <NuxtPage />
    </main>
    <SiteFooter />
  </div>
</template>

<script setup>
import SiteHeader from '~/components/SiteHeader.vue'
import SiteFooter from '~/components/SiteFooter.vue'
</script>

<style scoped>
.site-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content-area {
  flex-grow: 1;
}
</style>
