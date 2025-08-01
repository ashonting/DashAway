'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface OnboardingContextType {
  showWelcomeModal: () => void;
  showProductTour: () => void;
  showSampleContent: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [triggerWelcome, setTriggerWelcome] = useState(0);
  const [triggerTour, setTriggerTour] = useState(0);
  const [triggerSample, setTriggerSample] = useState(0);

  const showWelcomeModal = () => {
    setTriggerWelcome(prev => prev + 1);
  };

  const showProductTour = () => {
    setTriggerTour(prev => prev + 1);
  };

  const showSampleContent = () => {
    setTriggerSample(prev => prev + 1);
  };

  return (
    <OnboardingContext.Provider value={{
      showWelcomeModal,
      showProductTour,
      showSampleContent
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

// Custom hook for the home page to listen to onboarding triggers
export function useOnboardingTriggers() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showProductTour, setShowProductTour] = useState(false);
  const [showSampleContent, setShowSampleContent] = useState(false);

  return {
    showWelcomeModal,
    setShowWelcomeModal,
    showProductTour,
    setShowProductTour,
    showSampleContent,
    setShowSampleContent,
    triggerWelcome: () => setShowWelcomeModal(true),
    triggerTour: () => setShowProductTour(true),
    triggerSample: () => setShowSampleContent(true)
  };
}