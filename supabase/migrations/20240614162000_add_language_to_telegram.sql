-- Add language column to telegram_users_links
ALTER TABLE public.telegram_users_links ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'ru';
