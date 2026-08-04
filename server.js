import 'dotenv/config'
import http from 'node:http'
import { createHmac, timingSafeEqual } from 'node:crypto'

const port = Number(process.env.API_PORT ?? 3001)
const secret = process.env.MOCK_JWT_SECRET || 'local-development-secret'
const openWeatherApiKey = process.env.OPENWEATHER_API_KEY
const weatherCities = [
  { id: 'city_01', name: '서울', lat: 37.5665, lng: 126.978, temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', lat: 37.2636, lng: 127.0286, temp: 24, status: '비' },
  { id: 'city_03', name: '부산', lat: 35.1796, lng: 129.0756, temp: 26, status: '구름' },
  { id: 'city_04', name: '인천', lat: 37.4563, lng: 126.7052, temp: 23, status: '흐림' },
  { id: 'city_05', name: '대전', lat: 36.3504, lng: 127.3845, temp: 27, status: '맑음' },
  { id: 'city_06', name: '대구', lat: 35.8714, lng: 128.6014, temp: 31, status: '맑음' },
  { id: 'city_07', name: '광주', lat: 35.1595, lng: 126.8526, temp: 22, status: '흐림' },
  { id: 'city_08', name: '울산', lat: 35.5384, lng: 129.3114, temp: 29, status: '구름' },
  { id: 'city_09', name: '제주', lat: 33.4996, lng: 126.5312, temp: 20, status: '비' },
  { id: 'city_10', name: '강릉', lat: 37.7519, lng: 128.8761, temp: 25, status: '맑음' },
  { id: 'city_11', name: '전주', lat: 35.8242, lng: 127.148, temp: 24, status: '비' },
  { id: 'city_12', name: '춘천', lat: 37.8813, lng: 127.73, temp: 30, status: '맑음' },
  { id: 'city_13', name: '청주', lat: 36.6424, lng: 127.489, temp: 26, status: '흐림' },
  { id: 'city_14', name: '창원', lat: 35.228, lng: 128.6811, temp: 28, status: '구름' },
  { id: 'city_15', name: '포항', lat: 36.019, lng: 129.3435, temp: 32, status: '맑음' },
  { id: 'city_16', name: '여수', lat: 34.7604, lng: 127.6622, temp: 25, status: '구름' },
  { id: 'city_17', name: '목포', lat: 34.8118, lng: 126.3922, temp: 21, status: '비' },
  { id: 'city_18', name: '속초', lat: 38.207, lng: 128.5918, temp: 22, status: '흐림' },
]
const baseballStadiums = [
  { gameId: 'game_01', name: '잠실야구장', lat: 37.5122, lng: 127.0719, temp: 28, status: '맑음' },
  { gameId: 'game_02', name: '고척 스카이돔', lat: 37.4982, lng: 126.8671, temp: 28, status: '맑음' },
  { gameId: 'game_03', name: '수원 KT위즈파크', lat: 37.2997, lng: 127.0097, temp: 24, status: '비' },
  { gameId: 'game_04', name: '대구 삼성라이온즈파크', lat: 35.8412, lng: 128.6817, temp: 31, status: '맑음' },
  { gameId: 'game_05', name: '사직야구장', lat: 35.1940, lng: 129.0615, temp: 26, status: '구름' },
]
const initialProducts = [
  { id: 1, name: 'Vue 3 실전 가이드', category: '도서', price: 32000, stock: 8, description: 'Composition API와 컴포넌트 설계를 다루는 실습서' },
  { id: 2, name: '무선 키보드', category: '장비', price: 49000, stock: 5, description: '프런트엔드 개발자를 위한 저소음 무선 키보드' },
  { id: 3, name: '버티컬 마우스', category: '장비', price: 39000, stock: 0, description: '손목 부담을 줄이는 인체공학 마우스' },
]
const initialPosts = [
  { id: 1, title: 'Vue 학습을 시작합니다', content: 'Composition API부터 차근차근 실습해 봅시다.', author: '관리자', createdAt: '2026-08-01T09:00:00.000Z', updatedAt: '2026-08-01T09:00:00.000Z' },
  { id: 2, title: 'Mock API 활용 방법', content: 'Axios로 목록 조회, 등록, 수정, 삭제 요청을 연습합니다.', author: 'Vue 강사', createdAt: '2026-08-02T10:30:00.000Z', updatedAt: '2026-08-02T10:30:00.000Z' },
]
const users = [
  { id: 1, email: 'student@skala.com', password: '1234', name: 'SKALA 수강생', role: 'student', department: 'Frontend Class' },
  { id: 2, email: 'admin@skala.com', password: 'admin1234', name: '실습 관리자', role: 'admin', department: 'Education Team' },
]
let products; let posts; let nextProductId; let nextPostId
function resetData() {
  products = structuredClone(initialProducts); posts = structuredClone(initialPosts)
  nextProductId = Math.max(...products.map(({ id }) => id)) + 1
  nextPostId = Math.max(...posts.map(({ id }) => id)) + 1
}
resetData()

const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Lab-Client', 'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS', 'Content-Type': 'application/json; charset=utf-8' }
function send(res, status, data) { res.writeHead(status, headers); res.end(status === 204 ? undefined : JSON.stringify(data)) }
function fail(status, message) { const error = new Error(message); error.status = status; throw error }
async function body(req) {
  const chunks = []; for await (const chunk of req) chunks.push(chunk)
  if (!chunks.length) return {}
  try { const value = JSON.parse(Buffer.concat(chunks)); if (!value || Array.isArray(value) || typeof value !== 'object') fail(400, 'JSON 객체가 필요합니다.'); return value }
  catch (error) { if (error.status) throw error; fail(400, '올바른 JSON 형식이 아닙니다.') }
}
const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url')
function signToken(user) {
  const header = encode({ alg: 'HS256', typ: 'JWT' }); const payload = encode({ sub: user.id, email: user.email, role: user.role, exp: Math.floor(Date.now() / 1000) + 900 })
  const signature = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url')
  return `${header}.${payload}.${signature}`
}
function authenticate(req) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) fail(401, '인증 토큰이 필요합니다.')
  const [header, payload, signature] = token.split('.'); if (!header || !payload || !signature) fail(401, '잘못된 토큰입니다.')
  const expected = createHmac('sha256', secret).update(`${header}.${payload}`).digest()
  let actual; try { actual = Buffer.from(signature, 'base64url') } catch { fail(401, '잘못된 토큰입니다.') }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) fail(401, '토큰 서명이 올바르지 않습니다.')
  const claims = JSON.parse(Buffer.from(payload, 'base64url')); if (claims.exp < Date.now() / 1000) fail(401, '토큰이 만료되었습니다.')
  const user = users.find(({ id }) => id === claims.sub); if (!user) fail(401, '사용자를 찾을 수 없습니다.'); return user
}
const publicUser = ({ password, ...user }) => user

