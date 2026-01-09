import { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import './App.css'

import type { CalendarValue, AppointmentFormData } from './types/calendar'
import { useAvailableDates, useToday, useAppointments } from './hooks'
import { AppHeader, AppointmentForm, AppointmentList } from './components'

function App() {
  const [selectedDate, setSelectedDate] = useState<CalendarValue>(new Date())
  const [showForm, setShowForm] = useState(false)

  const today = useToday()
  const { availableDates, minDate, maxDate, nextMonday, bookingPeriods } = useAvailableDates()
  const {
    loading,
    error,
    refresh,
    addAppointment,
    removeAppointment,
    getAppointmentsForDate
  } = useAppointments()

  const isDateAvailable = (date: Date) => {
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    return availableDates.has(checkDate.toDateString())
  }

  const isPastDate = (date: Date) => {
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    return checkDate < today
  }

  const tileDisabled = ({ date }: { date: Date }) => {
    if (isPastDate(date)) {
      return false
    }
    return !isDateAvailable(date)
  }

  const handleDateChange = async (value: CalendarValue) => {
    setSelectedDate(value)
    setShowForm(false)
    await refresh()
  }

  const handleAddAppointment = async (formData: AppointmentFormData) => {
    const date = Array.isArray(selectedDate) ? selectedDate[0] : selectedDate
    if (!date) return

    if (!isDateAvailable(date)) {
      alert('예약 가능한 날짜가 아닙니다. 예약 가능 기간을 확인해주세요.')
      return
    }

    try {
      await addAppointment({
        date: date,
        title: formData.title,
        time: formData.time,
        description: formData.description
      })
      setShowForm(false)
    } catch {
      alert('예약 추가에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const handleDeleteAppointment = async (id: string) => {
    try {
      await removeAppointment(id)
    } catch {
      alert('예약 삭제에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const selectedDateObj = Array.isArray(selectedDate) ? selectedDate[0] : selectedDate
  const dayAppointments = selectedDateObj ? getAppointmentsForDate(selectedDateObj) : []
  const canAddAppointment = selectedDateObj && !isPastDate(selectedDateObj) && isDateAvailable(selectedDateObj)

  const handleShowForm = () => {
    if (!selectedDateObj) return

    if (isPastDate(selectedDateObj)) {
      alert('과거 날짜에는 일정을 추가할 수 없습니다.')
      return
    }

    if (!isDateAvailable(selectedDateObj)) {
      alert('예약 가능한 날짜를 선택해주세요.')
      return
    }

    setShowForm(true)
  }

  return (
    <div className="app-container">
      <AppHeader
        error={error}
        loading={loading}
        bookingPeriods={bookingPeriods}
        nextMonday={nextMonday}
      />

      <div className="main-content">
        <div className="calendar-section">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            locale="ko-KR"
            calendarType="gregory"
            className="custom-calendar"
            minDate={minDate}
            maxDate={maxDate}
            tileDisabled={tileDisabled}
          />
        </div>

        <div className="appointments-section">
          <div className="selected-date-info">
            <h2>
              {selectedDateObj
                ? selectedDateObj.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })
                : '날짜를 선택하세요'}
            </h2>

            {selectedDateObj && isPastDate(selectedDateObj) && (
              <div className="info-message">
                📅 과거 날짜입니다. 예약 현황만 확인할 수 있습니다.
              </div>
            )}

            {selectedDateObj && !isPastDate(selectedDateObj) && !isDateAvailable(selectedDateObj) && (
              <div className="warning-message">
                ⚠️ 이 날짜는 예약 가능한 기간이 아닙니다.
              </div>
            )}

            {!showForm ? (
              <button
                className="add-button"
                onClick={handleShowForm}
                disabled={!canAddAppointment}
              >
                + 일정 추가하기
              </button>
            ) : (
              <AppointmentForm
                onSubmit={handleAddAppointment}
                onCancel={() => setShowForm(false)}
              />
            )}
          </div>

          <AppointmentList
            appointments={dayAppointments}
            isPastDate={isPastDate}
            onDelete={handleDeleteAppointment}
          />
        </div>
      </div>
    </div>
  )
}

export default App
