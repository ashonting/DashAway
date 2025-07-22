'use client';

import { useState, useEffect } from 'react';

export default function GlobalCounter() {
  const [stats, setStats] = useState({ total_em_dashes_found: 0, total_documents_processed: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats/global`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        // Handle error
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center my-8">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-xl shadow-2xl text-white text-center transform hover:scale-105 transition-all duration-300 ease-in-out">
        <p className="text-4xl font-extrabold tracking-tight">{stats.total_em_dashes_found.toLocaleString()}</p>
        <p className="text-xl font-medium opacity-90">Em Dashes Cleaned</p>
      </div>
    </div>
  );
}
