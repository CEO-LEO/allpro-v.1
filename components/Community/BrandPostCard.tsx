'use client';

import { motion } from 'framer-motion';
import { 
  BuildingStorefrontIcon, 
  ClockIcon, 
  MapPinIcon, 
  TagIcon, 
  ArrowTrendingUpIcon, 
  HeartIcon, 
  ShareIcon, 
  ArrowTopRightOnSquareIcon 
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';

interface BrandPost {
  id: string;
  brandName: string;
  brandLogo: string;
  brandVerified: boolean;
  title: string;
  description: string;
  discount: string;
  imageUrl: string;
  category: string;
  validUntil: string;
  location: string;
  timeAgo: string;
  likes: number;
  shares: number;
}

interface BrandPostCardProps {
  post: BrandPost;
}

export default function BrandPostCard({ post }: BrandPostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLikesCount(likesCount + 1);
      toast.success('Liked! ❤️');
    }
  };

  const handleShare = () => {
    toast.success('Link copied to clipboard! 📋');
  };

  const handleViewDeal = () => {
    toast.success('Opening deal details...');
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="w-80 bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all"
    >
      {/* Brand Header */}
      <div className="p-4 flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100">
        <div className="relative">
          <Image
            src={post.brandLogo}
            alt={post.brandName}
            width={48}
            height={48}
            className="rounded-full border-2 border-blue-400 bg-white p-1"
          />
          {post.brandVerified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-white text-caption">✓</span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-900">{post.brandName}</p>
            <BuildingStorefrontIcon className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-center gap-1 text-caption text-gray-500">
            <ClockIcon className="w-3 h-3" />
            <span>{post.timeAgo}</span>
          </div>
        </div>
        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-caption">
          {post.discount}
        </div>
      </div>

      {/* Promotion Image */}
      <div className="relative h-64 bg-gray-100">
        <Image
          src={post.imageUrl}
          alt={post.title}
          fill
          className="object-cover"
        />
        {/* Category Tag */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <TagIcon className="w-3 h-3 text-orange-500" />
          <span className="text-caption text-gray-900">{post.category}</span>
        </div>
        {/* Trending Badge */}
        {post.likes > 50 && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <ArrowTrendingUpIcon className="w-3 h-3" />
            <span className="text-caption">HOT</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-h4 text-gray-900 mb-1 line-clamp-1">
            {post.title}
          </h3>
          <p className="text-gray-600 text-body-sm line-clamp-2">
            {post.description}
          </p>
        </div>

        {/* Location & Valid Until */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPinIcon className="w-4 h-4 text-red-600" />
            <span className="truncate">{post.location}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <ClockIcon className="w-4 h-4 text-blue-600" />
            <span>Valid until {post.validUntil}</span>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-200 text-body-sm text-gray-500">
          <div className="flex items-center gap-1">
            <HeartIcon className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="font-semibold">{likesCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <ShareIcon className="w-4 h-4" />
            <span className="font-semibold">{post.shares}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={handleLike}
          className={`flex-1 py-2.5 px-3 rounded-lg text-body-sm transition-all ${
            liked
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <HeartIcon className={`w-4 h-4 inline-block mr-1 ${liked ? 'fill-current' : ''}`} />
          {liked ? 'Liked' : 'Like'}
        </button>
        <button
          onClick={handleShare}
          className="flex-1 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-body-sm text-gray-700 transition-colors"
        >
          <ShareIcon className="w-4 h-4 inline-block mr-1" />
          Share
        </button>
        <button
          onClick={handleViewDeal}
          className="flex-1 py-2.5 px-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg text-body-sm transition-all hover:shadow-lg"
        >
          <ArrowTopRightOnSquareIcon className="w-4 h-4 inline-block mr-1" />
          View
        </button>
      </div>
    </motion.div>
  );
}
