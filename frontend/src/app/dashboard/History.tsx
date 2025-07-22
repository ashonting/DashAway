'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface HistoryItem {
  id: number;
  created_at: string;
  original_text: string;
  edited_text: string;
}

export default function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    };
    if (user) {
      fetchHistory();
    }
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
