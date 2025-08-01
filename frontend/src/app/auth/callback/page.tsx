'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log('=== AUTH CALLBACK STARTED v2.0 ===');
    console.log('Full URL:', window.location.href);
    console.log('Search params:', window.location.search);
    console.log('Hash fragment:', window.location.hash);
    
    let redirected = false;

    const handleAuthCallback = async () => {
      try {
        // Handle OAuth tokens from URL fragment (Supabase implicit flow)
        if (window.location.hash) {
          console.log('Found hash fragment, waiting for Supabase to process...');
          
          // Set up auth state change listener for OAuth flow
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state change:', event, session?.user?.email || 'no user');
            
            if (event === 'SIGNED_IN' && session && !redirected) {
              redirected = true;
              console.log('✅ User signed in via OAuth! Redirecting to dashboard...');
              subscription.unsubscribe(); // Clean up listener
              router.push('/dashboard');
            } else if (event === 'TOKEN_REFRESHED' && session && !redirected) {
              redirected = true;
              console.log('✅ Token refreshed, user authenticated! Redirecting to dashboard...');
              subscription.unsubscribe(); // Clean up listener
              router.push('/dashboard');
            }
          });
          
          // Also try direct session check after a delay
          setTimeout(async () => {
            if (!redirected) {
              console.log('Checking session after delay...');
              const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
              
              if (sessionData.session && !redirected) {
                redirected = true;
                console.log('✅ Session found after delay! Redirecting to dashboard...');
                subscription.unsubscribe();
                router.push('/dashboard');
              } else if (!redirected) {
                console.log('❌ No session after delay, redirecting to login');
                redirected = true;
                subscription.unsubscribe();
                router.push('/login?error=oauth_timeout');
              }
            }
          }, 3000);
          
          return; // Don't continue with other checks for fragment flow
        }
        
        // If no fragment, check for code-based flow
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        console.log('URL params check:', { code: !!code, error, errorDescription });
        
        if (error) {
          console.error('OAuth error from URL:', error, errorDescription);
          if (!redirected) {
            redirected = true;
            router.push(`/login?error=${error}`);
          }
          return;
        }

        if (code) {
          console.log('Found code, exchanging for session...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            if (!redirected) {
              redirected = true;
              router.push('/login?error=code_exchange_failed');
            }
            return;
          }

          if (data.session) {
            console.log('✅ Code exchange successful! Redirecting to dashboard...');
            if (!redirected) {
              redirected = true;
              router.push('/dashboard');
            }
            return;
          }
        }

        // If no fragment or code, check for existing session as fallback
        console.log('No OAuth data found, checking existing session...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (!redirected) {
            redirected = true;
            router.push('/login?error=session_error');
          }
          return;
        }

        if (sessionData.session) {
          console.log('✅ Existing session found! Redirecting to dashboard...');
          if (!redirected) {
            redirected = true;
            router.push('/dashboard');
          }
          return;
        }

        // If we get here, something went wrong
        console.log('❌ No auth data found, redirecting to login');
        if (!redirected) {
          redirected = true;
          router.push('/login?error=no_auth_data');
        }
        
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        if (!redirected) {
          redirected = true;
          router.push('/login?error=unexpected_error');
        }
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
        <p className="text-white/70">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}