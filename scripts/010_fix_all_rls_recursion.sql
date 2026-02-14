-- Code 42P17: infinite recursion detected in policy for relation "user_profiles"
-- EMERGENCY FIX: Remove recursive policies (role checks referencing same table) & problematic triggers.
-- This script MUST be run to fix the '500' and '406' errors on user_profiles/user_settings.

-- 1. Disable RLS temporarily so we can drop cleanly
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- 2. Drop the recursive triggers (these select from user_profiles to check for admin)
DROP TRIGGER IF EXISTS trigger_protect_role_change ON user_profiles;
DROP FUNCTION IF EXISTS protect_role_change;

-- 3. Drop existing policies (all of them to be safe)
DROP POLICY IF EXISTS "Users can view own user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage user_profiles" ON user_profiles;

-- 4. Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 5. Create Simple, Non-Recursive Policies (User can only read/write their own row)
CREATE POLICY "user_profiles_select_own" ON user_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_profiles_insert_own" ON user_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update_own" ON user_profiles
FOR UPDATE USING (auth.uid() = user_id);

-- User Settings (Just in case)
DROP POLICY IF EXISTS "Users can view own user_settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own user_settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own user_settings" ON user_settings;

CREATE POLICY "user_settings_select_own" ON user_settings
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_settings_insert_own" ON user_settings
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_settings_update_own" ON user_settings
FOR UPDATE USING (auth.uid() = user_id);

-- 6. Reload config
NOTIFY pgrst, 'reload config';
