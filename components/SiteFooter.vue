<template>
  <footer class="site-footer">
    <div class="footer-content">
      <NuxtLink to="/about" class="link">About Us</NuxtLink>
      <NuxtLink to="/contact" class="link">Contact Us</NuxtLink>

      <a
        href="https://www.google.com/maps?q=40.7128,-74.0060"
        target="_blank"
        class="map-link"
        title="Visit our Store"
      >
        <img src="/images/4.jpg" alt="Map" class="map-icon" />
      </a>
    </div>
  </footer>
</template>

<script setup lang="ts">
// No logic needed
</script>

<style scoped>
.site-footer {
  background: var(--surface);
  border-top: 1px solid var(--border);
  padding: 2rem 1rem;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  max-width: 1280px; /* Ensures consistency with main page content */
  margin: 0 auto; /* Centers the content */
}

.link {
  color: var(--subtext);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}

.link:hover {
  color: var(--primary);
}

.map-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.map-icon:hover {
  transform: scale(1.1);
  border-color: var(--primary);
}
</style>
