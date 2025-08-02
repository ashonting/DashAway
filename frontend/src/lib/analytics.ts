'use client';

import React from 'react';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: Date;
  userId?: string;
  sessionId?: string;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private isEnabled: boolean = true;
  private endpoint: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/events`;
    
    // Check if user has opted out of analytics
    if (typeof window !== 'undefined') {
      this.isEnabled = localStorage.getItem('analytics-opt-out') !== 'true';
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  clearUserId() {
    this.userId = undefined;
  }

  optOut() {
    this.isEnabled = false;
    if (typeof window !== 'undefined') {
      localStorage.setItem('analytics-opt-out', 'true');
    }
  }

  optIn() {
    this.isEnabled = true;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('analytics-opt-out');
    }
  }

  track(name: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name,
      properties: {
        ...properties,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId,
    };

    this.events.push(event);
    this.sendEvent(event);
  }

  private async sendEvent(event: AnalyticsEvent) {
    try {
      // In development, just log to console
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics Event:', event);
        return;
      }

      // Send to backend in production
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  }

  // Convenience methods for common events
  pageView(page: string, properties?: Record<string, any>) {
    this.track('page_view', {
      page,
      ...properties,
    });
  }

  buttonClick(buttonName: string, location?: string) {
    this.track('button_click', {
      button_name: buttonName,
      location,
    });
  }

  formSubmit(formName: string, success: boolean = true) {
    this.track('form_submit', {
      form_name: formName,
      success,
    });
  }

  featureUsed(featureName: string, properties?: Record<string, any>) {
    this.track('feature_used', {
      feature_name: featureName,
      ...properties,
    });
  }

  textAnalyzed(textLength: number, analysisType: string, processingTime?: number) {
    this.track('text_analyzed', {
      text_length: textLength,
      analysis_type: analysisType,
      processing_time: processingTime,
    });
  }

  userSignup(method: 'email' | 'google' | 'other') {
    this.track('user_signup', {
      signup_method: method,
    });
  }

  userLogin(method: 'email' | 'google' | 'other') {
    this.track('user_login', {
      login_method: method,
    });
  }

  subscriptionEvent(action: 'view_pricing' | 'start_checkout' | 'complete_purchase' | 'cancel', plan?: string) {
    this.track('subscription_event', {
      action,
      plan,
    });
  }

  errorOccurred(errorType: string, errorMessage: string, page: string) {
    this.track('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
      page,
    });
  }

  // Get analytics summary for current session
  getSessionSummary() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      eventCount: this.events.length,
      events: this.events,
    };
  }
}

// Create singleton instance
export const analytics = new Analytics();

// React hook for analytics
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    pageView: analytics.pageView.bind(analytics),
    buttonClick: analytics.buttonClick.bind(analytics),
    formSubmit: analytics.formSubmit.bind(analytics),
    featureUsed: analytics.featureUsed.bind(analytics),
    textAnalyzed: analytics.textAnalyzed.bind(analytics),
    userSignup: analytics.userSignup.bind(analytics),
    userLogin: analytics.userLogin.bind(analytics),
    subscriptionEvent: analytics.subscriptionEvent.bind(analytics),
    errorOccurred: analytics.errorOccurred.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
    clearUserId: analytics.clearUserId.bind(analytics),
    optOut: analytics.optOut.bind(analytics),
    optIn: analytics.optIn.bind(analytics),
  };
}

// Higher-order component to track page views automatically
export function withPageTracking<T extends object>(
  Component: React.ComponentType<T>,
  pageName: string
) {
  return function TrackedComponent(props: T) {
    const analyticsHook = useAnalytics();

    React.useEffect(() => {
      analyticsHook.pageView(pageName);
    }, [analyticsHook]);

    return React.createElement(Component, props);
  };
}

// Component to handle analytics initialization
export function AnalyticsProvider({ children, userId }: { children: React.ReactNode; userId?: string }) {
  React.useEffect(() => {
    if (userId) {
      analytics.setUserId(userId);
    } else {
      analytics.clearUserId();
    }
  }, [userId]);

  return React.createElement(React.Fragment, null, children);
}