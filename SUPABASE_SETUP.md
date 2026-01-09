# Supabase 설정 가이드

이 프로젝트는 Supabase를 백엔드로 사용하여 데이터를 저장합니다.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 계정 생성
2. "New Project" 클릭
3. 프로젝트 이름, 데이터베이스 비밀번호, 리전 선택
4. 프로젝트 생성 완료 대기 (약 2분)

## 2. 데이터베이스 스키마 설정

1. Supabase 대시보드에서 "SQL Editor" 메뉴 선택
2. `supabase-schema.sql` 파일의 내용을 복사하여 실행
3. 또는 아래 SQL을 직접 실행:

```sql
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  time TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(date, time);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON appointments FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete access" ON appointments FOR DELETE USING (true);
CREATE POLICY "Allow public update access" ON appointments FOR UPDATE USING (true);
```

## 3. 환경 변수 설정

1. 프로젝트 루트에 `.env` 파일 생성
2. Supabase 대시보드에서 "Settings" > "API" 메뉴로 이동
3. 다음 정보를 복사:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

4. `.env` 파일에 입력:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. 보안 설정 (선택사항)

현재 설정은 모든 사용자가 모든 데이터에 접근할 수 있습니다. 
실제 운영 환경에서는 인증을 추가하는 것을 권장합니다:

1. Supabase Authentication 활성화
2. Row Level Security (RLS) 정책 수정
3. 사용자별 데이터 분리

## 5. 개발 서버 실행

```bash
npm run dev
```

## 6. 배포

### Vercel 배포 (추천)

1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com)에 접속
3. 프로젝트 Import
4. Environment Variables에 Supabase 환경 변수 추가:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy

### Netlify 배포

1. GitHub에 코드 푸시
2. [Netlify](https://netlify.com)에 접속
3. "Add new site" > "Import an existing project"
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Environment Variables에 Supabase 환경 변수 추가
6. Deploy

## 문제 해결

### 환경 변수가 인식되지 않는 경우
- `.env` 파일이 프로젝트 루트에 있는지 확인
- Vite는 `VITE_` 접두사가 필요합니다
- 개발 서버를 재시작하세요

### 데이터베이스 연결 오류
- Supabase 프로젝트가 활성화되어 있는지 확인
- URL과 키가 올바른지 확인
- RLS 정책이 올바르게 설정되었는지 확인

## Supabase 무료 플랜 제한

- **데이터베이스 크기**: 500MB
- **대역폭**: 5GB/월
- **API 요청**: 50,000/월
- **실시간 연결**: 200 동시 연결

대부분의 소규모 프로젝트에는 충분합니다.
