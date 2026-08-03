<script setup>
// !! [협업 과제] 신규 파일 전체 추가 !!
// 카드 [상세보기] 클릭 시 뜨는 애플 날씨 앱 느낌의 상세 모달.
// 실제 날씨 상태(맑음/구름/흐림/비)에 따라 배경 그라데이션 + 동적 애니메이션이 달라진다.
// 기존 alert()를 대체하지만, 다른 컴포넌트/파일은 건드리지 않고 독립된 컴포넌트로 분리했다.
import { ref, computed, onMounted, onBeforeUnmount, inject } from 'vue'
import { statusEmoji } from '../utils/weather'

const props = defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close'])

// 부모(WeatherParent)가 provide한 단위 상태를 그대로 재사용 — 카드와 동일한 값 표시
const { unitSymbol, convertTemp } = inject('weather-unit')

// 마운트 직후 true로 바뀌면서 등장 트랜지션(fade + pop)이 재생된다.
const visible = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    visible.value = true
  })
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const handleKeydown = (e) => {
  if (e.key === 'Escape') handleClose()
}

// 닫힐 때는 트랜지션이 끝난 뒤(220ms) 실제로 emit('close')하여 자연스럽게 사라지게 한다.
const handleClose = () => {
  visible.value = false
  setTimeout(() => emit('close'), 220)
}

// 날씨 상태 → 배경 테마 클래스 매핑
// !! [협업 과제] 눈 테마 추가
const themeMap = {
  맑음: 'theme-sunny',
  구름: 'theme-cloudy',
  흐림: 'theme-overcast',
  비: 'theme-rainy',
  눈: 'theme-snowy',
}
const themeClass = computed(() => themeMap[props.cityItem.status] ?? 'theme-sunny')

// !! [협업 과제] 구름 배치 로직 개선.
// 기존엔 delay를 완전 무작위로 줘서 구름이 한쪽에 뭉치거나, 한참 동안 화면에 하나도 안 보이는 구간이 생겼다.
// → delay를 "각 구름의 duration에 비례해 균등하게" 음수로 나눠주면, 마운트 시점부터 화면 전역에
//   여러 구름이 고르게 떠 있는 상태로 시작해서 자연스럽게 이어 흐르는 것처럼 보인다.
const makeClouds = (count, { topFrom = 6, topTo = 55, scaleFrom = 0.7, scaleTo = 1.5, durFrom = 30, durTo = 42 } = {}) =>
  Array.from({ length: count }, (_, i) => {
    const duration = durFrom + Math.random() * (durTo - durFrom)
    return {
      id: i,
      top: topFrom + (i / count) * (topTo - topFrom) + (Math.random() - 0.5) * 6,
      scale: scaleFrom + Math.random() * (scaleTo - scaleFrom),
      duration,
      delay: -((i / count) * duration + Math.random() * 3),
    }
  })

// 구름(부분 흐림): 하늘에 6~8송이가 항상 떠 있도록
const clouds = makeClouds(8)
// !! 흐림(전운량 많음): 구름 수를 더 늘리고 크기도 키워서 하늘을 확실히 덮은 느낌을 준다
const heavyClouds = makeClouds(10, { topFrom: 2, topTo: 62, scaleFrom: 1.2, scaleTo: 2.1, durFrom: 34, durTo: 48 })

// 빗방울 다수를 랜덤한 위치·속도·지연으로 떨어뜨려 소나기처럼 보이게 한다.
const raindrops = Array.from({ length: 46 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  duration: 0.5 + Math.random() * 0.5,
  delay: Math.random() * 2,
}))

