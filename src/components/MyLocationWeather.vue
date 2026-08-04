<script setup>
import { computed, inject, ref } from 'vue'
import { weatherApi } from '../api/labApi.js'
import { statusEmoji } from '../utils/weather.js'

const emit = defineEmits(['save-city'])
const { unitSymbol, convertTemp } = inject('weather-unit')
const weather = ref(null)
const loading = ref(false)
const error = ref('')
const saved = ref(false)

const tip = computed(() => {
  if (!weather.value) return ''
  if (weather.value.status === '비') return '우산을 챙기고 미끄러운 길을 조심하세요.'
  if (weather.value.status === '눈') return '따뜻하게 입고 대중교통 상황을 확인하세요.'
  if (weather.value.temp >= 30) return '폭염에 주의하고 물을 자주 마셔주세요.'
  if (weather.value.temp <= 10) return '쌀쌀한 날씨예요. 겉옷을 꼭 챙기세요.'
  if (weather.value.wind >= 8) return '바람이 강합니다. 야외 활동에 유의하세요.'
  return '산책이나 가벼운 야외 활동을 즐기기 좋은 날씨예요.'
})

function locate() {
  error.value = ''
  saved.value = false
  if (!navigator.geolocation) {
    error.value = '이 브라우저는 위치 기능을 지원하지 않습니다.'
    return
  }
  loading.value = true
  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      try {
        weather.value = await weatherApi.getCurrentLocation(coords.latitude, coords.longitude)
      } catch (requestError) {
        error.value = requestError.message
      } finally {
        loading.value = false
      }
    },
    (locationError) => {
      error.value = locationError.code === 1
        ? '위치 권한이 필요합니다. 브라우저에서 위치 접근을 허용해 주세요.'
        : '현재 위치를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.'
      loading.value = false
    },
    { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
  )
}

function save() {
  emit('save-city', { ...weather.value, id: `saved_${weather.value.lat.toFixed(4)}_${weather.value.lng.toFixed(4)}` })
  saved.value = true
}
</script>

<template>
  <div class="location-weather">
    <div class="location-copy">
      <span class="eyebrow">GEOLOCATION · OPENWEATHER</span>
      <h3>지금 내 주변 날씨는?</h3>
      <p>위치 권한을 허용하면 현재 좌표 기준 날씨와 오늘의 활동 팁을 알려드려요.</p>
      <button class="locate-button" type="button" :disabled="loading" @click="locate">
        <span>{{ loading ? '⏳' : '📍' }}</span>{{ loading ? '위치 확인 중…' : weather ? '현재 날씨 다시 확인' : '내 위치 날씨 확인' }}
      </button>
      <p v-if="error" class="location-error" role="alert">{{ error }}</p>
      <small>위치 정보는 날씨 조회에만 사용하며 저장하지 않습니다.</small>
    </div>

    <Transition name="weather-pop" mode="out-in">
      <div v-if="weather" :key="weather.observedAt" class="result-card">
        <div class="result-top"><span class="weather-icon">{{ statusEmoji(weather.status) }}</span><div><b>{{ weather.name }}</b><span>{{ weather.description }}</span></div></div>
        <div class="temperature">{{ convertTemp(weather.temp) }}<small>{{ unitSymbol }}</small></div>
        <div class="metrics"><span>체감 {{ convertTemp(weather.feelsLike ?? weather.temp) }}{{ unitSymbol }}</span><span>습도 {{ weather.humidity }}%</span><span>바람 {{ weather.wind }}m/s</span></div>
        <p class="activity-tip">✨ {{ tip }}</p>
        <button class="save-button" type="button" :disabled="saved" @click="save">{{ saved ? '✓ 날씨 현황에 저장됨' : '+ 지역별 날씨 현황에 저장' }}</button>
      </div>
      <div v-else class="result-placeholder"><span>🧭</span><p>버튼을 눌러<br>내 주변 날씨를 만나보세요.</p></div>
    </Transition>
  </div>
</template>

<style scoped>
.location-weather{display:grid;grid-template-columns:1fr 1fr;gap:18px;padding:6px}.location-copy{align-self:center;padding:22px}.eyebrow{color:#19886c;font-size:.68rem;font-weight:800;letter-spacing:.14em}.location-copy h3{margin:8px 0;font-size:1.7rem;color:#23445a}.location-copy>p{max-width:430px;color:#6f8391}.location-copy small{display:block;margin-top:10px;color:#9aa6ae}.locate-button,.save-button{border:0;border-radius:11px;cursor:pointer;font-weight:750}.locate-button{display:flex;align-items:center;gap:7px;margin-top:20px;padding:12px 17px;background:#188a70;color:#fff;box-shadow:0 8px 18px #188a7030}.locate-button:disabled{cursor:wait;opacity:.7}.location-error{margin-top:12px!important;color:#bd3e4b!important;font-size:.85rem}.result-card,.result-placeholder{min-height:250px;border-radius:20px}.result-card{padding:24px;background:linear-gradient(145deg,#12384d,#126a68);color:#fff;box-shadow:0 15px 30px #173e4d25}.result-top{display:flex;align-items:center;gap:12px}.weather-icon{font-size:2.6rem}.result-top div{display:grid}.result-top span{color:#bcded9;font-size:.8rem}.temperature{margin:12px 0 8px;font-size:3.4rem;font-weight:800;line-height:1}.temperature small{font-size:1.2rem}.metrics{display:flex;gap:7px;flex-wrap:wrap}.metrics span{padding:5px 9px;border-radius:8px;background:#ffffff18;color:#d9eeee;font-size:.76rem}.activity-tip{margin:16px 0 12px;color:#e7f5f2;font-size:.86rem}.save-button{width:100%;padding:10px;background:#fff;color:#176c5c}.save-button:disabled{background:#d8eee8;color:#39836e}.result-placeholder{display:grid;place-content:center;border:1px dashed #bbd3d2;background:#f3faf8;color:#78918e;text-align:center}.result-placeholder span{font-size:3rem}.weather-pop-enter-active,.weather-pop-leave-active{transition:.25s ease}.weather-pop-enter-from,.weather-pop-leave-to{transform:translateY(8px);opacity:0}@media(max-width:720px){.location-weather{grid-template-columns:1fr}.location-copy{padding:10px}.result-card,.result-placeholder{min-height:220px}}
</style>
