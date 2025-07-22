'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { User, Crown, Calendar, BarChart3, FileText, Settings, Zap } from 'lucide-react';
import Link from 'next/link';

import Stats from './Stats';
import History from './History';

export default function DashboardPage() {
  const { user, loading } = useAuth();
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
    <main className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Welcome back!
              </h1>
              <p className="text-foreground/70 text-lg">Here&apos;s your DashAway dashboard</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-foreground/60 mb-1">Signed in as</p>
              <p className="font-semibold text-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Account Status Card */}
        <div className="mb-8">
          <div className="bg-card p-6 rounded-2xl border border-border/40 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${
                  isPro ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  {isPro ? <Crown className="h-6 w-6 text-white" /> : <User className="h-6 w-6 text-gray-600" />}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {isPro ? 'Pro Account' : 'Basic Account'}
                  </h3>
                  <p className="text-foreground/60">
                    {isPro ? '$4/month • Unlimited usage' : 'Free • Limited usage'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{remainingUses}</p>
                <p className="text-sm text-foreground/60">
                  {isPro ? 'cleanings available' : 'uses remaining'}
                </p>
              </div>
            </div>
            
            {!isPro && (
              <div className="mt-4 pt-4 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-foreground/80">Upgrade for unlimited access</span>
                  </div>
                  <Link 
                    href="/pricing"
                    className="px-4 py-2 bg-gradient-to-r from-teal-600 to-purple-600 text-white font-semibold rounded-lg hover:scale-105 transform transition-all duration-200 shadow-lg text-sm"
                  >
                    Upgrade to Pro
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Section */}
          <div className="lg:col-span-2">
            <div className="bg-card p-6 rounded-2xl border border-border/40 shadow-lg mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <BarChart3 className="h-6 w-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-foreground">Usage Statistics</h2>
              </div>
              <Stats />
            </div>

            {/* Document History */}
            <div className="bg-card p-6 rounded-2xl border border-border/40 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <FileText className="h-6 w-6 text-green-500" />
                <h2 className="text-2xl font-bold text-foreground">Document History</h2>
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
                  className="flex items-center space-x-3 w-full p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-primary"
                >
                  <Zap className="h-4 w-4" />
                  <span>Clean New Text</span>
                </Link>
                
                <Link 
                  href="/pricing"
                  className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-accent/50 transition-colors text-foreground/80"
                >
                  <Crown className="h-4 w-4" />
                  <span>View Pricing</span>
                </Link>
                
                <button className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-accent/50 transition-colors text-foreground/80">
                  <Settings className="h-4 w-4" />
                  <span>Account Settings</span>
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-card p-6 rounded-2xl border border-border/40 shadow-lg">
              <h3 className="text-lg font-semibold text-foreground mb-4">Account Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/60">Member since:</span>
                  <span className="text-foreground">Today</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Plan type:</span>
                  <span className={`font-medium ${
                    isPro ? 'text-yellow-600' : 'text-foreground'
                  }`}>
                    {isPro ? 'Pro' : 'Basic'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Usage this month:</span>
                  <span className="text-foreground">
                    {isPro ? 'Unlimited' : `${2 - user.usage_count}/2 used`}
                  </span>
                </div>
              </div>
            </div>

            {/* Usage Reset Info */}
            <div className="bg-card p-6 rounded-2xl border border-border/40 shadow-lg">
              <div className="flex items-center space-x-3 mb-3">
                <Calendar className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-foreground">Usage Reset</h3>
              </div>
              <p className="text-sm text-foreground/60 mb-2">
                {isPro ? 'Your unlimited usage never resets!' : 'Basic accounts reset monthly'}
              </p>
              {!isPro && (
                <p className="text-sm text-foreground/80">
                  Next reset: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
