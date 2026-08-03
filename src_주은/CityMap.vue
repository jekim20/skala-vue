<script setup>
// ========================================
// 전체 추가 파일: 도시 좌표를 OpenStreetMap으로 표시하는 컴포넌트
// 선택 도시가 없으면 대한민국 전체 지도를 표시한다.
// ========================================
import { computed } from 'vue'

const props = defineProps({
  city: {
    type: Object,
    default: null,
  },
  cityList: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['select-city'])

const hasLocation = computed(() => Number.isFinite(props.city?.lat) && Number.isFinite(props.city?.lng))
const mapUrl = computed(() => {
  if (!hasLocation.value) {
    return 'https://www.openstreetmap.org/export/embed.html?bbox=124.8%2C32.8%2C130.2%2C38.7&layer=mapnik'
  }
  const { lat, lng } = props.city
  const offset = 0.065
  const bbox = [lng - offset, lat - offset, lng + offset, lat + offset].join(',')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat}%2C${lng}`
})
const externalMapUrl = computed(() => {
  if (!hasLocation.value) return '#'
  return `https://www.openstreetmap.org/?mlat=${props.city.lat}&mlon=${props.city.lng}#map=13/${props.city.lat}/${props.city.lng}`
})

const markerEmoji = (status) => ({ 맑음: '☀️', 구름: '⛅', 흐림: '☁️', 비: '🌧️' })[status] ?? '📍'
// ========================================
// 추가 코드 끝
// ========================================
</script>

<template>
  <!-- ========================================
       전체 추가 코드: 지도 헤더, OpenStreetMap, 검색 결과 도시 선택 버튼
       ======================================== -->
  <div class="city-map">
    <div class="map-heading">
      <div v-if="hasLocation">
        <strong>📍 {{ city.name }}</strong>
        <span>{{ city.lat.toFixed(4) }}, {{ city.lng.toFixed(4) }}</span>
      </div>
      <div v-else>
        <strong>🇰🇷 대한민국 전체</strong>
        <span>도시를 선택하면 해당 위치로 이동합니다.</span>
      </div>
      <a
        v-if="hasLocation"
        :href="externalMapUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        큰 지도에서 보기 ↗
      </a>
    </div>
    <div class="map-canvas">
      <iframe
        :key="city?.id ?? 'korea'"
        :src="mapUrl"
        :title="hasLocation ? `${city.name} 위치 지도` : '대한민국 전체 지도'"
        loading="lazy"
      ></iframe>
    </div>
    <div v-if="cityList.length > 1" class="result-cities">
      <span>검색 결과</span>
      <button
        v-for="item in cityList.filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng))"
        :key="item.id"
        type="button"
        class="result-city"
        :class="{ selected: item.id === city?.id }"
        :title="`${item.name} · ${item.temp}℃ · ${item.status}`"
        :aria-label="`${item.name} 선택`"
        @click="emit('select-city', item)"
      >
        <span>{{ markerEmoji(item.status) }}</span>
        <strong>{{ item.name }}</strong>
      </button>
    </div>
  </div>
  <!-- ========================================
       추가 코드 끝
       ======================================== -->
</template>

<style scoped>
/* ========================================
   전체 추가 코드: 지도 및 검색 결과 버튼 스타일
   ======================================== */
.city-map { overflow: hidden; border: 1px solid #dde3ea; border-radius: 12px; }
.map-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; background: #f8fafc; }
.map-heading div { display: flex; align-items: baseline; gap: 8px; }
.map-heading span { color: #8494a5; font-size: 0.78rem; }
.map-heading a { color: #26875f; font-size: 0.85rem; text-decoration: none; }
.map-heading a:hover { text-decoration: underline; }
.map-canvas { height: 390px; overflow: hidden; background: #e9f2ee; }
iframe { display: block; width: 100%; height: 100%; border: 0; }
.result-cities { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; padding: 10px 12px; border-top: 1px solid #e3e8f0; background: #f8fafc; }
.result-cities > span { margin-right: 3px; color: #8494a5; font-size: .78rem; }
.result-city { display: flex; align-items: center; gap: 3px; padding: 4px 9px; border: 1px solid #d8e1dd; border-radius: 14px; background: white; color: #56687a; font-size: .76rem; cursor: pointer; }
.result-city:hover, .result-city.selected { border-color: #42b883; background: #edf9f4; color: #26875f; }
@media (max-width: 560px) {
  .map-heading, .map-heading div { align-items: flex-start; flex-direction: column; gap: 2px; }
  .map-canvas { height: 320px; }
}
/* ========================================
   추가 코드 끝
   ======================================== */
</style>
