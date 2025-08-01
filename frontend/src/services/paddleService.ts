// Frontend Paddle Integration Service
import { supabase } from '@/lib/supabase';

interface PaddleCheckoutResponse {
  checkout_url: string;
  checkout_id: string;
}

interface SubscriptionInfo {
  is_subscribed: boolean;
  tier: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  usage_limit: number;
  usage_count: number;
}

interface PricingConfig {
  [tier: string]: {
    name: string;
    monthly: {
      price: number;
      currency: string;
      features: string[];
    };
    yearly: {
      price: number;
      currency: string;
      features: string[];
    };
  };
}

class PaddleService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  private async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authentication token found');
    }

    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  async createCheckout(tier: string, billingCycle: string): Promise<PaddleCheckoutResponse> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/api/paddle/create-checkout?tier=${tier}&billing_cycle=${billingCycle}`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  }

  async getSubscriptionInfo(): Promise<SubscriptionInfo> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/api/paddle/subscription-info`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting subscription info:', error);
      throw error;
    }
  }

  async cancelSubscription(immediate: boolean = false): Promise<{ message: string }> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/api/paddle/cancel-subscription`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          subscription_id: '', // Will be resolved by backend
          action: immediate ? 'cancel_immediately' : 'cancel'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  async getPricingConfig(): Promise<PricingConfig> {
    try {
      const response = await fetch(`${this.baseUrl}/api/paddle/pricing-config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting pricing config:', error);
      // Return fallback config
      return {
        pro: {
          name: "Pro",
          monthly: {
            price: 4,
            currency: "USD",
            features: [
              "Unlimited document cleanings",
              "Em-dash detection & removal (biggest AI tell)",
              "Advanced AI phrase detection", 
              "Priority support",
              "Export to multiple formats"
            ]
          },
          yearly: {
            price: 48,
            currency: "USD",
            features: [
              "Unlimited document cleanings",
              "Advanced text analysis",
              "Priority support",
              "Export to multiple formats"
            ]
          }
        }
      };
    }
  }

  // Utility function to redirect to checkout
  redirectToCheckout(checkoutUrl: string) {
    window.location.href = checkoutUrl;
  }

  // Handle checkout success/failure callbacks
  handleCheckoutCallback(searchParams: URLSearchParams) {
    const checkout = searchParams.get('checkout');
    
    if (checkout === 'success') {
      return {
        success: true,
        message: 'Thank you for your subscription! Your account has been upgraded.'
      };
    } else if (checkout === 'cancelled') {
      return {
        success: false,
        message: 'Checkout was cancelled. You can try again anytime.'
      };
    }
    
    return null;
  }
}

export const paddleService = new PaddleService();
export type { SubscriptionInfo, PricingConfig };