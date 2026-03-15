'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Package, AlertCircle, CheckCircle, Clock, TrendingDown } from 'lucide-react';
import { Promotion } from '@/lib/types';
import FlashSaleControl, { FlashSaleConfig } from './FlashSaleControl';
import { useFlashSale } from '@/lib/flashSaleContext';

interface StockItem extends Promotion {
  branchName: string;
  branchId: string;
}

interface StockControlProps {
  merchantId: string;
  merchantName: string;
}

// Mock data for merchant's promotions across branches
const mockMerchantStock: StockItem[] = [
  {
    id: 'promo1',
    title: 'Buy 1 Get 1 Free Coffee',
    shop_name: '7-Eleven',
    description: 'All coffee sizes',
    price: 35,
    discount_rate: 50,
    category: 'beverage',
    is_verified: true,
    is_sponsored: false,
    location: 'Bangkok',
    search_volume: 1200,
    image: 'coffee.jpg',
    valid_until: '2026-02-28',
    branchName: '7-Eleven Siam Square',
    branchId: 'branch001',
    stockStatus: 'available',
    stockQuantity: 150,
    lastStockUpdate: '2026-02-03 08:00'
  },
  {
    id: 'promo1',
    title: 'Buy 1 Get 1 Free Coffee',
    shop_name: '7-Eleven',
    description: 'All coffee sizes',
    price: 35,
    discount_rate: 50,
    category: 'beverage',
    is_verified: true,
    is_sponsored: false,
    location: 'Bangkok',
    search_volume: 1200,
    image: 'coffee.jpg',
    valid_until: '2026-02-28',
    branchName: '7-Eleven Asoke',
    branchId: 'branch002',
    stockStatus: 'out_of_stock',
    stockQuantity: 0,
    lastStockUpdate: '2026-02-03 06:30'
  },
  {
    id: 'promo1',
    title: 'Buy 1 Get 1 Free Coffee',
    shop_name: '7-Eleven',
    description: 'All coffee sizes',
    price: 35,
    discount_rate: 50,
    category: 'beverage',
    is_verified: true,
    is_sponsored: false,
    location: 'Bangkok',
    search_volume: 1200,
    image: 'coffee.jpg',
    valid_until: '2026-02-28',
    branchName: '7-Eleven Chit Lom',
    branchId: 'branch003',
    stockStatus: 'available',
    stockQuantity: 45,
    lastStockUpdate: '2026-02-03 07:15'
  },
  {
    id: 'promo2',
    title: 'Fresh Sandwiches 30% Off',
    shop_name: '7-Eleven',
    description: 'All varieties',
    price: 42,
    discount_rate: 30,
    category: 'food',
    is_verified: true,
    is_sponsored: false,
    location: 'Bangkok',
    search_volume: 800,
    image: 'sandwich.jpg',
    valid_until: '2026-02-15',
    branchName: '7-Eleven Siam Square',
    branchId: 'branch001',
    stockStatus: 'available',
    stockQuantity: 25,
    lastStockUpdate: '2026-02-03 09:00'
  },
  {
    id: 'promo2',
    title: 'Fresh Sandwiches 30% Off',
    shop_name: '7-Eleven',
    description: 'All varieties',
    price: 42,
    discount_rate: 30,
    category: 'food',
    is_verified: true,
    is_sponsored: false,
    location: 'Bangkok',
    search_volume: 800,
    image: 'sandwich.jpg',
    valid_until: '2026-02-15',
    branchName: '7-Eleven Asoke',
    branchId: 'branch002',
    stockStatus: 'available',
    stockQuantity: 80,
    lastStockUpdate: '2026-02-03 08:30'
  }
];

