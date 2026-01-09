import { useState, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import './LoginPage.css'

// 인앱 브라우저 감지
function isInAppBrowser(): boolean {
  const ua = navigator.userAgent || navigator.vendor
  // 카카오톡, 인스타그램, 페이스북, 라인, 네이버 등 인앱 브라우저 감지
  return /KAKAOTALK|Instagram|FBAN|FBAV|Line|NAVER/i.test(ua)
}

export function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signInWithGoogle } = useAuth()

  const isInApp = useMemo(() => isInAppBrowser(), [])
  const currentUrl = window.location.href

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      await signInWithGoogle()
    } catch (err: any) {
      setError(err.message || 'Google 로그인에 실패했습니다')
      setLoading(false)
    }
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl)
    alert('URL이 복사되었습니다. 브라우저에서 붙여넣기 하세요.')
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>밴드 연습실 예약</h1>
          <p>예약을 관리하려면 로그인하세요</p>
        </div>

        {isInApp && (
          <div className="inapp-warning">
            <p><strong>인앱 브라우저에서는 Google 로그인이 제한됩니다.</strong></p>
            <p>Safari 또는 Chrome에서 열어주세요.</p>
            <button onClick={handleCopyUrl} className="copy-url-button">
              URL 복사하기
            </button>
          </div>
        )}

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <button
          className="google-login-button"
          onClick={handleGoogleLogin}
          disabled={loading || isInApp}
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading ? '로그인 중...' : 'Google로 계속하기'}
        </button>

        <div className="login-footer">
          <p>로그인하면 서비스 이용약관에 동의하게 됩니다</p>
        </div>
      </div>
    </div>
  )
}
