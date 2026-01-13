<template>
  <Layout>
    <template #header>
      <Header />
    </template>

    <RouterView />

    <template #footer>
      <Footer />
    </template>
  </Layout>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import Layout from '@/components/Layout.vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initialize()
})
</script>
