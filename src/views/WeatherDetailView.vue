<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const cityId = route.params.cityId
const city = ref(null)
const error = ref('')

const cityMockData = [
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', humidity: '45%', wind: '3m/s', pressure: '1012hPa', description: '쾌청한 날씨입니다. 야외 활동하기 좋습니다.' },
  { id: 'city_02', name: '수원', temp: 24, status: '비', humidity: '82%', wind: '5m/s', pressure: '1008hPa', description: '비가 오고 있습니다. 우산을 챙기세요.' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름', humidity: '68%', wind: '4m/s', pressure: '1010hPa', description: '구름이 많지만 크게 불편하지 않은 날씨입니다.' },
  { id: 'city_04', name: '인천', temp: 23, status: '흐림', humidity: '74%', wind: '4m/s', pressure: '1009hPa', description: '흐린 하늘이 지속되고 있습니다.' },
  { id: 'city_05', name: '대전', temp: 27, status: '맑음', humidity: '50%', wind: '3m/s', pressure: '1013hPa', description: '화창하고 기분 좋은 날씨입니다.' },
  { id: 'city_06', name: '대구', temp: 31, status: '맑음', humidity: '40%', wind: '2m/s', pressure: '1015hPa', description: '무더운 날씨가 이어집니다. 수분 섭취에 유의하세요.' },
  { id: 'city_07', name: '광주', temp: 22, status: '흐림', humidity: '70%', wind: '4m/s', pressure: '1007hPa', description: '선선하고 흐린 날씨입니다.' },
  { id: 'city_08', name: '울산', temp: 29, status: '구름', humidity: '64%', wind: '4m/s', pressure: '1011hPa', description: '구름이 끼어 덥지 않은 날씨입니다.' },
  { id: 'city_09', name: '제주', temp: 20, status: '비', humidity: '88%', wind: '6m/s', pressure: '1006hPa', description: '비가 내리고 있어 우산이 필요합니다.' },
  { id: 'city_10', name: '강릉', temp: 25, status: '맑음', humidity: '55%', wind: '3m/s', pressure: '1012hPa', description: '해변에 가기 좋은 맑은 날씨입니다.' },
]

onMounted(() => {
  const found = cityMockData.find((item) => item.id === cityId)
  if (found) {
    city.value = found
  } else {
    error.value = '해당 도시를 찾을 수 없습니다. 올바른 도시 ID를 입력했는지 확인하세요.'
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
        <li><strong>기온:</strong> {{ city.temp }}℃</li>
        <li><strong>습도:</strong> {{ city.humidity }}</li>
        <li><strong>풍속:</strong> {{ city.wind }}</li>
        <li><strong>기압:</strong> {{ city.pressure }}</li>
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
