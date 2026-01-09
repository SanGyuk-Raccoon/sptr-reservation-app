import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import './LoginPage.css'

// 인앱 브라우저 타입 감지
function getInAppBrowserType(): string | null {
  const ua = navigator.userAgent || navigator.vendor
  if (/KAKAOTALK/i.test(ua)) return 'kakaotalk'
  if (/Instagram/i.test(ua)) return 'instagram'
  if (/FBAN|FBAV/i.test(ua)) return 'facebook'
  if (/Line\//i.test(ua)) return 'line'
  if (/NAVER/i.test(ua)) return 'naver'
  return null
}

// 외부 브라우저로 열기
function openInExternalBrowser(url: string, browserType: string | null): boolean {
  try {
    if (browserType === 'kakaotalk') {
      window.location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(url)
      return true
    }
    if (browserType === 'line') {
      window.location.href = url + '?openExternalBrowser=1'
      return true
    }
    if (browserType === 'facebook' || browserType === 'instagram') {
      // FB/IG는 직접 열기가 제한적이므로 false 반환
      return false
    }
    if (browserType === 'naver') {
      // 네이버 앱은 naversearchapp 스킴 사용
      window.location.href = 'naversearchapp://openExternal?url=' + encodeURIComponent(url)
      return true
    }
  } catch {
    return false
  }
  return false
}

export function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showManualGuide, setShowManualGuide] = useState(false)
  const { signInWithGoogle } = useAuth()

  const inAppType = useMemo(() => getInAppBrowserType(), [])
  const isInApp = inAppType !== null
  const currentUrl = window.location.href

  // 인앱 브라우저면 자동으로 외부 브라우저 열기 시도
  useEffect(() => {
    if (isInApp) {
      const opened = openInExternalBrowser(currentUrl, inAppType)
      if (!opened) {
        setShowManualGuide(true)
      }
    }
  }, [isInApp, inAppType, currentUrl])

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

  const handleOpenExternal = () => {
    const opened = openInExternalBrowser(currentUrl, inAppType)
    if (!opened) {
      navigator.clipboard.writeText(currentUrl)
      alert('URL이 복사되었습니다.\n브라우저 앱에서 주소창에 붙여넣기 해주세요.')
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>밴드 연습실 예약</h1>
          <p>예약을 관리하려면 로그인하세요</p>
        </div>

        {isInApp && showManualGuide && (
          <div className="inapp-warning">
            <p><strong>인앱 브라우저에서는 Google 로그인이 제한됩니다.</strong></p>
            <p>아래 버튼을 눌러 브라우저에서 열어주세요.</p>
            <button onClick={handleOpenExternal} className="open-browser-button">
              브라우저에서 열기
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
