import React from 'react';
import { motion } from 'framer-motion';

/**
 * Ilustraciones SVG para estados vacíos
 */

export const EmptyRoutinesIllustration = () => (
  <motion.svg 
    width="200" 
    height="200" 
    viewBox="0 0 200 200" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <motion.circle 
      cx="100" 
      cy="100" 
      r="80" 
      fill="#E5E7EB" 
      fillOpacity="0.3"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <rect x="60" y="70" width="80" height="60" rx="8" fill="#9CA3AF" fillOpacity="0.2" />
    <rect x="70" y="80" width="60" height="8" rx="4" fill="#9CA3AF" fillOpacity="0.4" />
    <rect x="70" y="95" width="40" height="8" rx="4" fill="#9CA3AF" fillOpacity="0.4" />
    <motion.circle 
      cx="85" 
      cy="120" 
      r="8" 
      fill="#9CA3AF" 
      fillOpacity="0.3"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
    />
    <motion.circle 
      cx="105" 
      cy="120" 
      r="8" 
      fill="#9CA3AF" 
      fillOpacity="0.3"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
    />
    <motion.circle 
      cx="125" 
      cy="120" 
      r="8" 
      fill="#9CA3AF" 
      fillOpacity="0.3"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
    />
  </motion.svg>
);

export const EmptyExercisesIllustration = () => (
  <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="80" fill="#E5E7EB" fillOpacity="0.3" />
    <rect x="70" y="60" width="60" height="80" rx="8" fill="#9CA3AF" fillOpacity="0.2" />
    <circle cx="100" cy="80" r="12" fill="#9CA3AF" fillOpacity="0.4" />
    <rect x="85" y="100" width="30" height="30" rx="4" fill="#9CA3AF" fillOpacity="0.3" />
  </svg>
);

export const EmptyFoodsIllustration = () => (
  <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="80" fill="#E5E7EB" fillOpacity="0.3" />
    <circle cx="100" cy="90" r="25" fill="#9CA3AF" fillOpacity="0.2" />
    <path d="M85 110 L100 130 L115 110" stroke="#9CA3AF" strokeWidth="3" strokeOpacity="0.4" fill="none" />
  </svg>
);

export const EmptyClientsIllustration = () => (
  <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="80" fill="#E5E7EB" fillOpacity="0.3" />
    <circle cx="80" cy="80" r="15" fill="#9CA3AF" fillOpacity="0.3" />
    <circle cx="120" cy="80" r="15" fill="#9CA3AF" fillOpacity="0.3" />
    <path d="M70 120 Q100 100 130 120" stroke="#9CA3AF" strokeWidth="3" strokeOpacity="0.3" fill="none" />
  </svg>
);

export const EmptyWeightIllustration = () => (
  <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="80" fill="#E5E7EB" fillOpacity="0.3" />
    <rect x="85" y="60" width="30" height="80" rx="4" fill="#9CA3AF" fillOpacity="0.2" />
    <circle cx="100" cy="70" r="8" fill="#9CA3AF" fillOpacity="0.4" />
    <line x1="100" y1="80" x2="100" y2="130" stroke="#9CA3AF" strokeWidth="2" strokeOpacity="0.3" />
  </svg>
);

