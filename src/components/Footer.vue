<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-brand">
        <div class="brand">
          <span>codebuddy</span> 制作的博客
        </div>
        <p class="muted">使用vue3技术栈制作,Vercel部署，Supabase作为简易后端</p>
      </div>

      <div class="footer-links">
        <a href="https://vercel.com/" target="_blank" rel="noopener noreferrer" class="link">
          Vercel
        </a>
        <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" class="link">
          Supabase
        </a>
        <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer" class="link">
          Vite
        </a>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" class="link">
          GitHub
        </a>
      </div>
    </div>

    <div class="footer-bottom">
      <p class="muted">© {{ new Date().getFullYear() }}</p>
    </div>
  </footer>
</template>

<script setup>
// Footer component
</script>

<style scoped>
.footer {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 2px solid var(--border);
  margin-top: auto;
  position: relative;
  overflow: hidden;
}

.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 4px;
  background: linear-gradient(90deg, transparent, var(--accent), var(--secondary), transparent);
  border-radius: 0 0 4px 4px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.footer-brand {
  flex: 1;
}

.brand {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 0.6rem;
}

.brand span {
  background: linear-gradient(135deg, var(--accent) 0%, var(--secondary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.muted {
  color: var(--muted);
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.footer-links {
  display: flex;
  gap: 1.8rem;
}

.link {
  color: var(--text);
  text-decoration: none;
  transition: all 0.3s;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  position: relative;
}

.link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent), var(--secondary));
  transition: all 0.3s;
  transform: translateX(-50%);
}

.link:hover {
  color: var(--accent);
  background: rgba(240, 247, 255, 0.5);
}

.link:hover::before {
  width: 80%;
}

.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.2rem 1.5rem;
  border-top: 2px solid var(--border);
  text-align: center;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
  }

  .footer-links {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
