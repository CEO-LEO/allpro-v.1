'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BuildingStorefrontIcon, 
  UserGroupIcon, 
  PlusIcon 
} from '@heroicons/react/24/solid';
import BrandPostCard from './BrandPostCard';
import UserPostCard from './UserPostCard';
import CreatePostModal from './CreatePostModal';
import { mockBrandPosts, mockUserPosts } from '@/data/communityPosts';

type FeedTab = 'brands' | 'users';

export default function RealTimeFeed() {
  const [activeTab, setActiveTab] = useState<FeedTab>('brands');
  const [showCreatePost, setShowCreatePost] = useState(false);

  const posts = activeTab === 'brands' ? mockBrandPosts : mockUserPosts;

  return (
    <section className="bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-orange-500 rounded-full" />
              <h2 className="text-3xl font-bold text-gray-900">
                COMMUNITY FEED
              </h2>
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                LIVE
              </span>
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all hover:scale-105"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create Post</span>
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center gap-4 ml-4 mt-6">
            <button
              onClick={() => setActiveTab('brands')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                activeTab === 'brands'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BuildingStorefrontIcon className="w-5 h-5" />
              <span>Brand Posts</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                activeTab === 'brands' ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                {mockBrandPosts.length}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <UserGroupIcon className="w-5 h-5" />
              <span>User Posts</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                activeTab === 'users' ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                {mockUserPosts.length}
              </span>
            </button>
          </div>
        </div>

        {/* Horizontal Scroll Feed */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {/* Gradient Overlays for scroll indication */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-yellow-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-amber-50 to-transparent z-10 pointer-events-none" />

            <div className="overflow-x-auto scrollbar-hide pb-4">
              <div className="flex gap-4 min-w-max">
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {activeTab === 'brands' ? (
                      <BrandPostCard post={post} />
                    ) : (
                      <UserPostCard post={post} />
                    )}
                  </motion.div>
                ))}

                {/* "Create Post" CTA Card */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: posts.length * 0.05 }}
                  onClick={() => setShowCreatePost(true)}
                  className="w-80 bg-gradient-to-br from-orange-500 to-red-700 rounded-2xl shadow-lg overflow-hidden flex flex-col items-center justify-center p-8 text-white text-center cursor-pointer hover:scale-105 transition-transform"
                >
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <PlusIcon className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    {activeTab === 'brands' ? 'Promote Your Business' : 'Share Your Experience'}
                  </h3>
                  <p className="text-white/90 mb-6">
                    {activeTab === 'brands' 
                      ? 'Post exclusive deals and reach more customers!'
                      : 'Found a great deal? Share it with the community and earn points!'}
                  </p>
                  <div className="bg-white text-orange-600 px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2">
                    <PlusIcon className="w-4 h-4" />
                    <span>Create Post</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Create Post Modal */}
        <CreatePostModal
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          defaultTab={activeTab}
        />
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
