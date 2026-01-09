# Supabase 데이터 변경 가이드

Supabase에서 데이터를 변경하는 방법을 설명합니다. 스키마 변경과 데이터 변경으로 나눠 설명합니다.

## 📊 데이터 변경 방법

### 방법 1: Supabase 대시보드 (가장 간단)

#### 테이블 데이터 직접 수정

1. **Supabase 대시보드 접속**
   - [supabase.com](https://supabase.com) 로그인
   - 프로젝트 선택

2. **Table Editor 사용**
   - 좌측 메뉴에서 "Table Editor" 클릭
   - `appointments` 테이블 선택
   - 데이터 직접 수정/삭제 가능
   - "Save" 버튼으로 저장

#### 장점
- ✅ GUI로 쉽게 수정
- ✅ 즉시 반영
- ✅ 실수 방지 (유효성 검사)

#### 단점
- ❌ 대량 데이터 수정 시 비효율적
- ❌ 복잡한 조건 수정 어려움

---

### 방법 2: SQL Editor 사용 (권장)

#### 단일 데이터 수정

```sql
-- 특정 예약 수정
UPDATE appointments
SET 
  title = '수정된 제목',
  time = '15:30',
  description = '수정된 설명'
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
```

#### 여러 데이터 수정

```sql
-- 특정 날짜의 모든 예약 시간 수정
UPDATE appointments
SET time = '14:00'
WHERE date = '2024-02-15';
```

#### 조건부 수정

```sql
-- 제목에 '회의'가 포함된 예약의 설명 수정
UPDATE appointments
SET description = '자동 업데이트된 설명'
WHERE title LIKE '%회의%';
```

#### 데이터 삭제

```sql
-- 특정 예약 삭제
DELETE FROM appointments
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- 특정 날짜 이전의 모든 예약 삭제
DELETE FROM appointments
WHERE date < '2024-01-01';

-- 모든 데이터 삭제 (주의!)
DELETE FROM appointments;
```

#### 데이터 조회

```sql
-- 모든 예약 조회
SELECT * FROM appointments;

-- 특정 날짜의 예약 조회
SELECT * FROM appointments
WHERE date = '2024-02-15'
ORDER BY time;

-- 조건부 조회
SELECT * FROM appointments
WHERE title LIKE '%회의%'
AND date >= '2024-02-01';
```

---

## 🏗️ 스키마(테이블 구조) 변경

### 컬럼 추가

```sql
-- 새 컬럼 추가 예시: user_id 추가
ALTER TABLE appointments
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 새 컬럼 추가 예시: status 추가
ALTER TABLE appointments
ADD COLUMN status TEXT DEFAULT 'active';
```

### 컬럼 수정

```sql
-- 컬럼 타입 변경
ALTER TABLE appointments
ALTER COLUMN description TYPE VARCHAR(500);

-- 컬럼에 NOT NULL 제약 추가
ALTER TABLE appointments
ALTER COLUMN title SET NOT NULL;

-- 컬럼 기본값 변경
ALTER TABLE appointments
ALTER COLUMN status SET DEFAULT 'pending';
```

### 컬럼 삭제

```sql
-- 컬럼 삭제 (주의: 데이터 손실)
ALTER TABLE appointments
DROP COLUMN status;
```

### 인덱스 추가/삭제

```sql
-- 인덱스 추가
CREATE INDEX idx_appointments_title ON appointments(title);

-- 인덱스 삭제
DROP INDEX IF EXISTS idx_appointments_title;
```

---

## 🔄 마이그레이션 파일 관리

### 마이그레이션 파일 생성

변경사항을 추적하기 위해 마이그레이션 파일을 만드는 것을 권장합니다:

```sql
-- migrations/001_add_user_id.sql
-- 날짜: 2024-02-15
-- 설명: user_id 컬럼 추가

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_appointments_user_id 
ON appointments(user_id);
```

### 마이그레이션 실행 순서

1. 로컬에서 SQL 파일 작성
2. Supabase SQL Editor에서 실행
3. 결과 확인
4. Git에 커밋 (변경사항 추적)

---

## ⚠️ 주의사항

### 1. 백업

중요한 데이터 변경 전에는 반드시 백업:

```sql
-- 백업 테이블 생성
CREATE TABLE appointments_backup AS 
SELECT * FROM appointments;
```

### 2. 트랜잭션 사용

여러 작업을 한 번에 실행할 때:

```sql
BEGIN;

UPDATE appointments SET title = '제목1' WHERE id = 'id1';
UPDATE appointments SET title = '제목2' WHERE id = 'id2';

-- 문제 없으면
COMMIT;

-- 문제 있으면
ROLLBACK;
```

### 3. RLS 정책 확인

스키마 변경 후 RLS 정책도 업데이트 필요할 수 있음:

```sql
-- 새 컬럼에 대한 정책 추가
CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 📝 실제 사용 예시

### 예시 1: 모든 예약에 상태 추가

```sql
-- 1. status 컬럼 추가
ALTER TABLE appointments
ADD COLUMN status TEXT DEFAULT 'confirmed';

-- 2. 기존 데이터 업데이트
UPDATE appointments
SET status = 'confirmed'
WHERE status IS NULL;

-- 3. 인덱스 추가 (성능 향상)
CREATE INDEX idx_appointments_status ON appointments(status);
```

### 예시 2: 사용자별 데이터 분리

```sql
-- 1. user_id 컬럼 추가
ALTER TABLE appointments
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 2. 기존 데이터에 기본 사용자 할당 (필요시)
-- UPDATE appointments SET user_id = 'default-user-id';

-- 3. RLS 정책 수정
DROP POLICY IF EXISTS "Allow public read access" ON appointments;

CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT
  USING (auth.uid() = user_id);
```

### 예시 3: 데이터 정리

```sql
-- 1. 오래된 데이터 삭제 (1년 이상)
DELETE FROM appointments
WHERE date < CURRENT_DATE - INTERVAL '1 year';

-- 2. 중복 데이터 확인
SELECT date, time, title, COUNT(*)
FROM appointments
GROUP BY date, time, title
HAVING COUNT(*) > 1;

-- 3. 중복 데이터 삭제 (가장 오래된 것만 남기기)
DELETE FROM appointments a
USING appointments b
WHERE a.id > b.id
AND a.date = b.date
AND a.time = b.time
AND a.title = b.title;
```

---

## 🛠️ Supabase 대시보드에서 실행 방법

### SQL Editor 사용

1. **Supabase 대시보드 접속**
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 좌측 메뉴에서 "SQL Editor" 클릭
   - "New query" 클릭

3. **SQL 작성 및 실행**
   - SQL 쿼리 작성
   - "Run" 버튼 클릭 (또는 Ctrl+Enter)
   - 결과 확인

4. **저장 (선택사항)**
   - "Save" 버튼으로 쿼리 저장
   - 나중에 재사용 가능

---

## 🔍 데이터 확인

### 변경사항 확인

```sql
-- 최근 수정된 예약 확인
SELECT * FROM appointments
ORDER BY updated_at DESC
LIMIT 10;

-- 특정 기간의 예약 확인
SELECT * FROM appointments
WHERE date BETWEEN '2024-02-01' AND '2024-02-28'
ORDER BY date, time;
```

### 통계 확인

```sql
-- 날짜별 예약 수
SELECT date, COUNT(*) as count
FROM appointments
GROUP BY date
ORDER BY date;

-- 시간대별 예약 수
SELECT 
  EXTRACT(HOUR FROM time::TIME) as hour,
  COUNT(*) as count
FROM appointments
GROUP BY hour
ORDER BY hour;
```

---

## 📚 참고 자료

- [Supabase SQL 문서](https://supabase.com/docs/guides/database)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [프로젝트 스키마 파일](./supabase-schema.sql)

---

## 💡 팁

1. **작은 변경부터**: 큰 변경 전에 테스트 환경에서 먼저 시도
2. **변경사항 기록**: 모든 스키마 변경을 문서화
3. **정기 백업**: 중요한 데이터는 정기적으로 백업
4. **RLS 정책 확인**: 스키마 변경 후 보안 정책도 함께 확인
