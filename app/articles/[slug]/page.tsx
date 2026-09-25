'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Article } from '@/types';
import {
  BookOpen,
  Calendar,
  Eye,
  ArrowLeft,
  Share2,
  Tag,
  Clock,
  User,
  Sparkles,
  ChevronRight,
  Bookmark,
  ThumbsUp,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast-provider';
import ReportModal from '@/components/ui/report-modal';

import DetailPageHeader from '@/components/ui/detail-page-header';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { toast } = useToast();

  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchArticleDetail();
    }
  }, [slug]);

  const fetchArticleDetail = async () => {
    setLoading(true);
    try {
      const res: any = await api.get(`/articles/${slug}`);
      const data: Article = res.data || res;
      setArticle(data);
      setLikeCount(data.viewsCount ? Math.floor(data.viewsCount / 3) + 5 : 12);

      fetchRelatedArticles(data.category, data.id);
    } catch (err) {
      console.error('Failed to load article detail', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedArticles = async (category?: string, currentId?: string) => {
    try {
      const params: any = { limit: 6 };
      if (category) params.category = category;

      const res: any = await api.get('/articles', { params });
      const items: Article[] = res.data?.items || res.data || [];
      const filtered = items.filter((item) => item.id !== currentId && item.slug !== slug);
      setRelatedArticles(filtered.slice(0, 4));
    } catch (err) {
      console.error('Failed to load related articles', err);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết cẩm nang vào khay nhớ tạm!');
    }
  };

  const handleToggleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    toast.success(isLiked ? 'Đã bỏ yêu thích bài viết' : 'Cảm ơn bạn đã yêu thích bài viết!');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-slate-400 space-y-3">
        <div className="w-10 h-10 border-4 border-[#1A94FF] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-semibold text-slate-600 text-sm">Đang tải nội dung cẩm nang...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy bài viết cẩm nang</h2>
        <p className="text-slate-500 text-sm">Bài viết này không tồn tại hoặc đã bị gỡ khỏi hệ thống.</p>
        <Link
          href="/cam-nang"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#1A94FF] bg-white border border-slate-200 hover:border-blue-300 px-4 py-2.5 rounded-xl transition shadow-xs hover:bg-blue-50/50 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#1A94FF]" />
          <span>Quay lại danh sách Cẩm nang</span>
        </Link>
      </div>
    );
  }

  const wordCount = article.content ? article.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length : 200;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const breadcrumbs = [
    { label: 'Cẩm nang thủy sinh', href: '/cam-nang' },
    ...(article.category ? [{ label: article.category }] : []),
  ];

  return (
    <div className="bg-slate-50/50 min-h-screen pb-16">
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 space-y-4 max-w-6xl">
        
        {/* UNIFIED SHARED BREADCRUMB & HEADER */}
        <DetailPageHeader
          breadcrumbs={breadcrumbs}
          currentTitle={article.title}
          onReport={() => setShowReportModal(true)}
          reportLabel="Báo cáo"
          shareTitle="bài viết cẩm nang"
        />

        {/* Article Layout Grid (Main Body + Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content Area (Column 8) */}
          <main className="lg:col-span-8 space-y-6 bg-white border border-blue-100/80 rounded-3xl p-6 sm:p-8 shadow-xs">
            
            {/* Header Header & Metadata */}
            <header className="space-y-4 border-b border-slate-100 pb-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-[#0B74E5] border border-blue-200 uppercase tracking-wide">
                  {article.category || 'Cẩm nang chung'}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  {readingTime} phút đọc
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-snug tracking-tight">
                {article.title}
              </h1>

              {/* Author & Stats Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500 font-medium">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    {article.author?.displayName || article.author?.username || 'AquaHub Expert'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Xuất bản {new Date(article.publishedAt || Date.now()).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-slate-500">
                  <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                    <Eye className="w-3.5 h-3.5 text-[#1A94FF]" />
                    <strong>{article.viewsCount || 0}</strong> lượt xem
                  </span>
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-[#0B74E5] transition cursor-pointer font-bold text-xs"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#1A94FF]" />
                    <span>Chia sẻ</span>
                  </button>
                </div>
              </div>

              {/* Summary / Excerpt Highlight Card */}
              {article.excerpt && (
                <div className="relative bg-gradient-to-br from-blue-50/80 via-slate-50 to-indigo-50/50 border-l-4 border-[#1A94FF] p-4 sm:p-5 rounded-r-2xl shadow-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B74E5] uppercase tracking-wide mb-1">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Tóm tắt cẩm nang</span>
                  </div>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed italic">
                    "{article.excerpt}"
                  </p>
                </div>
              )}
            </header>



            {/* Main Rich Article Body */}
            <div
              className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-sm sm:text-base space-y-4 pt-2
                [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:border-blue-100 [&_h2]:pb-2 [&_h2]:flex [&_h2]:items-center [&_h2]:gap-2
                [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-800 [&_h3]:mt-6 [&_h3]:mb-2
                [&_p]:leading-relaxed [&_p]:text-slate-700 [&_p]:font-normal
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_ul]:text-slate-700
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1.5 [&_ol]:text-slate-700
                [&_li]:marker:text-[#1A94FF] [&_li]:marker:font-bold
                [&_blockquote]:border-l-4 [&_blockquote]:border-[#1A94FF] [&_blockquote]:bg-blue-50/60 [&_blockquote]:p-4 [&_blockquote]:rounded-r-2xl [&_blockquote]:italic [&_blockquote]:text-slate-700 [&_blockquote]:my-4
                [&_img]:rounded-2xl [&_img]:shadow-sm [&_img]:my-6 [&_img]:border [&_img]:border-slate-200
                [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:p-4 [&_pre]:rounded-2xl [&_pre]:overflow-x-auto [&_pre]:text-xs
                [&_a]:text-[#1A94FF] [&_a]:underline [&_a]:font-bold hover:[&_a]:text-[#0B74E5]"
              dangerouslySetInnerHTML={{ __html: article.content || '<p>Chưa có nội dung chi tiết cho cẩm nang này.</p>' }}
            />

            {/* Bottom Interaction & Reaction Bar */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/70 p-4 rounded-2xl border">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleLike}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer shadow-2xs ${
                    isLiked
                      ? 'bg-rose-500 text-white shadow-rose-500/20'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{isLiked ? 'Đã thích' : 'Hữu ích'} ({likeCount})</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-blue-50 hover:text-[#0B74E5] hover:border-blue-200 font-bold text-xs text-slate-700 transition cursor-pointer shadow-2xs"
                >
                  <Share2 className="w-4 h-4 text-[#1A94FF]" />
                  <span>Chia sẻ bài viết</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs transition cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Báo cáo cẩm nang</span>
                </button>
              </div>

              <Link
                href="/cam-nang"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B74E5] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Xem tất cả bài viết cẩm nang</span>
              </Link>
            </div>

          </main>

          {/* Sidebar Area (Column 4) */}
          <aside className="lg:col-span-4 space-y-6 sticky top-20">
            
            {/* Author / Expert Info Box */}
            <div className="bg-white border border-blue-100 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-900 text-sm">
                  {article.author?.displayName || article.author?.username || 'AquaHub Editorial'}
                </h4>
                <p className="text-xs text-slate-400">Chuyên gia biên soạn thủy sinh</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Cung cấp các hướng dẫn kỹ thuật nuôi cá cảnh, điều chỉnh môi trường nước chuẩn và mẹo chăm sóc sinh vật thủy sinh từ kinh nghiệm thực tế.
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Chuyên mục:</span>
                <span className="font-extrabold text-[#0B74E5]">{article.category || 'Thủy sinh'}</span>
              </div>
            </div>

            {/* Sticky Related Articles Box */}
            {relatedArticles.length > 0 && (
              <div className="bg-white border border-blue-100 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#1A94FF]" />
                    <span>Bài viết cùng chuyên mục</span>
                  </h3>
                  <Link href="/cam-nang" className="text-[11px] font-bold text-[#1A94FF] hover:underline">
                    Xem hết
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {relatedArticles.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/cam-nang/${rel.slug}`}
                      className="group flex flex-col p-3 rounded-2xl bg-slate-50/60 hover:bg-blue-50/80 transition border border-slate-100 hover:border-blue-200 space-y-1.5"
                    >
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-[#1A94FF] transition line-clamp-2 leading-snug">
                        {rel.title}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-[#1A94FF]" />
                          {rel.viewsCount || 0} lượt xem
                        </span>
                        <span>{new Date(rel.publishedAt || Date.now()).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </aside>

        </div>

        {/* Bottom Full-Width Related Articles Grid */}
        {relatedArticles.length > 0 && (
          <section className="pt-10 border-t border-slate-200/80 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-100 text-[#0B74E5] text-[11px] font-extrabold uppercase tracking-wide">
                  <BookOpen className="w-3.5 h-3.5" /> Khám phá thêm
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Bài viết cẩm nang liên quan khác
                </h2>
              </div>

              <Link
                href="/cam-nang"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-[#0B74E5] font-bold text-xs transition shadow-2xs cursor-pointer"
              >
                <span>Xem tất cả cẩm nang</span>
                <ChevronRight className="w-4 h-4 text-[#1A94FF]" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/cam-nang/${rel.slug}`}
                  className="group bg-white border border-slate-200/90 hover:border-[#1A94FF] rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-[#0B74E5] border border-blue-100 inline-block">
                      {rel.category || 'Cẩm nang'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#1A94FF] transition line-clamp-2 leading-snug">
                      {rel.title}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1A94FF] group-hover:text-[#0B74E5]">
                    <span className="text-[11px] text-slate-400 font-normal">
                      {new Date(rel.publishedAt || Date.now()).toLocaleDateString('vi-VN')}
                    </span>
                    <div className="flex items-center gap-1">
                      <span>Đọc bài</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Global Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={article.id}
        targetType="ARTICLE"
        title={article.title}
      />
    </div>
  );
}

