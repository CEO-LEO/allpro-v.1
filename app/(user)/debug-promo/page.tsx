'use client';

import { getPromotions, getPromotionById } from '@/lib/getPromotions';
import Link from 'next/link';

export default function DebugPromoPage() {
  const promotions = getPromotions();
  const firstPromo = promotions[0];
  const foundPromo = getPromotionById(firstPromo?.id || '');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-h1 mb-8">🔧 Promo Debug Page</h1>
        
        {/* Total Count */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-h3 mb-4">📊 Promotion Statistics</h2>
          <p>Total promotions loaded: <strong>{promotions.length}</strong></p>
        </div>

        {/* First Promotion Test */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-h3 mb-4">🧪 First Promotion Test</h2>
          {firstPromo && (
            <div className="space-y-2">
              <p><strong>ID:</strong> {firstPromo.id}</p> 
              <p><strong>Title:</strong> {firstPromo.title}</p>
              <p><strong>Shop:</strong> {firstPromo.shop_name}</p>
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">getPromotionById Test:</h3>
                {foundPromo ? (
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <p className="text-green-700">✅ Successfully found promotion!</p>
                    <p><strong>Found ID:</strong> {foundPromo.id}</p>
                    <p><strong>Found Title:</strong> {foundPromo.title}</p>
                  </div>
                ) : (
                  <div className="bg-red-50 p-3 rounded border border-red-200">
                    <p className="text-red-700">❌ Cannot find promotion by ID</p>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <Link 
                  href={`/promo/${firstPromo.id}`}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Test Promo Detail Link
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* IAMROOT AI - Promotion IDs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-h3 mb-4">📋 IAMROOT AImotion IDs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
            {promotions.map((promo, index) => (
              <div key={promo.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                <div className="truncate">
                  <span className="text-body-sm text-gray-600">#{index + 1}</span>
                  <strong className="ml-2">{promo.id}</strong>
                </div>
                <Link 
                  href={`/promo/${promo.id}`}
                  className="text-caption bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                >
                  Test
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}