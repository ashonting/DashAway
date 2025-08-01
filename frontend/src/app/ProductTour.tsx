'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Target, Zap, Eye, BarChart3, Download } from 'lucide-react';

interface ProductTourProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TourStep {
  title: string;
  content: string;
  targetSelector?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon: React.ReactNode;
}

const tourSteps: TourStep[] = [
  {
    title: "Welcome to DashAway",
    content: "Let&apos;s take a quick tour of the features that will help you transform AI-generated content into authentic human writing.",
    position: 'center',
    icon: <Target className="h-6 w-6" />
  },
  {
    title: "Paste Your AI Content",
    content: "Start by pasting any AI-generated text from ChatGPT, Claude, or other AI tools into this input area. We&apos;ll analyze it for AI tells instantly.",
    targetSelector: 'textarea',
    position: 'right',
    icon: <Zap className="h-6 w-6" />
  },
  {
    title: "Humanize AI Content",
    content: "Click this button (or press Ctrl+Enter) to analyze your text. We&apos;ll detect em-dashes, robotic phrases, jargon, and other AI fingerprints.",
    targetSelector: 'button[aria-label*="Analyze text"]',
    position: 'top',
    icon: <Eye className="h-6 w-6" />
  },
  {
    title: "Review Highlighted Issues",
    content: "AI tells will appear highlighted in different colors. Click any highlight to see replacement suggestions and improve your text instantly.",
    targetSelector: '[data-tour="output"]',
    position: 'left',
    icon: <BarChart3 className="h-6 w-6" />
  },
  {
    title: "Track Your Progress",
    content: "These stats show exactly what AI tells we found - em-dashes (the biggest giveaway), clichés, jargon, and robotic phrases.",
    targetSelector: '[data-tour="stats"]',
    position: 'top',
    icon: <BarChart3 className="h-6 w-6" />
  },
  {
    title: "Export Clean Content",
    content: "Once you&apos;re happy with the results, copy to clipboard or export as TXT/DOCX files. Your content is now ready to use confidently as your own work.",
    targetSelector: 'button:has-text("Copy to Clipboard")',
    position: 'top',
    icon: <Download className="h-6 w-6" />
  }
];

export default function ProductTour({ isOpen, onClose }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const updateTooltipPosition = () => {
      const step = tourSteps[currentStep];
      if (!step.targetSelector || step.position === 'center') {
        return;
      }

      const targetElement = document.querySelector(step.targetSelector);
      if (targetElement && tooltipRef.current) {
        const targetRect = targetElement.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        
        let top = 0;
        let left = 0;

        switch (step.position) {
          case 'top':
            top = targetRect.top - tooltipRect.height - 10;
            left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
            break;
          case 'bottom':
            top = targetRect.bottom + 10;
            left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
            break;
          case 'left':
            top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
            left = targetRect.left - tooltipRect.width - 10;
            break;
          case 'right':
            top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
            left = targetRect.right + 10;
            break;
        }

        // Keep tooltip within viewport
        const viewport = {
          width: window.innerWidth,
          height: window.innerHeight
        };

        if (left < 10) left = 10;
        if (left + tooltipRect.width > viewport.width - 10) {
          left = viewport.width - tooltipRect.width - 10;
        }
        if (top < 10) top = 10;
        if (top + tooltipRect.height > viewport.height - 10) {
          top = viewport.height - tooltipRect.height - 10;
        }

        setTooltipPosition({ top, left });
      }
    };

    // Initial position calculation
    setTimeout(updateTooltipPosition, 100);

    // Update position on resize
    window.addEventListener('resize', updateTooltipPosition);
    return () => window.removeEventListener('resize', updateTooltipPosition);
  }, [currentStep, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const step = tourSteps[currentStep];
    if (step.targetSelector && step.position !== 'center') {
      const targetElement = document.querySelector(step.targetSelector) as HTMLElement;
      if (targetElement) {
        // Add highlight to target element
        targetElement.style.position = 'relative';
        targetElement.style.zIndex = '1000';
        targetElement.style.boxShadow = '0 0 0 4px rgba(20, 184, 166, 0.5), 0 0 20px rgba(20, 184, 166, 0.3)';
        targetElement.style.borderRadius = '8px';

        // Scroll target into view
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });

        return () => {
          // Remove highlight
          targetElement.style.position = '';
          targetElement.style.zIndex = '';
          targetElement.style.boxShadow = '';
          targetElement.style.borderRadius = '';
        };
      }
    }
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
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

  const currentTourStep = tourSteps[currentStep];
  const isCenter = currentTourStep.position === 'center';

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`fixed z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-sm w-full transition-all duration-300 ${
          isCenter ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' : ''
        }`}
        style={!isCenter ? { top: tooltipPosition.top, left: tooltipPosition.left } : {}}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-teal-500 to-purple-600 rounded-lg text-white">
              {currentTourStep.icon}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{currentTourStep.title}</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Step {currentStep + 1} of {tourSteps.length}
              </span>
            </div>
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
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {currentTourStep.content}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {currentStep > 0 ? (
              <button
                onClick={handlePrev}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
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
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-teal-600 to-purple-600 text-white font-semibold rounded-lg hover:from-teal-500 hover:to-purple-500 transition-all duration-200"
            >
              {currentStep === tourSteps.length - 1 ? (
                <>
                  Finish Tour
                  <Target className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}