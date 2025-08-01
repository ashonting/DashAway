'use client';

import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useState, useEffect } from 'react';
import { FileText, Calendar, TrendingUp } from 'lucide-react';

export default function Stats() {
  const { user } = useSupabaseAuth();
  const [documentCount, setDocumentCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocumentCount = async () => {
      if (!user) return;
      try {
        // Get the current session to access the JWT token
        const { supabase } = await import('@/lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/history/count`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setDocumentCount(data.count || 0);
          }
        }
      } catch (error) {
        console.error('Failed to fetch document count:', error);
        setDocumentCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentCount();
  }, [user]);

  const isPro = user?.subscriptions && user.subscriptions.some(s => s.status === 'active');
  const remainingUses = isPro ? '∞' : (user?.usage_count || 0);
  const usedThisMonth = isPro ? documentCount : Math.max(0, 2 - (user?.usage_count || 0));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Documents Processed */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {loading ? '...' : documentCount}
          </span>
        </div>
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Documents</p>
        <p className="text-xs text-blue-500/80 dark:text-blue-400/80">All time processed</p>
      </div>

      {/* This Month Usage */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200/50 dark:border-green-700/50">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <span className="text-2xl font-bold text-green-700 dark:text-green-300">
            {usedThisMonth}
          </span>
        </div>
        <p className="text-sm font-medium text-green-600 dark:text-green-400">This Month</p>
        <p className="text-xs text-green-500/80 dark:text-green-400/80">Documents cleaned</p>
      </div>

      {/* Remaining Uses */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            {remainingUses}
          </span>
        </div>
        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Remaining Uses</p>
        <p className="text-xs text-purple-500/80 dark:text-purple-400/80">
          {isPro ? 'Unlimited access' : 'This month'}
        </p>
      </div>
    </div>
  );
}
