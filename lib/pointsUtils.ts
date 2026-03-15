// Points & Rewards System Utilities

export interface PointsTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  description: string;
  timestamp: Date;
  icon?: string;
}

export interface Voucher {
  id: string;
  rewardId: string;
  rewardName: string;
  rewardImage: string;
  brand: string;
  code: string;
  qrData: string;
  redeemedAt: Date;
  expiresAt: Date;
  status: 'active' | 'used' | 'expired';
  value: string;
}

const POINTS_KEY = 'hunter_points_balance';
const HISTORY_KEY = 'hunter_points_history';
const WALLET_KEY = 'hunter_wallet_vouchers';

// Get current points balance
export function getPointsBalance(): number {
  if (typeof window === 'undefined') return 0;
  const balance = localStorage.getItem(POINTS_KEY);
  return balance ? parseInt(balance, 10) : 0;
}

// Set points balance
export function setPointsBalance(amount: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(POINTS_KEY, amount.toString());
}

// Add points and log transaction
export function addPoints(amount: number, description: string, icon?: string): void {
  const currentBalance = getPointsBalance();
  const newBalance = currentBalance + amount;
  setPointsBalance(newBalance);
  
  logTransaction({
    id: `earn-${Date.now()}`,
    type: 'earn',
    amount,
    description,
    timestamp: new Date(),
    icon: icon || '⭐'
  });
}

// Spend points and log transaction
export function spendPoints(amount: number, description: string, icon?: string): boolean {
  const currentBalance = getPointsBalance();
  
  if (currentBalance < amount) {
    return false; // Insufficient balance
  }
  
  const newBalance = currentBalance - amount;
  setPointsBalance(newBalance);
  
  logTransaction({
    id: `spend-${Date.now()}`,
    type: 'spend',
    amount,
    description,
    timestamp: new Date(),
    icon: icon || '💰'
  });
  
  return true;
}

// Log a transaction to history
function logTransaction(transaction: PointsTransaction): void {
  if (typeof window === 'undefined') return;
  
  const history = getPointsHistory();
  history.unshift(transaction); // Add to beginning
  
  // Keep only last 100 transactions
  if (history.length > 100) {
    history.splice(100);
  }
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

// Get points history
export function getPointsHistory(): PointsTransaction[] {
  if (typeof window === 'undefined') return [];
  
  const history = localStorage.getItem(HISTORY_KEY);
  if (!history) return [];
  
  try {
    const parsed = JSON.parse(history);
    // Convert timestamp strings back to Date objects
    return parsed.map((t: any) => ({
      ...t,
      timestamp: new Date(t.timestamp)
    }));
  } catch {
    return [];
  }
}

// Get wallet vouchers
export function getWalletVouchers(): Voucher[] {
  if (typeof window === 'undefined') return [];
  
  const wallet = localStorage.getItem(WALLET_KEY);
  if (!wallet) return [];
  
  try {
    const parsed = JSON.parse(wallet);
    // Convert date strings back to Date objects and check expiry
    return parsed.map((v: any) => {
      const voucher = {
        ...v,
        redeemedAt: new Date(v.redeemedAt),
        expiresAt: new Date(v.expiresAt)
      };
      
      // Auto-mark as expired
      if (voucher.status === 'active' && new Date() > voucher.expiresAt) {
        voucher.status = 'expired';
      }
      
      return voucher;
    });
  } catch {
    return [];
  }
}

// Add voucher to wallet
export function addVoucherToWallet(voucher: Omit<Voucher, 'id' | 'redeemedAt' | 'status'>): Voucher {
  if (typeof window === 'undefined') return voucher as Voucher;
  
  const newVoucher: Voucher = {
    ...voucher,
    id: `voucher-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    redeemedAt: new Date(),
    status: 'active'
  };
  
  const wallet = getWalletVouchers();
  wallet.unshift(newVoucher);
  
  localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
  
  return newVoucher;
}

// Mark voucher as used
export function markVoucherAsUsed(voucherId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const wallet = getWalletVouchers();
  const voucher = wallet.find(v => v.id === voucherId);
  
  if (!voucher) return false;
  
  voucher.status = 'used';
  localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
  
  return true;
}

// Generate voucher code
export function generateVoucherCode(prefix: string = 'HUNT'): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = prefix;
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Initialize demo points and history
export function initializeDemoPoints(): void {
  if (typeof window === 'undefined') return;
  
  // Only initialize if not already set
  const existing = localStorage.getItem(POINTS_KEY);
  if (existing) return;
  
  // Set initial balance
  setPointsBalance(850);
  
  // Add demo history
  const demoHistory: PointsTransaction[] = [
    {
      id: 'demo-1',
      type: 'earn',
      amount: 50,
      description: 'ชวนเพื่อน: HUNTER-ABC',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      icon: '👥'
    },
    {
      id: 'demo-2',
      type: 'earn',
      amount: 10,
      description: 'รายงานสต็อก: Krispy Kreme',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      icon: '📦'
    },
    {
      id: 'demo-3',
      type: 'earn',
      amount: 100,
      description: 'ลงทะเบียนครั้งแรก',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      icon: '🎉'
    }
  ];
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(demoHistory));
}
