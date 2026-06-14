-- Create tables for Telegram integration

CREATE TABLE IF NOT EXISTS public.telegram_users (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    chat_id BIGINT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.telegram_auth_tokens (
    token UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_auth_tokens ENABLE ROW LEVEL SECURITY;

-- Policies for telegram_users
CREATE POLICY "Users can see their own telegram link"
    ON public.telegram_users
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policies for telegram_auth_tokens
CREATE POLICY "Users can manage their own auth tokens"
    ON public.telegram_auth_tokens
    FOR ALL
    USING (auth.uid() = user_id);

-- Grant access to service_role (for the Edge Function)
GRANT ALL ON public.telegram_users TO service_role;
GRANT ALL ON public.telegram_auth_tokens TO service_role;
