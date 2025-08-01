'use client';

import { useState } from 'react';
import { X, Zap, Eye, Users, ArrowRight } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
  onTrySample: () => void;
}

export default function WelcomeModal({ isOpen, onClose, onStartTour, onTrySample }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "Welcome to DashAway",
      content: (
        <div className="text-center">
          <div className="mb-6">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-teal-100 to-purple-100 dark:from-teal-900/30 dark:to-purple-900/30 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-700 mb-4">
              🤖 Turn AI Content Into Human Writing
            </div>
            <h2 className="text-2xl font-bold mb-4">They&apos;ll Never Know AI Wrote It</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Transform ChatGPT, Claude, and other AI-generated content into authentic human writing. 
              Remove em-dashes, robotic phrases, and AI &quot;tells&quot; that make your content sound fake.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "What DashAway Detects",
      content: (
        <div>
          <h3 className="text-xl font-bold mb-4 text-center">The Biggest AI Tells We Fix</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700">
              <Zap className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-teal-800 dark:text-teal-200">Em-Dashes (Biggest Tell)</h4>
                <p className="text-sm text-teal-700 dark:text-teal-300">ChatGPT and Claude overuse em-dashes—we catch every one and suggest better punctuation.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700">
              <Eye className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-purple-800 dark:text-purple-200">Robotic Phrases</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">Phrases like &quot;delve into,&quot; &quot;furthermore,&quot; and &quot;in conclusion&quot; that scream AI-generated.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700">
              <Users className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-orange-800 dark:text-orange-200">Corporate Jargon & Clichés</h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">Replace &quot;utilize&quot; with &quot;use&quot; and eliminate overused business buzzwords.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Get Started?",
      content: (
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4">Choose Your Learning Path</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Jump right in with sample AI content, or take a quick tour to learn all the features.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={onTrySample}
              className="flex flex-col items-center p-4 rounded-lg border-2 border-teal-200 dark:border-teal-700 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all"
            >
              <Zap className="h-8 w-8 text-teal-600 mb-2" />
              <h4 className="font-semibold mb-1">Try Sample Content</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                See DashAway in action with pre-loaded AI content
              </p>
            </button>
            <button
              onClick={onStartTour}
              className="flex flex-col items-center p-4 rounded-lg border-2 border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
            >
              <Eye className="h-8 w-8 text-purple-600 mb-2" />
              <h4 className="font-semibold mb-1">Take the Tour</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Learn all features with a guided walkthrough
              </p>
            </button>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-teal-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {steps[currentStep].content}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {currentStep > 0 ? (
              <button
                onClick={handlePrev}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
              >
                Previous
              </button>
            ) : (
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
              >
                Skip Tour
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-teal-600 to-purple-600 text-white font-semibold rounded-lg hover:from-teal-500 hover:to-purple-500 transition-all duration-200"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSkip}
                className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-teal-600 to-purple-600 text-white font-semibold rounded-lg hover:from-teal-500 hover:to-purple-500 transition-all duration-200"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}