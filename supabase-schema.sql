-- Supabase 데이터베이스 스키마
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- appointments 테이블 생성
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  time TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(date, time);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
CREATE TRIGGER update_appointments_updated_at 
  BEFORE UPDATE ON appointments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) 설정
-- 모든 사용자가 읽기/쓰기 가능하도록 설정 (필요에 따라 수정)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Allow public read access" ON appointments
  FOR SELECT
  USING (true);

-- 모든 사용자가 삽입 가능
CREATE POLICY "Allow public insert access" ON appointments
  FOR INSERT
  WITH CHECK (true);

-- 모든 사용자가 삭제 가능
CREATE POLICY "Allow public delete access" ON appointments
  FOR DELETE
  USING (true);

-- 모든 사용자가 업데이트 가능
CREATE POLICY "Allow public update access" ON appointments
  FOR UPDATE
  USING (true);
