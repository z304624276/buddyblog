<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p class="muted">抱歉，您访问的页面不存在</p>
      <router-link to="/" class="btn btn-primary">
        返回首页
      </router-link>
    </div>
  </div>
</template>

<script setup>
// NotFound component
</script>

<style scoped>
.not-found {
  min-height: calc(100vh - 64px - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.not-found-content {
  text-align: center;
}

.not-found h1 {
  font-size: 6rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 1rem 0;
}

.not-found h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.75rem 0;
}

.muted {
  color: #6b7280;
  margin: 0 0 2rem 0;
  font-size: 1.125rem;
}
</style>
