'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, CheckCircle, XCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  thumbnail?: string;
  stockStatus: 'available' | 'out_of_stock';
  lastUpdate?: string;
  views: number;
  salesThisWeek: number;
}

interface StockGridProps {
  branchName: string;
  products?: Product[];
}

export default function StockGrid({ branchName, products }: StockGridProps) {
  const [productList, setProductList] = useState<Product[]>(products || []);
  const [isLoading, setIsLoading] = useState(!products);
  const [flashingId, setFlashingId] = useState<string | null>(null);

  // TODO: เชื่อมต่อ API จริง
  // useEffect(() => {
  //   if (products) return;
  //   const fetchProducts = async () => {
  //     setIsLoading(true);
  //     try {
  //       const res = await fetch(`/api/merchant/stock?branch=${encodeURIComponent(branchName)}`);
  //       const data = await res.json();
  //       setProductList(data.products);
  //     } catch (err) { console.error(err); }
  //     finally { setIsLoading(false); }
  //   };
  //   fetchProducts();
  // }, [branchName, products]);

  useEffect(() => {
    if (products) return;
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [products]);

  const handleToggle = (productId: string) => {
    setProductList(prev => 
      prev.map(product => {
        if (product.id === productId) {
          const newStatus = product.stockStatus === 'available' ? 'out_of_stock' : 'available';
          const now = new Date();
          const timeString = now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          });
          
          // Flash animation
          setFlashingId(productId);
          setTimeout(() => setFlashingId(null), 600);

          // Toast notification
          if (newStatus === 'available') {
            toast.success(
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <div>
                  <p className="font-semibold text-sm">Stock Updated</p>
                  <p className="text-xs text-gray-600">{product.name} is now available</p>
                </div>
              </div>,
              {
                duration: 3000,
                position: 'top-center',
                style: {
                  background: '#10B981',
                  color: '#fff',
                  padding: '12px 16px',
                  borderRadius: '12px',
                }
              }
            );

            // Trigger restock notification event
            const event = new CustomEvent('stockUpdated', {
              detail: {
                productId: product.id,
                branchName: branchName,
                isInStock: true,
                productName: product.name
              }
            });
            window.dispatchEvent(event);

          } else {
            toast.error(
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                <div>
                  <p className="font-semibold text-sm">Stock Updated</p>
                  <p className="text-xs text-gray-200">{product.name} is now sold out</p>
                </div>
              </div>,
              {
                duration: 3000,
                position: 'top-center',
                style: {
                  background: '#EF4444',
                  color: '#fff',
                  padding: '12px 16px',
                  borderRadius: '12px',
                }
              }
            );
          }

          return {
            ...product,
            stockStatus: newStatus,
            lastUpdate: `Updated at ${timeString}`
          };
        }
        return product;
      })
    );
  };

  const availableCount = productList.filter(p => p.stockStatus === 'available').length;
  const totalCount = productList.length;

  return (
    <div className="w-full">
      <Toaster />
      
      {/* Header Stats */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{branchName}</h3>
            <p className="text-sm text-gray-500">Stock Management Dashboard</p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <p className="text-xs text-green-600 mb-1">In Stock</p>
            <p className="text-2xl font-bold text-green-700">{availableCount}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <p className="text-xs text-red-600 mb-1">Sold Out</p>
            <p className="text-2xl font-bold text-red-700">{totalCount - availableCount}</p>
          </div>
        </div>
      </div>

      {/* Quick Update Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Quick Update Panel
          </h4>
          <span className="text-xs text-gray-500">Tap to toggle</span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border-2 border-gray-200 p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                  <div className="w-16 h-9 rounded-full bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : (
        <AnimatePresence>
          {productList.map((product) => {
            const isAvailable = product.stockStatus === 'available';
            const isFlashing = flashingId === product.id;

            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  backgroundColor: isFlashing 
                    ? (isAvailable ? '#D1FAE5' : '#FEE2E2') 
                    : '#FFFFFF'
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Product Thumbnail */}
                  <div className={`
                    w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 border-2
                    ${isAvailable 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-gray-100 border-gray-300 opacity-60'
                    }
                  `}>
                    <Package className={`w-8 h-8 ${isAvailable ? 'text-blue-600' : 'text-gray-400'}`} />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 leading-tight">
                      {product.name}
                    </h5>
                    
                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      {isAvailable ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                          <CheckCircle className="w-3 h-3" />
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                          <XCircle className="w-3 h-3" />
                          Sold Out
                        </span>
                      )}
                      
                      {product.lastUpdate && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {product.lastUpdate}
                        </span>
                      )}
                    </div>

                    {/* Mini Stats */}
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        👁️ {product.views.toLocaleString()} views
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {product.salesThisWeek} sales/week
                      </span>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleToggle(product.id)}
                    className={`
                      relative w-16 h-9 rounded-full transition-all duration-300 flex-shrink-0
                      ${isAvailable 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-red-500 hover:bg-red-600'
                      }
                      shadow-lg hover:shadow-xl active:scale-95
                    `}
                    aria-label={`Toggle stock status for ${product.name}`}
                  >
                    <motion.div
                      initial={false}
                      animate={{
                        x: isAvailable ? 28 : 2,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                      }}
                      className="absolute top-1 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center"
                    >
                      {isAvailable ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </motion.div>
                  </button>
                </div>

                {/* Low Stock Warning */}
                {isAvailable && product.salesThisWeek > 50 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-gray-200"
                  >
                    <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                      <p className="text-xs text-yellow-800 font-medium">
                        High demand - Consider restocking soon
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        )}
      </div>

      {/* Empty State */}
      {productList.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No active promotions</p>
          <p className="text-sm text-gray-500 mt-1">Add products to manage stock</p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">i</span>
          </div>
          <div>
            <h5 className="font-semibold text-blue-900 mb-1">Quick Guide</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Green Toggle</strong> = Product is available for customers</li>
              <li>• <strong>Red Toggle</strong> = Product is sold out (customers will see 🔴 Out of Stock)</li>
              <li>• Changes are instant - customers see updates in real-time</li>
              <li>• Timestamp is automatically recorded for each status change</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
