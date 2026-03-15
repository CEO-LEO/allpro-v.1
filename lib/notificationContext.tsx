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
  type: 'restock' | 'welcome' | 'promo';
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
        productName: 'All Pro',
        branchName: '',
        message: '🎉 ยินดีต้อนรับสู่ All Pro! เริ่มล่าดีลกันเลย',
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
        triggerRestockNotification
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
