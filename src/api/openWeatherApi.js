import axios from 'axios'
import { mockCities, mockStadiums } from '../data/mockWeather.js'

const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY
const currentWeather = axios.create({ baseURL: 'https://api.openweathermap.org/data/2.5', timeout: 8000 })
const geocoding = axios.create({ baseURL: 'https://api.openweathermap.org/geo/1.0', timeout: 8000 })

function statusFromId(id) {
  if (id >= 200 && id < 600) return '비'
  if (id >= 600 && id < 700) return '눈'
  if (id === 800) return '맑음'
  if (id === 801 || id === 802) return '구름'
  return '흐림'
}

async function getAtLocation(location) {
  const { data } = await currentWeather.get('/weather', {
    params: { lat: location.lat, lon: location.lng, appid: apiKey, units: 'metric', lang: 'kr' },
  })
  return {
    ...location,
    temp: Math.round(data.main.temp),
    status: statusFromId(data.weather[0]?.id),
    humidity: data.main.humidity,
    wind: data.wind.speed,
    pressure: data.main.pressure,
    description: data.weather[0]?.description || '',
    observedAt: new Date(data.dt * 1000).toISOString(),
    source: 'openweather',
  }
}

export const hasPublicWeatherKey = Boolean(apiKey)

export const publicWeatherApi = {
  async getAll() {
    const cities = await Promise.all(mockCities.map(async (city) => {
      try { return await getAtLocation(city) } catch { return { ...structuredClone(city), source: 'mock' } }
    }))
    return { cities, source: cities.every(({ source }) => source === 'openweather') ? 'openweather' : 'mock' }
  },
  async getById(cityId) {
    const city = mockCities.find(({ id }) => id === cityId)
    if (!city) throw new Error('도시를 찾을 수 없습니다.')
    return getAtLocation(city)
  },
  async search(query) {
    const { data: locations } = await geocoding.get('/direct', {
      params: { q: query, limit: 1, appid: apiKey },
    })
    const location = locations[0]
    if (!location) throw new Error(`“${query}” 도시를 찾을 수 없습니다.`)
    const name = location.local_names?.ko || location.name
    const id = `city_api_${location.lat.toFixed(4)}_${location.lon.toFixed(4)}`.replaceAll('.', '-')
    return getAtLocation({ id, name, lat: location.lat, lng: location.lon })
  },
  async getStadiums() {
    const stadiums = await Promise.all(mockStadiums.map(async (stadium) => {
      try { return await getAtLocation(stadium) } catch { return { ...structuredClone(stadium), source: 'mock' } }
    }))
    return { stadiums, source: stadiums.every(({ source }) => source === 'openweather') ? 'openweather' : 'mock' }
  },
}
