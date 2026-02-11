-- ==========================================================
-- 004_FIX_RLS_ERROR.sql
-- ROBUST RLS RESET SCRIPT (FIXED)
-- Drops ALL existing policies dynamically to avoid "policy already exists" errors.
-- Excludes admin_action_logs from standard loop to avoid "user_id" error.
-- ==========================================================

DO $$
DECLARE
    r RECORD;
    tbl TEXT;
    -- Standard tables with 'user_id' column
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
        -- 'admin_action_logs' REMOVED from here (handled separately)
    ];
BEGIN
    -- 1. DROP ALL EXISTING POLICIES FOR *ALL* TARGET TABLES (Including Admin Logs)
    FOR r IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = ANY(tables || ARRAY['admin_action_logs'])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;

    -- 2. RE-ENABLE RLS AND CREATE NEW POLICIES FOR STANDARD TABLES
    FOREACH tbl IN ARRAY tables
    LOOP
        -- Enable RLS
        EXECUTE format('ALTER TABLE IF EXISTS %I ENABLE ROW LEVEL SECURITY', tbl);
        
        -- SELECT: users can only read their own data
        EXECUTE format(
            'CREATE POLICY "Users can view own %1$s" ON %1$I FOR SELECT USING (auth.uid() = user_id)',
            tbl
        );
        
        -- INSERT: users can only insert their own data
        EXECUTE format(
            'CREATE POLICY "Users can insert own %1$s" ON %1$I FOR INSERT WITH CHECK (auth.uid() = user_id)',
            tbl
        );
        
        -- UPDATE: users can only update their own data
        EXECUTE format(
            'CREATE POLICY "Users can update own %1$s" ON %1$I FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)',
            tbl
        );
        
        -- DELETE: users can only delete their own data
        EXECUTE format(
            'CREATE POLICY "Users can delete own %1$s" ON %1$I FOR DELETE USING (auth.uid() = user_id)',
            tbl
        );
    END LOOP;

    -- 3. APPLY SPECIAL ADMIN POLICIES 
    
    -- A) User Profiles (Add Admin Access)
    CREATE POLICY "Admins can view all profiles" ON user_profiles FOR SELECT 
    USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'));

    -- B) Admin Action Logs (Special Table without user_id)
    ALTER TABLE IF EXISTS admin_action_logs ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Admins can view all logs" ON admin_action_logs FOR SELECT 
    USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'));

    CREATE POLICY "Admins can insert logs" ON admin_action_logs FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'));

END
$$;
