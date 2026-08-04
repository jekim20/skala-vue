<template>
  <section class="view-about">
    <h1>서비스 소개</h1>
    <p>이 앱은 Vue 3와 Vite 기반으로 만든 날씨 대시보드 예제입니다.</p>
    <p>홈 화면에서 도시별 날씨 카드, 검색, 필터, 단위 변환을 사용해 보세요.</p>
    <p>카드의 상세보기 버튼을 누르면 해당 지역 기상 상세 페이지로 이동합니다.</p>
    <router-link to="/" class="back-link">메인 대시보드로 돌아가기</router-link>
  </section>
</template>

<style scoped>
.view-about {
  padding: 20px;
}
.back-link {
  display: inline-block;
  margin-top: 16px;
  padding: 10px 16px;
  border-radius: 12px;
  background: #42b883;
  color: white;
  text-decoration: none;
}
</style>
