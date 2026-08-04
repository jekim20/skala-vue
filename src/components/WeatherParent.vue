<script setup>
import { ref, computed, watch, watchEffect, provide } from 'vue'
import { useRouter } from 'vue-router'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'
import WeatherStats from './WeatherStats.vue'
import CityForm from './CityForm.vue'
import UnitToggle from './UnitToggle.vue'
// ========================================
// 추가 코드: 지도 컴포넌트
// ========================================
import CityMap from './CityMap.vue'
// ⚾ [추가] 야구 경기 예보 컴포넌트 · 유틸
import BaseballPanel from './BaseballPanel.vue'
import { countRainOutRisk } from '../utils/baseball'
import { STATUS_OPTIONS, statusEmoji } from '../utils/weather'

// ── 모든 반응형 데이터는 부모(WeatherParent)가 단일 소유한다 ──
const searchQuery = ref('')
const selectedCityInfo = ref('지역별 날씨 카드를 클릭해 보세요.')
// ========================================
// 수정 코드: 지도 마커 표시를 위해 기존 도시 데이터에 lat(위도), lng(경도) 추가
// ========================================
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', lat: 37.5665, lng: 126.978 },
  { id: 'city_02', name: '수원', temp: 24, status: '비', lat: 37.2636, lng: 127.0286 },
  { id: 'city_03', name: '부산', temp: 26, status: '구름', lat: 35.1796, lng: 129.0756 },
  { id: 'city_04', name: '인천', temp: 23, status: '흐림', lat: 37.4563, lng: 126.7052 },
  { id: 'city_05', name: '대전', temp: 27, status: '맑음', lat: 36.3504, lng: 127.3845 },
  { id: 'city_06', name: '대구', temp: 31, status: '맑음', lat: 35.8714, lng: 128.6014 },
  { id: 'city_07', name: '광주', temp: 22, status: '흐림', lat: 35.1595, lng: 126.8526 },
  { id: 'city_08', name: '울산', temp: 29, status: '구름', lat: 35.5384, lng: 129.3114 },
  { id: 'city_09', name: '제주', temp: 20, status: '비', lat: 33.4996, lng: 126.5312 },
  { id: 'city_10', name: '강릉', temp: 25, status: '맑음', lat: 37.7519, lng: 128.8761 },
  { id: 'city_11', name: '전주', temp: 24, status: '비', lat: 35.8242, lng: 127.148 },
  { id: 'city_12', name: '춘천', temp: 30, status: '맑음', lat: 37.8813, lng: 127.73 },
  { id: 'city_13', name: '청주', temp: 26, status: '흐림', lat: 36.6424, lng: 127.489 },
  { id: 'city_14', name: '창원', temp: 28, status: '구름', lat: 35.228, lng: 128.6811 },
  { id: 'city_15', name: '포항', temp: 32, status: '맑음', lat: 36.019, lng: 129.3435 },
  { id: 'city_16', name: '여수', temp: 25, status: '구름', lat: 34.7604, lng: 127.6622 },
  { id: 'city_17', name: '목포', temp: 21, status: '비', lat: 34.8118, lng: 126.3922 },
  { id: 'city_18', name: '속초', temp: 22, status: '흐림', lat: 38.207, lng: 128.5918 },
])

// ========================================
// 추가 코드: 현재 선택 도시와 최근 본 도시를 관리하는 상태
// recentCityIds는 메모리에만 저장되므로 새로고침하면 초기화된다.
// ========================================
const selectedCity = ref(null)
const recentCityIds = ref([])

const recentCities = computed(() =>
  recentCityIds.value.map((id) => weatherList.value.find((city) => city.id === id)).filter(Boolean),
)
// ========================================
// 추가 코드 끝
// ========================================

// ── 단위 상태: provide/inject로 후손(WeatherCard, WeatherStats, UnitToggle)에 전파 ──
const unit = ref('celsius')
const unitSymbol = computed(() => (unit.value === 'celsius' ? '℃' : '℉'))
const toggleUnit = () => {
  unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
}
const convertTemp = (temp) =>
  unit.value === 'fahrenheit' ? Math.round((temp * 9) / 5 + 32) : Math.round(temp)

provide('weather-unit', { unit, unitSymbol, convertTemp, toggleUnit })

// ── 정렬 / 상태 필터 ──────────────────────────────────────────
const sortKey = ref('default')
const statusFilter = ref('전체')