// !! [협업 과제] 눈송이 다수를 랜덤한 위치·크기·속도·좌우 흔들림 폭으로 흩날리게 한다.
const snowflakes = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  size: 4 + Math.random() * 6,
  duration: 6 + Math.random() * 7,
  delay: -Math.random() * 13,
  sway: 10 + Math.random() * 22,
}))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-backdrop" @click.self="handleClose">
        <div class="detail-modal" :class="themeClass">
          <button class="close-btn" type="button" title="닫기" @click="handleClose">✕</button>

          <div class="hero">
            <!-- ── 맑음: 떠오르는 해 + 회전하는 햇살 ── -->
            <div v-if="cityItem.status === '맑음'" class="scene scene-sunny">
              <div class="sun-wrap">
                <div class="sun-rays">
                  <span v-for="n in 12" :key="n" class="ray" :style="{ transform: `rotate(${n * 30}deg)` }"></span>
                </div>
                <div class="sun-core"></div>
              </div>
            </div>

            <!-- ── 구름: 해가 살짝 보이며 구름 여러 송이가 항상 떠 있는 상태로 천천히 흘러감 ── -->
            <div v-else-if="cityItem.status === '구름'" class="scene scene-cloudy">
              <div class="sun-peek"></div>
              <span
                v-for="c in clouds"
                :key="c.id"
                class="cloud"
                :style="{
                  top: c.top + '%',
                  '--s': c.scale,
                  animationDuration: c.duration + 's',
                  animationDelay: c.delay + 's',
                }"
              ></span>
            </div>

            <!-- ── 흐림: 크고 많은 구름이 하늘을 가득 덮은 채 옅은 안개까지 함께 흐름 ── -->
            <div v-else-if="cityItem.status === '흐림'" class="scene scene-overcast">
              <span v-for="n in 3" :key="n" class="fog-layer" :style="{ animationDelay: n * -7 + 's' }"></span>
              <span
                v-for="c in heavyClouds"
                :key="c.id"
                class="cloud cloud-heavy"
                :style="{
                  top: c.top + '%',
                  '--s': c.scale,
                  animationDuration: c.duration + 's',
                  animationDelay: c.delay + 's',
                }"
              ></span>
            </div>

            <!-- ── !! 눈: 눈송이가 좌우로 흔들리며 흩날려 쌓임 ── -->
            <div v-else-if="cityItem.status === '눈'" class="scene scene-snowy">
              <span v-for="n in 3" :key="n" class="cloud cloud-snow" :style="{ left: n * 28 + '%' }"></span>
              <span
                v-for="f in snowflakes"
                :key="f.id"
                class="snowflake"
                :style="{
                  left: f.left + '%',
                  width: f.size + 'px',
                  height: f.size + 'px',
                  '--sway': f.sway + 'px',
                  animationDuration: f.duration + 's',
                  animationDelay: f.delay + 's',
                }"
              ></span>
              <div class="snow-ground"></div>
            </div>

            <!-- ── 비: 먹구름 아래로 빗방울이 떨어짐 ── -->
            <div v-else class="scene scene-rainy">
              <span v-for="n in 3" :key="n" class="cloud cloud-rain" :style="{ left: n * 28 + '%' }"></span>
              <span
                v-for="d in raindrops"
                :key="d.id"
                class="raindrop"
                :style="{
                  left: d.left + '%',
                  animationDuration: d.duration + 's',
                  animationDelay: d.delay + 's',
                }"
              ></span>
              <span class="flash"></span>
            </div>

            <div class="hero-info">
              <p class="hero-emoji">{{ statusEmoji(cityItem.status) }}</p>
              <h2 class="hero-city">{{ cityItem.name }}</h2>
              <p class="hero-temp">{{ convertTemp(cityItem.temp) }}{{ unitSymbol }}</p>
              <p class="hero-status">{{ cityItem.status }}</p>
            </div>
          </div>

          <div class="detail-body">
            <p v-if="cityItem.temp >= 25" class="detail-label hot">🔥 더움 · 25℃ 이상</p>
            <p v-else class="detail-label cool">❄️ 선선함 · 25℃ 미만</p>
            <p class="detail-note">대시보드 목데이터를 기준으로 한 연출용 화면입니다.</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── 오버레이 & 등장 트랜지션 ───────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 32, 0.45);
  backdrop-filter: blur(3px);
  z-index: 1000;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.22s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .detail-modal,
.modal-fade-leave-active .detail-modal {
  transition:
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.22s ease;
}
.modal-fade-enter-from .detail-modal,
.modal-fade-leave-to .detail-modal {
  transform: scale(0.94) translateY(10px);
  opacity: 0;
}

