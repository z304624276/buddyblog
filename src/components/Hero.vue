<template>
  <section class="hero">
    <div class="hero-content">
      <h1>欢迎来到 探索Ai的博客</h1>
      <p class="hero-subtitle">分享你的想法,讨论Ai编程的更多可能</p>

      <div class="hero-actions">
        <router-link to="/posts" class="btn btn-primary btn-lg" @click="handleClick">
          浏览文章
        </router-link>
        <router-link to="/dashboard" class="btn btn-outline btn-lg" @click="handleClick">
          开始创作
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
// Hero component
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 247, 255, 0.95) 100%);
  border-radius: 32px;
  padding: 5rem 3rem;
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
  border: 2px solid var(--border);
}

.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 50%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero h1 {
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--text);
  margin: 0 0 1.5rem 0;
  background: linear-gradient(135deg, #667eea 0%, #3b82f6 50%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 1.35rem;
  color: var(--muted);
  margin: 0 0 2.5rem 0;
  font-weight: 600;
}

.hero-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .hero {
    padding: 3rem 2rem;
    border-radius: 24px;
  }

  .hero h1 {
    font-size: 2.2rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .hero-actions .btn {
    width: 100%;
  }
}
</style>
