'use client';

import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useEffect, useState } from 'react';

interface HistoryItem {
  id: number;
  created_at: string;
  original_text: string;
  edited_text: string;
}

export default function History() {
  const { user } = useSupabaseAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        // Get the current session to access the JWT token
        const { supabase } = await import('@/lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/history`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setHistory(data);
          } else {
            console.error('Failed to fetch history:', response.status, response.statusText);
          }
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      }
    };
    
    fetchHistory();
  }, [user]);

  return (
    <div className="p-6 bg-background rounded-2xl border border-border/40">
      <h3 className="text-xl font-bold mb-4">Document History</h3>
      <ul className="space-y-4">
        {history.map((item) => (
          <li key={item.id} className="p-4 bg-background rounded-lg border border-border/20">
            <p className="text-sm text-foreground/60">{new Date(item.created_at).toLocaleString()}</p>
            <p className="truncate">{item.original_text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
