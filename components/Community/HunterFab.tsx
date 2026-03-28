'use client';

import { useState, useEffect } from 'react';
import { CameraIcon, PlusIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

interface HunterFabProps {
  onClick: () => void;
}

export default function HunterFab({ onClick }: HunterFabProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.button
      onClick={onClick}
      className={`
        fixed z-[1000] bg-gradient-to-r from-orange-500 to-red-500 
        text-white shadow-lg flex items-center justify-center gap-2
        transition-all duration-300 hover:shadow-orange-300/40
        ${isScrolled 
          ? 'bottom-6 right-6 w-12 h-12 rounded-full' 
          : 'bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 px-5 py-3 rounded-full'
        }
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {/* Pulse animation */}
      <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
      
      <CameraIcon className={`relative ${isScrolled ? 'w-6 h-6' : 'w-5 h-5'}`} />
      
      <AnimatePresence>
        {!isScrolled && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="relative font-bold text-sm whitespace-nowrap"
          >
            Post Deal
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
