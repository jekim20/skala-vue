<script setup>
import { computed, inject } from 'vue'
import { getGameStatus, getWatchTip } from '../utils/baseball'

const props = defineProps({
  game: { type: Object, required: true },
  weather: { type: Object, default: null },
})

defineEmits(['select-game'])

// 부모가 provide한 단위 상태 재사용 (℃/℉ 토글에 자동 반응)
const { unitSymbol, convertTemp } = inject('weather-unit')

const status = computed(() => getGameStatus(props.weather, props.game.isDome))
const tip = computed(() => getWatchTip(props.weather))
</script>

<template>
  <div class="game-card" :class="`is-${status.level}`" @click="$emit('select-game', game)">
    <!-- 팀 컬러 그라데이션 바 : style 바인딩 -->
    <div
      class="team-bar"
      :style="{
        background: `linear-gradient(90deg, ${game.home.color} 0%, ${game.home.color} 50%, ${game.away.color} 50%, ${game.away.color} 100%)`,
      }"
    ></div>

    <div class="game-body">
      <div class="matchup">
        <span class="team" :style="{ color: game.home.color }">{{ game.home.name }}</span>
        <span class="vs">VS</span>
        <span class="team" :style="{ color: game.away.color }">{{ game.away.name }}</span>
      </div>

      <p class="venue">🏟️ {{ game.stadium }} · {{ game.time }}</p>

      <p class="weather-line" v-if="weather">
        {{ game.city }} · {{ convertTemp(weather.temp) }}{{ unitSymbol }} · {{ weather.status }}
      </p>
      <p class="weather-line muted" v-else>{{ game.city }} 날씨 정보 없음</p>

      <!-- 4단 조건부 분기 -->
      <p class="status-badge">
        <span v-if="status.level === 'dome'">🏟️ 돔구장 · 정상 개최</span>
        <span v-else-if="status.level === 'canceled'">🌧️ 우천 취소 유력</span>
        <span v-else-if="status.level === 'warning'">☁️ 우천 취소 가능</span>
        <span v-else-if="status.level === 'unknown'">❓ 날씨 정보 없음</span>
        <span v-else>✅ 정상 개최 예정</span>
      </p>

      <p class="tip">{{ tip }}</p>
    </div>
  </div>
</template>

<style scoped>
.game-card {
  overflow: hidden;
  border: 1px solid #e3e8f0;
  border-radius: 14px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.game-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(53, 73, 94, 0.15);
}

.team-bar {
  height: 6px;
}

.game-body {
  padding: 14px;
}

.matchup {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: bold;
}

.vs {
  font-size: 0.75rem;
  color: #8494a5;
}

.venue,
.weather-line {
  font-size: 0.85rem;
  color: #56687a;
  text-align: center;
  margin: 2px 0;
}

.muted {
  color: #b0bcc8;
}

.status-badge {
  margin: 10px 0 6px;
  padding: 6px 10px;
  border-radius: 8px;
  text-align: center;
  font-size: 0.88rem;
  font-weight: bold;
}

.tip {
  font-size: 0.8rem;
  color: #6b7b8c;
  text-align: center;
}

/* 판정별 색상 — 클래스 바인딩 */
.is-normal .status-badge {
  background-color: #e6f7ee;
  color: #1e8b5a;
}

.is-warning .status-badge {
  background-color: #fff6e0;
  color: #a5730a;
}

.is-canceled .status-badge {
  background-color: #fdeaea;
  color: #c0392b;
}

.is-dome .status-badge {
  background-color: #eef1fb;
  color: #4453a6;
}

.is-unknown .status-badge {
  background-color: #f2f4f6;
  color: #8494a5;
}

.is-canceled {
  border-color: #f3c1bb;
}

.is-warning {
  border-color: #f2ddab;
}
</style>