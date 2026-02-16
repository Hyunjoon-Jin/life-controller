-- ============================================
-- Google Auth Trigger Script
-- Run this in Supabase SQL Editor
-- ============================================

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Insert into user_profiles
  insert into public.user_profiles (user_id, email, name, photo, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'user'
  );
  
  -- Insert into user_settings (default settings)
  insert into public.user_settings (user_id)
  values (new.id);
  
  return new;
end;
$$;

-- Trigger definition
-- Drop if exists to avoid errors on multiple runs
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
