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
  </div>
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

header > a {
  color: #35495e;
  font-size: 1.4rem;
  font-weight: 700;
  text-decoration: none;
}

nav {
  display: flex;
  gap: 12px;
}

nav a {
  color: #56687a;
  text-decoration: none;
}

nav a.router-link-exact-active {
  color: #42b883;
  font-weight: 700;
}
</style>
