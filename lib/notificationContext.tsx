'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  productId: string;
  productName: string;
  branchName: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'restock' | 'welcome' | 'promo' | 'deal';
}

interface Subscription {
  productId: string;
  productName: string;
  branchName: string;
  subscribedAt: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  subscriptions: Subscription[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  subscribe: (productId: string, productName: string, branchName: string) => void;
  unsubscribe: (productId: string) => void;
  isSubscribed: (productId: string) => boolean;
  triggerRestockNotification: (productId: string, branchName: string) => void;
  triggerPromoNotification: (promoTitle: string, shopName: string, tags: string[]) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    const savedSubscriptions = localStorage.getItem('subscriptions');
    
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      setNotifications(parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      })));
    } else {
      // Welcome notification
      const welcomeNotif: Notification = {
        id: 'welcome-1',
        productId: 'welcome',
        productName: 'IAMROOT AI',
        branchName: '',
        message: '🎉 ยินดีต้อนรับสู่ IAMROOT AI! เริ่มล่าดีลกันเลย',
        timestamp: new Date(),
        read: false,
        type: 'welcome'
      };
      setNotifications([welcomeNotif]);
    }

    if (savedSubscriptions) {
      const parsed = JSON.parse(savedSubscriptions);
      setSubscriptions(parsed.map((s: any) => ({
        ...s,
        subscribedAt: new Date(s.subscribedAt)
      })));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  // Listen for merchant stock updates
  useEffect(() => {
    const handleStockUpdate = (event: CustomEvent) => {
      const { productId, branchName, isInStock } = event.detail;
      
      if (isInStock) {
        triggerRestockNotification(productId, branchName);
      }
    };

    window.addEventListener('stockUpdated' as any, handleStockUpdate);
    return () => window.removeEventListener('stockUpdated' as any, handleStockUpdate);
  }, [subscriptions]);

  // Listen for new promo created events from merchant dashboard
  useEffect(() => {
    const handleNewPromo = (event: CustomEvent) => {
      const { title, shopName, tags, category } = event.detail;
      const allTags = [...(tags || []), category].filter(Boolean);
      triggerPromoNotification(title, shopName, allTags);
    };

    window.addEventListener('newPromoCreated' as any, handleNewPromo);
    return () => window.removeEventListener('newPromoCreated' as any, handleNewPromo);
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Show toast
    toast.success(notification.message, {
      duration: 5000,
      icon: '🔔',
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const subscribe = (productId: string, productName: string, branchName: string) => {
    const newSub: Subscription = {
      productId,
      productName,
      branchName,
      subscribedAt: new Date()
    };

    setSubscriptions(prev => {
      // Remove existing subscription for same product
      const filtered = prev.filter(s => s.productId !== productId);
      return [...filtered, newSub];
    });

    toast.success(`✅ เราจะแจ้งเตือนคุณทันทีที่ ${productName} มีสินค้าที่ ${branchName}`, {
      duration: 4000,
      icon: '🔔',
    });
  };

  const unsubscribe = (productId: string) => {
    setSubscriptions(prev => prev.filter(s => s.productId !== productId));
  };

  const isSubscribed = (productId: string) => {
    return subscriptions.some(s => s.productId === productId);
  };

  const triggerRestockNotification = (productId: string, branchName: string) => {
    const subscription = subscriptions.find(s => s.productId === productId);
    
    if (subscription) {
      addNotification({
        productId,
        productName: subscription.productName,
        branchName,
        message: `🟢 ${subscription.productName} มีสินค้าแล้วที่ ${branchName}! รีบไปก่อนหมดเลย!`,
        type: 'restock'
      });

      // Animate bell icon
      const event = new CustomEvent('bellShake');
      window.dispatchEvent(event);
    }
  };

  // Trigger notification when a new promo matches user's preferred_tags
  const triggerPromoNotification = (promoTitle: string, shopName: string, tags: string[]) => {
    // ดึง preferred_tags จาก auth store ผ่าน localStorage (เพราะ context ไม่ access Zustand โดยตรง)
    try {
      const stored = localStorage.getItem('auth-storage');
      if (!stored) return;
      const parsed = JSON.parse(stored);
      const preferredTags: string[] = parsed?.state?.user?.preferred_tags || [];
      const userRole = parsed?.state?.user?.role;

      if (userRole !== 'USER' || preferredTags.length === 0) return;

      const preferredLower = preferredTags.map(t => t.toLowerCase());
      const promoTagsLower = tags.map(t => t.toLowerCase());

      const hasMatch = promoTagsLower.some(t => preferredLower.includes(t));

      if (hasMatch) {
        addNotification({
          productId: `promo-${Date.now()}`,
          productName: promoTitle,
          branchName: shopName,
          message: `🎉 โปรใหม่ที่คุณอาจสนใจ! ${promoTitle} จาก ${shopName}`,
          type: 'promo'
        });

        // Animate bell icon
        const bellEvent = new CustomEvent('bellShake');
        window.dispatchEvent(bellEvent);
      }
    } catch {
      // silently ignore parse errors
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        subscriptions,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        subscribe,
        unsubscribe,
        isSubscribed,
        triggerRestockNotification,
        triggerPromoNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
