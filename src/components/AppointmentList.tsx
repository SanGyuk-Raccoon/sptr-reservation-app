import type { Appointment } from '../lib/appointments'
import { AppointmentCard } from './AppointmentCard'

interface AppointmentListProps {
  appointments: Appointment[]
  isPastDate: (date: Date) => boolean
  onDelete: (id: string) => void
}

export function AppointmentList({ appointments, isPastDate, onDelete }: AppointmentListProps) {
  const sortedAppointments = [...appointments].sort((a, b) =>
    a.time.localeCompare(b.time)
  )

  return (
    <div className="appointments-list">
      <h3>예약된 일정 ({appointments.length})</h3>
      {appointments.length === 0 ? (
        <p className="no-appointments">예약된 일정이 없습니다.</p>
      ) : (
        <div className="appointments">
          {sortedAppointments.map(apt => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              isPast={isPastDate(apt.date)}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
