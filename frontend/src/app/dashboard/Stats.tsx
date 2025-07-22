'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function Stats() {
  const { user } = useAuth();

  return (
    <div className="p-6 bg-background rounded-2xl border border-border/40">
      <h3 className="text-xl font-bold mb-4">Usage Stats</h3>
      <p>Documents Processed: {user?.usage_count}</p>
    </div>
  );
}
