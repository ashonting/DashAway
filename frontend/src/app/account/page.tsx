'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Toast from '@/app/Toast';

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const res = await fetch('/api/users/me/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      setToastMessage('Password changed successfully');
      setShowToast(true);
    } else {
      const errorData = await res.json();
      setToastMessage(errorData.detail || 'Failed to change password');
      setShowToast(true);
    }
  };

  const handleManageSubscription = async () => {
    const res = await fetch('/api/paddle/generate-checkout-link');
    if (res.ok) {
      const data = await res.json();
      // Open Paddle checkout in a new window
      window.open(data.checkout_url, '_blank');
    } else {
      const errorData = await res.json();
      setToastMessage(errorData.detail || 'Failed to generate checkout link');
      setShowToast(true);
    }
  };

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-12">Account</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                required
              />
            </div>
            <button type="submit" className="w-full h-10 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
              Change Password
            </button>
          </form>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Subscription</h2>
          <p>Your current plan: {user.subscriptions && user.subscriptions.some(s => s.status === 'active') ? 'Plus' : 'Free'}</p>
          <button 
            onClick={handleManageSubscription}
            className="mt-4 w-full h-10 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
          >
            Manage Subscription
          </button>
        </div>
      </div>
      <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />
    </main>
  );
}