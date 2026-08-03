<script setup>
import { ref, computed } from 'vue'
import GameCard from './GameCard.vue'
import { GAME_SCHEDULE } from '../utils/baseball'

const props = defineProps({
  weatherList: { type: Array, required: true },
})

const emit = defineEmits(['select-game'])

const riskOnly = ref(false)

// 경기 + 해당 도시 날씨를 결합 (computed 파생)
const gamesWithWeather = computed(() =>
  GAME_SCHEDULE.map((game) => ({
    game,
    weather: props.weatherList.find((w) => w.name === game.city) ?? null,
  })),
)

const visibleGames = computed(() => {
  if (!riskOnly.value) return gamesWithWeather.value
  return gamesWithWeather.value.filter(
    ({ game, weather }) =>
      !game.isDome && weather && (weather.status === '비' || weather.status === '흐림'),
  )
})
</script>

<template>
  <div class="baseball-panel">
    <label class="risk-filter">
      <input type="checkbox" v-model="riskOnly" />
      우천 취소 위험 경기만 보기
    </label>

    <div v-if="visibleGames.length > 0" class="game-grid">
      <GameCard
        v-for="{ game, weather } in visibleGames"
        :key="game.id"
        :game="game"
        :weather="weather"
        @select-game="emit('select-game', $event)"
      />
    </div>

    <p v-else class="empty">☀️ 취소 위험이 있는 경기가 없습니다. 좋은 야구 날씨네요!</p>
  </div>
</template>

<style scoped>
.risk-filter {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 0.88rem;
  color: #56687a;
  cursor: pointer;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 12px;
}

.empty {
  padding: 24px;
  border: 1px dashed #ccd4de;
  border-radius: 12px;
  text-align: center;
  color: #8494a5;
}
</style>