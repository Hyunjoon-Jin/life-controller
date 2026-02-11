-- ============================================
-- Life Controller: Supabase Migration Script
-- Creates all tables + RLS policies
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- CORE: Tasks, Projects, Goals, Habits, Events
-- ============================================

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    due_date TIMESTAMPTZ,
    project_id TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    sub_tasks JSONB DEFAULT '[]',
    type TEXT,
    remarks TEXT,
    deadline TIMESTAMPTZ,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    dependencies TEXT[] DEFAULT '{}',
    progress INTEGER DEFAULT 0,
    connected_goal_id TEXT,
    source TEXT CHECK (source IN ('timeline', 'daily')),
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    color TEXT DEFAULT '#10b981',
    status TEXT DEFAULT 'active' CHECK (status IN ('preparation', 'active', 'completed', 'hold')),
    manager TEXT,
    members TEXT[] DEFAULT '{}',
    budget JSONB,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    parent_id TEXT,
    description TEXT,
    progress INTEGER DEFAULT 0,
    my_role TEXT,
    okrs JSONB DEFAULT '[]',
    stakeholders JSONB DEFAULT '[]',
    resources JSONB DEFAULT '[]',
    automation_rules JSONB DEFAULT '[]',
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    plan_type TEXT CHECK (plan_type IN ('long-term', 'short-term', 'habit', 'project')),
    category TEXT CHECK (category IN ('financial', 'health', 'career', 'growth', 'language', 'hobby', 'other')),
    deadline TIMESTAMPTZ,
    memo TEXT,
    sub_goals JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    streak INTEGER DEFAULT 0,
    completed_dates TEXT[] DEFAULT '{}',
    time TEXT,
    end_time TEXT,
    days INTEGER[] DEFAULT '{}',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    skipped_dates TEXT[] DEFAULT '{}',
    type TEXT,
    priority TEXT,
    is_meeting BOOLEAN DEFAULT FALSE,
    is_appointment BOOLEAN DEFAULT FALSE,
    connected_project_id TEXT,
    connected_goal_id TEXT,
    prep_time INTEGER,
    travel_time INTEGER,
    color TEXT,
    description TEXT,
    target_count INTEGER DEFAULT 1,
    daily_progress JSONB DEFAULT '{}',
    is_tracked BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    description TEXT,
    color TEXT,
    type TEXT,
    priority TEXT,
    is_meeting BOOLEAN DEFAULT FALSE,
    is_appointment BOOLEAN DEFAULT FALSE,
    is_work_log BOOLEAN DEFAULT FALSE,
    work_details JSONB,
    connected_project_id TEXT,
    connected_goal_id TEXT,
    prep_time INTEGER,
    travel_time INTEGER,
    habit_id TEXT,
    is_habit_event BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- JOURNAL: Journals, Memos, Scraps
-- ============================================

CREATE TABLE IF NOT EXISTS journals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    content TEXT,
    mood TEXT,
    images TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT,
    color TEXT DEFAULT '#ffffff',
    tags TEXT[] DEFAULT '{}',
    attachments TEXT[] DEFAULT '{}',
    connected_project_id TEXT,
    connected_goal_id TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    width INTEGER,
    height INTEGER,
    x INTEGER,
    y INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scraps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    memo TEXT,
    image TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PEOPLE
-- ============================================

CREATE TABLE IF NOT EXISTS people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT CHECK (relationship IN ('family', 'friend', 'work', 'other')),
    contact TEXT,
    email TEXT,
    company TEXT,
    department TEXT,
    job_title TEXT,
    birthdate TIMESTAMPTZ,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    business_card_image TEXT,
    school TEXT,
    major TEXT,
    industry TEXT,
    "group" TEXT,
    is_me BOOLEAN DEFAULT FALSE,
    interactions JSONB DEFAULT '[]',
    role TEXT,
    phone TEXT,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- GROWTH: Language, Books, Certificates
-- ============================================

CREATE TABLE IF NOT EXISTS language_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    study_time INTEGER DEFAULT 0,
    vocabulary JSONB DEFAULT '[]',
    memo TEXT,
    test_name TEXT,
    score TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS language_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('video', 'article', 'lecture', 'book', 'other')),
    url TEXT,
    thumbnail TEXT,
    category TEXT,
    language TEXT,
    status TEXT DEFAULT 'tostudy' CHECK (status IN ('tostudy', 'studying', 'completed')),
    is_recommended BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    author TEXT,
    total_pages INTEGER DEFAULT 0,
    current_page INTEGER DEFAULT 0,
    status TEXT DEFAULT 'toread' CHECK (status IN ('toread', 'reading', 'completed')),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    cover_url TEXT,
    link TEXT,
    rating INTEGER,
    review TEXT,
    quotes JSONB DEFAULT '[]',
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    issuer TEXT,
    date TIMESTAMPTZ,
    expiry_date TIMESTAMPTZ,
    score TEXT,
    credential_id TEXT,
    file_url TEXT,
    status TEXT DEFAULT 'studying' CHECK (status IN ('studying', 'acquired', 'expired')),
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- HEALTH: Exercise, Diet, InBody
-- ============================================

