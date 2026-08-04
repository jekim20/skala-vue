<script setup>
import { storeToRefs } from 'pinia'
import { useConfigStore } from '../stores/configStore.js'

const configStore = useConfigStore()
const { unit, unitSymbol } = storeToRefs(configStore)
</script>

<template>
  <button class="unit-toggle" type="button" aria-label="날씨 온도 단위 변경" @click="configStore.toggleUnit">
    <strong>{{ unitSymbol }}</strong>
    <span class="next">{{ unit === 'celsius' ? '℉로 보기' : '℃로 보기' }}</span>
  </button>
</template>

<style scoped>
.unit-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid #f0c869;
  border-radius: 20px;
  background-color: #fff7e0;
  color: #8a6d1d;
  cursor: pointer;
  transition: all 0.2s ease;
}

.unit-toggle:hover {
  background-color: #ffedbf;
}

.next {
  font-size: 0.8rem;
}
</style>
