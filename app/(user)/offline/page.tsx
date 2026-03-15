'use client';

import Link from 'next/link';
import { 
  WifiIcon, 
  ArrowPathIcon,
  HomeIcon,
  WalletIcon
} from '@heroicons/react/24/solid';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Sleeping Bot Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            {/* Bot Body */}
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-300 to-gray-400 rounded-3xl shadow-xl relative overflow-hidden">
              {/* Screen */}
              <div className="absolute inset-4 bg-gray-800 rounded-2xl flex items-center justify-center">
                {/* Sleeping Eyes */}
                <div className="space-y-1">
                  <div className="flex gap-6">
                    <div className="w-8 h-1 bg-white rounded-full"></div>
                    <div className="w-8 h-1 bg-white rounded-full"></div>
                  </div>
                  {/* Smile */}
                  <div className="w-12 h-6 mx-auto mt-2">
                    <svg viewBox="0 0 48 24" fill="none">
                      <path d="M0 0 Q24 16 48 0" stroke="white" strokeWidth="3" fill="none"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Antenna */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-gray-400"></div>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
            </div>
            
            {/* Z Z Z (sleeping) */}
            <div className="absolute -right-8 top-4 space-y-1 animate-bounce">
              <div className="text-4xl text-gray-400">Z</div>
              <div className="text-3xl text-gray-300 ml-4">z</div>
              <div className="text-2xl text-gray-200 ml-8">z</div>
            </div>
          </div>
        </div>

        {/* No Signal Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <WifiIcon className="w-10 h-10 text-red-600 opacity-30" />
            <div className="absolute w-1 h-20 bg-red-600 transform rotate-45"></div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          No Internet Connection
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-2">
          Oops! It looks like you're offline.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Our Promo Bot is taking a nap until you reconnect. 💤
        </p>

        {/* Status Box */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="text-sm text-gray-700 space-y-3">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-semibold">Offline Mode</span>
            </div>
            <div className="text-xs text-gray-500">
              You can still access:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1 text-green-600">
                <span>✅</span>
                <span>Saved Vouchers</span>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <span>✅</span>
                <span>Wallet</span>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <span>✅</span>
                <span>Recent Deals</span>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <span>✅</span>
                <span>Profile</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Try Again
          </button>

          <Link
            href="/profile/wallet"
            className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <WalletIcon className="w-5 h-5" />
            Go to My Wallet
          </Link>

          <Link
            href="/"
            className="w-full px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl shadow flex items-center justify-center gap-2 transition-all border border-gray-200"
          >
            <HomeIcon className="w-5 h-5" />
            Back to Homepage
          </Link>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4 text-left">
          <h3 className="font-semibold text-sm text-gray-900 mb-2 flex items-center gap-2">
            <span>💡</span>
            Tips while offline:
          </h3>
          <ul className="space-y-1 text-xs text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Check if Wi-Fi or mobile data is enabled</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Try moving to an area with better signal</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Your saved vouchers work offline!</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Cached deals are still viewable</span>
            </li>
          </ul>
        </div>

        {/* App Info */}
        <div className="mt-6 text-xs text-gray-400">
          PromoHunt PWA • Offline-Ready App
        </div>
      </div>
    </div>
  );
}
