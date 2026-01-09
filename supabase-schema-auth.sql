-- =============================================
-- Supabase 인증 + 권한 관리 스키마
-- Supabase 대시보드의 SQL Editor에서 실행하세요
-- =============================================

-- =============================================
-- 1. profiles 테이블 생성 (사용자 프로필 + 역할)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- profiles 정책: 본인 프로필 읽기
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- profiles 정책: 관리자는 모든 프로필 읽기
CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- profiles 정책: 본인 프로필 수정
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =============================================
-- 2. 회원가입 시 자동으로 profiles 생성하는 트리거
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    'user'  -- 기본 역할은 user
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기존 트리거가 있으면 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 트리거 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- 3. appointments 테이블 수정 (user_id, user_name 추가)
-- =============================================
-- 기존 테이블에 컬럼 추가 (이미 있으면 무시됨)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE appointments ADD COLUMN user_id UUID REFERENCES auth.users ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'user_name'
  ) THEN
    ALTER TABLE appointments ADD COLUMN user_name TEXT;
  END IF;
END $$;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);

-- =============================================
-- 4. 기존 RLS 정책 삭제 후 새로 생성
-- =============================================
DROP POLICY IF EXISTS "Allow public read access" ON appointments;
DROP POLICY IF EXISTS "Allow public insert access" ON appointments;
DROP POLICY IF EXISTS "Allow public delete access" ON appointments;
DROP POLICY IF EXISTS "Allow public update access" ON appointments;
DROP POLICY IF EXISTS "Admins can read all appointments" ON appointments;
DROP POLICY IF EXISTS "Users can read own appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can create appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can delete any appointment" ON appointments;
DROP POLICY IF EXISTS "Users can delete own appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can update any appointment" ON appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;

-- 관리자: 모든 예약 조회
CREATE POLICY "Admins can read all appointments" ON appointments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 사용자: 본인 예약만 조회
CREATE POLICY "Users can read own appointments" ON appointments
  FOR SELECT USING (user_id = auth.uid());

-- 인증된 사용자: 예약 생성
CREATE POLICY "Authenticated users can create appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 관리자: 모든 예약 삭제
CREATE POLICY "Admins can delete any appointment" ON appointments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 사용자: 본인 예약만 삭제
CREATE POLICY "Users can delete own appointments" ON appointments
  FOR DELETE USING (user_id = auth.uid());

-- 관리자: 모든 예약 수정
CREATE POLICY "Admins can update any appointment" ON appointments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 사용자: 본인 예약만 수정
CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE USING (user_id = auth.uid());

-- =============================================
-- 5. profiles 테이블 updated_at 자동 업데이트 트리거
-- =============================================
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- =============================================
-- 6. 첫 번째 관리자 생성 (회원가입 후 실행)
-- =============================================
-- 특정 이메일을 관리자로 설정하려면 아래 쿼리 실행:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@gmail.com';

-- =============================================
-- 완료!
-- =============================================
-- 이제 Supabase Authentication에서 Google Provider를 활성화하세요:
-- 1. Supabase Dashboard > Authentication > Providers
-- 2. Google 클릭 > Enable 토글
-- 3. Google Cloud Console에서 OAuth 2.0 클라이언트 생성
-- 4. Client ID와 Client Secret 입력
-- 5. Authorized redirect URI 설정:
--    https://[your-project-ref].supabase.co/auth/v1/callback
