# 📅 일정 예약 시스템

매주 월요일에 4주 뒤 일주일치 예약이 오픈되는 일정 예약 웹 애플리케이션입니다.

## ✨ 주요 기능

- 📆 캘린더 기반 일정 예약
- 🔄 매주 월요일마다 4주 뒤 일주일치 예약 오픈 (누적 방식)
- 📱 반응형 디자인
- 💾 Supabase를 통한 영구 데이터 저장
- 🔍 과거 날짜 예약 현황 조회
- ⚡ 실시간 데이터 동기화

## 🛠️ 기술 스택

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL)
- **UI**: React Calendar
- **스타일링**: CSS3

## 🚀 시작하기

### 1. 프로젝트 클론 및 의존성 설치

```bash
npm install
```

### 2. Supabase 설정

자세한 설정 방법은 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)를 참고하세요.

**간단 요약:**
1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. `supabase-schema.sql` 파일의 SQL을 실행
3. `.env` 파일 생성 및 환경 변수 설정:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:5173](http://localhost:5173) 접속

## 📦 빌드

```bash
npm run build
```

빌드 결과물은 `dist` 폴더에 생성됩니다.

## 🚢 배포

### Vercel (추천)

1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 Import
3. Environment Variables에 Supabase 환경 변수 추가
4. Deploy

### Netlify

1. GitHub에 코드 푸시
2. [Netlify](https://netlify.com)에서 프로젝트 Import
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Environment Variables 추가
5. Deploy

자세한 배포 방법은 [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)를 참고하세요.

## 📁 프로젝트 구조

```
├── src/
│   ├── lib/
│   │   ├── supabase.ts          # Supabase 클라이언트 설정
│   │   └── appointments.ts       # 예약 데이터 API 함수
│   ├── App.tsx                   # 메인 컴포넌트
│   ├── App.css                   # 스타일
│   └── main.tsx                  # 진입점
├── supabase-schema.sql           # 데이터베이스 스키마
├── SUPABASE_SETUP.md             # Supabase 설정 가이드
└── package.json
```

## 🔐 보안

현재 설정은 모든 사용자가 모든 데이터에 접근할 수 있습니다.
실제 운영 환경에서는 다음을 권장합니다:

- Supabase Authentication 활성화
- Row Level Security (RLS) 정책 수정
- 사용자별 데이터 분리

## 📝 라이선스

MIT
