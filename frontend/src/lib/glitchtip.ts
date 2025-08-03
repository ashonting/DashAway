'use client';

import React from 'react';
import * as Sentry from '@sentry/nextjs';

// Initialize Sentry (GlitchTip is Sentry-compatible)
export function initGlitchTip() {
  if (!process.env.NEXT_PUBLIC_GLITCHTIP_DSN) {
    console.warn('GlitchTip DSN not configured');
    return;
  }

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_GLITCHTIP_DSN,
    
    // Set environment
    environment: process.env.NODE_ENV || 'development',
    
    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Session replay (optional, uses more resources)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Error filtering
    beforeSend(event, hint) {
      // Don't send errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error captured by GlitchTip:', event);
        return null;
      }
      
      // Filter out common non-critical errors
      const error = hint.originalException;
      if (error && typeof error === 'object') {
        const message = 'message' in error ? error.message : '';
        
        // Skip network errors that are likely user issues
        if (typeof message === 'string') {
          if (message.includes('Network Error') || 
              message.includes('Failed to fetch') ||
              message.includes('ERR_NETWORK') ||
              message.includes('ERR_INTERNET_DISCONNECTED')) {
            return null;
          }
        }
      }
      
      return event;
    },
    
    // Additional options
    integrations: [
      // Add performance monitoring
      Sentry.browserTracingIntegration(),
      // Add session replay (optional)
      Sentry.replayIntegration(),
    ],
  });
}

// Helper functions for manual error reporting
export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach(key => {
        scope.setContext(key, context[key]);
      });
    }
    Sentry.captureException(error);
  });
}

export function captureMessage(message: string, level: 'error' | 'warning' | 'info' = 'info') {
  Sentry.captureMessage(message, level);
}

export function setUserContext(user: { id: string; email?: string; [key: string]: any }) {
  Sentry.setUser(user);
}

export function addBreadcrumb(message: string, category: string = 'custom', data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    timestamp: Date.now() / 1000,
  });
}

// Error boundary component (simplified to avoid TypeScript issues)
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>
) {
  return Sentry.withErrorBoundary(Component, {
    fallback: ({ error, resetError }) => 
      React.createElement('div', { 
        className: "min-h-screen flex items-center justify-center bg-gray-50" 
      },
        React.createElement('div', { className: "text-center" },
          React.createElement('h2', { 
            className: "text-xl font-bold text-gray-900 mb-4" 
          }, "Something went wrong"),
          React.createElement('p', { 
            className: "text-gray-600 mb-4" 
          }, "An error occurred while loading this page."),
          React.createElement('button', {
            onClick: resetError,
            className: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          }, "Try again")
        )
      ),
    beforeCapture: (scope, error) => {
      scope.setTag('errorBoundary', true);
    },
  });
}