-- SIMPLE RLS SECURITY FIX FOR DASHAWAY
-- This is the safest approach - lock everything down first, then open as needed

-- =====================================================
-- STEP 1: ENABLE RLS (This blocks ALL access by default)
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: ALLOW ONLY BACKEND ACCESS (Using Service Role)
-- =====================================================

-- This simple policy allows ONLY your backend to access these tables
-- Make sure your backend uses the service_role key!

-- Users table - backend only
CREATE POLICY "Service role only" ON public.users
    FOR ALL 
    TO service_role
    USING (true);

-- Subscriptions table - backend only
CREATE POLICY "Service role only" ON public.subscriptions
    FOR ALL 
    TO service_role
    USING (true);

-- Document history table - backend only
CREATE POLICY "Service role only" ON public.document_history
    FOR ALL 
    TO service_role
    USING (true);

-- Global stats table - backend can do everything, others can read
CREATE POLICY "Service role full access" ON public.global_stats
    FOR ALL 
    TO service_role
    USING (true);

CREATE POLICY "Public read access" ON public.global_stats
    FOR SELECT 
    TO anon, authenticated
    USING (true);

-- FAQ table - backend can do everything, others can read
CREATE POLICY "Service role full access" ON public.faq
    FOR ALL 
    TO service_role
    USING (true);

CREATE POLICY "Public read access" ON public.faq
    FOR SELECT 
    TO anon, authenticated
    USING (true);

-- Feedback table - backend full access, others can insert only
CREATE POLICY "Service role full access" ON public.feedback
    FOR ALL 
    TO service_role
    USING (true);

CREATE POLICY "Public can submit feedback" ON public.feedback
    FOR INSERT 
    TO anon, authenticated
    WITH CHECK (true);

-- =====================================================
-- VERIFY RLS IS ENABLED
-- =====================================================

-- Run this to confirm RLS is enabled on all tables:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'subscriptions', 'document_history', 'global_stats', 'faq', 'feedback')
ORDER BY tablename;