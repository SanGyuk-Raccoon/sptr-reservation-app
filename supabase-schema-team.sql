-- ============================================
-- 팀 기능 스키마 (밴드 예약 시스템)
-- ============================================

-- 1. teams 테이블 생성
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  leader_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. team_members 테이블 생성
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- 3. appointments 테이블에 team_id 컬럼 추가
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- 4. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_teams_leader_id ON teams(leader_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_team_id ON appointments(team_id);

-- ============================================
-- RLS 정책
-- ============================================

-- teams 테이블 RLS 활성화
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- teams: 인증된 사용자는 모든 팀 조회 가능
CREATE POLICY "Authenticated users can read teams" ON teams
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- teams: 관리자만 팀 생성 가능
CREATE POLICY "Admins can create teams" ON teams
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- teams: 관리자만 팀 수정 가능
CREATE POLICY "Admins can update teams" ON teams
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- teams: 관리자만 팀 삭제 가능
CREATE POLICY "Admins can delete teams" ON teams
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- team_members 테이블 RLS 활성화
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- team_members: 인증된 사용자는 모든 팀 멤버 조회 가능
CREATE POLICY "Authenticated users can read team members" ON team_members
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- team_members: 관리자만 팀 멤버 추가 가능
CREATE POLICY "Admins can add team members" ON team_members
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- team_members: 관리자만 팀 멤버 삭제 가능
CREATE POLICY "Admins can remove team members" ON team_members
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
