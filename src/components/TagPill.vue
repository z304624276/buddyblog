<template>
  <span
    class="tag-pill"
    :class="{ active: isActive }"
    :style="{ '--tag-color': tag?.color || '#3b82f6' }"
  >
    {{ tag?.name || name }}
  </span>
</template>

<script setup>
const props = defineProps({
  tag: {
    type: Object,
    default: null
  },
  name: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.tag-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 1rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.9);
  color: var(--tag-color);
  border: 2px solid var(--tag-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tag-pill:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: var(--tag-color);
  color: #fff;
}

.tag-pill.active {
  background: var(--tag-color);
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.tag-pill.active:hover {
  opacity: 0.9;
  transform: translateY(-2px) scale(1.05);
}
</style>
