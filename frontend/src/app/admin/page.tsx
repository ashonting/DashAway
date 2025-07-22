'use client';

import { useState, useEffect } from 'react';
import { Eye, Trash2, Shield, Users, MessageSquare, Crown, UserCheck, UserX } from 'lucide-react';

interface Feedback {
  id: number;
  feedback_type: string;
  content: string;
}

interface AdminStats {
  total_feedback: number;
  total_faqs: number;
}

interface AdminUser {
  id: number;
  email: string;
  is_active: boolean;
  usage_count: number;
  is_pro: boolean;
  subscription_id?: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        loadAdminData();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Authentication failed');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      // Load feedback
      const feedbackResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/feedback?password=${encodeURIComponent(password)}`
      );
      if (feedbackResponse.ok) {
        const feedbackData = await feedbackResponse.json();
        setFeedback(feedbackData);
      }

      // Load stats
      const statsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats?password=${encodeURIComponent(password)}`
      );
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Load users
      const usersResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?password=${encodeURIComponent(password)}`
      );
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
    }
  };

  const populateFAQs = async () => {
    if (!confirm('This will add default FAQs to the database. Continue?')) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/populate-faqs?password=${encodeURIComponent(password)}`,
        { method: 'POST' }
      );

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        loadAdminData(); // Refresh stats
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to populate FAQs');
      }
    } catch (error) {
      alert('Network error occurred');
    }
  };

  const deleteFeedback = async (feedbackId: number) => {
    if (!confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/feedback/${feedbackId}?password=${encodeURIComponent(password)}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setFeedback(feedback.filter(f => f.id !== feedbackId));
      } else {
        alert('Failed to delete feedback');
      }
    } catch (error) {
      alert('Network error occurred');
    }
  };

  const makeUserPro = async (userId: number) => {
    if (!confirm('Make this user Pro?')) return;
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/make-pro/${userId}?password=${encodeURIComponent(password)}`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        loadAdminData(); // Refresh data
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to make user Pro');
      }
    } catch (error) {
      alert('Network error occurred');
    }
  };

  const removeUserPro = async (userId: number) => {
    if (!confirm('Remove Pro status from this user?')) return;
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/remove-pro/${userId}?password=${encodeURIComponent(password)}`,
        { method: 'DELETE' }
      );
      
      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        loadAdminData(); // Refresh data
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to remove Pro status');
      }
    } catch (error) {
      alert('Network error occurred');
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-2xl border border-border/40 shadow-xl">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="text-3xl font-bold text-foreground">Admin Access</h1>
            <p className="text-foreground/60 mt-2">Enter admin password to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="password">
                Admin Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-gradient-to-r from-teal-600 to-purple-600 text-white font-semibold rounded-lg hover:scale-105 transform transition-all duration-200 shadow-lg disabled:opacity-50 disabled:scale-100"
            >
              {loading ? 'Authenticating...' : 'Access Admin Dashboard'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
              <p className="text-foreground/60">Manage user feedback and system statistics</p>
            </div>
            <button
              onClick={populateFAQs}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-purple-600 text-white font-semibold rounded-lg hover:scale-105 transform transition-all duration-200 shadow-lg"
            >
              Populate FAQs
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card p-6 rounded-2xl border border-border/40">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total_feedback}</p>
                  <p className="text-sm text-foreground/60">Total Feedback</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card p-6 rounded-2xl border border-border/40">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total_faqs}</p>
                  <p className="text-sm text-foreground/60">FAQ Items</p>
                </div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border/40">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-foreground">Active</p>
                  <p className="text-sm text-foreground/60">System Status</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management */}
        <div className="bg-card rounded-2xl border border-border/40 overflow-hidden mb-8">
          <div className="p-6 border-b border-border/40">
            <h2 className="text-2xl font-bold text-foreground">User Management</h2>
            <p className="text-foreground/60">Manage user accounts and Pro subscriptions</p>
          </div>

          <div className="p-6">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-foreground/30 mb-4" />
                <p className="text-foreground/60">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left py-3 px-2 font-semibold text-foreground">User</th>
                      <th className="text-left py-3 px-2 font-semibold text-foreground">Status</th>
                      <th className="text-left py-3 px-2 font-semibold text-foreground">Usage</th>
                      <th className="text-left py-3 px-2 font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border/20 hover:bg-accent/30">
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium text-foreground">{user.email}</p>
                            <p className="text-sm text-foreground/60">ID: {user.id}</p>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            {user.is_pro ? (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-gray-500" />
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.is_pro 
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              {user.is_pro ? 'Pro' : 'Basic'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-foreground">
                            {user.is_pro ? 'Unlimited' : `${user.usage_count} remaining`}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            {user.is_pro ? (
                              <button
                                onClick={() => removeUserPro(user.id)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                title="Remove Pro status"
                              >
                                <UserX className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => makeUserPro(user.id)}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-md transition-colors"
                                title="Make Pro"
                              >
                                <Crown className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-card rounded-2xl border border-border/40 overflow-hidden">
          <div className="p-6 border-b border-border/40">
            <h2 className="text-2xl font-bold text-foreground">User Feedback</h2>
            <p className="text-foreground/60">Review and manage user submissions</p>
          </div>

          <div className="p-6">
            {feedback.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-foreground/30 mb-4" />
                <p className="text-foreground/60">No feedback submitted yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedback.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border border-border/20 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {item.feedback_type}
                          </span>
                        </div>
                        <p className="text-foreground/80 whitespace-pre-wrap">{item.content}</p>
                      </div>
                      <button
                        onClick={() => deleteFeedback(item.id)}
                        className="ml-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Delete feedback"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}