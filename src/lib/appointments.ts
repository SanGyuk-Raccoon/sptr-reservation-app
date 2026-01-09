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
  team_id: string | null
  team_name?: string | null
}

export interface CreateAppointmentData {
  date: Date
  title: string
  time: string
  description: string
  user_id: string
  user_name: string
  team_id: string | null
  team_name?: string | null
}

// 로컬 날짜를 YYYY-MM-DD 형식으로 변환 (timezone 문제 방지)
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// AppointmentRow를 Appointment로 변환
const rowToAppointment = (row: AppointmentRow & { team_id?: string | null; team_name?: string | null }): Appointment => ({
  id: row.id,
  date: new Date(row.date),
  title: row.title,
  time: row.time,
  description: row.description || '',
  user_id: row.user_id,
  user_name: row.user_name,
  team_id: row.team_id || null,
  team_name: row.team_name || null
})

// 모든 예약 가져오기 (RLS가 자동으로 권한 처리)
export async function getAppointments(): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        team:teams(name)
      `)
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    if (error) throw error

    return data ? data.map(row => rowToAppointment({
      ...row,
      team_name: row.team?.name || null
    })) : []
  } catch (error) {
    console.error('예약 가져오기 실패:', error)
    throw error
  }
}

// 특정 날짜의 예약 가져오기
export async function getAppointmentsByDate(date: Date): Promise<Appointment[]> {
  try {
    const dateStr = formatLocalDate(date)

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', dateStr)
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
          date: formatLocalDate(appointment.date),
          title: appointment.title,
          time: appointment.time,
          description: appointment.description || null,
          user_id: appointment.user_id,
          user_name: appointment.user_name,
          team_id: appointment.team_id
        }
      ])
      .select(`
        *,
        team:teams(name)
      `)
      .single()

    if (error) throw error

    return rowToAppointment({
      ...data,
      team_name: data.team?.name || null
    })
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
