<template>
  <div>
    <Header v-if="showNavbar" />
    <router-view />
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// ✅ You can safely call useRoute() here
const route = useRoute()
const showNavbar = computed(() => route.meta?.showNavbar !== false)
</script>