function weatherStatus(weatherId) {
  if (weatherId >= 200 && weatherId < 600) return '비'
  if (weatherId >= 600 && weatherId < 700) return '눈'
  if (weatherId === 800) return '맑음'
  if (weatherId === 801 || weatherId === 802) return '구름'
  return '흐림'
}

function mockWeather(city, source = 'mock') {
  return { ...city, humidity: null, wind: null, pressure: null, description: '로컬 테스트 날씨 데이터', source }
}

async function fetchWeather(city) {
  if (!openWeatherApiKey) return mockWeather(city)
  const params = new URLSearchParams({ lat: city.lat, lon: city.lng, appid: openWeatherApiKey, units: 'metric', lang: 'kr' })
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?${params}`, { signal: AbortSignal.timeout(5000) })
    if (!response.ok) throw new Error(`OpenWeather 응답 오류: ${response.status}`)
    const data = await response.json()
    return {
      ...city,
      name: city.name === '현재 위치' ? data.name || city.name : city.name,
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      status: weatherStatus(data.weather[0]?.id),
      humidity: data.main.humidity,
      wind: data.wind.speed,
      pressure: data.main.pressure,
      description: data.weather[0]?.description || '',
      observedAt: new Date(data.dt * 1000).toISOString(),
      source: 'openweather',
    }
  } catch (error) {
    console.warn(`[날씨 API] ${city.name}: ${error.message} — Mock 데이터 사용`)
    return mockWeather(city, 'mock-fallback')
  }
}

async function searchWeather(query) {
  const localCity = weatherCities.find(({ name }) => name.includes(query) || query.includes(name))
  if (!openWeatherApiKey) {
    if (localCity) return mockWeather(localCity)
    fail(503, '새 도시 검색에는 OpenWeather API 키가 필요합니다.')
  }

  const geoParams = new URLSearchParams({ q: query, limit: '1', appid: openWeatherApiKey })
  const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?${geoParams}`, { signal: AbortSignal.timeout(5000) })
  if (!response.ok) fail(502, `도시 검색 API 요청에 실패했습니다. (${response.status})`)
  const [location] = await response.json()
  if (!location) fail(404, `“${query}” 도시를 찾을 수 없습니다.`)

  const name = location.local_names?.ko || location.name
  const id = `city_api_${location.lat.toFixed(4)}_${location.lon.toFixed(4)}`.replaceAll('.', '-')
  let city = weatherCities.find((item) => item.id === id)
  if (!city) {
    city = { id, name, lat: location.lat, lng: location.lon, temp: 0, status: '흐림' }
    weatherCities.push(city)
  }
  return fetchWeather(city)
}

