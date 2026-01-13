<template>
  <div class="layout" ref="layoutRef">
    <slot name="header"></slot>

    <main class="main">
      <slot></slot>
    </main>

    <slot name="footer"></slot>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const layoutRef = ref(null)

// 存储滚动位置
const scrollPositions = new Map()

const saveScrollPosition = () => {
  if (layoutRef.value) {
    scrollPositions.set(route.path, layoutRef.value.scrollTop)
  }
}

const restoreScrollPosition = () => {
  if (layoutRef.value) {
    const position = scrollPositions.get(route.path) || 0
    layoutRef.value.scrollTop = position
  }
}

onMounted(() => {
  window.addEventListener('scroll', saveScrollPosition, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', saveScrollPosition, true)
})

watch(() => route.path, () => {
  setTimeout(restoreScrollPosition, 0)
}, { immediate: true })
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  scroll-behavior: smooth;
}

.main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}
</style>