CREATE TABLE IF NOT EXISTS exercise_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    type TEXT NOT NULL,
    category TEXT CHECK (category IN ('weight', 'cardio', 'sport', 'fitness')),
    duration INTEGER DEFAULT 0,
    distance REAL,
    pace TEXT,
    result TEXT,
    score INTEGER,
    count INTEGER,
    target_part TEXT,
    sets JSONB DEFAULT '[]',
    intensity TEXT CHECK (intensity IN ('low', 'medium', 'high')),
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exercise_routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT CHECK (category IN ('weight', 'cardio', 'sport', 'fitness')),
    items JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS custom_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT CHECK (category IN ('weight', 'cardio', 'sport', 'fitness')),
    is_custom BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS diet_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    items JSONB DEFAULT '[]',
    total_calories INTEGER DEFAULT 0,
    total_macros JSONB DEFAULT '{"carbs": 0, "protein": 0, "fat": 0}',
    image TEXT,
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS custom_foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    brand TEXT,
    calories INTEGER DEFAULT 0,
    macros JSONB DEFAULT '{"carbs": 0, "protein": 0, "fat": 0}',
    serving_size TEXT,
    is_custom BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inbody_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    height REAL,
    weight REAL NOT NULL,
    skeletal_muscle_mass REAL,
    body_fat_mass REAL,
    body_fat_percent REAL,
    bmi REAL,
    basal_metabolic_rate REAL,
    visceral_fat_level REAL,
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- HOBBY
-- ============================================

CREATE TABLE IF NOT EXISTS hobbies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    start_date TIMESTAMPTZ,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hobby_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hobby_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    date TIMESTAMPTZ,
    images TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hobby_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    activity TEXT,
    duration INTEGER,
    content TEXT,
    category TEXT,
    satisfaction INTEGER,
    link TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- FINANCE
-- ============================================

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense', 'transfer', 'investment', 'saving', 'repayment', 'card_bill')),
    category TEXT,
    amount REAL NOT NULL DEFAULT 0,
    description TEXT,
    asset_id TEXT,
    target_asset_id TEXT,
    card_id TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('bank', 'cash', 'stock', 'real_estate', 'crypto', 'loan', 'credit_card')),
    balance REAL DEFAULT 0,
    currency TEXT DEFAULT 'KRW',
    color TEXT,
    account_number TEXT,
    interest_rate REAL,
    memo TEXT,
    "limit" REAL,
    billing_date INTEGER,
    repayment_date TIMESTAMPTZ,
    linked_asset_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS real_estate_scraps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    location TEXT,
    price TEXT,
    url TEXT,
    scraped_at TIMESTAMPTZ DEFAULT now(),
    memo TEXT,
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    name TEXT NOT NULL,
    analysis_date TIMESTAMPTZ,
    rating TEXT CHECK (rating IN ('buy', 'hold', 'sell')),
    target_price REAL,
    content TEXT,
    url TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_amount REAL DEFAULT 0,
    current_amount REAL DEFAULT 0,
    description TEXT,
    target_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS monthly_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    amount REAL DEFAULT 0,
    goal TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, year, month)
);

-- ============================================
-- WORK
-- ============================================

CREATE TABLE IF NOT EXISTS work_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    break_time INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS archive_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('markdown', 'link', 'file')),
    content TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PROFILE
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    english_name TEXT,
    job_title TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    bio TEXT,
    photo TEXT,
    social_links JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS educations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    school TEXT NOT NULL,
    degree TEXT,
    major TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_current BOOLEAN DEFAULT FALSE,
    gpa TEXT,
    description TEXT,
    files JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS careers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    position TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    team TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    projects JSONB DEFAULT '[]',
    files JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('club', 'external', 'award', 'overseas', 'volunteering', 'other')),
    title TEXT NOT NULL,
    organization TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    description TEXT,
    role TEXT,
    files JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    period TEXT,
    role TEXT,
    description TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    links JSONB DEFAULT '[]',
    images TEXT[] DEFAULT '{}',
    thumbnail TEXT,
    files JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SETTINGS: User-specific settings
-- ============================================

CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    home_shortcuts TEXT[] DEFAULT ARRAY['calendar', 'tasks', 'goals', 'reading', 'language', 'people', 'diet', 'ideas', 'work', 'hobby'],
    body_composition_goal JSONB,
    global_memo TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RLS POLICIES (all tables follow same pattern)
-- ============================================

DO $$
DECLARE
    tbl TEXT;
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
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
        
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

-- ============================================
-- INDEXES for common queries
-- ============================================

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start ON calendar_events(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_journals_user_id ON journals(user_id);
CREATE INDEX IF NOT EXISTS idx_journals_date ON journals(user_id, date);
CREATE INDEX IF NOT EXISTS idx_memos_user_id ON memos(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sessions_user_id ON exercise_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sessions_date ON exercise_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_diet_entries_user_id ON diet_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_entries_date ON diet_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_work_logs_user_id ON work_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_work_logs_date ON work_logs(user_id, date);

-- ============================================
-- updated_at trigger function
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'tasks', 'projects', 'goals', 'habits', 'calendar_events',
        'journals', 'memos', 'people',
        'language_entries', 'language_resources', 'books', 'certificates',
        'exercise_sessions', 'exercise_routines',
        'diet_entries', 'inbody_entries',
        'hobbies', 'hobby_posts',
        'transactions', 'assets', 'stock_analyses', 'finance_goals',
        'work_logs', 'archive_documents',
        'user_profiles', 'educations', 'careers', 'activities', 'portfolios',
        'user_settings'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        EXECUTE format(
            'CREATE TRIGGER update_%1$s_updated_at BEFORE UPDATE ON %1$I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
            tbl
        );
    END LOOP;
END
$$;
