import { supabase } from './supabase'
import type { AppointmentRow } from './supabase'

export interface Appointment {
  id: string
  date: Date
  title: string
  time: string
  description: string
  user_id: string | null
  user_name: string | null
}

export interface CreateAppointmentData {
  date: Date
  title: string
  time: string
  description: string
  user_id: string
  user_name: string
}

// AppointmentRow를 Appointment로 변환
const rowToAppointment = (row: AppointmentRow): Appointment => ({
  id: row.id,
  date: new Date(row.date),
  title: row.title,
  time: row.time,
  description: row.description || '',
  user_id: row.user_id,
  user_name: row.user_name
})

// 모든 예약 가져오기 (RLS가 자동으로 권한 처리)
export async function getAppointments(): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    if (error) throw error

    return data ? data.map(rowToAppointment) : []
  } catch (error) {
    console.error('예약 가져오기 실패:', error)
    throw error
  }
}

// 특정 날짜의 예약 가져오기
export async function getAppointmentsByDate(date: Date): Promise<Appointment[]> {
  try {
    const dateStr = date.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .gte('date', dateStr)
      .lt('date', new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('time', { ascending: true })

    if (error) throw error

    return data ? data.map(rowToAppointment) : []
  } catch (error) {
    console.error('날짜별 예약 가져오기 실패:', error)
    throw error
  }
}

// 예약 추가
export async function createAppointment(appointment: CreateAppointmentData): Promise<Appointment> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert([
        {
          date: appointment.date.toISOString().split('T')[0],
          title: appointment.title,
          time: appointment.time,
          description: appointment.description || null,
          user_id: appointment.user_id,
          user_name: appointment.user_name
        }
      ])
      .select()
      .single()

    if (error) throw error

    return rowToAppointment(data)
  } catch (error) {
    console.error('예약 추가 실패:', error)
    throw error
  }
}

// 예약 삭제
export async function deleteAppointment(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('예약 삭제 실패:', error)
    throw error
  }
}

// 실시간 구독
export function subscribeToAppointments(
  callback: (appointments: Appointment[]) => void
) {
  const channel = supabase
    .channel('appointments-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'appointments'
      },
      async () => {
        const appointments = await getAppointments()
        callback(appointments)
      }
    )
    .subscribe()

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel)
    }
  }
}
