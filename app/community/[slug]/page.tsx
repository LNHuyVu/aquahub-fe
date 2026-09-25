'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';
import { Post } from '@/types';
import AdBanner from '@/components/ui/ad-banner';
import {
  MessageSquare,
  Heart,
  Bookmark,
  Send,
  ArrowLeft,
  Sparkles,
  LogIn,
  Share2,
  Lock,
  Loader2,
  Clock,
  ChevronRight,
  Compass,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast-provider';
import ReportModal from '@/components/ui/report-modal';

import DetailPageHeader from '@/components/ui/detail-page-header';

interface CommentItem {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author?: {
    id: string;
    username: string;
    displayName?: string;
    avatar?: string;
  };
  createdAt: string;
}

const getCategoryName = (cat: any): string => {
  if (!cat) return '🐟 Cá cảnh';
  if (typeof cat === 'object') return cat.name || cat.slug || '🐟 Cá cảnh';
  return String(cat);
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slugOrId = (params.slug || params.id) as string;
  const { user } = useAuth();
  const { toast } = useToast();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (slugOrId) {
      fetchPostAndComments(true);

      const interval = setInterval(() => {
        fetchPostAndComments(false);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [slugOrId]);

  useEffect(() => {
    api.get('/posts', { params: { page: 1, limit: 5 } })
      .then((res: any) => {
        const items = Array.isArray(res)
          ? res
          : Array.isArray(res?.items)
          ? res.items
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.items)
          ? res.data.items
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
        setRecentPosts(items);
      })
      .catch(() => {});
  }, []);

  const fetchPostAndComments = async (isFirstLoad = false) => {
    if (isFirstLoad) setLoading(true);
    try {
      const postRes: any = await api.get(`/posts/${slugOrId}`);
      const postData = postRes?.data?.data || postRes?.data || postRes || null;
      setPost(postData);

      if (postData?.id) {
        const commentsRes: any = await api.get(`/posts/${postData.id}/comments`);
        const commentsData = Array.isArray(commentsRes)
          ? commentsRes
          : Array.isArray(commentsRes?.data)
          ? commentsRes.data
          : Array.isArray(commentsRes?.data?.data)
          ? commentsRes.data.data
          : [];
        setComments(commentsData);
      }
    } catch (err: any) {
      if (isFirstLoad) {
        console.error('Failed to load post detail', err);
        toast.error('Không tìm thấy bài viết hoặc bài viết đã bị xóa');
      }
    } finally {
      if (isFirstLoad) setLoading(false);
    }
  };

  const handleToggleLike = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!post) return;

    try {
      const res: any = await api.post(`/posts/${post.id}/like`);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              isLiked: res.data.isLiked,
              likesCount: res.data.likesCount,
            }
          : null
      );
    } catch (err) {
      toast.error('Lỗi khi thả tim bài viết');
    }
  };

  const handleToggleBookmark = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!post) return;

    try {
      const res: any = await api.post(`/posts/${post.id}/bookmark`);
      setPost((prev) =>
        prev ? { ...prev, isBookmarked: res.data.isBookmarked } : null
      );
      toast.success(res.data.isBookmarked ? 'Đã lưu bài viết' : 'Đã bỏ lưu bài viết');
    } catch (err) {
      toast.error('Lỗi khi lưu bài viết');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    if (!commentText.trim() || !post) return;

    setSubmittingComment(true);
    try {
      const res: any = await api.post(`/posts/${post.id}/comments`, {
        content: commentText.trim(),
      });

      const newComment = res.data;
      setComments((prev) => [...prev, newComment]);
      setCommentText('');
      setPost({ ...post, commentsCount: (post.commentsCount || 0) + 1 });
      toast.success('Đã gửi bình luận của bạn!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi gửi bình luận');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết chia sẻ!');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1A94FF] animate-spin" />
          <p className="text-slate-600 font-medium text-sm">Đang tải bài viết cộng đồng...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-12 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center border border-blue-100 shadow-sm space-y-4">
          <div className="w-14 h-14 bg-blue-50 text-[#1A94FF] rounded-2xl flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Không tìm thấy bài viết</h2>
          <p className="text-slate-500 text-sm">
            Bài viết này có thể đã bị xóa hoặc không còn khả dụng trên AquaHub.
          </p>
          <Link
            href="/cong-dong"
            className="inline-flex items-center justify-center gap-2 bg-[#1A94FF] hover:bg-[#0D5CB6] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại Cộng đồng
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Cộng đồng', href: '/cong-dong' },
  ];

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 space-y-4 max-w-6xl">
      {/* UNIFIED SHARED BREADCRUMB & HEADER */}
      <DetailPageHeader
        breadcrumbs={breadcrumbs}
        currentTitle={post.title || 'Chi tiết bài viết'}
        onReport={() => setShowReportModal(true)}
        reportLabel="Báo cáo"
        shareTitle="bài viết cộng đồng"
      />

      {/* Main 12-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Post Content & Comments */}
        <div className="lg:col-span-8 space-y-6">

          {/* Main Post Content Card */}
          <div className="bg-white border border-blue-100 rounded-2xl p-5 sm:p-7 shadow-sm space-y-4">
            {/* Author & Meta Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {post.author?.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.displayName || post.author.username}
                    className="w-10 h-10 rounded-full object-cover shadow-sm shrink-0 border border-blue-100"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#1A94FF] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                    {(post.author?.displayName || post.author?.username || 'A')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                    {post.author?.displayName || post.author?.username || 'Thành viên AquaHub'}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(post.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <span className="px-3 py-1 text-xs font-bold bg-blue-50 text-[#0B74E5] rounded-full border border-blue-100 shrink-0">
                {getCategoryName(post.category)}
              </span>
            </div>

            {/* Title */}
            {post.title && (
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug pt-1">
                {post.title}
              </h1>
            )}

            {/* Content Body */}
            <div className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal py-1">
              {post.content}
            </div>

            {/* Attached Images */}
            {post.images && post.images.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {post.images.map((imgUrl, idx) => (
                  <img
                    key={idx}
                    src={imgUrl}
                    alt={`Ảnh đính kèm ${idx + 1}`}
                    className="w-full h-64 sm:h-72 object-cover rounded-xl border border-blue-100 hover:opacity-95 transition cursor-pointer"
                    onClick={() => window.open(imgUrl, '_blank')}
                  />
                ))}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-5">
                <button
                  onClick={handleToggleLike}
                  className={`flex items-center gap-1.5 transition cursor-pointer font-semibold ${
                    post.isLiked ? 'text-rose-500 font-bold' : 'hover:text-rose-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-500' : ''}`} />
                  <span>{post.likesCount || 0} Thích</span>
                </button>

                <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                  <MessageSquare className="w-4 h-4 text-[#1A94FF]" />
                  <span>{comments.length} Bình luận</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="flex items-center gap-1.5 transition cursor-pointer font-semibold text-amber-700 hover:text-amber-800"
                  title="Báo cáo bài viết này"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Báo cáo</span>
                </button>

                <button
                  onClick={handleToggleBookmark}
                  className={`flex items-center gap-1.5 transition cursor-pointer font-semibold ${
                    post.isBookmarked ? 'text-[#1A94FF] font-bold' : 'hover:text-[#1A94FF]'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-[#1A94FF]' : ''}`} />
                  <span>{post.isBookmarked ? 'Đã lưu' : 'Lưu bài'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Comments Section Card */}
          <div className="bg-white border border-blue-100 rounded-2xl p-5 sm:p-7 shadow-sm space-y-5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MessageSquare className="w-5 h-5 text-[#1A94FF]" />
              Bình luận cộng đồng ({comments.length})
            </h3>

            {/* Add Comment Input Form */}
            {user ? (
              <form onSubmit={handleAddComment} className="space-y-3">
                <div className="flex gap-3 items-start">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.displayName || user.username}
                      className="w-9 h-9 rounded-full object-cover border border-blue-100 shrink-0 mt-0.5"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#1A94FF] text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0 mt-0.5">
                      {(user.displayName || user.username || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <textarea
                      rows={2}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Viết bình luận hoặc trao đổi cùng cộng đồng..."
                      className="w-full bg-slate-50 border border-blue-100 rounded-xl p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1A94FF] focus:bg-white transition resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingComment || !commentText.trim()}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1A94FF] hover:bg-[#0D5CB6] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer"
                      >
                        {submittingComment ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>{submittingComment ? 'Đang gửi...' : 'Gửi bình luận'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#E5F2FF]/60 border border-blue-200 text-slate-700">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="w-9 h-9 rounded-xl bg-[#1A94FF] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Bạn cần đăng nhập để gửi bình luận</h4>
                    <p className="text-xs text-slate-500">Đăng ký hoặc đăng nhập tài khoản AquaHub để tương tác cùng cộng đồng.</p>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A94FF] hover:bg-[#0D5CB6] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng nhập ngay</span>
                </Link>
              </div>
            )}

            {/* Comment List */}
            <div className="space-y-3 pt-1">
              {comments.length === 0 ? (
                <div className="bg-slate-50/50 rounded-2xl p-6 text-center text-slate-400 text-xs sm:text-sm border border-slate-100">
                  Chưa có bình luận nào. Hãy là người đầu tiên để lại bình luận!
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-3 p-3.5 bg-slate-50/80 rounded-2xl border border-blue-100/80"
                  >
                    {comment.author?.avatar ? (
                      <img
                        src={comment.author.avatar}
                        alt={comment.author.displayName || comment.author.username}
                        className="w-8 h-8 rounded-full object-cover border border-blue-100 shrink-0 mt-0.5"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#1A94FF] text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0 mt-0.5">
                        {(comment.author?.displayName || comment.author?.username || 'U')[0].toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {comment.author?.displayName || comment.author?.username || 'Thành viên AquaHub'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(comment.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-6">

          {/* Community Info Card */}
          <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-[#1A94FF]" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Quy tắc cộng đồng</h3>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#1A94FF] font-bold">•</span>
                <span>Tôn trọng ý kiến và kinh nghiệm của các thành viên nuôi cá khác.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1A94FF] font-bold">•</span>
                <span>Không đăng nội dung quảng cáo spam, lừa đảo hoặc vi phạm pháp luật.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1A94FF] font-bold">•</span>
                <span>Chia sẻ thông tin chân thực, hình ảnh hồ cá tự chụp được khuyến khích.</span>
              </li>
            </ul>
          </div>

          {/* Ad Banner Widget */}
          <AdBanner position="SIDEBAR" />

          {/* Recent Community Posts Widget */}
          {recentPosts.length > 0 && (
            <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <TrendingUp className="w-5 h-5 text-[#1A94FF]" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Bài viết mới khác</h3>
              </div>
              <div className="space-y-3">
                {recentPosts
                  .filter((p) => p.id !== post.id && p.slug !== post.slug)
                  .slice(0, 4)
                  .map((rp) => (
                    <Link
                      key={rp.id}
                      href={`/cong-dong/${rp.slug || rp.id}`}
                      className="block p-2.5 rounded-xl hover:bg-blue-50/60 transition group space-y-1"
                    >
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-50 text-[#0B74E5] rounded border border-blue-100">
                        {getCategoryName(rp.category)}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#1A94FF] transition line-clamp-2 leading-snug">
                        {rp.title || rp.content}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {new Date(rp.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </Link>
                  ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Global Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={post.id}
        targetType="POST"
        title={post.title || post.content}
      />
    </div>
  );
}



