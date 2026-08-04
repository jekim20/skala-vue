<script setup>
// ========================================
// 수정 코드: 자동완성 계산과 입력창 포커스 상태 관리를 위해 computed, ref 추가
// ========================================
import { computed, ref } from 'vue'
// 검색어는 props로 내려받고, 입력이 생기면 update-query 이벤트로 부모에 올려보낸다.
// 한글 IME 조합 이슈 때문에 v-model 대신 :value + @input 사용.
const props = defineProps({
  searchQuery: {
    type: String,
    required: true,
  },
  // ========================================
  // 추가 코드: 자동완성 후보와 최근 본 도시 데이터
  // ========================================
  cityList: {
    type: Array,
    default: () => [],
  },
  recentCities: {
    type: Array,
    default: () => [],
  },
  isSearching: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update-query', 'select-city', 'search-city'])

// ========================================
// 추가 코드: 검색 자동완성 상태 및 검색 결과 계산
// ========================================
const focused = ref(false)

const suggestions = computed(() => {
  const keyword = props.searchQuery.trim()
  if (!keyword) return []
  return props.cityList.filter((city) => city.name.includes(keyword)).slice(0, 6)
})

const handleInput = (e) => {
  emit('update-query', e.target.value)
}

const chooseCity = (city) => {
  emit('select-city', city)
  focused.value = false
}

const submitSearch = () => {
  const query = props.searchQuery.trim()
  if (query) emit('search-city', query)
}
// ========================================
// 추가 코드 끝
// ========================================
</script>

<template>
  <div class="search-bar">
    <!-- ========================================
         수정 코드: 기존 단순 입력창을 자동완성 검색창으로 변경
         ======================================== -->
    <label for="city-search">도시 검색</label>
    <form class="search-field" @submit.prevent="submitSearch">
      <span aria-hidden="true">🔎</span>
      <input
        id="city-search"
        :value="searchQuery"
        autocomplete="off"
        placeholder="도시 이름을 한글로 입력하세요"
        @focus="focused = true"
        @blur="focused = false"
        @input="handleInput"
      />
      <button class="search-button" type="submit" :disabled="isSearching">
        {{ isSearching ? '검색 중…' : '날씨 검색' }}
      </button>
      <ul v-if="focused && suggestions.length" class="suggestions">
        <li v-for="city in suggestions" :key="city.id">
          <button type="button" @mousedown.prevent="chooseCity(city)">
            <strong>{{ city.name }}</strong>
            <span>{{ city.temp }}℃ · {{ city.status }}</span>
          </button>
        </li>
      </ul>
    </form>

    <!-- ========================================
         병합 복원: "입력한 도시명 출력"은 과제 필수 요구사항(단계 1)이므로 유지
         ======================================== -->
    <p class="typed-query">
      입력한 도시명: <strong>{{ searchQuery }}</strong>
    </p>

    <!-- ========================================
         추가 코드: 현재 화면에서 최근 선택한 도시를 최대 5개까지 표시
         새로고침하면 목록은 초기화된다.
         ======================================== -->
    <div v-if="recentCities.length" class="recent-cities">
      <span>최근 본 도시</span>
      <button
        v-for="city in recentCities"
        :key="city.id"
        type="button"
        @click="chooseCity(city)"
      >
        {{ city.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* ========================================
   수정/추가 코드: 자동완성 목록과 최근 도시 버튼 스타일
   ======================================== */
.search-bar > label { display: block; margin-bottom: 6px; font-weight: 700; color: #35495e; }
.search-field { position: relative; display: flex; align-items: center; }
.search-field > span { position: absolute; left: 11px; z-index: 1; }
.search-bar input {
  flex: 1;
  min-width: 0;
  padding: 10px 12px 10px 38px;
  border: 1px solid #bbb;
  border-radius: 9px;
}
.search-button { flex: 0 0 auto; margin-left: 8px; padding: 10px 14px; border: 0; border-radius: 9px; background: #42b883; color: white; font-weight: 700; cursor: pointer; }
.search-button:disabled { cursor: wait; opacity: .65; }

.search-bar input:focus {
  outline: none;
  border-color: #42b883;
}

.suggestions { position: absolute; top: calc(100% + 5px); z-index: 10; width: 100%; padding: 5px; list-style: none; border: 1px solid #dde3ea; border-radius: 10px; background: white; box-shadow: 0 10px 24px rgba(53, 73, 94, .14); }
.suggestions button { display: flex; justify-content: space-between; width: 100%; padding: 9px 10px; border: 0; border-radius: 7px; background: transparent; color: #35495e; cursor: pointer; }
.suggestions button:hover { background: #edf9f4; }
.suggestions span { color: #718295; font-size: .85rem; }
.typed-query { margin-top: 8px; font-size: .88rem; color: #56687a; }
.recent-cities { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
.recent-cities > span { margin-right: 2px; color: #8494a5; font-size: .82rem; }
.recent-cities button { padding: 4px 10px; border: 1px solid #dbe4e0; border-radius: 14px; background: #f7fbf9; color: #3d6c58; cursor: pointer; }
.recent-cities button:hover { border-color: #42b883; }
/* ========================================
   수정/추가 코드 끝
   ======================================== */
</style>
