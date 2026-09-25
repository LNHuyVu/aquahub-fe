'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';
import { Post, PostCategory } from '@/types';
import {
  MessageSquare,
  Heart,
  Bookmark,
  Image as ImageIcon,
  Send,
  Compass,
  Sparkles,
  LogIn,
  Lock,
  Loader2,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast-provider';
import DetailPageHeader from '@/components/ui/detail-page-header';

const DEFAULT_CATEGORIES = [
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

const PAGE_SIZE = 24;

const extractPosts = (res: any): Post[] => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.items)) return res.data.items;
  if (Array.isArray(res.data?.data)) return res.data.data;
  if (Array.isArray(res.data?.data?.items)) return res.data.data.items;
  return [];
};

const extractCategories = (res: any): PostCategory[] => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.data)) return res.data.data;
  return [];
};

export default function CommunityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/posts/categories')
      .then((res: any) => {
        const cats = extractCategories(res);
        if (cats.length > 0) {
          setCategories(cats);
          if (!selectedCategoryId) {
            setSelectedCategoryId(cats[0].id);
          }
        }
      })
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  const fetchInitialPosts = useCallback(async (cat: string) => {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    try {
      if (cat === 'Tất cả') {
        const res: any = await api.get('/posts', { params: { page: 1, limit: 100 } });
        const items = extractPosts(res);
        setAllPosts(items);
        setHasMore(false);
      } else {
        const matchedCat = categories.find((c) => c.name === cat || c.slug === cat);
        const catQuery = matchedCat ? matchedCat.id : cat;
        const params: Record<string, any> = { page: 1, limit: PAGE_SIZE, category: catQuery };
        const res: any = await api.get('/posts', { params });
        const items = extractPosts(res);
        setAllPosts(items);
        if (items.length < PAGE_SIZE) setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load posts', err);
    } finally {
      setLoading(false);
    }
  }, [categories]);

  const fetchMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore || selectedCategory === 'Tất cả') return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const matchedCat = categories.find((c) => c.name === selectedCategory || c.slug === selectedCategory);
      const catQuery = matchedCat ? matchedCat.id : selectedCategory;
      const params: Record<string, any> = { page: nextPage, limit: PAGE_SIZE, category: catQuery };
      const res: any = await api.get('/posts', { params });
      const items = extractPosts(res);
      setAllPosts((prev) => [...prev, ...items]);
      setPage(nextPage);
      if (items.length < PAGE_SIZE) setHasMore(false);
    } catch (err) {
      console.error('Failed to load more posts', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, selectedCategory, categories]);

  useEffect(() => {
    fetchInitialPosts(selectedCategory);
  }, [selectedCategory, fetchInitialPosts]);

  useEffect(() => {
    if (selectedCategory === 'Tất cả') return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchMorePosts();
        }
      },
      { rootMargin: '120px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [selectedCategory, hasMore, loadingMore, loading, fetchMorePosts]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    if (!newTitle.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài viết.');
      return;
    }
    if (!newContent.trim()) {
      toast.error('Vui lòng nhập nội dung bài viết.');
      return;
    }

    setSubmitting(true);
    try {
      const res: any = await api.post('/posts', {
        title: newTitle.trim(),
        content: newContent.trim(),
        categoryId: selectedCategoryId || undefined,
      });
      const createdPost = res?.data?.data || res?.data || res;
      if (createdPost && createdPost.id) {
        setAllPosts((prev) => [createdPost, ...prev]);
      } else {
        fetchInitialPosts(selectedCategory);
      }
      setNewTitle('');
      setNewContent('');
      toast.success('Đăng bài thành công!');
    } catch (err) {
      console.error('Failed to create post', err);
      toast.error('Không thể đăng bài viết. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      const res: any = await api.post(`/posts/${postId}/like`);
      const payload = res?.data || res;
      setAllPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isLiked: payload.isLiked, likesCount: payload.likesCount }
            : p
        )
      );
    } catch (err) {
      console.error('Failed to like post', err);
    }
  };

  const handleToggleBookmark = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      const res: any = await api.post(`/posts/${postId}/bookmark`);
      const payload = res?.data || res;
      setAllPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isBookmarked: payload.isBookmarked }
            : p
        )
      );
      toast.success(payload.isBookmarked ? 'Đã lưu bài viết' : 'Đã bỏ lưu bài viết');
    } catch (err) {
      console.error('Failed to bookmark post', err);
    }
  };

  // Full width single-row post item layout
  const renderPostRow = (post: Post) => (
    <div
      key={post.id}
      onClick={() => router.push(`/cong-dong/${post.slug || post.id}`)}
      className="px-4 py-3 sm:px-6 hover:bg-white hover:shadow-2xs transition duration-150 cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative border-l-2 border-l-transparent hover:border-l-[#1A94FF]"
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        {post.author?.avatar ? (
          <img
            src={post.author.avatar}
            alt={post.author.displayName || post.author.username}
            className="w-8 h-8 rounded-full object-cover shadow-2xs shrink-0 border border-blue-100"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0B74E5] flex items-center justify-center font-bold text-xs shrink-0">
            {post.author?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-600 group-hover:text-[#1A94FF] transition truncate max-w-[150px] sm:max-w-xs">
              {post.author?.displayName || post.author?.username || 'Thành viên AquaHub'}
            </span>
            <span>•</span>
            <span className="shrink-0">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>

          <h3 className="text-xs sm:text-sm font-medium text-slate-800 group-hover:text-[#1A94FF] group-hover:font-semibold transition leading-snug truncate">
            {post.title || post.content}
          </h3>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 text-xs text-slate-500 font-medium shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => handleToggleLike(e, post.id)}
            className={`flex items-center gap-1.5 transition cursor-pointer ${
              post.isLiked ? 'text-rose-500 font-bold' : 'hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-500' : ''}`} />
            <span>{post.likesCount || 0}</span>
          </button>

          <div className="flex items-center gap-1.5 text-slate-600 font-semibold group-hover:text-[#1A94FF] transition">
            <MessageSquare className="w-4 h-4 text-[#1A94FF]" />
            <span>{post.commentsCount || 0}</span>
          </div>

          <button
            onClick={(e) => handleToggleBookmark(e, post.id)}
            className={`flex items-center gap-1.5 transition cursor-pointer ${
              post.isBookmarked ? 'text-[#1A94FF] font-bold' : 'hover:text-[#1A94FF]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-[#1A94FF]' : ''}`} />
          </button>
        </div>

        <div className="inline-flex items-center gap-1 text-xs font-bold text-[#1A94FF] group-hover:translate-x-1 transition-transform">
          <span>Xem chi tiết</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );

  const displayCategories = categories.length > 0 ? categories.map((c) => c.name) : DEFAULT_CATEGORIES;
  const navCategories = ['Tất cả', ...displayCategories];

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Breadcrumb Header */}
      <DetailPageHeader
        breadcrumbs={[]}
        currentTitle="Cộng Đồng Thủy Sinh"
        showShare={false}
        showBack={false}
      />

      {/* Header Banner */}
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

      {/* Category Navigation Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-2.5 shadow-2xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {navCategories.map((catName) => {
          const isActive = selectedCategory === catName;
          return (
            <button
              key={catName}
              onClick={() => setSelectedCategory(catName)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-[#1A94FF] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-[#1A94FF]'
              }`}
            >
              {catName}
            </button>
          );
        })}
      </div>

      {/* Create Post Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
        {user ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#1A94FF] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    {user.displayName || user.username}
                  </span>
                  <p className="text-[11px] text-slate-400">Bạn đang nghĩ gì về bể cá hôm nay?</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
                <span className="text-[11px] font-bold text-slate-400 shrink-0 uppercase">Danh mục:</span>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="bg-transparent text-xs font-extrabold text-[#0B74E5] focus:outline-none cursor-pointer"
                >
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))
                  ) : (
                    DEFAULT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-2.5">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Tiêu đề bài viết (*)..."
                required
                className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1A94FF] focus:bg-white transition"
              />

              <textarea
                rows={2}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Nội dung bài viết, chia sẻ hình ảnh, trải nghiệm (*)..."
                required
                className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1A94FF] focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition resize-none"
              />

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#1A94FF] px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-[#1A94FF]" />
                  <span>Thêm hình ảnh</span>
                </button>

                <button
                  type="submit"
                  disabled={submitting || !newTitle.trim() || !newContent.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A94FF] hover:bg-[#0D5CB6] text-white font-bold text-sm shadow-md shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer"
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

      {/* Main Unified Content Section */}
      <div className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="h-12 bg-slate-50 rounded-xl" />
            ))}
          </div>
        ) : selectedCategory === 'Tất cả' ? (
          <div className="divide-y-2 divide-blue-100/80">
            {displayCategories.map((catName) => {
              const categoryPosts = allPosts.filter((p) => {
                if (!p) return false;
                const pCatName = typeof p.category === 'object' ? p.category?.name : p.category;
                const pCatSlug = typeof p.category === 'object' ? p.category?.slug : undefined;
                const pCatId = typeof p.category === 'object' ? p.category?.id : p.categoryId;

                if (pCatName && pCatName.trim().toLowerCase() === catName.trim().toLowerCase()) return true;
                const matchedCat = categories.find((c) => c.name === catName || c.slug === catName);
                if (matchedCat) {
                  if (pCatId && pCatId === matchedCat.id) return true;
                  if (pCatSlug && pCatSlug === matchedCat.slug) return true;
                }
                return false;
              }).slice(0, 3);

              return (
                <div key={catName} className="flex flex-col">
                  {/* Prominent Banner Category Header Row */}
                  <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-[#0B74E5] px-4 sm:px-5 py-3.5 flex items-center justify-between text-white shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold backdrop-blur border border-white/30 shrink-0">
                        <Compass className="w-4 h-4 text-amber-300" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-black text-white tracking-wide uppercase">
                            {catName}
                          </h2>
                          <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-blue-100 text-[10px] font-bold border border-white/20">
                            {categoryPosts.length} bài mới
                          </span>
                        </div>
                        {/* Stylish Underline Accent under Category Name */}
                        <div className="h-[3px] w-28 bg-gradient-to-r from-cyan-400 to-amber-300 rounded-full mt-1" />
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedCategory(catName)}
                      className="inline-flex items-center gap-1.5 text-white hover:bg-white hover:text-[#0B74E5] font-bold text-xs transition cursor-pointer group bg-white/15 backdrop-blur px-3 py-1.5 rounded-xl border border-white/30 shadow-xs relative z-10"
                    >
                      <span>Xem thêm</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                  {/* 3 Child Posts Stacked Vertically with Left Inset Indent */}
                  {categoryPosts.length > 0 ? (
                    <div className="divide-y divide-slate-100 bg-slate-50/40">
                      {categoryPosts.map((post) => renderPostRow(post))}
                    </div>
                  ) : (
                    <div className="px-5 py-4 text-slate-400 text-xs flex items-center justify-between bg-slate-50/60">
                      <span className="italic font-medium">Chưa có bài viết trong danh mục này</span>
                      <button
                        onClick={() => {
                          const matchedCat = categories.find((c) => c.name === catName);
                          if (matchedCat) setSelectedCategoryId(matchedCat.id);
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className="text-[#1A94FF] font-bold hover:underline cursor-pointer"
                      >
                        + Đăng bài ngay
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* FILTERED CATEGORY VIEW: SINGLE ROW LIST WITH INFINITE SCROLL */
          <div className="divide-y divide-slate-100">
            <div className="bg-blue-50/60 px-4 py-3 flex items-center justify-between border-b border-blue-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm sm:text-base">
                  Danh mục: <span className="text-[#1A94FF]">{selectedCategory}</span>
                </span>
                <span className="text-xs text-slate-400 font-medium">({allPosts.length} bài viết)</span>
              </div>
              <button
                onClick={() => setSelectedCategory('Tất cả')}
                className="text-xs font-bold text-[#1A94FF] hover:underline cursor-pointer"
              >
                ← Quay lại tất cả danh mục
              </button>
            </div>

            {allPosts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Compass className="w-10 h-10 text-[#1A94FF] mx-auto" />
                <p className="font-bold text-slate-700">Chưa có bài viết nào trong danh mục này</p>
                <p className="text-xs text-slate-400">Hãy là người đầu tiên đóng góp bài viết cho "{selectedCategory}"!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {allPosts.map((post) => renderPostRow(post))}
              </div>
            )}

            <div ref={sentinelRef} className="h-4" />

            {loadingMore && (
              <div className="flex items-center justify-center py-4 gap-2 text-slate-400 text-xs font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-[#1A94FF]" />
                <span>Đang tải thêm bài viết...</span>
              </div>
            )}

            {!hasMore && allPosts.length > 0 && !loading && (
              <div className="flex items-center justify-center py-4 gap-2 text-slate-400 text-xs font-medium">
                <span>✅ Bạn đã xem hết tất cả bài viết trong {selectedCategory}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
