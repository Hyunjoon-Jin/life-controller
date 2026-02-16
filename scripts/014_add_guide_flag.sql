-- ============================================
-- Add has_seen_guide to user_settings
-- Run this in Supabase SQL Editor
-- ============================================

ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS has_seen_guide BOOLEAN DEFAULT FALSE;
