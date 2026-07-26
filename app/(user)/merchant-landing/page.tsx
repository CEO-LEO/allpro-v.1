'use client';

import { useRouter } from 'next/navigation';
import { Store, TrendingUp, Users, BarChart3, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

export default function MerchantLandingPage() {
  const router = useRouter();
  const { switchRole } = useAuthStore();

  const handleJoinNow = () => {
    switchRole('MERCHANT');
    toast.success('Welcome to Business Portal! 🏪');
    router.push('/merchant/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-500/20 rounded-full border border-blue-400/30 mb-8">
              <Store className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 font-semibold">For Business Owners</span>
            </div>
            
            <h1 className="text-display-lg text-white mb-6">
              Grow Your Business<br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Reach 10,000+ Customers
              </span>
            </h1>
            
            <p className="text-h3 text-gray-300 mb-12 max-w-3xl mx-auto">
              Join Thailand's fastest-growing promotion platform. Create flash sales, 
              manage your shop, and boost your revenue with powerful analytics.
            </p>
            
            <button
              onClick={handleJoinNow}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-button rounded-xl hover:shadow-2xl hover:scale-105 transition-all active:scale-95 inline-flex items-center gap-3"
            >
              <Store className="w-6 h-6" />
              Join Business Portal
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Zap,
              title: 'Flash Sales',
              description: 'Create limited-time offers to drive urgency and boost sales'
            },
            {
              icon: TrendingUp,
              title: 'Boost Ads',
              description: 'Promote your deals to thousands of active deal hunters'
            },
            {
              icon: Users,
              title: 'Customer Insights',
              description: 'Understand your audience with detailed analytics'
            },
            {
              icon: BarChart3,
              title: 'Real-time Analytics',
              description: 'Track performance and optimize your campaigns'
            }
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-blue-500/30 hover:border-blue-400/50 transition-all hover:transform hover:scale-105"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-h3 text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-display-lg text-white mb-2">10,000+</div>
              <div className="text-blue-100">Active Hunters</div>
            </div>
            <div>
              <div className="text-display-lg text-white mb-2">500+</div>
              <div className="text-blue-100">Partner Brands</div>
            </div>
            <div>
              <div className="text-display-lg text-white mb-2">2M+</div>
              <div className="text-blue-100">Deals Claimed</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-display text-white mb-6">
          Ready to Grow Your Business?
        </h2>
        <p className="text-h3 text-gray-300 mb-8 max-w-2xl mx-auto">
          Join hundreds of successful merchants already using All Pro to reach more customers.
        </p>
        <button
          onClick={handleJoinNow}
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:scale-105 transition-all active:scale-95 inline-flex items-center gap-3"
        >
          <Store className="w-6 h-6" />
          Get Started Now
        </button>
      </div>
    </div>
  );
}
