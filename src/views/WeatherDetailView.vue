<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfigStore } from '../stores/configStore.js'
import { weatherApi } from '../api/labApi.js'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const cityId = route.params.cityId
const city = ref(null)
const error = ref('')

onMounted(async () => {
  try {
    city.value = await weatherApi.getById(cityId)
  } catch (requestError) {
    try {
      const savedCities = JSON.parse(localStorage.getItem('weather-dashboard-saved-cities') || '[]')
      city.value = savedCities.find((item) => item.id === cityId) || null
    } catch {
      city.value = null
    }
    if (!city.value) error.value = requestError.message
  }
})
</script>

<template>
  <section class="view-detail">
    <h1>지역별 상세 기상 정보</h1>
    <button class="back-btn" type="button" @click="router.push('/')">메인 대시보드로 돌아가기</button>

    <div v-if="error" class="detail-error">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="city" class="detail-card">
      <h2>{{ city.name }}</h2>
      <p class="city-id">도시 코드: {{ city.id }}</p>
      <ul>
        <li><strong>날씨:</strong> {{ city.status }}</li>
        <li><strong>기온:</strong> {{ configStore.convertTemperature(city.temp) }}{{ configStore.unitSymbol }}</li>
        <li><strong>습도:</strong> {{ city.humidity == null ? 'Mock 데이터 없음' : `${city.humidity}%` }}</li>
        <li><strong>풍속:</strong> {{ city.wind == null ? 'Mock 데이터 없음' : `${city.wind}m/s` }}</li>
        <li><strong>기압:</strong> {{ city.pressure == null ? 'Mock 데이터 없음' : `${city.pressure}hPa` }}</li>
      </ul>
      <p class="description">{{ city.description }}</p>
    </div>

    <div v-else class="detail-loading">
      <p>도시 정보를 불러오는 중입니다...</p>
    </div>
  </section>
</template>

<style scoped>
.view-detail {
  padding: 20px;
}
.back-btn {
  margin-bottom: 16px;
  padding: 8px 14px;
  border: 1px solid #42b883;
  border-radius: 10px;
  background: white;
  color: #35495e;
  cursor: pointer;
}
.detail-card {
  padding: 18px;
  border-radius: 16px;
  background: #f5faff;
  border: 1px solid #dceefe;
}
.detail-card h2 {
  margin-top: 0;
}
.city-id {
  color: #6b7280;
  margin-bottom: 12px;
}
.detail-card ul {
  list-style: none;
  padding: 0;
  margin: 0 0 12px;
}
.detail-card li {
  margin-bottom: 8px;
}
.detail-error {
  padding: 18px;
  border-radius: 16px;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #991b1b;
}
.detail-loading {
  padding: 18px;
  border-radius: 16px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}
</style>
