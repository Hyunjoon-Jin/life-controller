-- 1. Drop the potentially problematic trigger
DROP TRIGGER IF EXISTS trigger_protect_role_change ON user_profiles;
DROP FUNCTION IF EXISTS protect_role_change;

-- 2. Drop the recursive policies temporarily
DROP POLICY IF EXISTS "Admins can view all logs" ON admin_action_logs;
DROP POLICY IF EXISTS "Admins can insert logs" ON admin_action_logs;

-- 3. Replace with simpler policies for now (Admin check removed for debugging)
CREATE POLICY "Everyone can insert logs" ON admin_action_logs
FOR INSERT WITH CHECK (true);

-- 4. Ensure admin_action_logs exists and has correct columns
CREATE TABLE IF NOT EXISTS admin_action_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    target_user_id UUID,
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Force refresh schema cache (sometimes needed)
NOTIFY pgrst, 'reload config';
