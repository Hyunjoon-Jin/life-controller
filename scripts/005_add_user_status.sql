-- Migrations for Account Withdrawal & Admin System (Safe Version)

-- 1. Add status and role columns to user_profiles (Safe: IF NOT EXISTS)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dormant', 'suspended', 'withdrawn')),
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. Create admin_action_logs table (Safe: IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS admin_action_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    target_user_id UUID,
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS for admin_action_logs
ALTER TABLE admin_action_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for admin_action_logs (Safe: Drop first)
-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Admins can view all logs" ON admin_action_logs;
DROP POLICY IF EXISTS "Admins can insert logs" ON admin_action_logs;

-- Recreate policies
CREATE POLICY "Admins can view all logs" ON admin_action_logs
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM user_profiles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can insert logs" ON admin_action_logs
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM user_profiles WHERE role = 'admin'
  )
);

-- 5. Prevent users from changing their own role to admin (Safe: Replace function)
CREATE OR REPLACE FUNCTION protect_role_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If trying to change role
    IF NEW.role <> OLD.role THEN
        -- Check if the user is an admin
        IF NOT EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        ) THEN
            RAISE EXCEPTION 'You are not authorized to change your role.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists to avoid error on recreation
DROP TRIGGER IF EXISTS trigger_protect_role_change ON user_profiles;

CREATE TRIGGER trigger_protect_role_change
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION protect_role_change();
