-- [핵심] user_profiles의 정책 이름을 몰라도 모두 강제로 삭제하는 강력한 스크립트
-- 이 코드는 정책 이름(Policy Name)을 몰라도, user_profiles에 붙은 모든 정책을 찾아서 지워버립니다.

BEGIN;

-- 1. user_profiles 테이블의 RLS 잠시 끄기
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- 2. 트리거 제거
DROP TRIGGER IF EXISTS trigger_protect_role_change ON user_profiles;
DROP FUNCTION IF EXISTS protect_role_change CASCADE;

-- 3. [Nuclear Option] 정책 이름을 조회해서 루프 돌며 모두 삭제
DO $$ 
DECLARE 
    r RECORD; 
BEGIN 
    -- user_profiles 테이블의 모든 정책 삭제
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles') 
    LOOP 
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON user_profiles'; 
    END LOOP;
    
    -- user_settings 테이블의 모든 정책 삭제
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_settings') 
    LOOP 
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON user_settings'; 
    END LOOP;
END $$;

-- 4. RLS 다시 켜기
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 5. 안전한 정책(내꺼만 보기) 단 하나만 생성
-- user_profiles
CREATE POLICY "safe_select_own" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "safe_insert_own" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "safe_update_own" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- user_settings
CREATE POLICY "safe_settings_select_own" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "safe_settings_insert_own" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "safe_settings_update_own" ON user_settings FOR UPDATE USING (auth.uid() = user_id);

COMMIT;

-- 6. 캐시 새로고침
NOTIFY pgrst, 'reload config';
