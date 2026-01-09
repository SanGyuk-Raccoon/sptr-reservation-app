import type { ReactNode } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface AdminGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export function AdminGuard({ children, fallback = null }: AdminGuardProps) {
  const { isAdmin, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (!isAdmin) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
