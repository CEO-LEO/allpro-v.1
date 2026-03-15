'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '@/components/Admin/AdminLayout';
import { 
  CheckCircle, 
  XCircle, 
  MapPin, 
  Clock, 
  Award,
  AlertTriangle,
  Ban,
  User,
  TrendingUp,
  Flag
} from 'lucide-react';
import { pendingPosts, getUserStats, PendingPost } from '@/data/adminMockData';
import toast, { Toaster } from 'react-hot-toast';

export default function ModerationQueue() {
  const [posts, setPosts] = useState<PendingPost[]>(pendingPosts);
  const [selectedPost, setSelectedPost] = useState<PendingPost>(posts[0]);
  const [userStats, setUserStats] = useState(getUserStats(posts[0].userId));

  const handleApprove = () => {
    toast.success(
      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5" />
        <div>
          <p className="text-body-sm text-sm">Post Approved!</p>
          <p className="text-caption text-gray-600">User earned +{selectedPost.points} points</p>
        </div>
      </div>,
      {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#10B981',
          color: '#fff',
          padding: '12px 16px',
          borderRadius: '12px',
        }
      }
    );

    // Remove from queue
    const remainingPosts = posts.filter(p => p.id !== selectedPost.id);
    setPosts(remainingPosts);
    if (remainingPosts.length > 0) {
      setSelectedPost(remainingPosts[0]);
      setUserStats(getUserStats(remainingPosts[0].userId));
    }
  };

  const handleReject = () => {
    toast.error(
      <div className="flex items-center gap-2">
        <XCircle className="w-5 h-5" />
        <div>
          <p className="text-body-sm">Post Rejected</p>
          <p className="text-caption text-gray-200">Hidden from public feed</p>
        </div>
      </div>,
      {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#EF4444',
          color: '#fff',
          padding: '12px 16px',
          borderRadius: '12px',
        }
      }
    );

    // Remove from queue
    const remainingPosts = posts.filter(p => p.id !== selectedPost.id);
    setPosts(remainingPosts);
    if (remainingPosts.length > 0) {
      setSelectedPost(remainingPosts[0]);
      setUserStats(getUserStats(remainingPosts[0].userId));
    }
  };

  const handleBanUser = () => {
    const confirmed = confirm(
      `⚠️ Ban User: ${selectedPost.userName}\n\nThis will:\n- Suspend their account\n- Hide all their posts\n- Prevent future uploads\n\nAre you sure?`
    );

    if (confirmed) {
      toast(
        <div className="flex items-center gap-2">
          <Ban className="w-5 h-5" />
          <div>
            <p className="text-body-sm">User Banned</p>
            <p className="text-caption text-gray-200">{selectedPost.userName} can no longer post</p>
          </div>
        </div>,
        {
          duration: 4000,
          position: 'top-center',
          icon: '🔨',
          style: {
            background: '#7C3AED',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: '12px',
          }
        }
      );

      // Remove from queue
      const remainingPosts = posts.filter(p => p.id !== selectedPost.id);
      setPosts(remainingPosts);
      if (remainingPosts.length > 0) {
        setSelectedPost(remainingPosts[0]);
        setUserStats(getUserStats(remainingPosts[0].userId));
      }
    }
  };

  return (
    <AdminLayout>
      <Toaster />
      <div className="h-screen flex flex-col bg-gray-900">
        {/* Header */}
        <header className="bg-gray-950 border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 text-white mb-1">Content Moderation Queue</h1>
              <p className="text-body-sm text-gray-400">Review community-submitted posts</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2">
                <p className="text-caption text-red-400 mb-1">Pending Items</p>
                <p className="text-h2 text-red-400">{posts.length}</p>
              </div>
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-4 py-2">
                <p className="text-caption text-green-400 mb-1">Processed Today</p>
                <p className="text-h2 text-green-400">48</p>
              </div>
            </div>
          </div>
        </header>

        {/* Split Screen Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Pending Posts List */}
          <div className="w-96 bg-gray-950 border-r border-gray-800 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-body-sm text-gray-400 uppercase tracking-wide mb-3">
                Pending Review ({posts.length})
              </h2>
              
              <div className="space-y-2">
                {posts.map((post) => (
                  <motion.button
                    key={post.id}
                    onClick={() => {
                      setSelectedPost(post);
                      setUserStats(getUserStats(post.userId));
                    }}
                    className={`
                      w-full text-left bg-gray-900 rounded-lg p-3 transition-all border-2
                      ${selectedPost.id === post.id 
                        ? 'border-red-500 shadow-lg' 
                        : 'border-gray-800 hover:border-gray-700'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-caption">{post.userAvatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm text-white mb-1">{post.userName}</p>
                        <p className="text-caption text-gray-400 truncate">{post.caption}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-caption">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{post.timestamp}</span>
                      </div>
                      
                      {post.reportCount > 0 && (
                        <div className="flex items-center gap-1 bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                          <Flag className="w-3 h-3" />
                          <span>{post.reportCount}</span>
                        </div>
                      )}
                    </div>

                    {/* Category Indicator */}
                    {post.category === 'spam' && (
                      <div className="mt-2 bg-yellow-500/20 border border-yellow-500/30 rounded px-2 py-1 text-caption text-yellow-400">
                        ⚠️ Spam Detected
                      </div>
                    )}
                    {post.category === 'inappropriate' && (
                      <div className="mt-2 bg-red-500/20 border border-red-500/30 rounded px-2 py-1 text-caption text-red-400">
                        🚨 Flagged Content
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Detail View */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedPost.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <div className="p-6">
                  {/* User Info Header */}
                  <div className="bg-gray-950 rounded-xl p-5 mb-6 border border-gray-800">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xl">{selectedPost.userAvatar}</span>
                        </div>
                        <div>
                          <h3 className="text-h3 text-white mb-1">{selectedPost.userName}</h3>
                          <div className="flex items-center gap-3 text-body-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {selectedPost.userId}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {selectedPost.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>

                      {selectedPost.reportCount > 0 && (
                        <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2">
                          <p className="text-caption text-red-400 mb-1">Reports</p>
                          <p className="text-h2 text-red-400">{selectedPost.reportCount}</p>
                        </div>
                      )}
                    </div>

                    {/* User Stats */}
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-gray-900 rounded-lg p-3 text-center">
                        <p className="text-caption text-gray-400 mb-1">Total Posts</p>
                        <p className="text-h4 text-white">{userStats.totalPosts}</p>
                      </div>
                      <div className="bg-gray-900 rounded-lg p-3 text-center">
                        <p className="text-caption text-gray-400 mb-1">Approved</p>
                        <p className="text-h4 text-green-400">{userStats.approvedPosts}</p>
                      </div>
                      <div className="bg-gray-900 rounded-lg p-3 text-center">
                        <p className="text-caption text-gray-400 mb-1">Total Points</p>
                        <p className="text-h4 text-yellow-400">{userStats.totalPoints}</p>
                      </div>
                      <div className="bg-gray-900 rounded-lg p-3 text-center">
                        <p className="text-caption text-gray-400 mb-1">Account Age</p>
                        <p className="text-h4 text-blue-400">{userStats.accountAge}</p>
                      </div>
                    </div>
                  </div>

                  {/* Post Image */}
                  <div className="bg-gray-950 rounded-xl overflow-hidden mb-6 border border-gray-800">
                    <img 
                      src={selectedPost.imageUrl} 
                      alt="Post content"
                      className="w-full h-96 object-cover"
                    />
                  </div>

                  {/* Post Details */}
                  <div className="bg-gray-950 rounded-xl p-5 mb-6 border border-gray-800">
                    <h4 className="text-body-sm text-gray-400 uppercase tracking-wide mb-3">
                      Post Details
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-caption text-gray-500 mb-1 block">Caption</label>
                        <p className="text-white">{selectedPost.caption}</p>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span className="text-body-sm">{selectedPost.location}</span>
                      </div>

                      <div className="flex items-center gap-2 text-yellow-400">
                        <Award className="w-4 h-4" />
                        <span className="text-body-sm">+{selectedPost.points} points reward</span>
                      </div>
                    </div>
                  </div>

                  {/* Warning for Bad Content */}
                  {(selectedPost.category === 'spam' || selectedPost.category === 'inappropriate') && (
                    <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-5 mb-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
                        <div>
                          <h4 className="text-red-400 font-bold mb-2">⚠️ Content Warning</h4>
                          <p className="text-body-sm text-red-300 mb-3">
                            {selectedPost.category === 'spam' 
                              ? 'This post appears to be spam or commercial advertising.'
                              : 'This post has been flagged for inappropriate content.'}
                          </p>
                          <button
                            onClick={handleBanUser}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                          >
                            <Ban className="w-4 h-4" />
                            Ban User Account
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Fixed Action Buttons */}
        <div className="bg-gray-950 border-t-2 border-gray-800 px-6 py-4">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleReject}
              className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl text-button transition-all shadow-lg hover:shadow-xl min-w-[200px] justify-center"
            >
              <XCircle className="w-6 h-6" />
              Reject Post
            </button>

            <button
              onClick={handleApprove}
              className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-button transition-all shadow-lg hover:shadow-xl min-w-[200px] justify-center"
            >
              <CheckCircle className="w-6 h-6" />
              Approve & Award Points
            </button>
          </div>

          <p className="text-center text-caption text-gray-500 mt-3">
            {posts.length} items remaining in queue
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
