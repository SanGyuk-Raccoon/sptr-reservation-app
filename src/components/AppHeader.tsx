import type { BookingPeriod } from '../types/calendar'

interface AppHeaderProps {
  error: string | null
  loading: boolean
  bookingPeriods: BookingPeriod[]
  nextMonday: Date
}

export function AppHeader({ error, loading, bookingPeriods }: AppHeaderProps) {
  // 예약 가능 기간 요약
  const periodSummary = bookingPeriods.length > 0
    ? `${bookingPeriods[0].start.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} ~ ${bookingPeriods[bookingPeriods.length - 1].end.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}`
    : '없음'

  return (
    <header className="app-header">
      <h1>밴드 연습실 예약</h1>
      {error && <div className="error-message">⚠️ {error}</div>}
      {loading && <div className="loading-message">로딩 중...</div>}
      <div className="booking-info-compact">
        <span className="info-label">예약 가능:</span>
        <span className="info-value">{periodSummary}</span>
      </div>
    </header>
  )
}
