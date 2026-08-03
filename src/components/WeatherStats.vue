<script setup>
import { computed, inject } from 'vue'

// 통계는 원본 데이터(부모 소유)에서 파생만 한다 — 상태를 복제하지 않는 것이 원칙.
const props = defineProps({
  cityList: {
    type: Array,
    required: true,
  },
})

const { unitSymbol, convertTemp } = inject('weather-unit')

const stats = computed(() => {
  const list = props.cityList
  if (list.length === 0) return null

  const temps = list.map((item) => item.temp)
  const avg = temps.reduce((sum, t) => sum + t, 0) / list.length
  const hottest = list.reduce((a, b) => (b.temp > a.temp ? b : a))
  const coldest = list.reduce((a, b) => (b.temp < a.temp ? b : a))
  const hotCount = list.filter((item) => item.temp >= 25).length

  const minTemp = Math.min(...temps)
  const maxTemp = Math.max(...temps)
  const domainMin = Math.floor(Math.min(minTemp, avg, maxTemp) - 2)
  const domainMax = Math.ceil(Math.max(minTemp, avg, maxTemp) + 2)
  const domainRange = Math.max(1, domainMax - domainMin)

  const toBottomPercent = (temp) => ((temp - domainMin) / domainRange) * 100

  const tickValues = Array.from({ length: domainRange + 1 }, (_, index) => {
    const value = domainMin + index
    return {
      value,
      bottom: toBottomPercent(value),
    }
  })

  return {
    count: list.length,
    avg,
    hottest,
    coldest,
    hotCount,
    minTemp,
    maxTemp,
    domainMin,
    domainMax,
    avgBottom: toBottomPercent(avg),
    minBottom: toBottomPercent(minTemp),
    maxBottom: toBottomPercent(maxTemp),
    tickValues,
  }
})
</script>

<template>
  <div v-if="stats" class="stats-visual">
    <div class="thermo-panel">
      <div class="thermo-header">
        <span class="thermo-badge">🌡️</span>
        <span>기온 분포</span>
      </div>

      <div class="thermo-grid">
        <div class="thermo-column">
          <div class="thermo-column-label">최저</div>
          <div class="thermo-shell">
            <div class="thermo-scale scale-left">
              <span
                v-for="tick in stats.tickValues"
                :key="`low-${tick.value}`"
                class="tick"
                :style="{ bottom: `${tick.bottom}%` }"
              >
                {{ convertTemp(tick.value) }}{{ unitSymbol }}
              </span>
            </div>
            <div class="thermo-tube low">
              <div class="thermo-fill" :style="{ '--fill-height': `${stats.minBottom}%` }"></div>
              <div
                class="marker marker-low"
                :style="{ '--marker-bottom': `${stats.minBottom}%`, bottom: '0%' }"
              >
                <span class="marker-line"></span>
                <span class="marker-label">{{ stats.coldest.name }}</span>
              </div>
            </div>
          </div>
          <div class="thermo-value">{{ convertTemp(stats.minTemp) }}{{ unitSymbol }}</div>
        </div>

        <div class="thermo-column">
          <div class="thermo-column-label">평균</div>
          <div class="thermo-shell centered-shell">
            <div class="thermo-tube avg">
              <div class="thermo-fill" :style="{ '--fill-height': `${stats.avgBottom}%` }"></div>
              <div class="avg-line" :style="{ '--avg-bottom': `${stats.avgBottom}%`, bottom: '0%' }"></div>
            </div>
          </div>
          <div class="thermo-value">{{ convertTemp(stats.avg) }}{{ unitSymbol }}</div>
        </div>

        <div class="thermo-column">
          <div class="thermo-column-label">최고</div>
          <div class="thermo-shell">
            <div class="thermo-tube high">
              <div class="thermo-fill" :style="{ '--fill-height': `${stats.maxBottom}%` }"></div>
              <div
                class="marker marker-high"
                :style="{ '--marker-bottom': `${stats.maxBottom}%`, bottom: '0%' }"
              >
                <span class="marker-line"></span>
                <span class="marker-label">{{ stats.hottest.name }}</span>
              </div>
            </div>
            <div class="thermo-scale scale-right">
              <span
                v-for="tick in stats.tickValues"
                :key="`high-${tick.value}`"
                class="tick"
                :style="{ bottom: `${tick.bottom}%` }"
              >
                {{ convertTemp(tick.value) }}{{ unitSymbol }}
              </span>
            </div>
          </div>
          <div class="thermo-value">{{ convertTemp(stats.maxTemp) }}{{ unitSymbol }}</div>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-tile tile-city">
        <p class="stat-label">🏙️ 도시 수</p>
        <p class="stat-value">{{ stats.count }}곳</p>
      </div>
      <div class="stat-tile tile-avg">
        <p class="stat-label">🌡️ 평균 기온</p>
        <p class="stat-value">{{ convertTemp(stats.avg) }}{{ unitSymbol }}</p>
      </div>
      <div class="stat-tile tile-hot">
        <p class="stat-label">🔥 최고</p>
        <p class="stat-value">
          {{ stats.hottest.name }} {{ convertTemp(stats.hottest.temp) }}{{ unitSymbol }}
        </p>
      </div>
      <div class="stat-tile tile-cold">
        <p class="stat-label">❄️ 최저</p>
        <p class="stat-value">
          {{ stats.coldest.name }} {{ convertTemp(stats.coldest.temp) }}{{ unitSymbol }}
        </p>
      </div>
      <div class="stat-tile tile-count">
        <p class="stat-label">🥵 더운 도시 (25℃↑)</p>
        <p class="stat-value">{{ stats.hotCount }}곳</p>
      </div>
    </div>
  </div>
  <p v-else class="stats-empty">표시할 도시가 없습니다.</p>
