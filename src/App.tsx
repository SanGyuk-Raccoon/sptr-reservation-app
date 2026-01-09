import { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import './App.css'

import type { CalendarValue, AppointmentFormData, WeekdaySlotId } from './types/calendar'
import type { Team } from './types/team'
import { WEEKDAY_SLOTS } from './types/calendar'
import { useAvailableDates, useToday, useAppointments } from './hooks'
import { isWeekday } from './utils/dateUtils'
import { getMyLeaderTeams } from './lib/teams'
import { AppHeader, AppointmentForm, AppointmentList } from './components'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthGuard, AdminGuard } from './components/auth'
import { AdminPage } from './components/admin'

function AppContent() {
  const [selectedDate, setSelectedDate] = useState<CalendarValue>(new Date())
  const [showForm, setShowForm] = useState(false)
  const [showAdminPage, setShowAdminPage] = useState(false)
  const [leaderTeams, setLeaderTeams] = useState<Team[]>([])

  const { user, profile, isAdmin, signOut } = useAuth()
  const today = useToday()
  const { availableDates, minDate, maxDate, nextMonday, bookingPeriods } = useAvailableDates()
  const {
    loading,
    error,
    refresh,
    addAppointment,
    removeAppointment,
    getAppointmentsForDate,
    getAvailableSlotsForDate
  } = useAppointments()

  // 내가 팀장인 팀 목록 로드
  useEffect(() => {
    if (user) {
      getMyLeaderTeams(user.id).then(setLeaderTeams)
    }
  }, [user])

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
    if (!date || !user) return

    if (!isDateAvailable(date)) {
      alert('예약 가능한 날짜가 아닙니다. 예약 가능 기간을 확인해주세요.')
      return
    }

    // 팀 이름 찾기
    const selectedTeam = leaderTeams.find(t => t.id === formData.team_id)

    try {
      await addAppointment({
        date: date,
        title: formData.title,
        time: formData.time,
        description: formData.description,
        user_id: user.id,
        user_name: profile?.name || user.email || '알 수 없음',
        team_id: formData.team_id,
        team_name: selectedTeam?.name || null
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

  // 예약 삭제 가능 여부 확인 (관리자 또는 본인 예약)
  const canDeleteAppointment = (appointmentUserId: string | null) => {
    if (isAdmin) return true
    return appointmentUserId === user?.id
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch {
      alert('로그아웃에 실패했습니다.')
    }
  }

  const selectedDateObj = Array.isArray(selectedDate) ? selectedDate[0] : selectedDate
  const dayAppointments = selectedDateObj ? getAppointmentsForDate(selectedDateObj) : []
  const canAddAppointment = selectedDateObj && !isPastDate(selectedDateObj) && isDateAvailable(selectedDateObj)

  // 선택된 날짜의 예약된 슬롯 계산 (평일용)
  const bookedSlots: WeekdaySlotId[] = selectedDateObj && isWeekday(selectedDateObj)
    ? WEEKDAY_SLOTS
        .map(slot => slot.id)
        .filter(slotId => !getAvailableSlotsForDate(selectedDateObj).includes(slotId))
    : []

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

  // 관리자 페이지에서 돌아올 때 팀 목록 새로고침
  const handleCloseAdminPage = () => {
    setShowAdminPage(false)
    if (user) {
      getMyLeaderTeams(user.id).then(setLeaderTeams)
    }
  }

  // 관리자 페이지 표시
  if (showAdminPage) {
    return <AdminPage onClose={handleCloseAdminPage} />
  }

  return (
    <div className="app-container">
      {/* 사용자 정보 헤더 */}
      <div className="user-header">
        <div className="user-info">
          {profile?.avatar_url && (
            <img
              src={profile.avatar_url}
              alt="프로필"
              className="user-avatar"
            />
          )}
          <span className="user-name">
            {profile?.name || user?.email}
          </span>
          <AdminGuard>
            <span className="admin-badge">관리자</span>
          </AdminGuard>
        </div>
        <div className="header-buttons">
          <AdminGuard>
            <button onClick={() => setShowAdminPage(true)} className="admin-button">
              팀 관리
            </button>
          </AdminGuard>
          <button onClick={handleSignOut} className="logout-button">
            로그아웃
          </button>
        </div>
      </div>

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
                과거 날짜입니다. 예약 현황만 확인할 수 있습니다.
              </div>
            )}

            {selectedDateObj && !isPastDate(selectedDateObj) && !isDateAvailable(selectedDateObj) && (
              <div className="warning-message">
                이 날짜는 예약 가능한 기간이 아닙니다.
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
            ) : selectedDateObj && (
              <AppointmentForm
                selectedDate={selectedDateObj}
                bookedSlots={bookedSlots}
                leaderTeams={leaderTeams}
                onSubmit={handleAddAppointment}
                onCancel={() => setShowForm(false)}
              />
            )}
          </div>

          <AppointmentList
            appointments={dayAppointments}
            isPastDate={isPastDate}
            onDelete={handleDeleteAppointment}
            canDelete={canDeleteAppointment}
            currentUserId={user?.id}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AuthGuard>
        <AppContent />
      </AuthGuard>
    </AuthProvider>
  )
}

export default App
