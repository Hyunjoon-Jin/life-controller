-- FINAL RLS FIX: USER PROFILES & SETTINGS
-- This script disables triggers and cleans up policies to resolve infinite recursion.

-- 1. Disable RLS to allow dropping without recursive checks
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- 2. Drop Triggers (Prevent unwanted side-effects)
DROP TRIGGER IF EXISTS trigger_protect_role_change ON user_profiles;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;

DROP FUNCTION IF EXISTS protect_role_change;

-- 3. Drop Policies on user_profiles
DROP POLICY IF EXISTS "Users can view own user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON user_profiles;

-- 4. Drop Policies on user_settings
DROP POLICY IF EXISTS "Users can view own user_settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own user_settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own user_settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete own user_settings" ON user_settings;

-- 5. Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 6. Create Simple Policies (Own User Only)
-- These policies rely ONLY on auth.uid() and do NOT check other tables or columns that trigger recursion.

CREATE POLICY "Simple select own profile" ON user_profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Simple insert own profile" ON user_profiles
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Simple update own profile" ON user_profiles
FOR UPDATE USING (user_id = auth.uid()); -- Removed explicit WITH CHECK regarding user_id as it's implied by USING for existing rows, simplifying logic

-- User Settings
CREATE POLICY "Simple select own settings" ON user_settings
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Simple insert own settings" ON user_settings
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Simple update own settings" ON user_settings
FOR UPDATE USING (user_id = auth.uid());

-- 7. Force config reload
NOTIFY pgrst, 'reload config';
