'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export default function GameificationEventListener() {
  useEffect(() => {
    const handleXpGained = (event: any) => {
      const { amount, newXp } = event.detail;
      toast.success(
        <div className="flex items-center gap-2">
          <span>⭐</span>
          <div>
            <div className="font-bold">+{amount} XP</div>
            <div className="text-xs opacity-75">Total: {newXp.toLocaleString()} XP</div>
          </div>
        </div>,
        { duration: 2000 }
      );
    };

    const handleCoinsGained = (event: any) => {
      const { amount, newCoins } = event.detail;
      toast.success(
        <div className="flex items-center gap-2">
          <span>💰</span>
          <div>
            <div className="font-bold">+{amount} Coins</div>
            <div className="text-xs opacity-75">Total: {newCoins.toLocaleString()} coins</div>
          </div>
        </div>,
        { duration: 2000 }
      );
    };

    const handleLevelUp = (event: any) => {
      const { level } = event.detail;
      toast.success(
        <div className="flex items-center gap-2 text-lg">
          <span>🎉</span>
          <div>
            <div className="font-bold">Level Up!</div>
            <div className="text-sm">You are now Level {level}!</div>
          </div>
        </div>,
        { duration: 3000 }
      );
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('xpGained', handleXpGained);
      window.addEventListener('coinsGained', handleCoinsGained);
      window.addEventListener('levelUp', handleLevelUp);

      return () => {
        window.removeEventListener('xpGained', handleXpGained);
        window.removeEventListener('coinsGained', handleCoinsGained);
        window.removeEventListener('levelUp', handleLevelUp);
      };
    }
  }, []);

  return null;
}