/* ── 모달 패널 ─────────────────────────────────────────────── */
.detail-modal {
  position: relative;
  width: 100%;
  max-width: 380px;
  max-height: 90vh;
  overflow: hidden auto;
  border-radius: 28px;
  background-color: #1c2733;
  box-shadow: 0 24px 60px rgba(15, 23, 32, 0.35);
  color: #fff;
}

.close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 5;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.22);
  color: #fff;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.35);
}

/* ── 히어로(애니메이션 배경) 영역 ───────────────────────────── */
.hero {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.hero-info {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 20px;
  z-index: 3;
  text-align: center;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
}

.hero-emoji {
  font-size: 1.6rem;
}

.hero-city {
  margin: 2px 0 4px;
  font-size: 1.4rem;
  font-weight: 600;
}

.hero-temp {
  font-size: 2.6rem;
  font-weight: 200;
  line-height: 1;
}

.hero-status {
  margin-top: 4px;
  font-size: 0.95rem;
  opacity: 0.9;
}

.scene {
  position: absolute;
  inset: 0;
}

/* ── 테마별 하늘 그라데이션 ─────────────────────────────────── */
.theme-sunny .hero {
  background: linear-gradient(180deg, #3f9ce0 0%, #7ec8f2 45%, #ffdf9c 100%);
}
.theme-cloudy .hero {
  background: linear-gradient(180deg, #5f87a8 0%, #9cbdd4 55%, #cfd9e3 100%);
}
.theme-overcast .hero {
  background: linear-gradient(180deg, #4b5563 0%, #6b7684 55%, #8b96a3 100%);
}
.theme-rainy .hero {
  background: linear-gradient(180deg, #212f3d 0%, #33465a 45%, #46617a 100%);
}
/* !! [협업 과제] 눈 테마 하늘 그라데이션 !! */
.theme-snowy .hero {
  background: linear-gradient(180deg, #7c93a8 0%, #b9cbdc 45%, #eef3f8 100%);
}

/* ── 맑음: 떠오르며 반짝이는 해 ─────────────────────────────── */
.sun-wrap {
  position: absolute;
  left: 50%;
  top: 46%;
  width: 120px;
  height: 120px;
  transform: translate(-50%, -50%);
  animation: sunrise 1.1s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.sun-core {
  position: absolute;
  inset: 18px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff6d8, #ffd166 60%, #ffb347 100%);
  box-shadow: 0 0 50px 14px rgba(255, 209, 102, 0.55);
  animation: sun-glow 3.2s ease-in-out infinite;
}

.sun-rays {
  position: absolute;
  inset: 0;
  animation: sun-rotate 40s linear infinite;
}

.ray {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 3px;
  height: 20px;
  margin-left: -1.5px;
  transform-origin: 50% 60px;
  background: rgba(255, 223, 140, 0.85);
  border-radius: 2px;
}

@keyframes sunrise {
  from {
    transform: translate(-50%, 30px);
    opacity: 0;
  }
  to {
    transform: translate(-50%, -50%);
    opacity: 1;
  }
}
@keyframes sun-glow {
  0%,
  100% {
    box-shadow: 0 0 50px 14px rgba(255, 209, 102, 0.5);
  }
  50% {
    box-shadow: 0 0 66px 20px rgba(255, 209, 102, 0.75);
  }
}
@keyframes sun-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ── 구름 / 흐림: 흘러가는 구름 + 안개 ──────────────────────── */
.sun-peek {
  position: absolute;
  left: 62%;
  top: 22%;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff6d8, #ffd166 70%);
  box-shadow: 0 0 40px 10px rgba(255, 209, 102, 0.45);
  animation: sun-glow 3.2s ease-in-out infinite;
}

.cloud {
  position: absolute;
  left: -32%;
  width: 120px;
  height: 42px;
  background: #fff;
  border-radius: 50px;
  opacity: 0.95;
  /* !! 뭉게뭉게 겹친 덩어리감을 주기 위해 box-shadow 블롭을 여러 개 붙였다 */
  box-shadow:
    26px 8px 0 -4px #fff,
    -24px 10px 0 -8px #fff,
    12px -14px 0 -6px #fff,
    -14px -10px 0 -10px #fff;
  /* !! 기존엔 인라인 transform과 애니메이션 transform이 충돌해 개별 크기(scale)가 무시됐다.
     → CSS 변수(--s)로 크기를 넘기고, 키프레임 쪽에서 함께 적용하도록 수정 */
  animation: cloud-drift linear infinite;
}

.cloud-heavy {
  background: #e4e9ee;
  opacity: 0.98;
  box-shadow:
    28px 8px 0 -2px #e4e9ee,
    -26px 10px 0 -6px #cfd6de,
    14px -16px 0 -4px #e4e9ee,
    -16px -12px 0 -8px #cfd6de,
    0 6px 0 -2px #b9c3cd;
}

@keyframes cloud-drift {
  from {
    transform: translateX(0) scale(var(--s, 1));
  }
  to {
    transform: translateX(170vw) scale(var(--s, 1));
  }
}

.fog-layer {
  position: absolute;
  left: -40%;
  width: 180%;
  height: 40px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.28), transparent);
  filter: blur(2px);
  animation: fog-drift 16s linear infinite;
}
.fog-layer:nth-child(1) {
  top: 30%;
}
.fog-layer:nth-child(2) {
  top: 55%;
}
.fog-layer:nth-child(3) {
  top: 78%;
}

@keyframes fog-drift {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(40%);
  }
}

/* ── 비: 떨어지는 빗방울 + 이따금 번쩍이는 번개 ─────────────── */
.cloud-rain {
  top: 6%;
  width: 150px;
  height: 50px;
  background: #37475a;
  box-shadow:
    26px 10px 0 -4px #37475a,
    -26px 8px 0 -8px #2c3a4a;
  opacity: 1;
  animation: none;
}

.raindrop {
  position: absolute;
  top: -8%;
  width: 2px;
  height: 18px;
  background: linear-gradient(180deg, rgba(174, 214, 241, 0), rgba(174, 214, 241, 0.85));
  animation: rain-fall linear infinite;
  transform: rotate(10deg);
}

@keyframes rain-fall {
  from {
    transform: translateY(-10%) rotate(10deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  to {
    transform: translateY(340px) rotate(10deg);
    opacity: 0.2;
  }
}

.flash {
  position: absolute;
  inset: 0;
  background: #fff;
  opacity: 0;
  animation: lightning 9s ease-in-out infinite;
}

@keyframes lightning {
  0%,
  93%,
  100% {
    opacity: 0;
  }
  94% {
    opacity: 0.55;
  }
  95% {
    opacity: 0.05;
  }
  96% {
    opacity: 0.35;
  }
  97% {
    opacity: 0;
  }
}

/* !! [협업 과제] 눈: 좌우로 흔들리며 떨어지는 눈송이 + 바닥에 쌓인 눈 ── */
.cloud-snow {
  top: 6%;
  width: 150px;
  height: 50px;
  background: #d7e2eb;
  box-shadow:
    26px 10px 0 -4px #d7e2eb,
    -26px 8px 0 -8px #c4d2de;
  opacity: 1;
  animation: none;
}

.snowflake {
  position: absolute;
  top: -8%;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.9);
  animation: snow-fall linear infinite;
}

@keyframes snow-fall {
  0% {
    transform: translate(0, -10%) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.95;
  }
  50% {
    transform: translate(var(--sway), 160px) rotate(180deg);
  }
  90% {
    opacity: 0.85;
  }
  100% {
    transform: translate(0, 330px) rotate(360deg);
    opacity: 0.35;
  }
}

.snow-ground {
  position: absolute;
  left: -10%;
  right: -10%;
  bottom: -12px;
  height: 34px;
  background: #fff;
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  opacity: 0.92;
}

/* ── 하단 상세 정보 영역 ───────────────────────────────────── */
.detail-body {
  padding: 18px 22px 24px;
  background-color: #1c2733;
}

.detail-label {
  font-weight: bold;
}
.detail-label.hot {
  color: #ff8a65;
}
.detail-label.cool {
  color: #7ec8f2;
}

.detail-note {
  margin-top: 8px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.55);
}

@media (prefers-reduced-motion: reduce) {
  .sun-rays,
  .cloud,
  .fog-layer,
  .raindrop,
  .flash,
  .sun-wrap,
  .sun-core,
  .snowflake {
    animation: none !important;
  }
}
</style>
