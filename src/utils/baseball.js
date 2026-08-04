// ⚾ [협업 과제 병합 보완] KBO 경기 유틸.
// 민기 님의 BaseballPanel/GameCard/WeatherParent가 import하는 파일이 전달분에 누락되어
// 사용처 코드에서 요구하는 스펙(GAME_SCHEDULE/getGameStatus/getWatchTip/countRainOutRisk)을
// 역산하여 작성했다. 판정 기준은 BaseballPanel의 riskOnly 필터(비·흐림, 돔 제외)와 일치시켰다.

// 오늘의 KBO 경기 일정 Mock — city는 weatherList의 도시 이름과 매칭된다
export const GAME_SCHEDULE = [
  {
    id: 'game_01',
    city: '서울',
    stadium: '잠실야구장',
    time: '18:30',
    isDome: false,
    home: { name: 'LG 트윈스', color: '#c30452' },
    away: { name: '두산 베어스', color: '#131230' },
  },
  {
    id: 'game_02',
    city: '서울',
    stadium: '고척 스카이돔',
    time: '18:30',
    isDome: true,
    home: { name: '키움 히어로즈', color: '#570514' },
    away: { name: 'SSG 랜더스', color: '#ce0e2d' },
  },
  {
    id: 'game_03',
    city: '수원',
    stadium: '수원 KT위즈파크',
    time: '18:30',
    isDome: false,
    home: { name: 'KT 위즈', color: '#231f20' },
    away: { name: '한화 이글스', color: '#f76800' },
  },
  {
    id: 'game_04',
    city: '대구',
    stadium: '대구 삼성라이온즈파크',
    time: '18:30',
    isDome: false,
    home: { name: '삼성 라이온즈', color: '#074ca1' },
    away: { name: 'KIA 타이거즈', color: '#ea0029' },
  },
  {
    id: 'game_05',
    city: '부산',
    stadium: '사직야구장',
    time: '18:00',
    isDome: false,
    home: { name: '롯데 자이언츠', color: '#041e42' },
    away: { name: 'NC 다이노스', color: '#315288' },
  },
]

// 경기 개최 판정: 돔 > 정보 없음 > 비(취소 유력) > 흐림(취소 가능) > 정상
// GameCard의 4단 조건부 분기(level: dome/canceled/warning/unknown/normal)와 매칭
export const getGameStatus = (weather, isDome) => {
  if (isDome) return { level: 'dome' }
  if (!weather) return { level: 'unknown' }
  if (weather.status === '비') return { level: 'canceled' }
  if (weather.status === '흐림') return { level: 'warning' }
  return { level: 'normal' }
}

// 직관 팁 한 줄 (날씨 데이터 기반)
export const getWatchTip = (weather) => {
  if (!weather) return '도시 날씨를 대시보드에 추가하면 직관 팁을 알려드려요.'
  if (weather.status === '비') return '☔ 우비를 챙기세요. 우천 취소 공지를 꼭 확인!'
  if (weather.status === '흐림') return '🌂 접이식 우산을 가방에 넣어 가면 안심이에요.'
  if (weather.temp >= 28) return '🧢 무더위! 모자·물병 필수, 3루 그늘석 추천이에요.'
  if (weather.temp <= 15) return '🧥 쌀쌀해요. 얇은 겉옷을 챙기세요.'
  return '🍗 야구 보기 딱 좋은 날씨! 치킨과 함께 즐기세요.'
}

// 우천 취소 위험 경기 수 — BaseballPanel의 riskOnly 필터와 동일 기준(돔 제외, 비·흐림)
export const countRainOutRisk = (weatherList) =>
  GAME_SCHEDULE.filter((game) => {
    if (game.isDome) return false
    const weather = weatherList.find((item) => item.gameId === game.id)
    return Boolean(weather && (weather.status === '비' || weather.status === '흐림'))
  }).length
