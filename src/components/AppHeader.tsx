import type { BookingPeriod } from '../types/calendar'

interface AppHeaderProps {
  error: string | null
  loading: boolean
  bookingPeriods: BookingPeriod[]
  nextMonday: Date
}

export function AppHeader({ error, loading, bookingPeriods, nextMonday }: AppHeaderProps) {
  return (
    <header className="app-header">
      <h1>📅 일정 예약 시스템</h1>
      <p>매주 월요일에 4주 뒤 일주일치 예약이 오픈됩니다</p>
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}
      {loading && (
        <div className="loading-message">
          데이터를 불러오는 중...
        </div>
      )}
      <div className="booking-info">
        <p className="booking-period">
          예약 가능 기간: {bookingPeriods.length > 0 ? (
            <>
              {bookingPeriods[0].start.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} ~ {bookingPeriods[bookingPeriods.length - 1].end.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              <span className="period-count"> ({bookingPeriods.length}개 기간)</span>
            </>
          ) : '없음'}
        </p>
        <p className="next-opening">
          다음 예약 오픈: {nextMonday.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          })} (4주 뒤 일주일치 추가)
        </p>
        {bookingPeriods.length > 0 && (
          <div className="periods-list">
            <p className="periods-title">예약 가능한 주차:</p>
            <div className="periods-grid">
              {bookingPeriods.map((period, idx) => (
                <div key={idx} className="period-item">
                  {period.start.toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric'
                  })} ~ {period.end.toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
