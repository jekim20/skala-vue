<script setup>
const features = [
  { icon: '🌤️', title: '날씨 대시보드', text: '전국 18개 도시의 기온과 날씨를 카드·통계·지도에서 한눈에 확인합니다.', tags: ['Computed', 'Props', 'Emit'] },
  { icon: '🧭', title: 'Router 탐색', text: '홈과 도시 상세 화면을 자연스럽게 오가며 Hash Router로 Pages 새로고침도 지원합니다.', tags: ['Vue Router', 'Route Params', 'Lazy Load'] },
  { icon: '🌡️', title: 'Pinia 설정 Store', text: '섭씨와 화씨 설정을 Store에서 관리해 메인과 상세 화면이 같은 단위를 공유합니다.', tags: ['Pinia', 'Getter', 'Action'] },
  { icon: '⚾', title: 'KBO 우천 예보', text: '각 구장 좌표의 OpenWeather 관측값을 경기 일정과 결합해 취소 위험과 직관 팁을 제공합니다.', tags: ['OpenWeather', 'Data Mapping', 'Filter'] },
  { icon: '📍', title: '내 위치 맞춤 날씨', text: '사용자가 허용한 현재 좌표로 기온·체감온도·습도·바람과 맞춤 활동 팁을 제공합니다.', tags: ['Geolocation', 'Axios', 'Privacy'] },
]
</script>

