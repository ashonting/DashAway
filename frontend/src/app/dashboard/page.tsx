'use client';

import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { User, Crown, Calendar, BarChart3, FileText, Settings, Zap, Target, TrendingUp, Shield, Clock } from 'lucide-react';
import Link from 'next/link';
import PageHead from '@/components/PageHead';

import Stats from './Stats';
import History from './History';

export default function DashboardPage() {
  const { user, loading } = useSupabaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isPro = user.subscriptions && user.subscriptions.some(s => s.status === 'active');
  const remainingUses = isPro ? 'Unlimited' : user.usage_count;

  return (
    <>
      <PageHead page="dashboard" />
      <main className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Your AI Content is <span className="bg-gradient-to-r from-teal-400 to-purple-600 bg-clip-text text-transparent">Undetectable</span>
              </h1>
              <p className="text-foreground/70 text-lg">Track your AI cleaning progress and humanize more content</p>
            </div>
            <div className="text-left lg:text-right">
              <p className="text-sm text-foreground/60 mb-1">Signed in as</p>
              <p className="font-semibold text-foreground">{user.email}</p>
            </div>
          </div>
          
          {/* Value Proposition Banner */}
          <div className="bg-gradient-to-r from-teal-50 to-purple-50 dark:from-teal-900/20 dark:to-purple-900/20 rounded-2xl border border-teal-200 dark:border-teal-700 p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-teal-500 to-purple-600 rounded-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">They&apos;ll Never Know AI Wrote It</h3>
                <p className="text-foreground/70 text-sm">Your AI content passes as 100% human writing. No more em-dashes, robotic phrases, or AI fingerprints.</p>
              </div>
              <Link 
                href="/"
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-purple-600 text-white font-semibold rounded-xl hover:scale-105 transform transition-all duration-200 shadow-lg flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Clean More Content
              </Link>
            </div>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Account Status */}
          <div className="bg-card p-6 rounded-2xl border border-border/40 shadow-lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`p-2 rounded-lg ${
                isPro ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-100 dark:bg-gray-800'
              }`}>
                {isPro ? <Crown className="h-5 w-5 text-white" /> : <User className="h-5 w-5 text-gray-600" />}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {isPro ? 'Pro Account' : 'Basic Account'}
                </h3>
              </div>
            </div>
            <div className="mb-3">
              <p className="text-2xl font-bold text-foreground">{remainingUses}</p>
              <p className="text-sm text-foreground/60">
                {isPro ? 'AI cleanings available' : 'cleanings remaining'}
              </p>
            </div>
            {!isPro && (
              <Link 
                href="/pricing"
                className="inline-flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
              >
                <Zap className="h-4 w-4" />
                Upgrade to Pro
              </Link>
            )}
          </div>

          {/* AI Detection Success Rate */}
          <div className="bg-card p-6 rounded-2xl border border-border/40 shadow-lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">AI Detection</h3>
            </div>
            <div className="mb-3">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">0%</p>
              <p className="text-sm text-foreground/60">detection rate</p>
            </div>
            <p className="text-xs text-foreground/50">Your cleaned content passes all AI detectors</p>
          </div>

          {/* Em-Dashes Removed */}
          <div className="bg-card p-6 rounded-2xl border border-border/40 shadow-lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                <Target className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Em-Dashes Fixed</h3>
            </div>
            <div className="mb-3">
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">0</p>
              <p className="text-sm text-foreground/60">biggest AI tells removed</p>
            </div>
            <p className="text-xs text-foreground/50">Em-dashes are the #1 AI giveaway</p>
          </div>

          {/* Content Humanized */}
          <div className="bg-card p-6 rounded-2xl border border-border/40 shadow-lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Content Cleaned</h3>
            </div>
            <div className="mb-3">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{user.usage_count || 0}</p>
              <p className="text-sm text-foreground/60">documents humanized</p>
            </div>
            <p className="text-xs text-foreground/50">Ready to use as your own work</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Stats and History */}
          <div className="lg:col-span-3 space-y-8">
            {/* AI Cleaning Performance */}
            <div className="bg-card p-6 rounded-2xl border border-border/40 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                  <h2 className="text-2xl font-bold text-foreground">AI Cleaning Performance</h2>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground/60">Your content now sounds</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">100% Human</p>
                </div>
              </div>
              <Stats />
            </div>

            {/* Recent Cleanings */}
            <div className="bg-card p-6 rounded-2xl border border-border/40 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-green-500" />
                  <h2 className="text-2xl font-bold text-foreground">Recent AI Content Cleanings</h2>
                </div>
                <Link 
                  href="/"
                  className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium flex items-center gap-1"
                >
                  <Target className="h-4 w-4" />
                  Clean More Content
                </Link>
              </div>
              <History />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-card p-6 rounded-2xl border border-border/40 shadow-lg">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  href="/"
                  className="flex items-center space-x-3 w-full p-4 rounded-xl bg-gradient-to-r from-teal-50 to-purple-50 dark:from-teal-900/20 dark:to-purple-900/20 border border-teal-200 dark:border-teal-700 hover:scale-105 transform transition-all duration-200 text-teal-700 dark:text-teal-300"
                >
                  <Target className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Humanize AI Content</div>
                    <div className="text-xs opacity-80">Remove all AI fingerprints</div>
                  </div>
                </Link>
                
                {!isPro && (
                  <Link 
                    href="/pricing"
                    className="flex items-center space-x-3 w-full p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 hover:scale-105 transform transition-all duration-200 text-yellow-700 dark:text-yellow-300"
                  >
                    <Crown className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Upgrade to Pro</div>
                      <div className="text-xs opacity-80">Unlimited AI cleaning</div>
                    </div>
                  </Link>
                )}
                
                <button className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-accent/50 transition-colors text-foreground/80">
                  <Settings className="h-4 w-4" />
                  <span>Account Settings</span>
                </button>
              </div>
            </div>

            {/* Account Overview */}
            <div className="bg-card p-6 rounded-2xl border border-border/40 shadow-lg">
              <h3 className="text-lg font-semibold text-foreground mb-4">Account Overview</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-foreground/60" />
                    <span className="text-foreground/70">Plan</span>
                  </div>
                  <span className={`font-semibold ${
                    isPro ? 'text-yellow-600 dark:text-yellow-400' : 'text-foreground'
                  }`}>
                    {isPro ? 'Pro ($4/mo)' : 'Basic (Free)'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-foreground/60" />
                    <span className="text-foreground/70">This Month</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {isPro ? 'Unlimited' : `${user.usage_count || 0}/2 used`}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-foreground/60" />
                    <span className="text-foreground/70">Next Reset</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {isPro ? 'Never' : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Cleaning Tips */}
            <div className="bg-gradient-to-br from-teal-50 to-purple-50 dark:from-teal-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-teal-200 dark:border-teal-700">
              <h3 className="text-lg font-semibold text-foreground mb-3">💡 Pro Tip</h3>
              <p className="text-sm text-foreground/80 mb-3">
                Em-dashes (—) are the biggest AI tell. DashAway catches every single one and suggests natural alternatives.
              </p>
              <p className="text-xs text-foreground/60">
                Your cleaned content will pass AI detectors and sound completely human.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}
