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

/**
 * 시간 문자열을 분 단위로 변환 (예: "17:30" → 1050)
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * 두 시간대가 겹치는지 확인
 */
export function isTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1)
  const e1 = timeToMinutes(end1)
  const s2 = timeToMinutes(start2)
  const e2 = timeToMinutes(end2)

  // 두 구간이 겹치지 않는 경우: e1 <= s2 또는 e2 <= s1
  return !(e1 <= s2 || e2 <= s1)
}

/**
 * 시간 문자열에서 시작/종료 시간 추출
 * 슬롯 ID면 해당 슬롯의 시간, "HH:MM-HH:MM" 형식이면 파싱
 */
export function parseTimeRange(time: string): { start: string; end: string } | null {
  // 슬롯 ID인 경우
  const slot = WEEKDAY_SLOTS.find(s => s.id === time)
  if (slot) {
    return { start: slot.startTime, end: slot.endTime }
  }

  // "HH:MM-HH:MM" 형식인 경우
  const rangeMatch = time.match(/^(\d{2}:\d{2})-(\d{2}:\d{2})$/)
  if (rangeMatch) {
    return { start: rangeMatch[1], end: rangeMatch[2] }
  }

  // 단순 시간 "HH:MM" 형식 (주말용, 1시간으로 가정)
  const simpleMatch = time.match(/^(\d{2}:\d{2})$/)
  if (simpleMatch) {
    const startMinutes = timeToMinutes(simpleMatch[1])
    const endMinutes = startMinutes + 60
    const endHours = Math.floor(endMinutes / 60)
    const endMins = endMinutes % 60
    return {
      start: simpleMatch[1],
      end: `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`
    }
  }

  return null
}

/**
 * 새 시간대가 기존 예약들과 겹치는지 확인
 */
export function hasTimeConflict(
  newStart: string,
  newEnd: string,
  existingTimes: string[]
): boolean {
  for (const time of existingTimes) {
    const range = parseTimeRange(time)
    if (range && isTimeOverlap(newStart, newEnd, range.start, range.end)) {
      return true
    }
  }
  return false
}

/**
 * 새 시간대가 기본 슬롯(A, B, C)과 겹치는지 확인
 */
export function hasSlotConflict(newStart: string, newEnd: string): boolean {
  for (const slot of WEEKDAY_SLOTS) {
    if (isTimeOverlap(newStart, newEnd, slot.startTime, slot.endTime)) {
      return true
    }
  }
  return false
}
