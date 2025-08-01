-- SUPABASE SECURITY FIX FOR DASHAWAY
-- Run these commands in your Supabase SQL Editor immediately
-- This will enable Row Level Security (RLS) and protect your user data

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
-- STEP 2: CREATE POLICIES FOR USERS TABLE
-- =====================================================

-- Users can only see their own user record
CREATE POLICY "Users can view own record" ON public.users
    FOR SELECT USING (auth.uid()::text = supabase_id);

-- Users can update their own record
CREATE POLICY "Users can update own record" ON public.users
    FOR UPDATE USING (auth.uid()::text = supabase_id);

-- Service role can do everything (for backend operations)
CREATE POLICY "Service role has full access to users" ON public.users
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- STEP 3: CREATE POLICIES FOR SUBSCRIPTIONS TABLE
-- =====================================================

-- Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM public.users 
            WHERE supabase_id = auth.uid()::text
        )
    );

-- Service role has full access
CREATE POLICY "Service role has full access to subscriptions" ON public.subscriptions
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- STEP 4: CREATE POLICIES FOR DOCUMENT_HISTORY TABLE
-- =====================================================

-- Users can only see their own document history
CREATE POLICY "Users can view own document history" ON public.document_history
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM public.users 
            WHERE supabase_id = auth.uid()::text
        )
    );

-- Users can insert their own documents
CREATE POLICY "Users can insert own documents" ON public.document_history
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM public.users 
            WHERE supabase_id = auth.uid()::text
        )
    );

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents" ON public.document_history
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM public.users 
            WHERE supabase_id = auth.uid()::text
        )
    );

-- Service role has full access
CREATE POLICY "Service role has full access to document_history" ON public.document_history
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- STEP 5: CREATE POLICIES FOR GLOBAL_STATS TABLE
-- =====================================================

-- Everyone can read global stats (it's aggregate data)
CREATE POLICY "Anyone can view global stats" ON public.global_stats
    FOR SELECT USING (true);

-- Only service role can update stats
CREATE POLICY "Service role can update global stats" ON public.global_stats
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- STEP 6: CREATE POLICIES FOR FAQ TABLE
-- =====================================================

-- Everyone can read FAQs (public information)
CREATE POLICY "Anyone can view FAQs" ON public.faq
    FOR SELECT USING (true);

-- Only service role can manage FAQs
CREATE POLICY "Service role can manage FAQs" ON public.faq
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- STEP 7: CREATE POLICIES FOR FEEDBACK TABLE
-- =====================================================

-- Anyone can submit feedback (even anonymous users)
CREATE POLICY "Anyone can submit feedback" ON public.feedback
    FOR INSERT WITH CHECK (true);

-- Only service role can view/manage feedback
CREATE POLICY "Service role can manage feedback" ON public.feedback
    FOR SELECT USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role can delete feedback" ON public.feedback
    FOR DELETE USING (auth.jwt()->>'role' = 'service_role');

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