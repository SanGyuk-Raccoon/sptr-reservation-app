import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { getProfile, signInWithGoogle, signOut } from '../lib/auth'
import type { Profile, UserRole } from '../types/auth'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isAdmin: boolean
  role: UserRole | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    // 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event)
        setUser(session?.user ?? null)

        if (session?.user) {
          // 약간의 딜레이를 줘서 트리거가 프로필을 생성할 시간을 확보
          setTimeout(() => {
            loadProfile(session.user.id)
          }, 500)
        } else {
          setProfile(null)
          setIsLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      const profileData = await getProfile(userId)
      setProfile(profileData)
    } catch (error) {
      console.error('프로필 로드 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignInWithGoogle = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Google 로그인 실패:', error)
      throw error
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setProfile(null)
      setUser(null)
    } catch (error) {
      console.error('로그아웃 실패:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isAdmin: profile?.role === 'admin',
    role: profile?.role ?? null,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
