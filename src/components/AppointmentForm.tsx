import { useState } from 'react'
import type { AppointmentFormData, WeekdaySlotId } from '../types/calendar'
import type { Team } from '../types/team'
import { WEEKDAY_SLOTS } from '../types/calendar'
import { isWeekday } from '../utils/dateUtils'

interface AppointmentFormProps {
  selectedDate: Date
  bookedSlots: WeekdaySlotId[]
  leaderTeams: Team[]
  onSubmit: (data: AppointmentFormData) => void
  onCancel: () => void
}

export function AppointmentForm({ selectedDate, bookedSlots, leaderTeams, onSubmit, onCancel }: AppointmentFormProps) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    title: leaderTeams.length === 1 ? leaderTeams[0].name : '',
    time: '',
    description: '',
    team_id: leaderTeams.length === 1 ? leaderTeams[0].id : null
  })

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
    setFormData({ ...formData, time: slotId })
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
        // 평일: 슬롯 선택 버튼
        <div className="slot-selector">
          <label className="slot-label">시간대 선택</label>
          <div className="slot-buttons">
            {WEEKDAY_SLOTS.map((slot) => {
              const isBooked = bookedSlots.includes(slot.id)
              const isSelected = formData.time === slot.id
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
          </div>
        </div>
      ) : (
        // 주말: 자유 시간 입력
        <input
          type="time"
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          className="form-input"
        />
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
