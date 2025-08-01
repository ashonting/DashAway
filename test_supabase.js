const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vsjxnobjkkesyszhpweu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzanhub2Jqa2tlc3lzenBwZXUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcyOTk2NTQ0OCwiZXhwIjoyMDQ1NTQxNDQ4fQ.fwdqSBEP6t9Cn9dWKTI2Tpl8CvnMJPa1wdIWrfpUqxY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession();
    console.log('Session test:', { data, error });
    
    // Test user info
    const { data: user, error: userError } = await supabase.auth.getUser();
    console.log('User test:', { user, userError });
    
    // Test sign-in with Google (this will show available providers)
    console.log('Testing OAuth providers...');
    const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback'
      }
    });
    console.log('OAuth test:', { authData, authError });
    
  } catch (err) {
    console.error('Error testing Supabase:', err);
  }
}

testSupabase();