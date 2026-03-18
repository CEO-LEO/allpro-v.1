'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  TrendingUp, 
  Eye, 
  MousePointer, 
  DollarSign,
  Target,
  Play,
  Pause,
  Plus,
  BarChart3,
  Zap,
  Users,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Crown,
  X
} from 'lucide-react';
import { 
  type AdCampaign, 
  mockCampaigns, 
  getCampaignStats,
  createCampaign 
} from '@/lib/adsData';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { useProductStore } from '@/store/useProductStore';

export default function AdsManagerPage() {
  const { user } = useAuthStore();
  const { products } = useProductStore();
  const merchantProducts = products.filter(p => p.shopName === user?.shopName);

  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [stats, setStats] = useState({
    totalImpressions: 0,
    totalClicks: 0,
    totalSpent: 0,
    ctr: 0,
    avgCPC: 0,
    activeCampaigns: 0
  });
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  
  const isPro = user?.isPro || false;

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState<'visibility' | 'traffic'>('visibility');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [dailyBudget, setDailyBudget] = useState(500);
  const [duration, setDuration] = useState(7);

  const merchantId = user?.id || 'guest';
  const storageKey = `merchant_${merchantId}_campaigns`;

  useEffect(() => {
    // Load campaigns from local storage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setCampaigns(JSON.parse(stored));
      } else {
        setCampaigns([]); // Start empty for new users
      }
    }
  }, [merchantId, storageKey]);

  // Calculate stats from actual campaigns
  useEffect(() => {
    const totalImpressions = campaigns.reduce((acc, c) => acc + (c.impressions || 0), 0);
    const totalClicks = campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0);
    const totalSpent = campaigns.reduce((acc, c) => acc + (c.spent || 0), 0);
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    
    setStats({
      totalImpressions,
      totalClicks,
      totalSpent,
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      avgCPC: totalClicks > 0 ? totalSpent / totalClicks : 0,
      activeCampaigns
    });
  }, [campaigns]);

  const handleCreateCampaign = () => {
    if (!user) {
        toast.error('Please login first');
        return;
    }
    const product = merchantProducts.find(p => p.id === selectedProduct);
    if (!product) {
      toast.error('Please select a product');
      return;
    }

    const newCampaignData: AdCampaign = {
      id: `camp-${Date.now()}`,
      merchantId,
      merchantName: user.shopName || user.name || 'My Shop',
      productId: product.id,
      productName: product.title,
      productImage: product.image,
      productPrice: product.promoPrice,
      productDiscount: product.discount,
      goal: selectedGoal,
      dailyBudget,
      totalBudget: dailyBudget * duration,
      duration,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
      impressions: 0,
      clicks: 0,
      spent: 0
    };

    const updatedCampaigns = [...campaigns, newCampaignData];
    setCampaigns(updatedCampaigns);
    localStorage.setItem(storageKey, JSON.stringify(updatedCampaigns));

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    toast.success('🚀 Campaign Launched Successfully!', { duration: 4000 });
    
    setShowCreateWizard(false);
    setWizardStep(1);
  };

  const totalBudget = dailyBudget * duration;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/merchant/dashboard" className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                ← Dashboard
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  📊 Ads Manager
                  {isPro && (
                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      PRO
                    </span>
                  )}
                </h1>
                <p className="text-sm text-gray-500">Boost your sales with targeted ads</p>
              </div>
            </div>

            {!isPro && (
              <button
                onClick={() => setShowProModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <Crown className="w-4 h-4" />
                Upgrade to PRO
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Content Card Container */}
        <div className="bg-slate-50 rounded-3xl p-4 sm:p-6 md:p-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-md border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <Eye className="w-8 h-8 text-blue-500" />
              <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full font-semibold">
                Impressions
              </span>
            </div>
            <p className="text-3xl font-black text-gray-900">
              {stats.totalImpressions.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total views</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-md border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <MousePointer className="w-8 h-8 text-green-500" />
              <span className="text-xs text-gray-500 bg-green-50 px-2 py-1 rounded-full font-semibold">
                Clicks
              </span>
            </div>
            <p className="text-3xl font-black text-gray-900">
              {stats.totalClicks.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              CTR: {stats.ctr.toFixed(2)}%
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-md border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <DollarSign className="w-8 h-8 text-orange-500" />
              <span className="text-xs text-gray-500 bg-orange-50 px-2 py-1 rounded-full font-semibold">
                Spent
              </span>
            </div>
            <p className="text-3xl font-black text-gray-900">
              ฿{stats.totalSpent.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Avg CPC: ฿{stats.avgCPC.toFixed(2)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-md border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <Target className="w-8 h-8 text-purple-500" />
              <span className="text-xs text-gray-500 bg-purple-50 px-2 py-1 rounded-full font-semibold">
                Active
              </span>
            </div>
            <p className="text-3xl font-black text-gray-900">
              {stats.activeCampaigns}
            </p>
            <p className="text-sm text-gray-600 mt-1">Campaigns running</p>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowCreateWizard(true)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-6 h-6" />
            Create New Campaign
          </button>
        </div>

        {/* Campaigns List */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Your Campaigns
          </h2>

          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <Image
                    src={campaign.productImage}
                    alt={campaign.productName}
                    width={80}
                    height={80}
                    className="rounded-xl object-cover"
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{campaign.productName}</h3>
                        <p className="text-sm text-gray-600">{campaign.merchantName}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        campaign.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : campaign.status === 'paused'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {campaign.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Impressions</p>
                        <p className="font-bold text-gray-900">{campaign.impressions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Clicks</p>
                        <p className="font-bold text-gray-900">{campaign.clicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">CTR</p>
                        <p className="font-bold text-gray-900">
                          {campaign.impressions > 0 
                            ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) 
                            : 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Spent</p>
                        <p className="font-bold text-gray-900">฿{campaign.spent.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full"
                          style={{ width: `${(campaign.spent / campaign.totalBudget) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 font-semibold">
                        ฿{campaign.spent} / ฿{campaign.totalBudget}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>{/* End Content Card Container */}
      </div>

      {/* Create Campaign Wizard */}
      <AnimatePresence>
        {showCreateWizard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateWizard(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Wizard Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
                <button
                  onClick={() => setShowCreateWizard(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold mb-2">🚀 Create Ad Campaign</h2>
                <p className="text-blue-100">Step {wizardStep} of 4</p>
                
                {/* Progress Bar */}
                <div className="mt-4 bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-full rounded-full transition-all duration-300"
                    style={{ width: `${(wizardStep / 4) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-6">
                {/* Step 1: Choose Goal */}
                {wizardStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Choose Your Goal</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <button
                        onClick={() => setSelectedGoal('visibility')}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          selectedGoal === 'visibility'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Zap className={`w-12 h-12 mx-auto mb-3 ${
                          selectedGoal === 'visibility' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <h4 className="font-bold text-gray-900 mb-2">Boost Visibility</h4>
                        <p className="text-sm text-gray-600">Appear at top of search results</p>
                      </button>

                      <button
                        onClick={() => setSelectedGoal('traffic')}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          selectedGoal === 'traffic'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Users className={`w-12 h-12 mx-auto mb-3 ${
                          selectedGoal === 'traffic' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <h4 className="font-bold text-gray-900 mb-2">Drive Traffic</h4>
                        <p className="text-sm text-gray-600">Featured on homepage banner</p>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Select Product */}
                {wizardStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Select Product</h3>
                    
                    <div className="space-y-3 mb-6">
                      {merchantProducts.length === 0 ? (
                        <div className="text-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                          <p className="text-gray-500 mb-2">No products found for {user?.shopName || 'your shop'}.</p>
                          <Link href="/merchant/products/add" className="text-blue-600 font-bold hover:underline">
                            + Add a product first
                          </Link>
                        </div>
                      ) : (
                        merchantProducts.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => setSelectedProduct(product.id)}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                              selectedProduct === product.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="w-12 h-12 relative flex-shrink-0">
                               <Image 
                                src={product.image} 
                                alt={product.title}
                                fill
                                className="rounded-lg object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 line-clamp-1">{product.title}</p>
                              <p className="text-sm text-gray-600">฿{product.promoPrice} • {product.discount}% OFF</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Budget & Duration */}
                {wizardStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Set Budget & Duration</h3>
                    
                    {/* Daily Budget */}
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Daily Budget: ฿{dailyBudget}
                      </label>
                      <input
                        type="range"
                        min="100"
                        max="2000"
                        step="100"
                        value={dailyBudget}
                        onChange={(e) => setDailyBudget(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>฿100</span>
                        <span>฿2,000</span>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Duration: {duration} days
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1 day</span>
                        <span>30 days</span>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">Total Budget:</span>
                        <span className="text-2xl font-black text-blue-600">
                          ฿{totalBudget.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Preview */}
                {wizardStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Preview Your Ad</h3>
                    
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 border-2 border-dashed border-gray-300">
                      <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold mb-3">
                        โฆษณา
                      </span>
                      {(() => {
                        const product = merchantProducts.find(p => p.id === selectedProduct);
                        return (
                          <div className="bg-white rounded-xl p-4 shadow-md">
                            <div className="flex gap-3">
                              <div className="w-20 h-20 relative flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                {product ? (
                                  <Image
                                    src={product.image}
                                    alt={product.title}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-4xl">
                                    🍔
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 line-clamp-1">{product?.title || 'Your Product'}</h4>
                                <p className="text-sm text-gray-600">{user?.shopName || 'Your Shop Name'}</p>
                                <p className="text-orange-600 font-bold">฿{product?.promoPrice || 99}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Campaign Summary */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Goal:</span>
                        <span className="font-bold">{selectedGoal === 'visibility' ? 'Boost Visibility' : 'Drive Traffic'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Daily Budget:</span>
                        <span className="font-bold">฿{dailyBudget}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-bold">{duration} days</span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span className="text-gray-900 font-bold">Total:</span>
                        <span className="font-black text-blue-600">฿{totalBudget}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-6">
                  {wizardStep > 1 && (
                    <button
                      onClick={() => setWizardStep(wizardStep - 1)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition-all"
                    >
                      ← Back
                    </button>
                  )}
                  
                  {wizardStep < 4 ? (
                    <button
                      onClick={() => setWizardStep(wizardStep + 1)}
                      disabled={wizardStep === 2 && !selectedProduct}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
                    >
                      Next
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleCreateCampaign}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <Sparkles className="w-5 h-5" />
                      Launch Campaign
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pro Merchant Modal */}
      <AnimatePresence>
        {showProModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowProModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white text-center relative">
                <button
                  onClick={() => setShowProModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
                <Crown className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-3xl font-black mb-2">Upgrade to PRO</h2>
                <p className="text-white/90">Unlock premium features for your business</p>
              </div>

              <div className="p-8">
                <div className="space-y-4 mb-8">
                  {[
                    { icon: Zap, text: 'Unlimited Flash Sales' },
                    { icon: BarChart3, text: 'Advanced Analytics Dashboard' },
                    { icon: CheckCircle2, text: 'Verified Merchant Blue Badge' },
                    { icon: Target, text: 'Priority Ad Placement' },
                    { icon: Users, text: 'Customer Insights & Demographics' },
                    { icon: Sparkles, text: 'Featured Store Listing' }
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                        <benefit.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-gray-900 font-semibold">{benefit.text}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6 border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-black text-gray-900">฿999</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-600">Save 20% with annual plan (฿9,590/year)</p>
                </div>

                <button
                  onClick={() => {
                    toast.success('🎉 Welcome to PRO! All features unlocked!');
                    confetti({ particleCount: 100, spread: 70 });
                    setShowProModal(false);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Subscribe Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
