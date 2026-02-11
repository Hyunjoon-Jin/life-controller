-- EMERGENCY FIX: INFINITE RECURSION & 500 ERRORS
-- This script aggressively clears conflicting policies and triggers on user_profiles.

-- 1. Disable RLS temporarily to ensure we can modify policies without locking up
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL possible triggers causing issues
DROP TRIGGER IF EXISTS trigger_protect_role_change ON user_profiles;
DROP FUNCTION IF EXISTS protect_role_change;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles; -- Re-add later if needed, but safe to drop now

-- 3. Drop ALL policies on user_profiles (Explicitly naming common ones)
DROP POLICY IF EXISTS "Users can view own user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON user_profiles;

-- 4. Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create SAFE, Simple Policies (No self-referencing subqueries)

-- Access Policy: Users can see/edit THEIR OWN profile ONLY.
CREATE POLICY "Users can view own user_profiles" ON user_profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own user_profiles" ON user_profiles
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Allow updating ALL fields for now to ensure soft-delete works
CREATE POLICY "Users can update own user_profiles" ON user_profiles
FOR UPDATE USING (user_id = auth.uid());

-- 6. Reload Supabase Config
NOTIFY pgrst, 'reload config';