<template>
  <section class="about-page">
    <div class="about-hero">
      <div class="hero-copy">
        <span class="eyebrow">SKALA · VUE FRONTEND PROJECT</span>
        <h1>날씨를 탐색하며<br><em>Vue의 흐름</em>을 익힙니다.</h1>
        <p>컴포넌트 통신에서 Router, Pinia, Axios까지 단계별 학습 내용을 하나의 대시보드 경험으로 연결했습니다.</p>
        <div class="hero-actions">
          <RouterLink class="primary-link" to="/">대시보드 체험하기 <span>→</span></RouterLink>
        </div>
      </div>
      <div class="weather-orbit" aria-hidden="true">
        <div class="sun">☀️</div><span class="cloud one">☁️</span><span class="cloud two">🌧️</span>
        <div class="orbit-label"><strong>18</strong><span>도시 날씨</span></div>
      </div>
    </div>

    <div class="section-heading">
      <div><span>WHAT I BUILT</span><h2>하나의 화면에 담은 학습 기능</h2></div>
      <p>각 기능은 독립된 컴포넌트로 나뉘고 반응형 상태로 연결됩니다.</p>
    </div>

    <div class="feature-grid">
      <article v-for="(feature, index) in features" :key="feature.title" class="feature-card" :style="{ '--card-index': index }">
        <span class="feature-icon">{{ feature.icon }}</span>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.text }}</p>
        <div class="tag-list"><span v-for="tag in feature.tags" :key="tag">{{ tag }}</span></div>
      </article>
    </div>

    <div class="architecture">
      <div><span class="eyebrow dark">HOW IT WORKS</span><h2>사용자 행동이 화면이 되기까지</h2></div>
      <ol>
        <li><b>01</b><span><strong>Interaction</strong><small>검색·선택·단위 변경</small></span></li>
        <li><b>02</b><span><strong>Reactive State</strong><small>ref · computed · Pinia</small></span></li>
        <li><b>03</b><span><strong>Components</strong><small>Props · Emit · Slot</small></span></li>
        <li><b>04</b><span><strong>Dashboard</strong><small>카드 · 지도 · 상세 화면</small></span></li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.about-page{color:#19364a}.about-hero{position:relative;display:grid;grid-template-columns:1.35fr .65fr;gap:30px;overflow:hidden;padding:58px;border-radius:28px;background:linear-gradient(135deg,#102c43 0%,#125a62 58%,#16806c 100%);color:white;box-shadow:0 24px 60px rgba(14,58,70,.22)}.about-hero:before{position:absolute;inset:auto -70px -120px auto;width:330px;height:330px;border:1px solid #ffffff20;border-radius:50%;content:''}.hero-copy{position:relative;z-index:1}.eyebrow{color:#88e3cc;font-size:.72rem;font-weight:800;letter-spacing:.18em}.eyebrow.dark{color:#24856d}.hero-copy h1{margin:14px 0;font-size:clamp(2.15rem,5vw,3.7rem);line-height:1.12;letter-spacing:-.055em}.hero-copy h1 em{color:#8ce6cc;font-style:normal}.hero-copy p{max-width:650px;color:#d6e8e8;font-size:1.02rem}.hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:28px}.primary-link,.ghost-link{padding:12px 18px;border-radius:11px;font-weight:750;text-decoration:none}.primary-link{background:#fff;color:#126c5b}.primary-link span{margin-left:7px}.ghost-link{border:1px solid #ffffff45;color:#fff}.weather-orbit{position:relative;align-self:center;justify-self:center;width:220px;height:220px;border:1px solid #ffffff35;border-radius:50%}.weather-orbit:after{position:absolute;inset:30px;border:1px dashed #ffffff28;border-radius:50%;content:''}.sun{position:absolute;top:27px;left:73px;font-size:4.8rem;filter:drop-shadow(0 8px 15px #f8b93d55)}.cloud{position:absolute;font-size:2.4rem;filter:drop-shadow(0 5px 8px #102c4355)}.cloud.one{right:-8px;top:92px}.cloud.two{bottom:5px;left:12px}.orbit-label{position:absolute;z-index:2;right:43px;bottom:45px;display:grid;text-align:center}.orbit-label strong{font-size:1.7rem}.orbit-label span{color:#c8e6e0;font-size:.72rem}.section-heading{display:flex;align-items:end;justify-content:space-between;gap:24px;margin:44px 4px 20px}.section-heading span{color:#24856d;font-size:.7rem;font-weight:800;letter-spacing:.16em}.section-heading h2{margin-top:5px;font-size:1.7rem}.section-heading p{max-width:360px;color:#708493;font-size:.9rem}.feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.feature-card{position:relative;min-height:220px;padding:24px;border:1px solid #dbe7eb;border-radius:18px;background:rgba(255,255,255,.82);box-shadow:0 10px 32px rgba(34,69,87,.07);transition:.22s ease}.feature-card:hover{transform:translateY(-5px);border-color:#9ed8c6;box-shadow:0 16px 35px rgba(34,100,87,.12)}.feature-icon{display:grid;width:48px;height:48px;place-items:center;border-radius:14px;background:#eef8f5;font-size:1.55rem}.feature-card h3{margin:16px 0 7px}.feature-card p{color:#687d8b;font-size:.88rem}.tag-list{display:flex;gap:5px;flex-wrap:wrap;margin-top:15px}.tag-list span{padding:3px 7px;border-radius:7px;background:#f0f4f6;color:#547080;font-size:.66rem;font-weight:700}.architecture{display:grid;grid-template-columns:.7fr 1.3fr;gap:30px;margin-top:30px;padding:32px;border:1px solid #d9e5e9;border-radius:22px;background:#fff}.architecture h2{margin-top:8px;line-height:1.3}.architecture ol{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:0;list-style:none}.architecture li{display:grid;gap:12px;padding:14px;border-radius:13px;background:#f4f8f8}.architecture li b{color:#39a486;font-size:.75rem}.architecture li span{display:grid}.architecture small{margin-top:3px;color:#81909a}@media(max-width:850px){.about-hero{grid-template-columns:1fr;padding:38px}.weather-orbit{display:none}.feature-grid{grid-template-columns:repeat(2,1fr)}.architecture{grid-template-columns:1fr}.section-heading{align-items:start;flex-direction:column}}@media(max-width:560px){.about-hero{padding:30px 24px}.feature-grid{grid-template-columns:1fr}.architecture ol{grid-template-columns:1fr 1fr}.section-heading p{display:none}}
</style>
<style scoped>
.about-hero {
  animation: hero-arrive .7s cubic-bezier(.22, .8, .3, 1) both;
}
.hero-copy > * {
  animation: copy-arrive .6s ease both;
}
.hero-copy > :nth-child(2) { animation-delay: .08s; }
.hero-copy > :nth-child(3) { animation-delay: .16s; }
.hero-copy > :nth-child(4) { animation-delay: .24s; }
.weather-orbit { animation: orbit-arrive .8s .2s ease both, orbit-pulse 5s 1s ease-in-out infinite; }
.weather-orbit::after { animation: orbit-spin 18s linear infinite; }
.sun { animation: sun-float 3.2s ease-in-out infinite; }
.cloud.one { animation: cloud-drift 4s .3s ease-in-out infinite; }
.cloud.two { animation: cloud-drift 4.8s 1s ease-in-out infinite reverse; }
.section-heading { animation: section-arrive .55s .2s ease both; }
.feature-card {
  opacity: 0;
  animation: card-arrive .55s cubic-bezier(.2, .75, .3, 1) forwards;
  animation-delay: calc(.28s + var(--card-index) * .09s);
}
.feature-card:last-child:nth-child(odd) { grid-column: 1 / -1; min-height: 190px; }
.feature-card:hover .feature-icon { animation: icon-bounce .5s ease; }
.architecture { animation: section-arrive .65s .65s ease both; }
.architecture li { transition: transform .2s ease, background .2s ease; }
.architecture li:hover { transform: translateY(-3px); background: #eaf7f3; }
.primary-link { transition: transform .2s ease, box-shadow .2s ease; }
.primary-link:hover { transform: translateY(-2px); box-shadow: 0 9px 20px #061e2435; }

@keyframes hero-arrive { from { opacity: 0; transform: translateY(18px) scale(.985); } }
@keyframes copy-arrive { from { opacity: 0; transform: translateY(12px); } }
@keyframes orbit-arrive { from { opacity: 0; transform: scale(.75) rotate(-12deg); } }
@keyframes orbit-pulse { 50% { box-shadow: 0 0 0 13px #ffffff0a; } }
@keyframes orbit-spin { to { transform: rotate(360deg); } }
@keyframes sun-float { 50% { transform: translateY(-8px) rotate(5deg); } }
@keyframes cloud-drift { 50% { transform: translateX(10px) translateY(-4px); } }
@keyframes section-arrive { from { opacity: 0; transform: translateY(14px); } }
@keyframes card-arrive { to { opacity: 1; transform: translateY(0); } from { opacity: 0; transform: translateY(18px); } }
@keyframes icon-bounce { 45% { transform: translateY(-6px) rotate(-5deg); } 75% { transform: translateY(2px) rotate(2deg); } }

@media (max-width: 560px) {
  .feature-card:last-child:nth-child(odd) { grid-column: auto; }
}
@media (prefers-reduced-motion: reduce) {
  .about-page *, .about-page *::before, .about-page *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
}
</style>
<style scoped>
@media (min-width: 851px) {
  .feature-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
