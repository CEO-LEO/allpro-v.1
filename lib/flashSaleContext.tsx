'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface FlashSale {
  productId: string | number;
  productName: string;
  originalPrice: number;
  flashPrice: number;
  discountRate: number;
  endTime: Date;
  claimedPercentage: number;
  location: string;
}

interface FlashSaleContextType {
  activeFlashSales: Map<string | number, FlashSale>;
  startFlashSale: (sale: FlashSale) => void;
  endFlashSale: (productId: string | number) => void;
  isFlashSale: (productId: string | number) => boolean;
  getFlashSale: (productId: string | number) => FlashSale | undefined;
  getAllActiveFlashSales: () => FlashSale[];
}

const FlashSaleContext = createContext<FlashSaleContextType | undefined>(undefined);

export function FlashSaleProvider({ children }: { children: ReactNode }) {
  const [activeFlashSales, setActiveFlashSales] = useState<Map<string | number, FlashSale>>(new Map());
  const intervalRefs = React.useRef<Map<string | number, NodeJS.Timeout>>(new Map());

  // Mock initial flash sales for demo
  useEffect(() => {
    const mockFlashSales = new Map<string | number, FlashSale>();
    
    // Add a demo flash sale (expires in 1 hour)
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 1);
    
    mockFlashSales.set(1, {
      productId: 1,
      productName: 'โดนัท Krispy Kreme แถม 1 Free',
      originalPrice: 99,
      flashPrice: 49,
      discountRate: 50,
      endTime: endTime,
      claimedPercentage: 67,
      location: 'Siam Paragon'
    });

    setActiveFlashSales(mockFlashSales);

    // Clean up expired flash sales every minute
    const interval = setInterval(() => {
      const now = new Date();
      setActiveFlashSales(prev => {
        const updated = new Map(prev);
        let hasExpired = false;

        updated.forEach((sale, productId) => {
          if (sale.endTime <= now) {
            updated.delete(productId);
            hasExpired = true;
            
            toast.success(
              `⏰ Flash Sale สิ้นสุดแล้ว: ${sale.productName}`,
              { duration: 4000 }
            );
          }
        });

        return hasExpired ? updated : prev;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const startFlashSale = (sale: FlashSale) => {
    setActiveFlashSales(prev => {
      const updated = new Map(prev);
      updated.set(sale.productId, sale);
      return updated;
    });

    // Send "Red Alert" notification to nearby users
    sendFlashNotification(sale);

    // Increase claimed percentage gradually (simulation)
    simulateClaimedIncrease(sale.productId);
  };

  const endFlashSale = (productId: string | number) => {
    setActiveFlashSales(prev => {
      const updated = new Map(prev);
      updated.delete(productId);
      return updated;
    });
  };

  const isFlashSale = (productId: string | number): boolean => {
    return activeFlashSales.has(productId);
  };

  const getFlashSale = (productId: string | number): FlashSale | undefined => {
    return activeFlashSales.get(productId);
  };

  const getAllActiveFlashSales = (): FlashSale[] => {
    return Array.from(activeFlashSales.values());
  };

  // Send high-priority notification to nearby users
  const sendFlashNotification = (sale: FlashSale) => {
    const timeRemaining = Math.floor((sale.endTime.getTime() - Date.now()) / 60000);
    
    // Simulate sending notifications to nearby users
    setTimeout(() => {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-gradient-to-r from-red-600 to-orange-600 shadow-2xl rounded-2xl p-4 pointer-events-auto flex gap-3`}
          >
            <div className="flex-shrink-0 text-3xl">⚡</div>
            <div className="flex-1">
              <div className="font-bold text-white text-lg mb-1">
                🚨 FLASH SALE ใกล้คุณ!
              </div>
              <div className="text-white/90 text-sm font-medium mb-2">
                {sale.productName}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white text-lg font-bold">
                  {sale.discountRate}% OFF
                </span>
                <span className="text-white/90 text-xs">
                  📍 {sale.location}
                </span>
              </div>
              <div className="mt-2 text-white/80 text-xs">
                สิ้นสุดใน {timeRemaining} นาที
              </div>
            </div>
          </div>
        ),
        {
          duration: 8000,
          position: 'top-center',
        }
      );

      // Play sound effect (concept - would need actual audio)
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.2 },
        colors: ['#FF5722', '#FF9800']
      });
    }, 500);
  };

  // Simulate claimed percentage increasing over time
  const simulateClaimedIncrease = (productId: string | number) => {
    // Clean up any existing interval for this product
    const existingInterval = intervalRefs.current.get(productId);
    if (existingInterval) clearInterval(existingInterval);

    const interval = setInterval(() => {
      setActiveFlashSales(prev => {
        const updated = new Map(prev);
        const sale = updated.get(productId);
        
        if (sale && sale.claimedPercentage < 95) {
          // Increase by 1-5% randomly
          const increase = Math.floor(Math.random() * 5) + 1;
          sale.claimedPercentage = Math.min(95, sale.claimedPercentage + increase);
          updated.set(productId, { ...sale });
        } else {
          clearInterval(interval);
          intervalRefs.current.delete(productId);
        }

        return updated;
      });
    }, 30000); // Update every 30 seconds

    intervalRefs.current.set(productId, interval);
  };

  // Cleanup all intervals on unmount
  useEffect(() => {
    return () => {
      intervalRefs.current.forEach((interval) => clearInterval(interval));
      intervalRefs.current.clear();
    };
  }, []);

  return (
    <FlashSaleContext.Provider
      value={{
        activeFlashSales,
        startFlashSale,
        endFlashSale,
        isFlashSale,
        getFlashSale,
        getAllActiveFlashSales
      }}
    >
      {children}
    </FlashSaleContext.Provider>
  );
}

export function useFlashSale() {
  const context = useContext(FlashSaleContext);
  if (context === undefined) {
    throw new Error('useFlashSale must be used within FlashSaleProvider');
  }
  return context;
}
