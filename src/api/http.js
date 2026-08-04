import axios from 'axios'

export const accessTokenKey = 'jwt-lab-access-token'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json', 'X-Lab-Client': 'weather-lab' },
})

http.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(accessTokenKey)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message ||
      (error.code === 'ECONNABORTED' ? 'API 응답 시간이 초과되었습니다.' : 'API 서버에 연결할 수 없습니다. npm run dev:all을 실행해 주세요.')
    const normalized = new Error(message)
    normalized.status = error.response?.status
    return Promise.reject(normalized)
  },
)
