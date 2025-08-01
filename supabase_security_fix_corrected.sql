-- SUPABASE SECURITY FIX FOR DASHAWAY (CORRECTED VERSION)
-- Run these commands in your Supabase SQL Editor immediately
-- This version is corrected for your actual database schema

-- =====================================================
-- STEP 1: ENABLE RLS ON ALL TABLES
-- =====================================================

-- Enable RLS on all tables (this blocks all access by default)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- IMPORTANT: Since you're using a hybrid auth system,
-- we'll create policies that work with your backend
-- =====================================================

-- =====================================================
-- STEP 2: CREATE POLICIES FOR USERS TABLE
-- =====================================================

-- For now, we'll restrict direct access and only allow service role
-- This ensures only your backend can access user data
CREATE POLICY "Only service role can access users" ON public.users
    FOR ALL USING (
        -- Check if the request is from service role
        auth.jwt()->>'role' = 'service_role'
        OR
        -- Or if it's from your backend (using a specific claim you can add)
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

-- =====================================================
-- STEP 3: CREATE POLICIES FOR SUBSCRIPTIONS TABLE
-- =====================================================

-- Only service role can access subscriptions
CREATE POLICY "Only service role can access subscriptions" ON public.subscriptions
    FOR ALL USING (
        auth.jwt()->>'role' = 'service_role'
        OR
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

-- =====================================================
-- STEP 4: CREATE POLICIES FOR DOCUMENT_HISTORY TABLE
-- =====================================================

-- Only service role can access document history
CREATE POLICY "Only service role can access document_history" ON public.document_history
    FOR ALL USING (
        auth.jwt()->>'role' = 'service_role'
        OR
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

-- =====================================================
-- STEP 5: CREATE POLICIES FOR GLOBAL_STATS TABLE
-- =====================================================

-- Everyone can read global stats (it's aggregate data)
CREATE POLICY "Anyone can view global stats" ON public.global_stats
    FOR SELECT USING (true);

-- Only service role can update stats
CREATE POLICY "Only service role can update global stats" ON public.global_stats
    FOR INSERT USING (
        auth.jwt()->>'role' = 'service_role'
        OR
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

CREATE POLICY "Only service role can modify global stats" ON public.global_stats
    FOR UPDATE USING (
        auth.jwt()->>'role' = 'service_role'
        OR
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

-- =====================================================
-- STEP 6: CREATE POLICIES FOR FAQ TABLE
-- =====================================================

-- Everyone can read FAQs (public information)
CREATE POLICY "Anyone can view FAQs" ON public.faq
    FOR SELECT USING (true);

-- Only service role can manage FAQs
CREATE POLICY "Only service role can manage FAQs" ON public.faq
    FOR ALL USING (
        auth.jwt()->>'role' = 'service_role'
        OR
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

-- =====================================================
-- STEP 7: CREATE POLICIES FOR FEEDBACK TABLE
-- =====================================================

-- Anyone can submit feedback (even anonymous users)
CREATE POLICY "Anyone can submit feedback" ON public.feedback
    FOR INSERT WITH CHECK (true);

-- Only service role can view/manage feedback
CREATE POLICY "Only service role can view feedback" ON public.feedback
    FOR SELECT USING (
        auth.jwt()->>'role' = 'service_role'
        OR
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

CREATE POLICY "Only service role can delete feedback" ON public.feedback
    FOR DELETE USING (
        auth.jwt()->>'role' = 'service_role'
        OR
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

-- =====================================================
-- ALTERNATIVE: If you need to link users to Supabase Auth
-- =====================================================

-- First, check if you want to add supabase_id column to link accounts:
-- ALTER TABLE public.users ADD COLUMN supabase_id UUID REFERENCES auth.users(id);
-- CREATE INDEX idx_users_supabase_id ON public.users(supabase_id);

-- Then you could use more sophisticated policies like:
-- CREATE POLICY "Users can view own record via email" ON public.users
--     FOR SELECT USING (email = auth.jwt()->>'email');

-- =====================================================
-- VERIFICATION QUERIES (Run these to check)
-- =====================================================

-- Check if RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'subscriptions', 'document_history', 'global_stats', 'faq', 'feedback');

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- IMPORTANT BACKEND CONFIGURATION
-- =====================================================

-- Your backend MUST use the service_role key, not the anon key
-- In your .env file:
-- SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

-- In your backend code, make sure you're using service_role key:
-- supabase = create_client(url, service_role_key)  # NOT anon_key!