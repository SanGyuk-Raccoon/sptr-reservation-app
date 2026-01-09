import { supabase } from './supabase'
import type { Profile } from '../types/auth'

// Google 로그인
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}`
    }
  })
  if (error) throw error
  return data
}

// 로그아웃
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// 프로필 조회
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('프로필 조회 실패:', error)
    return null
  }
  return data
}

// 프로필 업데이트
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'name' | 'avatar_url'>>
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('프로필 업데이트 실패:', error)
    return null
  }
  return data
}

// 현재 세션 가져오기
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

// 모든 사용자 조회 (관리자 전용)
export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('사용자 목록 조회 실패:', error)
    return []
  }
  return data || []
}