// 검색어 + 상태 칩 + 정렬을 모두 반영한 최종 목록 (computed 파생)
const visibleWeatherList = computed(() => {
  const keyword = searchQuery.value.trim()
  let list = weatherList.value.filter((item) => item.name.includes(keyword))
  if (statusFilter.value !== '전체') {
    list = list.filter((item) => item.status === statusFilter.value)
  }
  const sorted = [...list]
  if (sortKey.value === 'temp-desc') sorted.sort((a, b) => b.temp - a.temp)
  else if (sortKey.value === 'temp-asc') sorted.sort((a, b) => a.temp - b.temp)
  else if (sortKey.value === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  return sorted
})

// ── 감시자 ─────────────────────────────────────────────────────
watch(selectedCityInfo, (newValue, oldValue) => {
  console.log(`[watch] 상태바 변경 감지: "${oldValue}" -> "${newValue}"`)
})

watchEffect(() => {
  console.log(`[watchEffect] 현재 검색어: "${searchQuery.value}"`)
})

// ── 자식 이벤트 핸들러 ─────────────────────────────────────────
const updateQuery = (newQuery) => {
  searchQuery.value = newQuery

  // ========================================
  // 추가 코드: 검색 결과가 한 도시뿐이면 지도에서도 자동 선택
  // ========================================
  const keyword = newQuery.trim()
  if (!keyword) return
  const matches = weatherList.value.filter((item) => item.name.includes(keyword))
  if (matches.length === 1) selectCity(matches[0])
}

const selectCity = (cityItem) => {
  // ========================================
  // 추가 코드: 카드·검색창·지도에서 공통으로 사용하는 도시 선택 처리
  // ========================================
  selectedCity.value = cityItem
  selectedCityInfo.value = `${cityItem.name}이 선택되었습니다.`
  recentCityIds.value = [cityItem.id, ...recentCityIds.value.filter((id) => id !== cityItem.id)].slice(0, 5)
}

const selectFromSearch = (cityItem) => {
  searchQuery.value = cityItem.name
  selectCity(cityItem)
}
// ========================================
// 추가 코드 끝
// ========================================

const router = useRouter()

const showDetail = (cityItem) => {
  router.push(`/weather/${cityItem.id}`)
}

const addCity = (payload) => {
  if (weatherList.value.some((item) => item.name === payload.name)) {
    selectedCityInfo.value = `⚠️ ${payload.name}은(는) 이미 목록에 있습니다.`
    return
  }
  weatherList.value.push({ id: `city_${Date.now()}`, ...payload })
  selectedCityInfo.value = `➕ ${payload.name}이 목록에 추가되었습니다.`
}

const removeCity = (cityItem) => {
  weatherList.value = weatherList.value.filter((item) => item.id !== cityItem.id)
  // ========================================
  // 추가 코드: 선택된 도시를 삭제하면 전체 지도 상태로 복귀
  // ========================================
  if (selectedCity.value?.id === cityItem.id) {
    selectedCity.value = null
  }
  selectedCityInfo.value = `🗑️ ${cityItem.name}이 목록에서 삭제되었습니다.`
}

// ⚾ [추가] ──────────────────────────────────────────────────
// 날씨 데이터에서 우천 취소 위험 경기 수를 파생 (computed)
// weatherList가 바뀌면 배지 문구가 자동으로 갱신된다.
const rainOutCount = computed(() => countRainOutRisk(weatherList.value))

// 경기 카드 클릭(emit) 수신 → 하단 상태바 갱신
const selectGame = (game) => {
  selectedCityInfo.value = `⚾ ${game.stadium} — ${game.home.name} vs ${game.away.name} (${game.city})`
}
</script>

<template>
  <div class="weather-parent">
    <!-- Named Slot(#extra)으로 단위 토글을 제목 오른쪽에 배치 -->
    <BaseDashboardCard title="📊 오늘의 요약">
      <template #extra>
        <UnitToggle />
      </template>
      <WeatherStats :city-list="weatherList" />
    </BaseDashboardCard>

    <BaseDashboardCard title="🔍 도시 검색 · 추가">
      <!-- ========================================
           수정 코드: 자동완성용 도시 목록과 최근 도시 전달, 도시 선택 이벤트 추가
           ======================================== -->
      <SearchBar
        :search-query="searchQuery"
        :city-list="weatherList"
        :recent-cities="recentCities"
        @update-query="updateQuery"
        @select-city="selectFromSearch"
      />
      <hr class="divider" />
      <CityForm @add-city="addCity" />
    </BaseDashboardCard>

    <!-- ========================================
         추가 코드: 선택 전에는 한국 전체, 선택 후에는 해당 도시를 표시하는 지도 영역
         ======================================== -->
    <BaseDashboardCard title="🗺️ 선택한 도시 위치">
      <CityMap
        :city="selectedCity"
        :city-list="visibleWeatherList"
        @select-city="selectCity"
      />
    </BaseDashboardCard>

    <BaseDashboardCard title="🌤️ 지역별 날씨 현황">
      <!-- Named Slot(#extra)으로 필터 칩 + 정렬 셀렉트 배치 -->
      <template #extra>
        <div class="list-controls">
          <div class="filter-chips">
            <button
              v-for="status in ['전체', ...STATUS_OPTIONS]"
              :key="status"
              type="button"
              class="chip"
              :class="{ active: statusFilter === status }"
              @click="statusFilter = status"
            >
              {{ status === '전체' ? '🌈 전체' : `${statusEmoji(status)} ${status}` }}
            </button>
          </div>
          <select v-model="sortKey" class="sort-select">
            <option value="default">기본 순서</option>
            <option value="temp-desc">온도 높은 순</option>
            <option value="temp-asc">온도 낮은 순</option>
            <option value="name">이름 순</option>
          </select>
        </div>
      </template>

      <!-- 검색어가 비면 원본 전체, 일치 데이터가 있으면 해당 데이터 출력 -->
      <div v-if="visibleWeatherList.length > 0" class="card-list">
        <!-- 추가 코드: selected prop으로 현재 선택된 카드에 강조 스타일 적용 -->
        <WeatherCard
          v-for="item in visibleWeatherList"
          :key="item.id"
          :city-item="item"
          :selected="selectedCity?.id === item.id"
          @select-card="selectCity"
          @click-detail="showDetail"
          @remove-card="removeCity"
        />
      </div>

      <!-- 일치하는 데이터가 없을 때 안내 -->
      <div v-else class="empty-result">
        🔍 조건과 일치하는 도시가 없습니다.
        <span v-if="searchQuery">(검색어: "{{ searchQuery }}")</span>
        <span v-if="statusFilter !== '전체'">(필터: {{ statusFilter }})</span>
      </div>

      <div class="status-bar">{{ selectedCityInfo }}</div>
    </BaseDashboardCard>

    <!-- ⚾ [추가] KBO 경기 · 우천 취소 예보 섹션 -->
    <BaseDashboardCard title="⚾ 오늘의 KBO 경기 · 우천 취소 예보">
      <!-- #extra 슬롯: 위험 경기 수 요약 배지 (클래스 바인딩으로 색 전환) -->
      <template #extra>
        <span class="risk-badge" :class="{ danger: rainOutCount > 0 }">
          {{ rainOutCount > 0 ? `⚠️ 취소 위험 ${rainOutCount}경기` : '✅ 전 경기 정상 예상' }}
        </span>
      </template>

      <!-- props로 날씨 목록을 내려주고, 경기 선택 이벤트를 emit으로 받는다 -->
      <BaseballPanel :weather-list="weatherList" @select-game="selectGame" />
    </BaseDashboardCard>

  </div>
</template>

<style scoped>
.divider {
  margin: 14px 0;
  border: none;
  border-top: 1px dashed #dde3ea;
}

.list-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.chip {
  padding: 4px 12px;
  border: 1px solid #dde3ea;
  border-radius: 16px;
  background-color: #f8fafc;
  color: #56687a;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chip:hover {
  border-color: #42b883;
}

.chip.active {
  border-color: #42b883;
  background-color: #42b883;
  color: white;
}

.sort-select {
  padding: 5px 8px;
  border: 1px solid #dde3ea;
  border-radius: 8px;
  background-color: #fff;
  color: #56687a;
}

.card-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.empty-result {
  padding: 24px;
  border: 1px dashed #ccd4de;
  border-radius: 12px;
  text-align: center;
  color: #8494a5;
}

.status-bar {
  margin-top: 16px;
  padding: 10px 14px;
  border-radius: 8px;
  color: white;
  background-color: #35495e;
}

/* ⚾ [추가] 우천 취소 위험 배지 */
.risk-badge {
  padding: 5px 12px;
  border-radius: 16px;
  background-color: #e6f7ee;
  color: #1e8b5a;
  font-size: 0.85rem;
  font-weight: bold;
}

.risk-badge.danger {
  background-color: #fdeaea;
  color: #c0392b;
}
</style>
