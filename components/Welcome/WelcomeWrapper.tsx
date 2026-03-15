'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import SplashScreen from './SplashScreen';
import Onboarding from './Onboarding';

interface WelcomeWrapperProps {
  children: React.ReactNode;
}

export default function WelcomeWrapper({ children }: WelcomeWrapperProps) {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    
    if (!hasSeenOnboarding) {
      // First-time user: Show splash → onboarding
      setShowOnboarding(true);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    
    // If first-time user, keep showing onboarding
    // Otherwise, go straight to content
    if (!showOnboarding) {
      setIsReady(true);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setIsReady(true);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen key="splash" onComplete={handleSplashComplete} />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!showSplash && showOnboarding && (
          <Onboarding key="onboarding" onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      {/* Main Content - Hidden until ready */}
      <div style={{ opacity: isReady ? 1 : 0, transition: 'opacity 0.5s' }}>
        {children}
      </div>
    </>
  );
}
