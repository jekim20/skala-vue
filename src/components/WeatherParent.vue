<script setup>
import { ref, computed, watch, watchEffect, provide, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'
import WeatherStats from './WeatherStats.vue'
import UnitToggle from './UnitToggle.vue'
import MyLocationWeather from './MyLocationWeather.vue'
import { useConfigStore } from '../stores/configStore.js'
// ========================================
// 추가 코드: 지도 컴포넌트
// ========================================
import CityMap from './CityMap.vue'
// ⚾ [추가] 야구 경기 예보 컴포넌트 · 유틸
import BaseballPanel from './BaseballPanel.vue'
import { countRainOutRisk } from '../utils/baseball'
import { STATUS_OPTIONS, statusEmoji } from '../utils/weather'
import { weatherApi } from '../api/labApi.js'

const savedCitiesKey = 'weather-dashboard-saved-cities'

const readSavedCities = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(savedCitiesKey) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

const writeSavedCities = (cities) => {
  localStorage.setItem(savedCitiesKey, JSON.stringify(cities))
}

// ── 모든 반응형 데이터는 부모(WeatherParent)가 단일 소유한다 ──
const searchQuery = ref('')
const selectedCityInfo = ref('지역별 날씨 카드를 클릭해 보세요.')
const isWeatherLoading = ref(false)
const weatherSource = ref('mock')
const weatherError = ref('')
const isCitySearching = ref(false)
const isStaticDemo = import.meta.env.PROD
const savedSearchCities = ref(readSavedCities().map((city) => ({ ...city, isSaved: true })))
const stadiumWeatherList = ref([])
const stadiumWeatherSource = ref('mock')
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

// Pinia 설정 Store의 단위를 기존 하위 날씨 컴포넌트에도 전달한다.
const configStore = useConfigStore()
const { unit, unitSymbol } = storeToRefs(configStore)
const convertTemp = (temp) => configStore.convertTemperature(temp)
provide('weather-unit', { unit, unitSymbol, convertTemp, toggleUnit: configStore.toggleUnit })

const loadWeather = async () => {
  isWeatherLoading.value = true
  weatherError.value = ''
  try {
    const [result, stadiumResult] = await Promise.all([
      weatherApi.getAll(),
      weatherApi.getStadiums(),
    ])
    const savedCities = savedSearchCities.value
    const savedById = new Map(savedCities.map((city) => [city.id, city]))
    const baseIds = new Set(result.cities.map(({ id }) => id))
    weatherList.value = [
      ...result.cities.map((city) => savedById.has(city.id) ? { ...city, isSaved: true } : city),
      ...savedCities.filter(({ id }) => !baseIds.has(id)).map((city) => ({ ...city, isSaved: true })),
    ]
    weatherSource.value = result.source
    stadiumWeatherList.value = stadiumResult.stadiums
    stadiumWeatherSource.value = stadiumResult.source
    selectedCityInfo.value = result.source === 'openweather'
      ? '🌐 OpenWeather에서 최신 관측 날씨를 불러왔습니다.'
      : isStaticDemo
        ? '✨ GitHub Pages 포트폴리오용 데모 날씨를 표시합니다.'
        : '🧪 API 키 또는 인터넷 연결이 없어 로컬 Mock 날씨를 사용합니다.'
  } catch (error) {
    weatherError.value = error.message
    selectedCityInfo.value = `⚠️ ${error.message}`
  } finally {
    isWeatherLoading.value = false
  }
}

const searchWeather = async (query) => {
  isCitySearching.value = true
  weatherError.value = ''
  try {
    const city = { ...await weatherApi.search(query), isSaved: true }
    const existingIndex = weatherList.value.findIndex((item) => item.id === city.id)
    if (existingIndex >= 0) weatherList.value.splice(existingIndex, 1, city)
    else weatherList.value.push(city)
    const savedIndex = savedSearchCities.value.findIndex((item) => item.id === city.id)
    if (savedIndex >= 0) savedSearchCities.value.splice(savedIndex, 1, city)
    else savedSearchCities.value.push(city)
    writeSavedCities(savedSearchCities.value)
    selectCity(city)
    searchQuery.value = ''
    statusFilter.value = '전체'
    weatherSource.value = city.source === 'openweather' ? 'openweather' : 'mock'
    selectedCityInfo.value = `💾 ${city.name} 날씨를 지역별 날씨 현황에 저장했습니다.`
  } catch (error) {
    weatherError.value = error.message
    selectedCityInfo.value = `⚠️ ${error.message}`
  } finally {
    isCitySearching.value = false
  }
}

onMounted(loadWeather)

// ── 정렬 / 상태 필터 ──────────────────────────────────────────
const sortKey = ref('default')
const statusFilter = ref('전체')

// 검색어 + 상태 칩 + 정렬을 모두 반영한 최종 목록 (computed 파생)
const visibleWeatherList = computed(() => {
  const keyword = searchQuery.value.trim()
  let list = savedSearchCities.value.filter((item) => item.name.includes(keyword))
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

const saveLocationWeather = (city) => {
  const savedCity = { ...city, isSaved: true }
  const weatherIndex = weatherList.value.findIndex((item) => item.id === savedCity.id)
  if (weatherIndex >= 0) weatherList.value.splice(weatherIndex, 1, savedCity)
  else weatherList.value.push(savedCity)
  const savedIndex = savedSearchCities.value.findIndex((item) => item.id === savedCity.id)
  if (savedIndex >= 0) savedSearchCities.value.splice(savedIndex, 1, savedCity)
  else savedSearchCities.value.push(savedCity)
  writeSavedCities(savedSearchCities.value)
  selectCity(savedCity)
  searchQuery.value = ''
  statusFilter.value = '전체'
  selectedCityInfo.value = `💾 ${savedCity.name}의 현재 위치 날씨를 저장했습니다.`
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
  savedSearchCities.value = savedSearchCities.value.filter((item) => item.id !== cityItem.id)
  writeSavedCities(savedSearchCities.value)
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
const rainOutCount = computed(() => countRainOutRisk(stadiumWeatherList.value))

// 경기 카드 클릭(emit) 수신 → 하단 상태바 갱신
const selectGame = (game) => {
  selectedCityInfo.value = `⚾ ${game.stadium} — ${game.home.name} vs ${game.away.name} (${game.city})`
}
</script>

<template>
  <div class="weather-parent">
    <BaseDashboardCard title="📊 오늘의 요약">
      <template #extra>
        <UnitToggle />
      </template>
      <WeatherStats :city-list="savedSearchCities" />
    </BaseDashboardCard>

    <BaseDashboardCard :title="isStaticDemo ? '🔍 도시 날씨 검색' : '🔍 실시간 도시 날씨 검색'">
      <template #extra>
        <button class="refresh-button" type="button" :disabled="isWeatherLoading" @click="loadWeather">
          {{ isWeatherLoading ? '불러오는 중…' : '날씨 새로고침' }}
        </button>
      </template>
      <!-- ========================================
           수정 코드: 자동완성용 도시 목록과 최근 도시 전달, 도시 선택 이벤트 추가
           ======================================== -->
      <SearchBar
        :search-query="searchQuery"
        :city-list="weatherList"
        :recent-cities="recentCities"
        :is-searching="isCitySearching"
        @update-query="updateQuery"
        @select-city="selectFromSearch"
        @search-city="searchWeather"
      />
      <p class="api-source" :class="{ live: weatherSource === 'openweather' }">
        {{ weatherSource === 'openweather' ? '● OpenWeather 실시간 데이터' : '● 포트폴리오 데모 데이터' }}
      </p>
      <p v-if="weatherError" class="api-error">{{ weatherError }}</p>
    </BaseDashboardCard>

    <BaseDashboardCard title="📍 내 위치 맞춤 날씨">
      <MyLocationWeather @save-city="saveLocationWeather" />
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
          <span class="saved-count">💾 저장 도시 {{ savedSearchCities.length }}개</span>
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
        🔍 저장된 도시가 없습니다. 위에서 도시를 검색하거나 현재 위치 날씨를 저장해 주세요.
        <span v-if="searchQuery">(검색어: "{{ searchQuery }}")</span>
        <span v-if="statusFilter !== '전체'">(필터: {{ statusFilter }})</span>
      </div>

      <div class="status-bar">{{ selectedCityInfo }}</div>
    </BaseDashboardCard>

    <!-- ⚾ [추가] KBO 경기 · 우천 취소 예보 섹션 -->
    <BaseDashboardCard title="⚾ 오늘의 KBO 경기 · 우천 취소 예보">
      <!-- #extra 슬롯: 위험 경기 수 요약 배지 (클래스 바인딩으로 색 전환) -->
      <template #extra>
        <span class="stadium-source" :class="{ live: stadiumWeatherSource === 'openweather' }">
          {{ stadiumWeatherSource === 'openweather' ? '● 구장 실시간 관측' : '● 구장 데모 날씨' }}
        </span>
        <span class="risk-badge" :class="{ danger: rainOutCount > 0 }">
          {{ rainOutCount > 0 ? `⚠️ 취소 위험 ${rainOutCount}경기` : '✅ 전 경기 정상 예상' }}
        </span>
      </template>

      <!-- props로 날씨 목록을 내려주고, 경기 선택 이벤트를 emit으로 받는다 -->
      <BaseballPanel :weather-list="stadiumWeatherList" @select-game="selectGame" />
    </BaseDashboardCard>

  </div>
</template>

<style scoped>
.divider {
  margin: 14px 0;
  border: none;
  border-top: 1px dashed #dde3ea;
}

.refresh-button {
  padding: 7px 13px;
  border: 1px solid #42b883;
  border-radius: 9px;
  background: #fff;
  color: #278864;
  cursor: pointer;
}

.refresh-button:disabled { cursor: wait; opacity: 0.6; }
.api-source { margin: 12px 0 0; color: #8995a2; font-size: 0.82rem; }
.api-source.live { color: #20865f; }
.api-error { color: #b73c48; font-size: 0.86rem; }

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

.saved-count {
  padding: 5px 10px;
  border-radius: 14px;
  background: #edf9f4;
  color: #278864;
  font-size: 0.8rem;
  font-weight: 700;
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

.stadium-source { color: #8995a2; font-size: 0.8rem; }
.stadium-source.live { color: #20865f; }

.risk-badge.danger {
  background-color: #fdeaea;
  color: #c0392b;
}
</style>
