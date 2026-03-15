'use client';

import { motion } from 'framer-motion';
import { Gift, Users, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ReferralCard() {
  return (
    <Link href="/refer">
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 p-6 shadow-xl cursor-pointer group"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Sparkle Decorations */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-4 right-4"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </motion.div>

        <div className="relative z-10 flex items-start gap-4">
          {/* 3D Gift Icon */}
          <motion.div
            animate={{
              y: [0, -8, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="flex-shrink-0"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
                <Gift className="w-10 h-10 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-bold text-white">
                ชวนเพื่อนรับ 50 แต้ม!
              </h3>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5 text-white" />
              </motion.div>
            </div>
            
            <p className="text-white/90 text-sm font-medium mb-3">
              Give your friend a head start, and earn rewards yourself
            </p>

            {/* Stats Row */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Users className="w-4 h-4 text-white" />
                <span className="text-xs font-bold text-white">แชร์ง่าย</span>
              </div>
              
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-xs font-bold text-white">คุ้มทั้งสองฝ่าย</span>
              </div>
            </div>

            {/* CTA Text */}
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-4 inline-flex items-center gap-2 text-white font-bold text-sm"
            >
              <span>แตะเพื่อเริ่มชวนเพื่อน</span>
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </div>
        </div>

        {/* Shimmer Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
        </div>
      </motion.div>
    </Link>
  );
}
