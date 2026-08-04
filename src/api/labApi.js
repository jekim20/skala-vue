import { http } from './http.js'
import { cloneMock, mockCities, mockStadiums } from '../data/mockWeather.js'
import { hasPublicWeatherKey, publicWeatherApi } from './openWeatherApi.js'

const staticDemo = import.meta.env.PROD

export const productApi = {
  getAll: (params = {}) => http.get('/products', { params }).then(({ data }) => data),
  create: (body) => http.post('/products', body).then(({ data }) => data),
  update: (id, body) => http.patch(`/products/${id}`, body).then(({ data }) => data),
  remove: (id) => http.delete(`/products/${id}`).then(({ data }) => data),
}

export const postApi = {
  getAll: (params = {}) => http.get('/posts', { params }).then(({ data }) => data),
  create: (body) => http.post('/posts', body).then(({ data }) => data),
  update: (id, body) => http.patch(`/posts/${id}`, body).then(({ data }) => data),
  remove: (id) => http.delete(`/posts/${id}`).then(({ data }) => data),
}

export const systemApi = {
  health: () => http.get('/health').then(({ data }) => data),
  reset: () => http.post('/reset').then(({ data }) => data),
}

export const authApi = {
  login: (body) => http.post('/auth/login', body).then(({ data }) => data),
  me: () => http.get('/auth/me').then(({ data }) => data),
  protectedMessage: () => http.get('/auth/protected-message').then(({ data }) => data),
}

export const weatherApi = {
  getAll: () => staticDemo
    ? hasPublicWeatherKey
      ? publicWeatherApi.getAll()
      : Promise.resolve({ cities: cloneMock(mockCities), source: 'mock' })
    : http.get('/weather').then(({ data }) => data),
  getById: (cityId) => {
    if (!staticDemo) return http.get(`/weather/${cityId}`).then(({ data }) => data)
    if (hasPublicWeatherKey) return publicWeatherApi.getById(cityId)
    const city = mockCities.find(({ id }) => id === cityId)
    return city ? Promise.resolve(cloneMock(city)) : Promise.reject(new Error('도시를 찾을 수 없습니다.'))
  },
  search: (query) => {
    if (!staticDemo) return http.get('/weather-search', { params: { q: query } }).then(({ data }) => data)
    if (hasPublicWeatherKey) return publicWeatherApi.search(query)
    const keyword = query.trim().toLowerCase()
    const city = mockCities.find(({ name }) => name.toLowerCase().includes(keyword))
    return city ? Promise.resolve(cloneMock(city)) : Promise.reject(new Error('데모에서는 전국 18개 도시를 검색할 수 있습니다.'))
  },
  getStadiums: () => staticDemo
    ? hasPublicWeatherKey
      ? publicWeatherApi.getStadiums()
      : Promise.resolve({ stadiums: cloneMock(mockStadiums), source: 'mock' })
    : http.get('/stadium-weather').then(({ data }) => data),
  getCurrentLocation: (lat, lng) => {
    if (staticDemo) {
      return hasPublicWeatherKey
        ? publicWeatherApi.getCurrentLocation(lat, lng)
        : Promise.reject(new Error('배포용 OpenWeather API 키가 필요합니다.'))
    }
    return http.get('/weather-location', { params: { lat, lng } }).then(({ data }) => data)
  },
}
