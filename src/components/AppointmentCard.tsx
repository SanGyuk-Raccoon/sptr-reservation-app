import type { Appointment } from '../lib/appointments'
import { slotIdToDisplayTime } from '../utils/dateUtils'

interface AppointmentCardProps {
  appointment: Appointment
  isPast: boolean
  onDelete: (id: string) => void
  canDelete: boolean
  isOwner: boolean
  isAdmin: boolean
}

export function AppointmentCard({
  appointment,
  isPast,
  onDelete,
  canDelete,
  isOwner,
  isAdmin
}: AppointmentCardProps) {
  return (
    <div className={`appointment-card ${isPast ? 'past-appointment' : ''} ${isOwner ? 'own-appointment' : ''}`}>
      <div className="appointment-header">
        <span className="appointment-time">{slotIdToDisplayTime(appointment.time)}</span>
        <div className="appointment-badges">
          {isPast && <span className="past-badge">과거</span>}
          {isOwner && !isPast && <span className="owner-badge">내 예약</span>}
        </div>
        {!isPast && canDelete && (
          <button
            onClick={() => onDelete(appointment.id)}
            className="delete-button"
            title={isAdmin && !isOwner ? '관리자 권한으로 삭제' : '삭제'}
          >
            ✕
          </button>
        )}
      </div>
      <h4 className="appointment-title">{appointment.title}</h4>
      {appointment.team_name && (
        <p className="appointment-team">
          <span className="team-badge">{appointment.team_name}</span>
        </p>
      )}
      {appointment.description && (
        <p className="appointment-description">{appointment.description}</p>
      )}
      {appointment.user_name && (
        <p className="appointment-user">
          예약자: {appointment.user_name}
        </p>
      )}
    </div>
  )
}
