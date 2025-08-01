# 🚨 SUPABASE SECURITY FIX GUIDE FOR DASHAWAY

## CRITICAL SECURITY ISSUES FOUND

Your Supabase database has **6 tables without Row Level Security (RLS)** enabled. This means:
- ⚠️ **Anyone with your Supabase URL could read ALL user data**
- ⚠️ **User passwords, subscriptions, and documents are exposed**
- ⚠️ **This is a GDPR violation and serious security breach**

## 🔥 IMMEDIATE ACTIONS REQUIRED

### 1. Enable Row Level Security (RLS) - DO THIS NOW!

1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Copy the entire contents of `supabase_security_fix.sql`
4. Paste and click "Run"

**This will:**
- ✅ Enable RLS on all tables (blocking all access by default)
- ✅ Create policies so users can only see their own data
- ✅ Allow your backend (service role) to manage data
- ✅ Keep public data (FAQs, stats) accessible

### 2. Fix OTP Expiry Setting

1. Go to Supabase Dashboard → Authentication → Providers
2. Click on "Email" provider
3. Change "OTP Expiry" from current setting to **3600** (1 hour)
4. Click "Save"

**Why:** Longer OTP expiry times are a security risk - tokens should expire quickly.

### 3. Enable Compromised Password Protection

1. Go to Supabase Dashboard → Authentication → Settings
2. Find "Password Protection" section
3. Enable "Check passwords against known data breaches"
4. Click "Save"

**Why:** This prevents users from using passwords that have been leaked in data breaches.

## 📊 RLS POLICIES EXPLAINED

### Users Table
- ✅ Users can only see/update their own record
- ✅ Backend service can manage all users
- ❌ Users cannot see other users' data

### Subscriptions Table  
- ✅ Users can only see their own subscription
- ✅ Backend service can manage all subscriptions
- ❌ Users cannot see other users' billing data

### Document History Table
- ✅ Users can view/insert/delete their own documents
- ✅ Backend service has full access
- ❌ Users cannot access other users' documents

### Global Stats Table
- ✅ Everyone can read (it's aggregate data)
- ✅ Only backend can update
- ❌ Users cannot manipulate stats

### FAQ Table
- ✅ Everyone can read FAQs
- ✅ Only backend can manage
- ❌ Users cannot modify FAQs

### Feedback Table
- ✅ Anyone can submit feedback
- ✅ Only backend can read/manage feedback
- ❌ Users cannot see other feedback

## 🧪 TESTING YOUR SECURITY

After applying the fixes, test that RLS is working:

### Test 1: Check RLS Status
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = false;
```
**Expected:** No results (all tables have RLS enabled)

### Test 2: Test User Access
1. Use Supabase client in your app
2. Try to query another user's data
3. Should return empty results

### Test 3: Test Backend Access
1. Use service role key in your backend
2. Should be able to access all data
3. Verify your app still works normally

## ⚠️ POTENTIAL ISSUES AFTER ENABLING RLS

### If your app stops working:
1. **Check your backend is using service_role key** (not anon key)
2. **Verify policies are created correctly**
3. **Test queries in SQL editor with different roles**

### Backend Connection Check:
```python
# Your backend should use service_role key:
SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key"  # Not anon key!
```

## 🔐 SECURITY BEST PRACTICES

### 1. Never Disable RLS
Once enabled, keep it on. Design policies instead of disabling.

### 2. Use Service Role Sparingly
Only your backend should use service_role key, never expose it.

### 3. Test New Policies
Always test policies before deploying to production.

### 4. Regular Security Audits
Check Supabase dashboard monthly for security warnings.

## 📈 BUSINESS IMPACT

**Before RLS:**
- 🚨 Any user could steal your entire customer database
- 🚨 Competitors could see all your usage data
- 🚨 GDPR fines up to €20 million or 4% of revenue

**After RLS:**
- ✅ User data is protected and isolated
- ✅ GDPR compliant data protection
- ✅ Professional security standards
- ✅ Customer trust maintained

## 🚀 NEXT STEPS

1. **Apply the SQL fixes immediately** ⏰
2. **Fix auth settings** (OTP and password protection) ⏰
3. **Test your application** still works ✅
4. **Monitor for any issues** 📊
5. **Document this was fixed** for compliance 📝

## 💡 QUICK REFERENCE

**Service Role Key Location:**
- Supabase Dashboard → Settings → API → service_role key

**Testing RLS Locally:**
```bash
# Use Supabase CLI to test policies
supabase db test
```

**If You Need Help:**
- Supabase Discord: https://discord.supabase.com
- Documentation: https://supabase.com/docs/guides/auth/row-level-security

---

⏰ **TIME REQUIRED:** 10-15 minutes
🎯 **PRIORITY:** CRITICAL - Do this before anything else!
💰 **COST:** Free (included with Supabase)