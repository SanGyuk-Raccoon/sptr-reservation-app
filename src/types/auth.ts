export type UserRole = 'admin' | 'user'

export interface Profile {
  id: string
  name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  user_metadata: {
    name?: string
    full_name?: string
    avatar_url?: string
  }
}