</template>

<style scoped>
.stats-visual {
  display: grid;
  grid-template-columns: minmax(220px, 260px) 1fr;
  gap: 18px;
  align-items: center;
}

.thermo-panel {
  background: linear-gradient(180deg, rgba(244, 247, 250, 0.95), rgba(224, 236, 255, 0.8));
  border: 1px solid #dfeaf6;
  border-radius: 20px;
  padding: 14px 12px 10px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.thermo-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #45607d;
}

.thermo-badge {
  font-size: 1.2rem;
}

.thermo-grid {
  display: grid;
  grid-template-columns: repeat(3, 50px);
  gap: 8px;
  justify-content: center;
  align-items: end;
}

.thermo-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 50px;
}

.thermo-column-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #4f6176;
}

.thermo-shell {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  min-height: 300px;
}

.centered-shell {
  justify-content: center;
}

.thermo-scale {
  position: relative;
  width: 30px;
  height: 250px;
  flex-shrink: 0;
}

.scale-left {
  margin-left: 2px;
}

.scale-right {
  margin-right: 2px;
}

.tick {
  position: absolute;
  left: 0;
  transform: translateY(50%);
  font-size: 0.56rem;
  color: #697e96;
  white-space: nowrap;
  opacity: 0.9;
}

.thermo-tube {
  position: relative;
  width: 36px;
  height: 250px;
  border: 3px solid #dfeaf5;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(229, 239, 255, 0.7));
  overflow: hidden;
  box-shadow: inset 0 0 12px rgba(120, 160, 219, 0.12);
  flex-shrink: 0;
}

.thermo-fill {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 0;
  border-radius: 0 0 16px 16px;
  opacity: 0.94;
  box-shadow: inset 0 8px 18px rgba(255, 255, 255, 0.2);
  animation: fill-rise 0.9s ease-out forwards;
}

.thermo-tube.low .thermo-fill {
  background: linear-gradient(180deg, #bde3ff 0%, #70b8ff 36%, #3a82ff 72%, #1d5fe8 100%);
}

.thermo-tube.avg .thermo-fill {
  background: linear-gradient(180deg, #ffe7a8 0%, #ffcb5a 40%, #ff9f1c 75%, #f57f17 100%);
}

.thermo-tube.high .thermo-fill {
  background: linear-gradient(180deg, #ffc4c4 0%, #ff7a7a 34%, #ff5353 70%, #d81b60 100%);
}

@keyframes fill-rise {
  from {
    height: 0;
    opacity: 0.2;
  }
  to {
    height: var(--fill-height, 0%);
    opacity: 0.94;
  }
}

.avg-line {
  position: absolute;
  left: -2px;
  right: -2px;
  height: 4px;
  background: linear-gradient(90deg, rgba(245, 146, 24, 0.12), rgba(245, 146, 24, 0.85), rgba(245, 146, 24, 0.12));
  border-radius: 999px;
  box-shadow: 0 0 0 1px rgba(245, 146, 24, 0.2);
  animation: avg-rise 0.9s ease-out forwards;
}

@keyframes avg-rise {
  from {
    bottom: 0%;
    opacity: 0.2;
  }
  to {
    bottom: var(--avg-bottom, 0%);
    opacity: 1;
  }
}

.marker {
  position: absolute;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: 2;
  animation: marker-rise 0.9s ease-out forwards;
}

@keyframes marker-rise {
  from {
    bottom: 0%;
    opacity: 0.2;
  }
  to {
    bottom: var(--marker-bottom, 0%);
    opacity: 1;
  }
}

.marker-line {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 10px;
  height: 2px;
  border-radius: 999px;
  background: #ff3b30;
  transform: translateY(50%);
}

.marker-label {
  position: absolute;
  left: -12px;
  top: -28px;
  display: inline-block;
  padding: 4px 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(101, 122, 146, 0.18);
  box-shadow: 0 2px 8px rgba(58, 86, 116, 0.12);
  font-size: 0.54rem;
  font-weight: 700;
  color: #324b67;
  white-space: nowrap;
  max-width: 64px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.marker-low .marker-label,
.marker-high .marker-label {
  z-index: 3;
}

.marker-low .marker-line {
  background: #3a82ff;
}

.marker-high .marker-line {
  background: #ff3b30;
}

.thermo-value {
  font-size: 0.8rem;
  font-weight: 800;
  color: #324b67;
  text-align: center;
  width: 40%;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
}

.stat-tile {
  padding: 12px 14px;
  border-radius: 12px;
  text-align: center;
}

.tile-city {
  background-color: #eef2f7;
}

.tile-avg {
  background-color: #fff7e0;
}

.tile-hot {
  background-color: #fdeaea;
}

.tile-cold {
  background-color: #e3edf9;
}

.tile-count {
  background-color: #f4e8fb;
}

.stat-label {
  font-size: 0.82rem;
  color: #6b7a8c;
}

.stat-value {
  margin-top: 4px;
  font-weight: bold;
  color: #35495e;
}

.stats-empty {
  color: #888;
}

@media (max-width: 760px) {
  .stats-visual {
    grid-template-columns: 1fr;
  }

  .thermo-panel {
    padding-top: 18px;
  }

  .thermo-shell {
    min-height: 280px;
  }
}
</style>
