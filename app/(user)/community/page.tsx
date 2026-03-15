"use client";

import { useState } from "react";
import { 
  UserGroupIcon, 
  ArrowTrendingUpIcon, 
  TrophyIcon, 
  ChatBubbleLeftRightIcon 
} from "@heroicons/react/24/solid";
import RealTimeFeed from "@/components/Community/RealTimeFeed";
import HunterFab from "@/components/Community/HunterFab";

export default function CommunityPage() {
  const [showCreatePost, setShowCreatePost] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white pt-20 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <UserGroupIcon className="w-8 h-8" /> 
            Hunter Community
          </h1>
          <p className="text-purple-100 text-lg">แชร์ดีล ช่วยเหลือ และรับรางวัล!</p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <ArrowTrendingUpIcon className="w-6 h-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">1,234</div>
              <div className="text-xs text-purple-100">Active Hunters</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <ChatBubbleLeftRightIcon className="w-6 h-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">8,567</div>
              <div className="text-xs text-purple-100">Posts Today</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <TrophyIcon className="w-6 h-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">256</div>
              <div className="text-xs text-purple-100">Top Contributors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-4">
        {/* Create Post Button */}
        <button
          onClick={() => setShowCreatePost(true)}
          className="w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 mb-6 hover:border-purple-500 hover:bg-purple-50 transition-all flex items-center gap-3 justify-center"
        >
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-gray-700">แชร์ดีลดีๆ ที่เจอ...</span>
        </button>

        {/* Real-Time Feed */}
        <RealTimeFeed
          showCreateModal={showCreatePost}
          setShowCreateModal={setShowCreatePost}
        />

        {/* Hunter FAB */}
        <HunterFab onClick={() => setShowCreatePost(true)} />
      </div>
    </div>
  );
}
