'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Flag,
  Loader2,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface ReportedPost {
  id: string;
  content: string;
  image_url: string | null;
  display_name: string;
  username: string;
  created_at: string;
  reportCount: number;
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'เมื่อกี้';
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  return `${Math.floor(hours / 24)} วันที่แล้ว`;
}

export default function ModerationQueue() {
  const [posts, setPosts] = useState<ReportedPost[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    // ดึง report ทั้งหมด แล้วนับจำนวนต่อโพสต์ฝั่ง client (ไม่มี GROUP BY ผ่าน PostgREST ตรงๆ)
    const { data: reports, error: reportsErr } = await supabase
      .from('post_reports')
      .select('post_id');

    if (reportsErr) {
      console.error('[Moderation] reports fetch error:', reportsErr.message);
      setIsLoading(false);
      return;
    }

    const countByPost = new Map<string, number>();
    (reports || []).forEach((r) => countByPost.set(r.post_id, (countByPost.get(r.post_id) || 0) + 1));
    const reportedIds = Array.from(countByPost.keys());

    if (reportedIds.length === 0) {
      setPosts([]);
      setIsLoading(false);
      return;
    }

    const { data: postRows, error: postsErr } = await supabase
      .from('community_posts')
      .select('id, content, image_url, display_name, username, created_at')
      .in('id', reportedIds);

    if (postsErr) {
      console.error('[Moderation] posts fetch error:', postsErr.message);
      setIsLoading(false);
      return;
    }

    const merged: ReportedPost[] = (postRows || [])
      .map((p) => ({ ...p, reportCount: countByPost.get(p.id) || 0 }))
      .sort((a, b) => b.reportCount - a.reportCount);

    setPosts(merged);
    setSelectedId(merged[0]?.id ?? null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selectedPost = posts.find((p) => p.id === selectedId) || null;

  const handleApprove = async () => {
    if (!selectedPost || isActing) return;
    setIsActing(true);
    const { error } = await supabase.from('post_reports').delete().eq('post_id', selectedPost.id);
    setIsActing(false);
    if (error) {
      toast.error('ล้างรายงานไม่สำเร็จ: ' + error.message);
      return;
    }
    toast.success('อนุมัติโพสต์แล้ว — ล้างรายงานทั้งหมดของโพสต์นี้');
    const remaining = posts.filter((p) => p.id !== selectedPost.id);
    setPosts(remaining);
    setSelectedId(remaining[0]?.id ?? null);
  };

  const handleReject = async () => {
    if (!selectedPost || isActing) return;
    setIsActing(true);
    const { error } = await supabase.from('community_posts').delete().eq('id', selectedPost.id);
    setIsActing(false);
    if (error) {
      toast.error('ลบโพสต์ไม่สำเร็จ: ' + error.message);
      return;
    }
    toast.success('ลบโพสต์แล้ว');
    const remaining = posts.filter((p) => p.id !== selectedPost.id);
    setPosts(remaining);
    setSelectedId(remaining[0]?.id ?? null);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="h-screen flex items-center justify-center bg-gray-900 text-gray-500">
          <Loader2 className="w-7 h-7 animate-spin mr-3" /> กำลังโหลด...
        </div>
      </AdminLayout>
    );
  }

  if (posts.length === 0 || !selectedPost) {
    return (
      <AdminLayout>
        <div className="h-screen flex flex-col bg-gray-900">
          <header className="bg-gray-950 border-b border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-h2 text-white mb-1">Content Moderation Queue</h1>
                <p className="text-body-sm text-gray-400">โพสต์ที่ถูกรายงานจริงจากผู้ใช้ (ตาราง post_reports)</p>
              </div>
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-4 py-2">
                <p className="text-caption text-green-400 mb-1">Pending Items</p>
                <p className="text-h2 text-green-400">0</p>
              </div>
            </div>
          </header>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-lg text-gray-400">ไม่มีโพสต์ที่ถูกรายงานในขณะนี้</p>
              <p className="text-sm text-gray-500 mt-2">เมื่อมีผู้ใช้กดรายงานโพสต์ (ปุ่มธงในหน้า /community) จะปรากฏที่นี่</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Toaster />
      <div className="h-screen flex flex-col bg-gray-900">
        <header className="bg-gray-950 border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 text-white mb-1">Content Moderation Queue</h1>
              <p className="text-body-sm text-gray-400">โพสต์ที่ถูกรายงานจริงจากผู้ใช้</p>
            </div>
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2">
              <p className="text-caption text-red-400 mb-1">Reported Posts</p>
              <p className="text-h2 text-red-400">{posts.length}</p>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-96 bg-gray-950 border-r border-gray-800 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-body-sm text-gray-400 uppercase tracking-wide mb-3">
                Pending Review ({posts.length})
              </h2>
              <div className="space-y-2">
                {posts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => setSelectedId(post.id)}
                    className={`w-full text-left bg-gray-900 rounded-lg p-3 transition-all border-2 ${
                      selectedId === post.id ? 'border-red-500 shadow-lg' : 'border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-caption">{(post.display_name || '?').charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm text-white mb-1">{post.display_name}</p>
                        <p className="text-caption text-gray-400 truncate">{post.content}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-caption">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{timeAgo(post.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                        <Flag className="w-3 h-3" />
                        <span>{post.reportCount}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="p-6">
              <div className="bg-gray-950 rounded-xl p-5 mb-6 border border-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl">{(selectedPost.display_name || '?').charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="text-h3 text-white mb-1">{selectedPost.display_name}</h3>
                      <div className="flex items-center gap-3 text-body-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" /> @{selectedPost.username}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> {timeAgo(selectedPost.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2">
                    <p className="text-caption text-red-400 mb-1">Reports</p>
                    <p className="text-h2 text-red-400">{selectedPost.reportCount}</p>
                  </div>
                </div>
              </div>

              {selectedPost.image_url && (
                <div className="bg-gray-950 rounded-xl overflow-hidden mb-6 border border-gray-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedPost.image_url} alt="Post content" className="w-full h-96 object-cover" />
                </div>
              )}

              <div className="bg-gray-950 rounded-xl p-5 mb-6 border border-gray-800">
                <h4 className="text-body-sm text-gray-400 uppercase tracking-wide mb-3">Post Content</h4>
                <p className="text-white whitespace-pre-line">{selectedPost.content}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-950 border-t-2 border-gray-800 px-6 py-4">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleReject}
              disabled={isActing}
              className="flex items-center gap-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-8 py-4 rounded-xl text-button transition-all shadow-lg hover:shadow-xl min-w-[200px] justify-center"
            >
              <XCircle className="w-6 h-6" /> Reject &amp; ลบโพสต์
            </button>
            <button
              onClick={handleApprove}
              disabled={isActing}
              className="flex items-center gap-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-8 py-4 rounded-xl text-button transition-all shadow-lg hover:shadow-xl min-w-[200px] justify-center"
            >
              <CheckCircle className="w-6 h-6" /> Approve &amp; ล้างรายงาน
            </button>
          </div>
          <p className="text-center text-caption text-gray-500 mt-3">{posts.length} รายการที่ถูกรายงาน</p>
        </div>
      </div>
    </AdminLayout>
  );
}
