// KBO 구장 · 홈/원정 팀 정보 (구장 도시는 weatherList의 name과 매칭됨)
export const GAME_SCHEDULE = [
  {
    id: 'game_01',
    city: '서울',
    stadium: '잠실야구장',
    home: { name: '두산 베어스', color: '#131230' },
    away: { name: '롯데 자이언츠', color: '#041E42' },
    time: '18:30',
    isDome: false,
  },
  {
    id: 'game_02',
    city: '서울',
    stadium: '고척스카이돔',
    home: { name: '키움 히어로즈', color: '#570514' },
    away: { name: '삼성 라이온즈', color: '#074CA1' },
    time: '18:30',
    isDome: true,
  },
  {
    id: 'game_03',
    city: '수원',
    stadium: 'KT 위즈 파크',
    home: { name: 'KT 위즈', color: '#000000' },
    away: { name: 'LG 트윈스', color: '#C30452' },
    time: '18:30',
    isDome: false,
  },
  {
    id: 'game_04',
    city: '인천',
    stadium: 'SSG 랜더스 필드',
    home: { name: 'SSG 랜더스', color: '#CE0E2D' },
    away: { name: '한화 이글스', color: '#FF6600' },
    time: '18:30',
    isDome: false,
  },
  {
    id: 'game_05',
    city: '창원',
    stadium: 'NC 파크',
    home: { name: 'NC 다이노스', color: '#315288' },
    away: { name: 'KIA 타이거즈', color: '#EA0029' },
    time: '18:30',
    isDome: false,
  },
]

// 날씨 상태 → 경기 개최 판정
export const getGameStatus = (weather, isDome) => {
  if (isDome) {
    return { level: 'dome', icon: '🏟️', label: '돔구장 · 날씨 무관 정상 개최' }
  }
  if (!weather) {
    return { level: 'unknown', icon: '❓', label: '해당 도시 날씨 정보 없음' }
  }
  if (weather.status === '비') {
    return { level: 'canceled', icon: '🌧️', label: '우천 취소 유력' }
  }
  if (weather.status === '흐림') {
    return { level: 'warning', icon: '☁️', label: '우천 취소 가능 · 경기 전 확인' }
  }
  return { level: 'normal', icon: '✅', label: '정상 개최 예정' }
}

// 기온 → 관람 팁
export const getWatchTip = (weather) => {
  if (!weather) return '날씨 정보를 확인할 수 없습니다.'
  if (weather.temp >= 31) return '🥵 폭염 — 생수·모자·쿨링 용품 필수'
  if (weather.temp >= 25) return '😎 더운 편 — 그늘 좌석을 추천합니다'
  if (weather.temp >= 20) return '👍 야구 보기 딱 좋은 날씨'
  return '🧥 쌀쌀함 — 겉옷을 꼭 챙기세요'
}

// 취소 위험 경기 수 (요약 배지용)
export const countRainOutRisk = (weatherList) =>
  GAME_SCHEDULE.filter((game) => {
    if (game.isDome) return false
    const weather = weatherList.find((w) => w.name === game.city)
    return weather && (weather.status === '비' || weather.status === '흐림')
  }).length