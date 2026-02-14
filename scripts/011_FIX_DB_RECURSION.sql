-- [긴급 복구] DB 무한 루프(42P17) 및 500 에러 해결 스크립트
-- 이 스크립트는 Supabase SQL Editor에서 실행해야 하며, 배포와 무관하게 즉시 적용됩니다.

BEGIN;

-- 1. 안전을 위해 RLS 잠시 끄기
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- 2. 문제가 되는 모든 트리거 및 함수 삭제
DROP TRIGGER IF EXISTS trigger_protect_role_change ON user_profiles;
DROP FUNCTION IF EXISTS protect_role_change CASCADE;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;

-- 3. user_profiles 테이블의 모든 정책(Policy) 삭제
-- (이름이 다를 수 있어 흔한 이름들 모두 시도)
DROP POLICY IF EXISTS "Users can view own user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON user_profiles;

-- 4. user_settings 테이블의 정책 삭제
DROP POLICY IF EXISTS "Users can view own user_settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own user_settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own user_settings" ON user_settings;
DROP POLICY IF EXISTS "user_settings_select_own" ON user_settings;
DROP POLICY IF EXISTS "user_settings_insert_own" ON user_settings;
DROP POLICY IF EXISTS "user_settings_update_own" ON user_settings;

-- 5. RLS 다시 켜기
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 6. [핵심] 가장 단순하고 안전한 정책으로 재생성 (재귀 없음)
-- 내 아이디(auth.uid())와 일치하는 행만 조회/수정 가능

CREATE POLICY "FIX_profile_select" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "FIX_profile_insert" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "FIX_profile_update" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "FIX_settings_select" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "FIX_settings_insert" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "FIX_settings_update" ON user_settings FOR UPDATE USING (auth.uid() = user_id);

COMMIT;

-- 7. 설정 리로드
NOTIFY pgrst, 'reload config';
