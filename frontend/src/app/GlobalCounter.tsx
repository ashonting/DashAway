'use client';

import { useState, useEffect } from 'react';

export default function GlobalCounter() {
  const [stats, setStats] = useState({ total_em_dashes_found: 0, total_documents_processed: 0 });

  useEffect(() => {
    let isActive = true;
    let retryCount = 0;
    const maxRetries = 3;

    const fetchStats = async () => {
      if (!isActive) return;
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats/global`, {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (res.ok && isActive) {
          const data = await res.json();
          setStats(data);
          retryCount = 0; // Reset retry count on success
        }
      } catch (error) {
        console.error('Error fetching global stats:', error);
        retryCount++;
        if (retryCount >= maxRetries) {
          console.log('Max retries reached for global stats');
          return; // Stop retrying
        }
      }
    };

    fetchStats();
    const interval = setInterval(() => {
      if (isActive && retryCount < maxRetries) {
        fetchStats();
      }
    }, 10000); // Poll every 10 seconds (increased from 5)

    return () => {
      isActive = false;
      clearInterval(interval);
    };
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
