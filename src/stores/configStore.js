import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', {
  state: () => ({
    unit: 'celsius',
  }),

  getters: {
    unitSymbol: (state) => (state.unit === 'celsius' ? '℃' : '℉'),
  },

  actions: {
    toggleUnit() {
      this.unit = this.unit === 'celsius' ? 'fahrenheit' : 'celsius'
    },

    convertTemperature(celsius) {
      return this.unit === 'fahrenheit'
        ? Math.round((celsius * 9) / 5 + 32)
        : Math.round(celsius)
    },
  },
})