async function route(req, res, url) {
  const productMatch = url.pathname.match(/^\/api\/products\/(\d+)$/)
  const postMatch = url.pathname.match(/^\/api\/posts\/(\d+)$/)
  const weatherMatch = url.pathname.match(/^\/api\/weather\/([^/]+)$/)
  if (req.method === 'GET' && url.pathname === '/api/health') return send(res, 200, { status: 'ok', productCount: products.length, postCount: posts.length, auth: true })
  if (req.method === 'POST' && url.pathname === '/api/reset') { resetData(); return send(res, 200, { message: 'Mock 데이터가 초기화되었습니다.' }) }
  if (req.method === 'GET' && url.pathname === '/api/weather') {
    const cities = await Promise.all(weatherCities.map(fetchWeather))
    return send(res, 200, { cities, source: cities.every(({ source }) => source === 'openweather') ? 'openweather' : 'mock' })
  }
  if (req.method === 'GET' && url.pathname === '/api/stadium-weather') {
    const stadiums = await Promise.all(baseballStadiums.map(fetchWeather))
    return send(res, 200, {
      stadiums,
      source: stadiums.every(({ source }) => source === 'openweather') ? 'openweather' : 'mock',
    })
  }
  if (req.method === 'GET' && url.pathname === '/api/weather-location') {
    const lat = Number(url.searchParams.get('lat'))
    const lng = Number(url.searchParams.get('lng'))
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
      fail(400, '올바른 위도와 경도가 필요합니다.')
    }
    return send(res, 200, await fetchWeather({ id: `current_${lat}_${lng}`, name: '현재 위치', lat, lng, temp: 24, status: '맑음' }))
  }
  if (req.method === 'GET' && url.pathname === '/api/weather-search') {
    const query = (url.searchParams.get('q') || '').trim()
    if (!query) fail(400, '검색할 도시 이름을 입력해 주세요.')
    return send(res, 200, await searchWeather(query))
  }
  if (req.method === 'GET' && weatherMatch) {
    const city = weatherCities.find(({ id }) => id === weatherMatch[1])
    if (!city) fail(404, '도시를 찾을 수 없습니다.')
    return send(res, 200, await fetchWeather(city))
  }
  if (req.method === 'GET' && url.pathname === '/api/products') {
    const q = (url.searchParams.get('q') || '').toLowerCase(); const category = url.searchParams.get('category') || '전체'; const available = url.searchParams.get('available') === 'true'
    return send(res, 200, products.filter((p) => (!q || `${p.name} ${p.description}`.toLowerCase().includes(q)) && (category === '전체' || p.category === category) && (!available || p.stock > 0)))
  }
  if (req.method === 'POST' && url.pathname === '/api/products') {
    const input = await body(req); if (!input.name?.trim()) fail(400, '상품명은 필수입니다.')
    const item = { id: nextProductId++, name: input.name.trim(), category: input.category || '기타', price: Number(input.price), stock: Number(input.stock), description: input.description || '' }; products.push(item); return send(res, 201, item)
  }
  if (productMatch && req.method === 'PATCH') {
    const item = products.find(({ id }) => id === Number(productMatch[1])); if (!item) fail(404, '상품을 찾을 수 없습니다.')
    const input = await body(req); for (const key of ['name', 'category', 'price', 'stock', 'description']) if (Object.hasOwn(input, key)) item[key] = ['price', 'stock'].includes(key) ? Number(input[key]) : input[key]
    return send(res, 200, item)
  }
  if (productMatch && req.method === 'DELETE') { const index = products.findIndex(({ id }) => id === Number(productMatch[1])); if (index < 0) fail(404, '상품을 찾을 수 없습니다.'); return send(res, 200, products.splice(index, 1)[0]) }
  if (req.method === 'GET' && url.pathname === '/api/posts') return send(res, 200, [...posts].sort((a, b) => b.id - a.id))
  if (req.method === 'POST' && url.pathname === '/api/posts') {
    const input = await body(req); if (!input.title?.trim()) fail(400, '게시글 제목은 필수입니다.'); const now = new Date().toISOString()
    const item = { id: nextPostId++, title: input.title.trim(), author: input.author?.trim() || '익명', content: input.content || '', createdAt: now, updatedAt: now }; posts.push(item); return send(res, 201, item)
  }
  if (postMatch && req.method === 'PATCH') {
    const item = posts.find(({ id }) => id === Number(postMatch[1])); if (!item) fail(404, '게시글을 찾을 수 없습니다.'); const input = await body(req)
    for (const key of ['title', 'author', 'content']) if (Object.hasOwn(input, key)) item[key] = input[key]; item.updatedAt = new Date().toISOString(); return send(res, 200, item)
  }
  if (postMatch && req.method === 'DELETE') { const index = posts.findIndex(({ id }) => id === Number(postMatch[1])); if (index < 0) fail(404, '게시글을 찾을 수 없습니다.'); return send(res, 200, posts.splice(index, 1)[0]) }
  if (req.method === 'POST' && url.pathname === '/api/auth/login') {
    const input = await body(req); const user = users.find(({ email, password }) => email === input.email && password === input.password)
    if (!user) fail(401, '이메일 또는 비밀번호가 올바르지 않습니다.'); return send(res, 200, { accessToken: signToken(user), user: publicUser(user) })
  }
  if (req.method === 'GET' && url.pathname === '/api/auth/me') return send(res, 200, publicUser(authenticate(req)))
  if (req.method === 'GET' && url.pathname === '/api/auth/protected-message') { const user = authenticate(req); return send(res, 200, { message: `${user.name}님의 인증 요청이 성공했습니다.`, role: user.role, requestedAt: new Date().toISOString() }) }
  fail(404, '존재하지 않는 API 경로입니다.')
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204)
  const url = new URL(req.url || '/', `http://${req.headers.host || `localhost:${port}`}`)
  try { await route(req, res, url) } catch (error) { if (!error.status || error.status >= 500) console.error(error); send(res, error.status || 500, { message: error.status ? error.message : '서버 내부 오류가 발생했습니다.' }) }
})
server.listen(port, '127.0.0.1', () => console.log(`통합 Mock API: http://localhost:${port}/api`))
