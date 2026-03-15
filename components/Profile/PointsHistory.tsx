'use client';

import { motion } from 'framer-motion';
import { usePoints } from '@/lib/pointsContext';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function PointsHistory() {
  const { transactions } = usePoints();

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">📜</span>
        ประวัติการทำธุรกรรม
      </h3>

      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-500">ยังไม่มีประวัติการทำธุรกรรม</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                flex items-center justify-between p-4 rounded-xl border-2
                ${transaction.type === 'earn' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-orange-50 border-orange-200'
                }
              `}
            >
              {/* Left Side */}
              <div className="flex items-center gap-3">
                <div className="text-2xl">{transaction.icon}</div>
                <div>
                  <p className="font-semibold text-gray-900">{transaction.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.timestamp).toLocaleString('th-TH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Right Side - Points */}
              <div className="flex items-center gap-1">
                {transaction.type === 'earn' ? (
                  <>
                    <TrendingUp className="text-green-600" size={18} />
                    <span className="font-bold text-lg text-green-600">
                      +{transaction.amount}
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="text-orange-600" size={18} />
                    <span className="font-bold text-lg text-orange-600">
                      -{transaction.amount}
                    </span>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
