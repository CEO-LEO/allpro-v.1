'use client';

import { useState } from 'react';
import { Package, CheckCircle, AlertCircle, TrendingDown, Plus, Trash2 } from 'lucide-react';
import { useStockStore } from '@/store/useStockStore';
import toast from 'react-hot-toast';

type FilterTab = 'all' | 'in_stock' | 'out_of_stock';

interface StockControlProps {
  merchantId: string;
  merchantName: string;
}

export default function StockControl({ merchantId, merchantName }: StockControlProps) {
  void merchantId;

  const items = useStockStore((s) => s.items);
  const addItem = useStockStore((s) => s.addItem);
  const updateQuantity = useStockStore((s) => s.updateQuantity);
  const removeItem = useStockStore((s) => s.removeItem);

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', branch: '', category: '', quantity: '', image: '' });

  // Map stock items to display format
  const products = items.map((item) => ({
    id: item.id,
    name: item.name,
    branch: item.branch,
    status: (item.quantity > 0 ? 'in_stock' : 'out_of_stock') as 'in_stock' | 'out_of_stock',
    quantity: item.quantity,
    isFlashSale: false,
    isActive: item.quantity > 0,
    updatedAt: item.updatedAt,
    lowStockThreshold: item.lowStockThreshold,
  }));

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

      {/* Filter Tabs + Add Button */}
      <div className="flex items-center justify-between">
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
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          เพิ่มสินค้า
        </button>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">เพิ่มสินค้าในสต็อก</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="ชื่อสินค้า"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="สาขา"
              value={newItem.branch}
              onChange={(e) => setNewItem({ ...newItem, branch: e.target.value })}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="หมวดหมู่"
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="จำนวน"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="ลิงค์รูปภาพ (ไม่บังคับ)"
              value={newItem.image}
              onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
              className="md:col-span-2 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                if (!newItem.name || !newItem.quantity) {
                  toast.error('กรุณากรอกชื่อสินค้าและจำนวน');
                  return;
                }
                addItem({
                  name: newItem.name,
                  branch: newItem.branch || 'Main',
                  category: newItem.category || 'Other',
                  quantity: parseInt(newItem.quantity) || 0,
                  lowStockThreshold: 10,
                  image: newItem.image || undefined,
                });
                setNewItem({ name: '', branch: '', category: '', quantity: '', image: '' });
                setShowAddForm(false);
                toast.success('เพิ่มสินค้าสำเร็จ');
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              บันทึก
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

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
                    <input
                      type="number"
                      min="0"
                      value={product.quantity}
                      onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 0)}
                      className={`w-20 px-3 py-1 rounded-lg text-sm font-semibold border text-center ${
                        product.quantity === 0
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : 'bg-white text-gray-900 border-gray-200'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {product.isActive && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                      Active
                    </span>
                  )}
                  <button
                    onClick={() => {
                      removeItem(product.id);
                      toast.success('ลบสินค้าแล้ว');
                    }}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              เพิ่มสินค้าตัวแรก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
