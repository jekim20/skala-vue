<template>
  <div class="app-container">
    <header>
      <RouterLink to="/">🌤️ 날씨 대시보드</RouterLink>
      <nav>
        <RouterLink to="/">홈</RouterLink>
        <RouterLink to="/about">서비스 소개</RouterLink>
      </nav>
    </header>
    <main>
      <RouterView />
    </main>
    <footer>
      <span>Vue 3 · Router · Pinia · Axios</span>
      <span>Made for SKALA Frontend Lab</span>
    </footer>
  </div>
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  padding: 12px 16px;
  border: 1px solid rgba(214, 226, 234, 0.85);
  border-radius: 16px;
  background: rgba(255,255,255,.88);
  box-shadow: 0 8px 28px rgba(38, 70, 94, .08);
  backdrop-filter: blur(12px);
}

header > a {
  color: #35495e;
  font-size: 1.4rem;
  font-weight: 700;
  text-decoration: none;
}

nav {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 640px) {
  header { align-items: flex-start; flex-direction: column; }
}

nav a {
  padding: 7px 10px;
  border-radius: 9px;
  color: #56687a;
  text-decoration: none;
}

nav a.router-link-exact-active {
  background: #e9f8f2;
  color: #42b883;
  font-weight: 700;
}

nav a:hover { background: #f1f7f5; color: #278864; }

footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 30px;
  padding: 18px 4px 8px;
  border-top: 1px solid rgba(171, 190, 203, .45);
  color: #7c8c99;
  font-size: .78rem;
}

@media (max-width: 640px) {
  footer { flex-direction: column; }
}
</style>
