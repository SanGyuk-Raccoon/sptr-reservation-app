import { createClient } from '@supabase/supabase-js'

// 환경 변수에서 Supabase URL과 키 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 환경 변수가 설정되지 않았습니다. .env 파일을 확인하세요.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 데이터베이스 타입 정의
export interface AppointmentRow {
  id: string
  date: string
  title: string
  time: string
  description: string | null
  created_at: string
  updated_at: string
}
