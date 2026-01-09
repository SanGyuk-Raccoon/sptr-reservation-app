import type { Appointment } from '../lib/appointments'

interface AppointmentCardProps {
  appointment: Appointment
  isPast: boolean
  onDelete: (id: string) => void
}

export function AppointmentCard({ appointment, isPast, onDelete }: AppointmentCardProps) {
  return (
    <div className={`appointment-card ${isPast ? 'past-appointment' : ''}`}>
      <div className="appointment-header">
        <span className="appointment-time">{appointment.time}</span>
        {isPast && (
          <span className="past-badge">과거</span>
        )}
        {!isPast && (
          <button
            onClick={() => onDelete(appointment.id)}
            className="delete-button"
          >
            ✕
          </button>
        )}
      </div>
      <h4 className="appointment-title">{appointment.title}</h4>
      {appointment.description && (
        <p className="appointment-description">{appointment.description}</p>
      )}
    </div>
  )
}
