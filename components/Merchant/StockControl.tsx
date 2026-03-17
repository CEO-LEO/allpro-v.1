'use client';

import { useState } from 'react';
import { Package, CheckCircle, AlertCircle, TrendingDown } from 'lucide-react';

// --- Data Structure คาดว่าจะได้รับจาก API ---
// {
//   id: string;
//   name: string;
//   branch: string;
//   status: 'in_stock' | 'out_of_stock';
//   quantity: number;
//   isFlashSale: boolean;
//   isActive: boolean;
//   updatedAt: string;        // ISO date string
//   lowStockThreshold?: number;
// }

interface Product {
  id: string;
  name: string;
  branch: string;
  status: 'in_stock' | 'out_of_stock';
  quantity: number;
  isFlashSale: boolean;
  isActive: boolean;
  updatedAt: string;
  lowStockThreshold?: number;
}

type FilterTab = 'all' | 'in_stock' | 'out_of_stock';

interface StockControlProps {
  merchantId: string;
  merchantName: string;
}

export default function StockControl({ merchantId, merchantName }: StockControlProps) {
  void merchantId;

  // TODO: เชื่อมต่อ API จริง — เรียก fetch แล้ว setProducts(data)
  const [products] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // --- Summary คำนวณจาก State ---
  const totalItems = products.length;
  const inStockCount = products.filter((p) => p.status === 'in_stock').length;
  const outOfStockCount = products.filter((p) => p.status === 'out_of_stock').length;
  const lowStockCount = products.filter(
    (p) => p.status === 'in_stock' && p.quantity > 0 && p.quantity <= (p.lowStockThreshold ?? 10)
  ).length;

  // --- Filter ---
  const filteredProducts =
    activeTab === 'all'
      ? products
      : products.filter((p) => p.status === activeTab);

  const tabs: { key: FilterTab; label: string; count: number; color: string }[] = [
    { key: 'all', label: 'All Items', count: totalItems, color: 'bg-orange-500 text-white' },
    { key: 'in_stock', label: 'In Stock', count: inStockCount, color: 'bg-white text-gray-700 border border-gray-200' },
    { key: 'out_of_stock', label: 'Out of Stock', count: outOfStockCount, color: 'bg-white text-gray-700 border border-gray-200' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Stock Management</h2>
            <p className="text-sm text-gray-500">{merchantName}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">Total Items</p>
          <p className="text-3xl font-bold text-gray-900">{totalItems}</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 shadow-sm p-4">
          <div className="flex items-center gap-1 mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
            <p className="text-xs text-green-700">In Stock</p>
          </div>
          <p className="text-3xl font-bold text-green-700">{inStockCount}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 shadow-sm p-4">
          <div className="flex items-center gap-1 mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            <p className="text-xs text-red-700">Out of Stock</p>
          </div>
          <p className="text-3xl font-bold text-red-700">{outOfStockCount}</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 shadow-sm p-4">
          <div className="flex items-center gap-1 mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
            <p className="text-xs text-amber-700">Low Stock</p>
          </div>
          <p className="text-3xl font-bold text-amber-700">{lowStockCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Product List or Empty State */}
      {filteredProducts.length > 0 ? (
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-2xl border shadow-sm p-6 ${
                product.status === 'out_of_stock' ? 'border-red-200 bg-red-50/30' : 'border-green-200 bg-green-50/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    🏪 {product.branch} &nbsp; 🕐 Updated: {product.updatedAt}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    product.status === 'in_stock'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {product.status === 'in_stock' ? '● IN STOCK' : '● OUT OF STOCK'}
                </span>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Status:</span>
                    <div
                      className={`w-11 h-6 rounded-full relative ${
                        product.status === 'in_stock' ? 'bg-green-500' : 'bg-red-400'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          product.status === 'in_stock' ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {product.status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-semibold border ${
                        product.quantity === 0
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : 'bg-white text-gray-900 border-gray-200'
                      }`}
                    >
                      {product.quantity}
                    </span>
                  </div>
                </div>

                {product.isActive && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                    ⚡ 🔥 Active
                  </span>
                )}
              </div>

              {product.isFlashSale && (
                <div className="mt-3 px-4 py-2 bg-orange-50 border border-orange-200 rounded-xl">
                  <p className="text-sm text-orange-600 font-medium">
                    ⚡ Flash Sale Active – Item is now featured at top of homepage!
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-20 text-center">
          <div className="mx-auto max-w-sm">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">
              📦 ยังไม่มีรายการสินค้า
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              คุณยังไม่ได้เพิ่มสินค้าใดๆ ในสต็อก<br />
              เพิ่มสินค้าเพื่อเริ่มต้นจัดการสต็อกแบบเรียลไทม์
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
