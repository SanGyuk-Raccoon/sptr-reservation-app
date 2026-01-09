import { useState, useEffect, useCallback } from 'react'
import {
  getAppointments,
  createAppointment,
  deleteAppointment,
  subscribeToAppointments,
  type Appointment,
  type CreateAppointmentData
} from '../lib/appointments'

interface UseAppointmentsResult {
  appointments: Appointment[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  addAppointment: (data: CreateAppointmentData) => Promise<void>
  removeAppointment: (id: string) => Promise<void>
  getAppointmentsForDate: (date: Date) => Appointment[]
}

export function useAppointments(): UseAppointmentsResult {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setError(null)
      const data = await getAppointments()
      setAppointments(data)
    } catch (err) {
      console.error('예약 데이터 새로고침 실패:', err)
      setError('데이터를 불러오는 중 오류가 발생했습니다.')
    }
  }, [])

  useEffect(() => {
    async function loadAppointments() {
      try {
        setLoading(true)
        setError(null)
        const data = await getAppointments()
        setAppointments(data)
      } catch (err) {
        console.error('예약 데이터 불러오기 실패:', err)
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()

    const subscription = subscribeToAppointments((updatedAppointments) => {
      setAppointments(updatedAppointments)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const addAppointment = useCallback(async (data: CreateAppointmentData) => {
    try {
      setError(null)
      await createAppointment(data)
      await refresh()
    } catch (err) {
      console.error('예약 추가 실패:', err)
      setError('예약을 추가하는 중 오류가 발생했습니다.')
      throw err
    }
  }, [refresh])

  const removeAppointment = useCallback(async (id: string) => {
    try {
      setError(null)
      await deleteAppointment(id)
      await refresh()
    } catch (err) {
      console.error('예약 삭제 실패:', err)
      setError('예약을 삭제하는 중 오류가 발생했습니다.')
      throw err
    }
  }, [refresh])

  const getAppointmentsForDate = useCallback((date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date)
      return aptDate.toDateString() === date.toDateString()
    })
  }, [appointments])

  return {
    appointments,
    loading,
    error,
    refresh,
    addAppointment,
    removeAppointment,
    getAppointmentsForDate
  }
}
