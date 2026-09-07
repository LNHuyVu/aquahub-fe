'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';
import { Post } from '@/types';
import {
  MessageSquare,
  Heart,
  Bookmark,
  Image as ImageIcon,
  Send,
  User as UserIcon,
  Compass,
  Sparkles,
  LogIn,
  Lock,
} from 'lucide-react';

const COMMUNITY_CATEGORIES = [
  'Tất cả',
  '🐟 Cá cảnh',
  '🌱 Thủy sinh',
  '💧 Nước & Vi sinh',
  '🦠 Bệnh & Chăm sóc',
  '🍤 Thức ăn',
  '🧰 Thiết bị',
  '🐣 Sinh sản',
  '🦐 Tép & Sinh vật',
  '💰 Mua bán',
];

export default function CommunityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [newPostCategory, setNewPostCategory] = useState('🐟 Cá cảnh');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts(selectedCategory);
  }, [selectedCategory]);

  const fetchPosts = async (cat: string) => {
    setLoading(true);
    try {
      const queryParam = cat !== 'Tất cả' ? `?category=${encodeURIComponent(cat)}` : '';
      const res: any = await api.get(`/posts${queryParam}`);
      setPosts(res.data.items || []);
    } catch (err) {
      console.error('Failed to load posts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    if (!newContent.trim()) return;

    setSubmitting(true);
    try {
      const res: any = await api.post('/posts', { 
        content: newContent,
        category: newPostCategory,
      });
      setPosts([res.data, ...posts]);
      setNewContent('');
    } catch (err) {
      console.error('Failed to create post', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      const res: any = await api.post(`/posts/${postId}/like`);
      setPosts(
        posts.map((p) =>
          p.id === postId
            ? { ...p, isLiked: res.data.isLiked, likesCount: res.data.likesCount }
            : p
        )
      );
    } catch (err) {
      console.error('Failed to like post', err);
    }
  };

  const handleActionRequireAuth = () => {
    if (!user) {
      router.push('/login');
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 space-y-4 sm:space-y-6">
      
      {/* Synchronized Header Banner */}
      <div className="bg-gradient-to-r from-[#1A94FF] via-[#0B74E5] to-[#0D5CB6] rounded-3xl p-8 sm:p-10 text-white shadow-lg shadow-blue-500/10 space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur border border-white/30">
            <Compass className="w-4 h-4 text-amber-300" />
            <span>Mạng xã hội thủy sinh</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Cộng Đồng Thủy Sinh & Cá Cảnh</h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl">
            Chia sẻ hình ảnh bể cá, nhật ký chăm sóc cá và cùng giao lưu kinh nghiệm nuôi sinh vật cảnh.
          </p>
        </div>
      </div>

      {/* Compact Membership Info Banner */}
      <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-800 shrink-0">
          <Sparkles className="w-4 h-4 text-[#1A94FF]" />
          <span>Quyền hạn thành viên:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-slate-600 text-[11px] sm:text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
            <strong>👀 Khách:</strong> Tự do xem bài viết, bình luận & cẩm nang
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
            <strong>🔑 Thành viên:</strong> Đăng bài, thả tim, bình luận & nhật ký hồ
          </span>
        </div>
      </div>

      {/* Category Navigation Bar */}
      <div className="bg-white border border-blue-100 rounded-2xl p-3 shadow-sm flex items-center gap-2 overflow-x-auto scrollbar-none">
        {COMMUNITY_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-[#1A94FF] text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-[#1A94FF]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Feed Column */}
        <div className="lg:col-span-12 space-y-6">
          
          {/* Create Post Card */}
          <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm space-y-4">
            {user ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1A94FF] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-sm">
                        {user.displayName || user.username}
                      </span>
                      <p className="text-xs text-slate-400">Bạn đang nghĩ gì về bể cá hôm nay?</p>
                    </div>
                  </div>

                  {/* Category Selector for New Post */}
                  <div className="flex items-center gap-2 bg-blue-50/70 border border-blue-100 px-3 py-1.5 rounded-xl">
                    <span className="text-xs font-semibold text-slate-600 shrink-0">Danh mục:</span>
                    <select
                      value={newPostCategory}
                      onChange={(e) => setNewPostCategory(e.target.value)}
                      className="bg-transparent text-xs font-bold text-[#0B74E5] focus:outline-none cursor-pointer"
                    >
                      {COMMUNITY_CATEGORIES.filter((c) => c !== 'Tất cả').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <form onSubmit={handleCreatePost} className="space-y-3">
                  <textarea
                    rows={3}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Chia sẻ hình ảnh, trải nghiệm hoặc thành quả chăm cá của bạn..."
                    className="w-full bg-slate-50 border border-blue-100 rounded-xl p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1A94FF] focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition resize-none"
                  />

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#1A94FF] px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
                    >
                      <ImageIcon className="w-4 h-4 text-[#1A94FF]" />
                      Thêm hình ảnh
                    </button>

                    <button
                      type="submit"
                      disabled={submitting || !newContent.trim()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A94FF] hover:bg-[#0D5CB6] text-white font-bold text-sm shadow-md shadow-blue-500/20 transition disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submitting ? 'Đang đăng...' : 'Đăng bài'}</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#E5F2FF]/60 border border-blue-200 text-slate-700">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="w-10 h-10 rounded-xl bg-[#1A94FF] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Bạn cần đăng nhập để đăng bài viết</h4>
                    <p className="text-xs text-slate-500">Đăng ký hoặc đăng nhập tài khoản AquaHub để tương tác cùng cộng đồng.</p>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1A94FF] hover:bg-[#0D5CB6] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex-shrink-0"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập ngay</span>
                </Link>
              </div>
            )}
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-white border border-blue-100 rounded-2xl animate-pulse" />
              ))
            ) : posts.length === 0 ? (
              <div className="bg-white border border-blue-100 rounded-2xl p-6 text-center text-slate-400 space-y-2">
                <Compass className="w-10 h-10 text-[#1A94FF] mx-auto" />
                <p className="font-bold text-slate-700">Chưa có bài viết nào trong danh mục này</p>
                <p className="text-xs text-slate-400">Hãy là người đầu tiên đóng góp bài viết cho "{selectedCategory}"!</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm space-y-3 hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1A94FF] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        {post.author?.username?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {post.author?.displayName || post.author?.username || 'Thành viên AquaHub'}
                        </h4>
                        <span className="text-xs text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    <span className="px-3 py-1 text-xs font-bold bg-blue-50 text-[#0B74E5] rounded-full border border-blue-100">
                      {post.category || '🐟 Cá cảnh'}
                    </span>
                  </div>

                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>

                  {post.images && post.images.length > 0 && (
                    <div className="rounded-xl overflow-hidden max-h-96 bg-slate-100">
                      <img src={post.images[0]} alt="Post media" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-3 border-t border-blue-50 text-xs text-slate-500 font-medium">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1.5 transition ${
                        post.isLiked ? 'text-rose-500 font-bold' : 'hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-500' : ''}`} />
                      <span>{post.likesCount} Thích</span>
                    </button>

                    <button
                      onClick={handleActionRequireAuth}
                      className="flex items-center gap-1.5 hover:text-[#1A94FF] transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.commentsCount} Bình luận</span>
                    </button>

                    <button
                      onClick={handleActionRequireAuth}
                      className="flex items-center gap-1.5 hover:text-[#1A94FF] transition ml-auto"
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>Lưu</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
