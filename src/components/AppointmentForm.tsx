import { useState } from 'react'
import type { AppointmentFormData, WeekdaySlotId } from '../types/calendar'
import type { Team } from '../types/team'
import { WEEKDAY_SLOTS } from '../types/calendar'
import { isWeekday, hasSlotConflict, hasTimeConflict } from '../utils/dateUtils'

// 30분 단위 시간 옵션 생성 (09:00 ~ 23:00)
function generateTimeOptions(): string[] {
  const options: string[] = []
  for (let hour = 9; hour <= 23; hour++) {
    options.push(`${String(hour).padStart(2, '0')}:00`)
    if (hour < 23) {
      options.push(`${String(hour).padStart(2, '0')}:30`)
    }
  }
  return options
}

const TIME_OPTIONS = generateTimeOptions()

interface AppointmentFormProps {
  selectedDate: Date
  bookedSlots: WeekdaySlotId[]
  existingTimes: string[]  // 해당 날짜의 모든 예약 시간
  leaderTeams: Team[]
  onSubmit: (data: AppointmentFormData) => void
  onCancel: () => void
}

export function AppointmentForm({ selectedDate, bookedSlots, existingTimes, leaderTeams, onSubmit, onCancel }: AppointmentFormProps) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    title: leaderTeams.length === 1 ? leaderTeams[0].name : '',
    time: '',
    description: '',
    team_id: leaderTeams.length === 1 ? leaderTeams[0].id : null
  })

  // 기타 시간 모드 (평일용)
  const [useCustomTime, setUseCustomTime] = useState(false)
  const [customStartTime, setCustomStartTime] = useState('')
  const [customEndTime, setCustomEndTime] = useState('')
  const [timeError, setTimeError] = useState<string | null>(null)

  // 팀 선택 시 title 자동 설정
  const handleTeamChange = (teamId: string | null) => {
    const team = leaderTeams.find(t => t.id === teamId)
    setFormData({
      ...formData,
      team_id: teamId,
      title: team?.name || ''
    })
  }

  const isWeekdayDate = isWeekday(selectedDate)

  const handleSlotSelect = (slotId: WeekdaySlotId) => {
    setUseCustomTime(false)
    setTimeError(null)
    setFormData({ ...formData, time: slotId })
  }

  const handleCustomTimeToggle = () => {
    setUseCustomTime(true)
    setFormData({ ...formData, time: '' })
    setCustomStartTime('')
    setCustomEndTime('')
    setTimeError(null)
  }

  const validateCustomTime = (start: string, end: string): string | null => {
    if (!start || !end) return null

    // 시작 시간이 종료 시간보다 늦은 경우
    if (start >= end) {
      return '종료 시간은 시작 시간보다 늦어야 합니다.'
    }

    // 기본 슬롯(A, B, C)과 겹치는지 확인
    if (hasSlotConflict(start, end)) {
      return 'A, B, C 슬롯 시간대와 겹칩니다. 다른 시간을 선택해주세요.'
    }

    // 기존 예약과 겹치는지 확인
    if (hasTimeConflict(start, end, existingTimes)) {
      return '이미 예약된 시간대와 겹칩니다.'
    }

    return null
  }

  const handleCustomTimeChange = (start: string, end: string) => {
    setCustomStartTime(start)
    setCustomEndTime(end)

    const error = validateCustomTime(start, end)
    setTimeError(error)

    if (!error && start && end) {
      setFormData({ ...formData, time: `${start}-${end}` })
    } else {
      setFormData({ ...formData, time: '' })
    }
  }

  const handleSubmit = () => {
    if (!formData.team_id) {
      alert('팀을 선택해주세요.')
      return
    }
    if (!formData.time) {
      alert('시간을 선택해주세요.')
      return
    }
    if (timeError) {
      alert(timeError)
      return
    }
    onSubmit(formData)
  }

  // 팀장인 팀이 없으면 예약 불가
  if (leaderTeams.length === 0) {
    return (
      <div className="appointment-form">
        <div className="no-team-warning">
          예약 권한이 없습니다. 팀장으로 등록된 팀이 없습니다.
        </div>
        <button onClick={onCancel} className="cancel-button">
          닫기
        </button>
      </div>
    )
  }

  return (
    <div className="appointment-form">
      {/* 팀 선택 */}
      <div className="team-selector">
        <label className="form-label">예약 팀</label>
        {leaderTeams.length === 1 ? (
          <div className="selected-team">{leaderTeams[0].name}</div>
        ) : (
          <select
            value={formData.team_id || ''}
            onChange={(e) => handleTeamChange(e.target.value || null)}
            className="form-select"
          >
            <option value="">팀 선택</option>
            {leaderTeams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {isWeekdayDate ? (
        // 평일: 슬롯 선택 + 기타 시간
        <div className="slot-selector">
          <label className="slot-label">시간대 선택</label>
          <div className="slot-buttons">
            {WEEKDAY_SLOTS.map((slot) => {
              const isBooked = bookedSlots.includes(slot.id)
              const isSelected = !useCustomTime && formData.time === slot.id
              return (
                <button
                  key={slot.id}
                  type="button"
                  className={`slot-button ${isSelected ? 'selected' : ''} ${isBooked ? 'disabled' : ''}`}
                  onClick={() => !isBooked && handleSlotSelect(slot.id)}
                  disabled={isBooked}
                >
                  {slot.label}
                  {isBooked && <span className="booked-tag">예약됨</span>}
                </button>
              )
            })}
            {/* 기타 시간 버튼 */}
            <button
              type="button"
              className={`slot-button ${useCustomTime ? 'selected' : ''}`}
              onClick={handleCustomTimeToggle}
            >
              기타 시간
            </button>
          </div>

          {/* 기타 시간 입력 */}
          {useCustomTime && (
            <div className="custom-time-inputs">
              <div className="time-range-inputs">
                <select
                  value={customStartTime}
                  onChange={(e) => handleCustomTimeChange(e.target.value, customEndTime)}
                  className="form-select time-select"
                >
                  <option value="">시작 시간</option>
                  {TIME_OPTIONS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                <span className="time-separator">~</span>
                <select
                  value={customEndTime}
                  onChange={(e) => handleCustomTimeChange(customStartTime, e.target.value)}
                  className="form-select time-select"
                >
                  <option value="">종료 시간</option>
                  {TIME_OPTIONS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              {timeError && <div className="time-error">{timeError}</div>}
              <div className="time-hint">
                A, B, C 슬롯 및 기존 예약과 겹치지 않는 시간을 선택하세요.
              </div>
            </div>
          )}
        </div>
      ) : (
        // 주말: 자유 시간 입력
        <div className="weekend-time-selector">
          <label className="form-label">시간 선택</label>
          <div className="time-range-inputs">
            <select
              value={customStartTime}
              onChange={(e) => {
                setCustomStartTime(e.target.value)
                if (e.target.value && customEndTime) {
                  const error = validateCustomTime(e.target.value, customEndTime)
                  setTimeError(error)
                  if (!error) {
                    setFormData({ ...formData, time: `${e.target.value}-${customEndTime}` })
                  }
                }
              }}
              className="form-select time-select"
            >
              <option value="">시작 시간</option>
              {TIME_OPTIONS.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
            <span className="time-separator">~</span>
            <select
              value={customEndTime}
              onChange={(e) => {
                setCustomEndTime(e.target.value)
                if (customStartTime && e.target.value) {
                  const error = validateCustomTime(customStartTime, e.target.value)
                  setTimeError(error)
                  if (!error) {
                    setFormData({ ...formData, time: `${customStartTime}-${e.target.value}` })
                  }
                }
              }}
              className="form-select time-select"
            >
              <option value="">종료 시간</option>
              {TIME_OPTIONS.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          {timeError && <div className="time-error">{timeError}</div>}
        </div>
      )}

      <div className="form-buttons">
        <button onClick={handleSubmit} className="save-button">
          저장
        </button>
        <button onClick={onCancel} className="cancel-button">
          취소
        </button>
      </div>
    </div>
  )
}
