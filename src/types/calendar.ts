export type ValuePiece = Date | null
export type CalendarValue = ValuePiece | [ValuePiece, ValuePiece]

export interface BookingPeriod {
  start: Date
  end: Date
}

export interface AvailableDatesResult {
  availableDates: Set<string>
  minDate: Date
  maxDate: Date
  nextMonday: Date
  bookingPeriods: BookingPeriod[]
}

export interface AppointmentFormData {
  title: string
  time: string
  description: string
}
