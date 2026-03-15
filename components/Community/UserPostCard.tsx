'use client';

import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  MapPinIcon, 
  TrophyIcon, 
  HandThumbUpIcon, 
  ChatBubbleLeftRightIcon, 
  ShareIcon 
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import { useGamification } from '@/hooks/useGamification';

interface UserPost {
  id: string;
  userName: string;
  userAvatar: string;
  userLevel: number;
  caption: string;
  imageUrl: string;
  location: string;
  timeAgo: string;
  points: number;
  helpful: number;
  comments: number;
}

interface UserPostCardProps {
  post: UserPost;
}

export default function UserPostCard({ post }: UserPostCardProps) {
  const [marked, setMarked] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(post.helpful);
  const { earnPoints } = useGamification();

  const handleMarkHelpful = () => {
    if (!marked) {
      setMarked(true);
      setHelpfulCount(helpfulCount + 1);
      earnPoints('WRITE_REVIEW', { action: 'Marked post helpful' });
      toast.success('Marked as helpful! +10 points 👍');
    }
  };

  const handleShare = () => {
    earnPoints('SHARE_DEAL', { action: 'Shared user post' });
    toast.success('Link copied! +25 points 🎉');
  };

  const handleComment = () => {
    toast.info('Comment feature coming soon! 💬');
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="w-80 bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-orange-200 hover:border-orange-400 hover:shadow-2xl transition-all"
    >
      {/* User Header */}
      <div className="p-4 flex items-center gap-3 bg-gradient-to-r from-orange-50 to-amber-50 border-b-2 border-orange-100">
        <div className="relative">
          <Image
            src={post.userAvatar}
            alt={post.userName}
            width={48}
            height={48}
            className="rounded-full border-2 border-orange-400"
          />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-900">{post.userName}</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <ClockIcon className="w-3 h-3" />
              <span>{post.timeAgo}</span>
            </div>
            <div className="text-xs font-bold text-orange-600">
              Lv.{post.userLevel}
            </div>
          </div>
        </div>
        <div className="bg-yellow-100 text-yellow-800 px-2 py-1.5 rounded-full flex items-center gap-1">
          <TrophyIcon className="w-3 h-3" />
          <span className="text-xs font-bold">+{post.points}</span>
        </div>
      </div>

      {/* Post Image */}
      <div className="relative h-64 bg-gray-100">
        <Image
          src={post.imageUrl}
          alt={post.caption}
          fill
          className="object-cover"
        />
        {/* User Level Badge */}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <TrophyIcon className="w-3 h-3" />
          <span className="text-xs font-bold">Level {post.userLevel}</span>
        </div>
      </div>

      {/* Caption & Location */}
      <div className="p-4 space-y-3">
        <p className="text-gray-900 font-medium line-clamp-3">
          {post.caption}
        </p>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPinIcon className="w-4 h-4 text-red-600" />
          <span className="truncate">{post.location}</span>
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-200 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <HandThumbUpIcon className={`w-4 h-4 ${marked ? 'fill-orange-500 text-orange-500' : ''}`} />
            <span className="font-semibold">{helpfulCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            <span className="font-semibold">{post.comments}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={handleMarkHelpful}
          disabled={marked}
          className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-bold transition-all ${
            marked
              ? 'bg-orange-100 text-orange-600 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-600'
          }`}
        >
          <HandThumbUpIcon className={`w-4 h-4 inline-block mr-1 ${marked ? 'fill-current' : ''}`} />
          {marked ? 'Helpful!' : 'Helpful'}
        </button>
        <button
          onClick={handleComment}
          className="flex-1 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-700 transition-colors"
        >
          <ChatBubbleLeftRightIcon className="w-4 h-4 inline-block mr-1" />
          Comment
        </button>
        <button
          onClick={handleShare}
          className="flex-1 py-2.5 px-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg text-sm font-bold transition-all hover:shadow-lg"
        >
          <ShareIcon className="w-4 h-4 inline-block mr-1" />
          Share
        </button>
      </div>
    </motion.div>
  );
}