export default function StockControl({ merchantId, merchantName }: StockControlProps) {
  const [stockItems, setStockItems] = useState<StockItem[]>(mockMerchantStock);
  const [filter, setFilter] = useState<'all' | 'available' | 'out_of_stock'>('all');
  const { startFlashSale, endFlashSale, isFlashSale } = useFlashSale();

  const handleFlashSaleActivate = (config: FlashSaleConfig) => {
    startFlashSale({
      productId: config.productId,
      productName: stockItems.find(i => parseInt(i.id) === config.productId)?.title || 'Unknown',
      originalPrice: stockItems.find(i => parseInt(i.id) === config.productId)?.price || 0,
      flashPrice: config.discountPrice,
      discountRate: Math.round(((stockItems.find(i => parseInt(i.id) === config.productId)?.price || 0) - config.discountPrice) / (stockItems.find(i => parseInt(i.id) === config.productId)?.price || 1) * 100),
      endTime: config.endTime,
      claimedPercentage: 0,
      location: stockItems.find(i => parseInt(i.id) === config.productId)?.branchName || 'Unknown'
    });
  };

  const handleFlashSaleDeactivate = (productId: number) => {
    endFlashSale(productId);
  };

  const handleToggleStock = (branchId: string, promoId: string) => {
    setStockItems(prev => prev.map(item => {
      if (item.branchId === branchId && item.id === promoId) {
        const newStatus = item.stockStatus === 'available' ? 'out_of_stock' : 'available';
        return {
          ...item,
          stockStatus: newStatus,
          stockQuantity: newStatus === 'out_of_stock' ? 0 : item.stockQuantity || 100,
          lastStockUpdate: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0].substring(0, 5)
        };
      }
      return item;
    }));
  };

  const handleQuantityChange = (branchId: string, promoId: string, quantity: number) => {
    setStockItems(prev => prev.map(item => {
      if (item.branchId === branchId && item.id === promoId) {
        return {
          ...item,
          stockQuantity: quantity,
          stockStatus: quantity === 0 ? 'out_of_stock' : 'available',
          lastStockUpdate: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0].substring(0, 5)
        };
      }
      return item;
    }));
  };

  const filteredItems = stockItems.filter(item => 
    filter === 'all' ? true : item.stockStatus === filter
  );

  const stats = {
    total: stockItems.length,
    available: stockItems.filter(i => i.stockStatus === 'available').length,
    outOfStock: stockItems.filter(i => i.stockStatus === 'out_of_stock').length,
    lowStock: stockItems.filter(i => i.stockStatus === 'available' && (i.stockQuantity || 0) < 20).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Stock Management</h2>
              <p className="text-sm text-gray-600">{merchantName}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Total Items</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-sm text-green-700 mb-1 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              In Stock
            </p>
            <p className="text-3xl font-bold text-green-600">{stats.available}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <p className="text-sm text-red-700 mb-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Out of Stock
            </p>
            <p className="text-3xl font-bold text-red-600">{stats.outOfStock}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4">
            <p className="text-sm text-yellow-700 mb-1 flex items-center gap-1">
              <TrendingDown className="w-4 h-4" />
              Low Stock
            </p>
            <p className="text-3xl font-bold text-yellow-600">{stats.lowStock}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
          }`}
        >
          All Items ({stats.total})
        </button>
        <button
          onClick={() => setFilter('available')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            filter === 'available'
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-300'
          }`}
        >
          🟢 In Stock ({stats.available})
        </button>
        <button
          onClick={() => setFilter('out_of_stock')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            filter === 'out_of_stock'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-red-300'
          }`}
        >
          🔴 Out of Stock ({stats.outOfStock})
        </button>
      </div>

      {/* Stock Items List */}
      <div className="space-y-4">
        {filteredItems.map((item, index) => (
          <motion.div
            key={`${item.branchId}-${item.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-blue-300 transition-all"
          >
            <div className="flex items-start gap-6">
              {/* Product Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Store className="w-4 h-4" />
                        {item.branchName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Updated: {item.lastStockUpdate}
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.stockStatus === 'available'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {item.stockStatus === 'available' ? '🟢 IN STOCK' : '🔴 OUT OF STOCK'}
                  </span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6">
                  {/* Toggle Switch */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <button
                      onClick={() => handleToggleStock(item.branchId, item.id)}
                      className={`
                        relative w-16 h-8 rounded-full transition-all duration-300
                        ${item.stockStatus === 'available' ? 'bg-green-500' : 'bg-red-500'}
                      `}
                    >
                      <motion.div
                        animate={{
                          x: item.stockStatus === 'available' ? 32 : 0
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg"
                      />
                    </button>
                    <span className="text-sm font-bold text-gray-900">
                      {item.stockStatus === 'available' ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Quantity Input */}
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Quantity:</label>
                    <input
                      type="number"
                      min="0"
                      value={item.stockQuantity || 0}
                      onChange={(e) => handleQuantityChange(item.branchId, item.id, parseInt(e.target.value) || 0)}
                      className={`
                        w-24 px-3 py-2 border-2 rounded-lg font-bold text-center
                        ${(item.stockQuantity || 0) === 0
                          ? 'border-red-300 text-red-600 bg-red-50'
                          : (item.stockQuantity || 0) < 20
                          ? 'border-yellow-300 text-yellow-700 bg-yellow-50'
                          : 'border-gray-200 text-gray-900'
                        }
                      `}
                    />
                    {(item.stockQuantity || 0) < 20 && (item.stockQuantity || 0) > 0 && (
                      <span className="text-xs font-medium text-yellow-600 flex items-center gap-1">
                        <TrendingDown className="w-4 h-4" />
                        Low Stock
                      </span>
                    )}
                  </div>

                  {/* Flash Sale Control */}
                  <div className="ml-auto">
                    <FlashSaleControl
                      productId={parseInt(item.id.replace('promo', ''))}
                      productName={item.title}
                      currentPrice={item.price}
                      isFlashActive={isFlashSale(parseInt(item.id.replace('promo', '')))}
                      onActivate={handleFlashSaleActivate}
                      onDeactivate={() => handleFlashSaleDeactivate(parseInt(item.id.replace('promo', '')))}
                    />
                  </div>
                </div>

                {/* Flash Sale Active Indicator */}
                {isFlashSale(parseInt(item.id.replace('promo', ''))) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-3 bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300 rounded-xl"
                  >
                    <p className="text-sm font-bold text-orange-800 flex items-center gap-2">
                      ⚡ Flash Sale Active - Item is now featured at top of homepage!
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-200">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No items found in this category</p>
        </div>
      )}
    </div>
  );
}
