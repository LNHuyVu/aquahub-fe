'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Article } from '@/types';
import { BookOpen, Calendar, Eye, ArrowLeft, Share2, Tag } from 'lucide-react';
import { useToast } from '@/components/ui/toast-provider';

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { toast } = useToast();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    try {
      const res: any = await api.get(`/articles/${slug}`);
      setArticle(res.data || res);
    } catch (err) {
      console.error('Failed to load article detail', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết cẩm nang vào khay nhớ tạm!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400 space-y-3">
        <div className="w-10 h-10 border-4 border-[#1A94FF] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-semibold text-slate-600 text-sm">Đang tải nội dung cẩm nang...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy bài viết cẩm nang</h2>
        <p className="text-slate-500 text-sm">Bài viết này không tồn tại hoặc đã bị ẩn.</p>
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A94FF] text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:bg-[#0B74E5] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách Cẩm nang</span>
        </Link>
      </div>
    );
  }

  return (
    <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        href="/articles"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#1A94FF] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách Cẩm nang</span>
      </Link>

      {/* Main Header */}
      <header className="space-y-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#1A94FF]" />
            {new Date(article.publishedAt || Date.now()).toLocaleDateString('vi-VN')}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            {article.viewsCount || 0} lượt xem
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="text-base text-slate-600 leading-relaxed font-medium bg-blue-50/60 border-l-4 border-[#1A94FF] p-4 rounded-r-2xl">
            {article.excerpt}
          </p>
        )}
      </header>

      {/* Cover Image */}
      {article.coverImage && (
        <div className="rounded-3xl overflow-hidden shadow-md max-h-[420px] bg-slate-100">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Rich Text Body Content */}
      <div
        className="prose max-w-none text-slate-800 leading-relaxed text-sm sm:text-base space-y-4
          [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:border-blue-100 [&_h2]:pb-2
          [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-slate-800 [&_h3]:mt-6 [&_h3]:mb-2
          [&_p]:leading-relaxed [&_p]:text-slate-700
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1
          [&_blockquote]:border-l-4 [&_blockquote]:border-[#1A94FF] [&_blockquote]:bg-blue-50/50 [&_blockquote]:p-4 [&_blockquote]:rounded-r-2xl [&_blockquote]:italic [&_blockquote]:text-slate-700
          [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:p-4 [&_pre]:rounded-2xl [&_pre]:overflow-x-auto [&_pre]:text-xs
          [&_a]:text-[#1A94FF] [&_a]:underline [&_a]:font-semibold hover:[&_a]:text-[#0B74E5]"
        dangerouslySetInnerHTML={{ __html: article.content || '<p>Chưa có nội dung chi tiết.</p>' }}
      />

      {/* Footer Share & Navigation Bar */}
      <footer className="pt-6 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Tag className="w-4 h-4 text-[#1A94FF]" />
          <span>AquaHub Handbook / Cẩm nang kiến thức</span>
        </div>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-[#1A94FF]" />
          <span>Chia sẻ bài viết</span>
        </button>
      </footer>
    </article>
  );
}
