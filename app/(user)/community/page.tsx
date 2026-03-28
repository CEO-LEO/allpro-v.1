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
      <div className="bg-gradient-to-r from-purple-600 to-violet-500 text-white pt-14 pb-5 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold mb-0.5 flex items-center gap-2">
            <UserGroupIcon className="w-6 h-6" /> 
            Hunter Community
          </h1>
          <p className="text-purple-200 text-xs">แชร์ดีล ช่วยเหลือ และรับรางวัล!</p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2.5 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5 text-center">
              <ArrowTrendingUpIcon className="w-4 h-4 mx-auto mb-1 text-white/70" />
              <div className="text-base font-semibold">1,234</div>
              <div className="text-[10px] text-purple-300">Active Hunters</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5 text-center">
              <ChatBubbleLeftRightIcon className="w-4 h-4 mx-auto mb-1 text-white/70" />
              <div className="text-base font-semibold">8,567</div>
              <div className="text-[10px] text-purple-300">Posts Today</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5 text-center">
              <TrophyIcon className="w-4 h-4 mx-auto mb-1 text-white/70" />
              <div className="text-base font-semibold">256</div>
              <div className="text-[10px] text-purple-300">Top Contributors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-4">
        {/* Create Post Button */}
        <button
          onClick={() => setShowCreatePost(true)}
          className="w-full bg-white border border-dashed border-gray-300 rounded-xl p-3.5 mb-6 hover:border-purple-400 hover:bg-purple-50/50 transition-all flex items-center gap-3 justify-center shadow-sm"
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
