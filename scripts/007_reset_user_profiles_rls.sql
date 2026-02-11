-- 1. Drop the problematic triggers/functions
DROP TRIGGER IF EXISTS trigger_protect_role_change ON user_profiles;
DROP FUNCTION IF EXISTS protect_role_change;

-- 2. Drop all conflicting policies on user_profiles
DROP POLICY IF EXISTS "Users can view own user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all user_profiles" ON user_profiles; -- If it exists (even if not listed before)

-- 3. Re-create simple, non-recursive policies for user_profiles
-- This ensures no recursion happens (no queries inside policy)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own user_profiles" ON user_profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own user_profiles" ON user_profiles
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own user_profiles" ON user_profiles
FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 4. Re-setup admin_action_logs (Safe version)
-- Ensure admin_action_logs policies don't accidentally recurse back to user_profiles if avoidable
-- For now, allow inserts by authenticated users to unblock logging
DROP POLICY IF EXISTS "Admins can insert logs" ON admin_action_logs;
DROP POLICY IF EXISTS "Everyone can insert logs" ON admin_action_logs;

CREATE POLICY "Everyone can insert logs" ON admin_action_logs
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. Force schema cache reload
NOTIFY pgrst, 'reload config';
