'use client';

import { useAuth } from '@/contexts/AuthContext';
import { X, Crown, Zap, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAnonymous?: boolean;
}

export default function UpgradeModal({ isOpen, onClose, isAnonymous = true }: UpgradeModalProps) {
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card rounded-2xl border border-border/40 shadow-2xl p-8 max-w-md w-full mx-4 transform animate-in fade-in-0 zoom-in-95">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <X className="h-4 w-4 text-foreground/60" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-teal-400 to-purple-600 rounded-full flex items-center justify-center mb-4">
            {isAnonymous ? <Zap className="h-8 w-8 text-white" /> : <Crown className="h-8 w-8 text-white" />}
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {isAnonymous ? 'You\'ve Used Your Free Try!' : 'Monthly Limit Reached'}
          </h2>
          
          <p className="text-foreground/60">
            {isAnonymous 
              ? 'Sign up for a free account to get 2 cleanings per month, or upgrade to Pro for unlimited access.'
              : 'You\'ve used your 2 monthly cleanings. Upgrade to Pro for unlimited text cleaning.'
            }
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-sm text-foreground">Unlimited text cleanings</span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-sm text-foreground">Document history & analytics</span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-sm text-foreground">Priority support</span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-sm text-foreground">Advanced features (coming soon)</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {isAnonymous && (
            <Link 
              href="/register"
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-teal-600 to-purple-600 text-white font-semibold rounded-lg hover:scale-105 transform transition-all duration-200 shadow-lg"
            >
              Sign Up Free
            </Link>
          )}
          
          <Link 
            href="/pricing"
            className={`w-full inline-flex items-center justify-center px-4 py-2 font-semibold rounded-lg transition-all duration-200 ${
              isAnonymous 
                ? 'border border-primary text-primary hover:bg-primary hover:text-white'
                : 'bg-gradient-to-r from-teal-600 to-purple-600 text-white hover:scale-105 transform shadow-lg'
            }`}
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Pro - $4/month
          </Link>
          
          <button 
            onClick={onClose}
            className="w-full px-4 py-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}