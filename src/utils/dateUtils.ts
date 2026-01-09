import { WEEKDAY_SLOTS, type WeekdaySlotId } from '../types/calendar'

/**
 * 날짜가 평일(월~금)인지 확인
 */
export function isWeekday(date: Date): boolean {
  const day = date.getDay()
  return day >= 1 && day <= 5 // 1=월, 5=금
}

/**
 * 날짜가 주말(토~일)인지 확인
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6 // 0=일, 6=토
}

/**
 * 시간 문자열이 슬롯 ID인지 확인
 */
export function isSlotId(time: string): time is WeekdaySlotId {
  return ['A', 'B', 'C'].includes(time)
}

/**
 * 슬롯 ID를 표시용 문자열로 변환
 */
export function slotIdToDisplayTime(slotId: string): string {
  const slot = WEEKDAY_SLOTS.find(s => s.id === slotId)
  return slot ? slot.label : slotId
}
