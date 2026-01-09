import { useMemo } from 'react'
import type { AvailableDatesResult, BookingPeriod } from '../types/calendar'

export function useAvailableDates(): AvailableDatesResult {
  const today = useMemo(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  }, [])

  return useMemo(() => {
    const todayDate = new Date(today)
    todayDate.setHours(0, 0, 0, 0)

    // 다음 월요일 찾기
    const dayOfWeek = todayDate.getDay()
    const daysUntilMonday = dayOfWeek === 1 ? 0 : (8 - dayOfWeek) % 7 || 7
    const thisMonday = new Date(todayDate)
    thisMonday.setDate(todayDate.getDate() + (dayOfWeek === 1 ? 0 : daysUntilMonday))

    // 과거의 모든 월요일 찾기 (최대 1년 전까지)
    const mondays: Date[] = []
    const startDate = new Date(todayDate)
    startDate.setFullYear(todayDate.getFullYear() - 1)

    // 시작일부터 오늘까지의 모든 월요일 찾기
    const firstMonday = new Date(startDate)
    const firstDayOfWeek = startDate.getDay()
    const daysToFirstMonday = firstDayOfWeek === 1 ? 0 : (8 - firstDayOfWeek) % 7 || 7
    firstMonday.setDate(startDate.getDate() + daysToFirstMonday)

    let currentMonday = new Date(firstMonday)
    while (currentMonday <= todayDate) {
      mondays.push(new Date(currentMonday))
      currentMonday.setDate(currentMonday.getDate() + 7)
    }

    // 각 월요일로부터 4주 뒤 일주일치 계산
    const availableDatesSet = new Set<string>()
    const periods: BookingPeriod[] = []

    mondays.forEach(monday => {
      const bookingStart = new Date(monday)
      bookingStart.setDate(monday.getDate() + 28)

      const bookingEnd = new Date(bookingStart)
      bookingEnd.setDate(bookingStart.getDate() + 6)

      if (bookingEnd >= todayDate) {
        periods.push({ start: bookingStart, end: bookingEnd })

        const currentDate = new Date(bookingStart)
        while (currentDate <= bookingEnd) {
          if (currentDate >= todayDate) {
            availableDatesSet.add(currentDate.toDateString())
          }
          currentDate.setDate(currentDate.getDate() + 1)
        }
      }
    })

    const availableDatesArray = Array.from(availableDatesSet)
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => a.getTime() - b.getTime())

    const minDate = new Date(todayDate)
    minDate.setFullYear(todayDate.getFullYear() - 1)
    const maxDate = availableDatesArray.length > 0
      ? availableDatesArray[availableDatesArray.length - 1]
      : new Date(todayDate.getTime() + 365 * 24 * 60 * 60 * 1000)

    return {
      availableDates: availableDatesSet,
      minDate,
      maxDate,
      nextMonday: thisMonday,
      bookingPeriods: periods.sort((a, b) => a.start.getTime() - b.start.getTime())
    }
  }, [today])
}

export function useToday(): Date {
  return useMemo(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  }, [])
}
