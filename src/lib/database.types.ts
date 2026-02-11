// Auto-generated Supabase Database Types for Life Controller
// These map database columns (snake_case) to frontend types

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
    public: {
        Tables: {
            tasks: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    completed: boolean;
                    due_date: string | null;
                    project_id: string | null;
                    priority: 'high' | 'medium' | 'low';
                    sub_tasks: Json;
                    type: string | null;
                    remarks: string | null;
                    deadline: string | null;
                    start_date: string | null;
                    end_date: string | null;
                    dependencies: string[];
                    progress: number;
                    connected_goal_id: string | null;
                    source: 'timeline' | 'daily' | null;
                    category: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'updated_at'> & {
                    id?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
            };
            projects: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    color: string;
                    status: string | null;
                    manager: string | null;
                    members: string[];
                    budget: Json | null;
                    start_date: string | null;
                    end_date: string | null;
                    parent_id: string | null;
                    description: string | null;
                    progress: number;
                    my_role: string | null;
                    okrs: Json;
                    stakeholders: Json;
                    resources: Json;
                    automation_rules: Json;
                    is_archived: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'> & {
                    id?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Database['public']['Tables']['projects']['Insert']>;
            };
            goals: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    progress: number;
                    plan_type: string | null;
                    category: string | null;
                    deadline: string | null;
                    memo: string | null;
                    sub_goals: Json;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['goals']['Row'], 'id' | 'created_at' | 'updated_at'> & {
                    id?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Database['public']['Tables']['goals']['Insert']>;
            };
            habits: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    streak: number;
                    completed_dates: string[];
                    time: string | null;
                    end_time: string | null;
                    days: number[];
                    start_date: string | null;
                    end_date: string | null;
                    skipped_dates: string[];
                    type: string | null;
                    priority: string | null;
                    is_meeting: boolean;
                    is_appointment: boolean;
                    connected_project_id: string | null;
                    connected_goal_id: string | null;
                    prep_time: number | null;
                    travel_time: number | null;
                    color: string | null;
                    description: string | null;
                    target_count: number;
                    daily_progress: Json;
                    is_tracked: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['habits']['Row'], 'id' | 'created_at' | 'updated_at'> & {
                    id?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Database['public']['Tables']['habits']['Insert']>;
            };
            calendar_events: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    start_time: string;
                    end_time: string;
                    description: string | null;
                    color: string | null;
                    type: string | null;
                    priority: string | null;
                    is_meeting: boolean;
                    is_appointment: boolean;
                    is_work_log: boolean;
                    work_details: Json | null;
                    connected_project_id: string | null;
                    connected_goal_id: string | null;
                    prep_time: number | null;
                    travel_time: number | null;
                    habit_id: string | null;
                    is_habit_event: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['calendar_events']['Row'], 'id' | 'created_at' | 'updated_at'> & {
                    id?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Database['public']['Tables']['calendar_events']['Insert']>;
            };
            journals: {
                Row: {
                    id: string;
                    user_id: string;
                    date: string;
                    content: string | null;
                    mood: string | null;
                    images: string[];
                    tags: string[];
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['journals']['Row'], 'id' | 'created_at' | 'updated_at'> & {
                    id?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Database['public']['Tables']['journals']['Insert']>;
            };
            memos: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string | null;
                    content: string | null;
                    color: string;
                    tags: string[];
                    attachments: string[];
                    connected_project_id: string | null;
                    connected_goal_id: string | null;
                    is_favorite: boolean;
                    width: number | null;
                    height: number | null;
                    x: number | null;
                    y: number | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['memos']['Row'], 'id' | 'created_at' | 'updated_at'> & {
                    id?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Database['public']['Tables']['memos']['Insert']>;
            };
            user_settings: {
                Row: {
                    id: string;
                    user_id: string;
                    home_shortcuts: string[];
                    body_composition_goal: Json | null;
                    global_memo: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['user_settings']['Row'], 'id' | 'created_at' | 'updated_at'> & {
                    id?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Database['public']['Tables']['user_settings']['Insert']>;
            };
            // Simplified type stubs for remaining tables (same pattern)
            scraps: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            people: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            language_entries: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            language_resources: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            books: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            certificates: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            exercise_sessions: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            exercise_routines: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            custom_exercises: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            diet_entries: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            custom_foods: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            inbody_entries: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            hobbies: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            hobby_posts: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            hobby_entries: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            transactions: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            assets: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            real_estate_scraps: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            stock_analyses: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            finance_goals: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            monthly_budgets: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            work_logs: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            archive_documents: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            user_profiles: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            educations: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            careers: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            activities: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
            portfolios: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
        };
    };
}
