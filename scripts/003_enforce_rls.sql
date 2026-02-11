-- ==========================================================
-- 003_ENFORCE_RLS.sql
-- FORCEFULLY ENABLE RLS AND RECREATE POLICIES
-- Run this script to fix "Data Leakage" between users.
-- ==========================================================

DO $$
DECLARE
    tbl TEXT;
    -- check if we missed any table
    tables TEXT[] := ARRAY[
        'tasks', 'projects', 'goals', 'habits', 'calendar_events',
        'journals', 'memos', 'scraps',
        'people',
        'language_entries', 'language_resources', 'books', 'certificates',
        'exercise_sessions', 'exercise_routines', 'custom_exercises',
        'diet_entries', 'custom_foods', 'inbody_entries',
        'hobbies', 'hobby_posts', 'hobby_entries',
        'transactions', 'assets', 'real_estate_scraps', 'stock_analyses',
        'finance_goals', 'monthly_budgets',
        'work_logs', 'archive_documents',
        'user_profiles', 'educations', 'careers', 'activities', 'portfolios',
        'user_settings'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        -- 1. Enable RLS (Idempotent)
        EXECUTE format('ALTER TABLE IF EXISTS %I ENABLE ROW LEVEL SECURITY', tbl);
        
        -- 2. Drop existing policies to ensure clean state
        EXECUTE format('DROP POLICY IF EXISTS "Users can view own %1$s" ON %1$I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Users can insert own %1$s" ON %1$I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Users can update own %1$s" ON %1$I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Users can delete own %1$s" ON %1$I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Admins can view all profiles" ON %1$I', tbl); -- Cleanup old admin policies if any

        -- 3. Re-create Standard User Policies
        
        -- SELECT: users can only read their own data
        EXECUTE format(
            'CREATE POLICY "Users can view own %1$s" ON %1$I FOR SELECT USING (user_id = auth.uid())',
            tbl
        );
        
        -- INSERT: users can only insert their own data
        EXECUTE format(
            'CREATE POLICY "Users can insert own %1$s" ON %1$I FOR INSERT WITH CHECK (user_id = auth.uid())',
            tbl
        );
        
        -- UPDATE: users can only update their own data
        EXECUTE format(
            'CREATE POLICY "Users can update own %1$s" ON %1$I FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())',
            tbl
        );
        
        -- DELETE: users can only delete their own data
        EXECUTE format(
            'CREATE POLICY "Users can delete own %1$s" ON %1$I FOR DELETE USING (user_id = auth.uid())',
            tbl
        );

    END LOOP;
END
$$;

-- ==========================================================
-- SPECIAL POLICIES (Admin, etc.)
-- ==========================================================

-- 1. Allow Admin to VIEW ALL User Profiles
-- (We dropped above, so we re-create)
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles" ON user_profiles FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
);

-- 2. Admin Action Logs (Managed Separately in 002, but safely re-assert RLS here)
ALTER TABLE IF EXISTS admin_action_logs ENABLE ROW LEVEL SECURITY;
-- (Assuming 002 script was run for admin_action_logs policies)

