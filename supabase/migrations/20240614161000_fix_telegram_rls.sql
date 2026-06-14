-- Fix and refine RLS policies for Telegram tables

-- Drop existing policies if they exist to start fresh
DROP POLICY IF EXISTS "Users can manage their own auth tokens" ON public.telegram_auth_tokens;
DROP POLICY IF EXISTS "Users can see their own telegram link" ON public.telegram_users;

-- Explicitly allow Insert for users on their own tokens
CREATE POLICY "Users can create their own auth tokens"
    ON public.telegram_auth_tokens
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view and delete their own auth tokens"
    ON public.telegram_auth_tokens
    FOR ALL
    USING (auth.uid() = user_id);

-- Explicitly allow service role to do everything (though it should by default)
ALTER TABLE public.telegram_auth_tokens FORCE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_users FORCE ROW LEVEL SECURITY;

-- Ensure service_role has permissions
GRANT ALL ON public.telegram_auth_tokens TO service_role;
GRANT ALL ON public.telegram_users TO service_role;
GRANT ALL ON public.telegram_auth_tokens TO postgres;
GRANT ALL ON public.telegram_users TO postgres;
