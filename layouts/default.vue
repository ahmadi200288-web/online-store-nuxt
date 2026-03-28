<template>
  <div>
    <SiteHeader />

    <main>
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
main {
  min-height: 70vh;
}
</style>
