// 폼 선택지 / 필터 칩에서 공용으로 쓰는 날씨 상태 목록
// !! [협업 과제 병합] '눈' 추가 — 눈 카드 배경/모달 테마가 실제로 도달 가능하도록 활성화
export const STATUS_OPTIONS = ['맑음', '구름', '흐림', '비', '눈']

export const statusEmoji = (status) => {
  const map = { 맑음: '☀️', 구름: '⛅', 흐림: '☁️', 비: '🌧️', 눈: '🌨️' }
  return map[status] ?? '🌡️'
}
