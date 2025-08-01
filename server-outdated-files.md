# Outdated Files on Server (root@209.97.145.242)

## Critical Differences Found:

### 1. **Authentication System** ❌
- **Server uses**: Old `AuthContext.tsx` and `useAuth` hook
- **Should use**: `SupabaseAuthContext.tsx` and `useSupabaseAuth` hook
- **Files affected**:
  - `/contexts/AuthContext.tsx` → Should be `/contexts/SupabaseAuthContext.tsx`
  - All components using `useAuth` need to import `useSupabaseAuth`

### 2. **Missing Onboarding Components** ❌
- **Server missing**:
  - `WelcomeModal.tsx`
  - `SampleContent.tsx`
  - `ProductTour.tsx`
- **Server has**: `FAQModal.tsx` (which we don't use anymore)

### 3. **Header Component** ❌
- **Server version**: 
  - Uses old `useAuth`
  - Has FAQ button that opens modal
  - No Help dropdown menu
  - No "Show Tutorial" option
- **Should have**: 
  - Help dropdown with FAQ link
  - "Show Tutorial" option for logged-in users
  - Uses `useSupabaseAuth`

### 4. **Main Page (page.tsx)** ❌
- **Server version**: 
  - Uses `useAuth` from `AuthContext`
  - No onboarding imports or logic
  - Missing progressive onboarding functionality
- **Should have**:
  - Imports for WelcomeModal, SampleContent, ProductTour
  - Onboarding state and logic
  - Uses `useSupabaseAuth`

### 5. **Dashboard Page** ❌
- **Server version**: 
  - Still has "Welcome back!" (old copy)
  - Missing the new "Your AI Content is Undetectable" design
  - Old layout and metrics
- **Should have**:
  - New modern information architecture
  - AI-focused copy and metrics
  - 4-card metric layout

### 6. **History Component** ❌
- **Server version**: 
  - Missing JWT authentication headers
  - Simple fetch without auth
- **Should have**:
  - JWT token from Supabase session
  - Authorization headers in fetch calls

### 7. **Missing SEO/Meta Components** ❌
- **Server missing**:
  - `/lib/metadata.ts`
  - `/components/PageHead.tsx`
  - Meta description optimizations

## Files That Need to Be Copied to Server:

### Frontend Files:
1. `/src/contexts/SupabaseAuthContext.tsx` (replace AuthContext.tsx)
2. `/src/app/Header.tsx`
3. `/src/app/page.tsx`
4. `/src/app/WelcomeModal.tsx` (new)
5. `/src/app/SampleContent.tsx` (new)
6. `/src/app/ProductTour.tsx` (new)
7. `/src/app/dashboard/page.tsx`
8. `/src/app/dashboard/History.tsx`
9. `/src/app/dashboard/Stats.tsx`
10. `/src/app/faq/page.tsx`
11. `/src/app/pricing/page.tsx`
12. `/src/app/login/page.tsx`
13. `/src/app/register/page.tsx`
14. `/src/lib/metadata.ts` (new)
15. `/src/components/PageHead.tsx` (new)
16. `/src/lib/supabase.ts` (if not already there)
17. `/src/contexts/OnboardingContext.tsx` (new, though not used yet)

### Files to Remove from Server:
1. `/src/contexts/AuthContext.tsx` (replaced by SupabaseAuthContext)
2. `/src/app/FAQModal.tsx` (no longer used)
3. `/src/app/api/auth/[...nextauth]/route.ts` (if exists - replaced by Supabase)

## Summary:
The server is running a significantly older version of the codebase that:
- Uses the old NextAuth authentication instead of Supabase
- Missing all progressive onboarding components
- Has outdated UI copy (not AI-cleaning focused)
- Missing authentication headers in API calls
- Missing SEO optimizations

All the new features we implemented are not on the server, which explains why:
- No Help dropdown menu
- No onboarding modals
- History API errors (missing auth headers)
- Old dashboard design