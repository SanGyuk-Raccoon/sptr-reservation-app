# Vercel 배포 가이드

이 문서는 일정 예약 시스템을 Vercel에 배포하는 방법을 설명합니다.

## 📋 사전 준비사항

### 1. GitHub 계정 및 저장소
- [ ] GitHub 계정 생성 (없는 경우)
- [ ] 프로젝트를 GitHub 저장소에 푸시

### 2. Supabase 설정 완료
- [ ] Supabase 프로젝트 생성 완료
- [ ] 데이터베이스 스키마 실행 완료
- [ ] Supabase URL과 Anon Key 확인

## 🚀 배포 단계

### Step 1: GitHub에 코드 푸시

```bash
# Git 초기화 (아직 안 했다면)
git init

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit: 일정 예약 시스템"

# GitHub 저장소 생성 후 원격 저장소 추가
git remote add origin https://github.com/your-username/your-repo-name.git

# 푸시
git push -u origin main
```

**주의사항:**
- `.env` 파일은 `.gitignore`에 포함되어 있어 자동으로 제외됩니다
- 환경 변수는 Vercel에서 별도로 설정해야 합니다

### Step 2: Vercel 프로젝트 생성

1. [Vercel](https://vercel.com) 접속
2. GitHub 계정으로 로그인
3. "Add New..." → "Project" 클릭
4. GitHub 저장소 선택
5. 프로젝트 설정:
   - **Framework Preset**: Vite (자동 감지됨)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (자동 감지됨)
   - **Output Directory**: `dist` (자동 감지됨)
   - **Install Command**: `npm install` (자동 감지됨)

### Step 3: 환경 변수 설정

Vercel 프로젝트 설정에서 "Environment Variables" 섹션으로 이동하여 다음 변수 추가:

#### 필수 환경 변수

| 변수 이름 | 값 | 설명 |
|----------|-----|------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` | Supabase Anon Key |

**설정 방법:**
1. Vercel 대시보드 → 프로젝트 선택
2. Settings → Environment Variables
3. 각 변수 추가:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: Supabase 대시보드에서 복사한 URL
   - **Environment**: Production, Preview, Development 모두 선택
4. `VITE_SUPABASE_ANON_KEY`도 동일하게 추가

**Supabase 값 확인 방법:**
1. Supabase 대시보드 접속
2. 프로젝트 선택
3. Settings → API
4. **Project URL** 복사 → `VITE_SUPABASE_URL`
5. **anon public** key 복사 → `VITE_SUPABASE_ANON_KEY`

### Step 4: 배포 실행

1. "Deploy" 버튼 클릭
2. 빌드 진행 상황 확인 (약 1-2분 소요)
3. 배포 완료 후 URL 확인

## ✅ 배포 후 확인사항

### 1. 사이트 접속 확인
- 배포된 URL로 접속
- 페이지가 정상적으로 로드되는지 확인

### 2. 기능 테스트
- [ ] 캘린더가 정상적으로 표시되는지
- [ ] 일정 추가가 작동하는지
- [ ] 일정 삭제가 작동하는지
- [ ] 데이터가 Supabase에 저장되는지

### 3. 콘솔 에러 확인
- 브라우저 개발자 도구(F12) → Console 탭
- 에러가 없는지 확인

## 🔧 문제 해결

### 빌드 실패 시

**문제: 환경 변수가 인식되지 않음**
```
Error: VITE_SUPABASE_URL is not defined
```

**해결:**
1. Vercel 대시보드에서 Environment Variables 확인
2. 변수 이름이 정확한지 확인 (`VITE_` 접두사 필수)
3. 모든 환경(Production, Preview, Development)에 설정되어 있는지 확인
4. 재배포 실행

**문제: TypeScript 에러**
```
Type error: ...
```

**해결:**
1. 로컬에서 `npm run build` 실행하여 에러 확인
2. 에러 수정 후 다시 푸시
3. Vercel이 자동으로 재배포

### 런타임 에러 시

**문제: Supabase 연결 실패**
```
Failed to fetch
```

**해결:**
1. 환경 변수가 올바르게 설정되었는지 확인
2. Supabase 프로젝트가 활성화되어 있는지 확인
3. RLS 정책이 올바르게 설정되었는지 확인

## 📝 Vercel 설정 파일 (선택사항)

프로젝트 루트에 `vercel.json` 파일을 생성하여 추가 설정 가능:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**참고:** Vite 프로젝트는 Vercel이 자동으로 감지하므로 `vercel.json`은 선택사항입니다.

## 🔄 자동 배포 설정

Vercel은 기본적으로 다음 경우에 자동 배포됩니다:

- **Production**: `main` 또는 `master` 브랜치에 푸시 시
- **Preview**: 다른 브랜치에 푸시 시 (PR 생성 시)

### 자동 배포 비활성화 (필요시)

1. Vercel 대시보드 → 프로젝트 선택
2. Settings → Git
3. "Auto-deploy" 옵션 조정

## 🌐 커스텀 도메인 설정 (선택사항)

1. Vercel 대시보드 → 프로젝트 선택
2. Settings → Domains
3. 도메인 추가
4. DNS 설정 안내에 따라 도메인 연결

## 📊 배포 상태 확인

- **Vercel 대시보드**: 배포 히스토리, 로그 확인
- **배포 URL**: `https://your-project.vercel.app`
- **GitHub Actions**: Vercel과 연동되어 자동 배포

## 💡 팁

1. **환경 변수 관리**
   - Production과 Preview 환경을 분리하여 관리 가능
   - 민감한 정보는 Environment Variables에만 저장

2. **빌드 최적화**
   - Vite는 이미 최적화되어 있음
   - 필요시 `vite.config.ts`에서 추가 설정 가능

3. **에러 모니터링**
   - Vercel 대시보드의 Functions 탭에서 에러 로그 확인
   - Sentry 등 에러 모니터링 도구 연동 가능

## 📚 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Vite 배포 가이드](https://vite.dev/guide/static-deploy.html)
- [Supabase 설정 가이드](./SUPABASE_SETUP.md)
