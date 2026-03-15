'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/data/profileData';
import { Lock, CheckCircle } from 'lucide-react';

interface BadgeGridProps {
  badges: Badge[];
}

export default function BadgeGrid({ badges }: BadgeGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        
        return (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative group"
          >
            {/* Badge Container */}
            <div
              className={`
                relative rounded-2xl p-6 transition-all duration-300
                ${badge.unlocked
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-2 hover:scale-105'
                  : 'bg-gray-900/50 border-2 border-gray-700/50'
                }
              `}
              style={{
                borderColor: badge.unlocked ? `${badge.color}50` : undefined,
              }}
            >
              {/* Glow Effect for Unlocked */}
              {badge.unlocked && (
                <div
                  className="absolute inset-0 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity"
                  style={{ backgroundColor: badge.color }}
                />
              )}

              {/* Hexagon Icon Container */}
              <div className="relative flex flex-col items-center">
                <motion.div
                  whileHover={{ rotate: badge.unlocked ? 360 : 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative w-20 h-20 mb-4"
                >
                  {/* Hexagon Background */}
                  <div
                    className={`
                      w-full h-full flex items-center justify-center
                      ${badge.unlocked ? 'hexagon-unlocked' : 'hexagon-locked'}
                    `}
                    style={{
                      backgroundColor: badge.unlocked ? badge.color : '#374151',
                    }}
                  >
                    {badge.unlocked ? (
                      <Icon className="w-10 h-10 text-white relative z-10" />
                    ) : (
                      <Lock className="w-10 h-10 text-gray-500 relative z-10" />
                    )}
                  </div>

                  {/* Checkmark for Unlocked */}
                  {badge.unlocked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.div>

                {/* Badge Name */}
                <h3
                  className={`
                    font-bold text-center mb-2
                    ${badge.unlocked ? 'text-white' : 'text-gray-500'}
                  `}
                >
                  {badge.name}
                </h3>

                {/* Description */}
                <p
                  className={`
                    text-xs text-center
                    ${badge.unlocked ? 'text-gray-400' : 'text-gray-600'}
                  `}
                >
                  {badge.description}
                </p>

                {/* Unlocked Date */}
                {badge.unlocked && badge.unlockedDate && (
                  <p className="text-xs text-gray-500 mt-2">
                    Unlocked {new Date(badge.unlockedDate).toLocaleDateString()}
                  </p>
                )}

                {/* Requirement for Locked */}
                {!badge.unlocked && (
                  <p className="text-xs text-gray-600 mt-2 italic">
                    🔒 {badge.requirement}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}

      <style jsx>{`
        .hexagon-unlocked,
        .hexagon-locked {
          clip-path: polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%);
          position: relative;
        }
        
        .hexagon-unlocked::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: inherit;
          clip-path: polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%);
          filter: blur(8px);
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}
