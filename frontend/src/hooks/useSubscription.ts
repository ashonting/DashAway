import { useState, useEffect, useCallback } from 'react';
import { paddleService, SubscriptionInfo } from '@/services/paddleService';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface UseSubscriptionReturn {
  subscriptionInfo: SubscriptionInfo | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  createCheckout: (tier: string, billingCycle: string) => Promise<void>;
  cancelSubscription: (immediate?: boolean) => Promise<void>;
  isSubscribed: boolean;
  canUseService: boolean;
  usagePercentage: number;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const { user } = useSupabaseAuth();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSubscription = useCallback(async () => {
    if (!user) {
      setSubscriptionInfo(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const info = await paddleService.getSubscriptionInfo();
      setSubscriptionInfo(info);
    } catch (err) {
      console.error('Error fetching subscription info:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscription info');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createCheckout = useCallback(async (tier: string, billingCycle: string) => {
    if (!user) {
      throw new Error('Please log in to subscribe');
    }

    setLoading(true);
    setError(null);

    try {
      const checkoutResponse = await paddleService.createCheckout(tier, billingCycle);
      paddleService.redirectToCheckout(checkoutResponse.checkout_url);
    } catch (err) {
      console.error('Error creating checkout:', err);
      setError(err instanceof Error ? err.message : 'Failed to create checkout');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const cancelSubscription = useCallback(async (immediate: boolean = false) => {
    if (!user || !subscriptionInfo?.is_subscribed) {
      throw new Error('No active subscription to cancel');
    }

    setLoading(true);
    setError(null);

    try {
      await paddleService.cancelSubscription(immediate);
      // Refresh subscription info after cancellation
      await refreshSubscription();
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, subscriptionInfo, refreshSubscription]);

  // Load subscription info when user changes
  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  // Computed values
  const isSubscribed = subscriptionInfo?.is_subscribed || false;
  const canUseService = !subscriptionInfo || 
    subscriptionInfo.usage_count < subscriptionInfo.usage_limit || 
    subscriptionInfo.usage_limit === -1 || 
    subscriptionInfo.usage_limit > 999999;

  const usagePercentage = subscriptionInfo 
    ? Math.min((subscriptionInfo.usage_count / subscriptionInfo.usage_limit) * 100, 100)
    : 0;

  return {
    subscriptionInfo,
    loading,
    error,
    refreshSubscription,
    createCheckout,
    cancelSubscription,
    isSubscribed,
    canUseService,
    usagePercentage
  };
};