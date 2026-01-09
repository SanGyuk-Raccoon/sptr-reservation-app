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
  team_id: string | null
}

// 평일 시간대 슬롯 타입
export type WeekdaySlotId = 'A' | 'B' | 'C'

export interface WeekdayTimeSlot {
  id: WeekdaySlotId
  label: string
  startTime: string
  endTime: string
}

// 평일 시간대 상수 정의
export const WEEKDAY_SLOTS: WeekdayTimeSlot[] = [
  { id: 'A', label: 'A (17:30-19:00)', startTime: '17:30', endTime: '19:00' },
  { id: 'B', label: 'B (19:00-20:30)', startTime: '19:00', endTime: '20:30' },
  { id: 'C', label: 'C (20:30-22:00)', startTime: '20:30', endTime: '22:00' }
]
