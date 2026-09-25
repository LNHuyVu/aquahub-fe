'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Article } from '@/types';
import { BookOpen, Calendar, Eye, ChevronRight, Search } from 'lucide-react';
import Pagination from '@/components/ui/pagination';
import DetailPageHeader from '@/components/ui/detail-page-header';

function ArticlesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize states from URL search params so page state is retained on Back navigation
  const search = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '24', 10);

  const [searchInput, setSearchInput] = useState(search);
  const [categories, setCategories] = useState<string[]>([
    'Tất cả cẩm nang',
    'Kỹ thuật nuôi & Làm nước',
    'Bệnh cá & Điều trị',
    'Dinh dưỡng & Thức ăn',
    'Thủy sinh & Bể kính',
    'Kinh nghiệm chọn cá',
  ]);

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const updateUrlParams = (newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '' || val === undefined) {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    });
    router.push(`/cam-nang?${params.toString()}`);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [page, pageSize, search, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res: any = await api.get('/articles/categories');
      if (Array.isArray(res.data) && res.data.length > 0) {
        const catNames = res.data.map((c: any) => c.name);
        setCategories(['Tất cả cẩm nang', ...catNames]);
      }
    } catch (err) {
      console.error('Failed to load article categories', err);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: pageSize, search };
      if (selectedCategory && selectedCategory !== 'Tất cả cẩm nang') {
        params.category = selectedCategory;
      }
      const res: any = await api.get('/articles', { params });
      setArticles(res.data.items || []);
      setTotalPages(res.data.meta?.totalPages || 1);
      setTotalItems(res.data.meta?.total || 0);
    } catch (err) {
      console.error('Failed to load articles', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Breadcrumb Header */}
      <DetailPageHeader
        breadcrumbs={[]}
        currentTitle="Cẩm Nang Thủy Sinh"
        showShare={false}
        showBack={false}
      />

      {/* Synchronized Header Banner */}
      <div className="bg-gradient-to-r from-[#1A94FF] via-[#0B74E5] to-[#0D5CB6] rounded-3xl p-8 sm:p-10 text-white shadow-lg shadow-blue-500/10 space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur border border-white/30">
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>Kho Cẩm Nang AquaHub ({totalItems > 0 ? `${totalItems} bài viết` : '200+ bài viết'})</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Cẩm Nang Chăm Sóc Cá Cảnh</h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl">
            Tổng hợp kiến thức thủy sinh, hướng dẫn làm sạch nước bể, cách trị nấm cho cá và chia sẻ kinh nghiệm từ các chuyên gia.
          </p>
        </div>
      </div>

      {/* Category Pills & Filter Toolbar */}
      <div className="space-y-4">
        {/* Category Pills Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat || (cat === 'Tất cả cẩm nang' && !selectedCategory);
            return (
              <button
                key={cat}
                onClick={() => updateUrlParams({ category: cat === 'Tất cả cẩm nang' ? null : cat, page: 1 })}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer border ${
                  isSelected
                    ? 'bg-[#1A94FF] text-white border-[#1A94FF] shadow-md shadow-blue-500/20'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-[#1A94FF]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Toolbar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateUrlParams({ search: searchInput, page: 1 });
          }}
          className="flex items-center justify-between gap-4 bg-white border border-blue-100 p-4 rounded-2xl shadow-xs"
        >
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Tìm cẩm nang (ví dụ: Nấm cá, Betta, Guppy, Cycle bể... Nhấn Enter)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#1A94FF] transition"
            />
            <Search className="w-4 h-4 text-[#1A94FF] absolute left-3.5 top-3" />
          </div>
        </form>
      </div>

      {/* Articles List / Grid (Text-First Design - No Images) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-white border border-slate-200/80 rounded-2xl animate-pulse p-6 space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-6 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white border border-blue-100 rounded-3xl p-12 text-center text-slate-400 space-y-3 shadow-xs">
          <BookOpen className="w-12 h-12 text-[#1A94FF] mx-auto" />
          <h3 className="font-extrabold text-slate-800 text-base">Không tìm thấy bài viết cẩm nang phù hợp</h3>
          <p className="text-xs text-slate-400">Rất tiếc, chưa có nội dung nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
          <button
            onClick={() => updateUrlParams({ search: null, category: null, page: 1 })}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#1A94FF] bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-100 transition cursor-pointer"
          >
            <span>Đặt lại tất cả bộ lọc</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Featured Spotlight Card (First article on page 1 with no search/filter) */}
          {page === 1 && !search && !selectedCategory && articles.length > 0 && (() => {
            const feat = articles[0];
            const readTime = Math.max(1, Math.ceil((feat.excerpt?.length || feat.content?.length || 200) / 120));
            return (
              <div className="relative bg-gradient-to-br from-white via-blue-50/40 to-slate-50 border border-blue-200/90 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition group overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/5 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#1A94FF] text-white shadow-xs">
                        ⭐ Cẩm nang nổi bật
                      </span>
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-[#0B74E5] border border-blue-200">
                        {feat.category || 'Kỹ thuật nuôi & Làm nước'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#1A94FF]" />
                        {new Date(feat.publishedAt || Date.now()).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {feat.viewsCount || 0} lượt xem
                      </span>
                    </div>
                  </div>

                  <Link href={`/cam-nang/${feat.slug}`} className="block space-y-2 group">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 group-hover:text-[#1A94FF] transition-colors leading-snug">
                      {feat.title}
                    </h2>
                    {feat.excerpt && (
                      <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed font-normal">
                        {feat.excerpt}
                      </p>
                    )}
                  </Link>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-200/60 text-xs">
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[10px]">
                        {(feat.author?.displayName || feat.author?.username || 'A')[0].toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-800">
                        {feat.author?.displayName || feat.author?.username || 'AquaHub Editorial'}
                      </span>
                      <span>•</span>
                      <span className="text-slate-500 font-medium">⏱️ {readTime} phút đọc</span>
                    </div>

                    <Link
                      href={`/cam-nang/${feat.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A94FF] hover:bg-[#0B74E5] text-white font-bold text-xs shadow-xs transition group-hover:translate-x-1"
                    >
                      <span>Khám phá chi tiết cẩm nang</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Regular Articles Grid (Text-Only Editorial Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(page === 1 && !search && !selectedCategory ? articles.slice(1) : articles).map((art) => {
              const readTime = Math.max(1, Math.ceil((art.excerpt?.length || art.content?.length || 150) / 100));
              return (
                <Link
                  key={art.id}
                  href={`/cam-nang/${art.slug}`}
                  className="group bg-white border border-slate-200/90 hover:border-[#1A94FF] rounded-2xl p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Header Info: Category Badge & Reading Time */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-[#0B74E5] border border-blue-100 truncate max-w-[180px]">
                        {art.category || 'Cẩm nang chung'}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                        ⏱️ {readTime} phút đọc
                      </span>
                    </div>

                    {/* Article Title */}
                    <h3 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-[#1A94FF] transition-colors line-clamp-2 leading-snug">
                      {art.title}
                    </h3>

                    {/* Article Excerpt */}
                    {art.excerpt && (
                      <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed font-normal">
                        {art.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Card Bottom Footer: Meta & Action Link */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#1A94FF]" />
                        {new Date(art.publishedAt || Date.now()).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {art.viewsCount || 0} lượt xem
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-[#1A94FF] group-hover:text-[#0B74E5] pt-1">
                      <span>Đọc cẩm nang</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        itemLabel="cẩm nang"
        onPageChange={(newPage) => updateUrlParams({ page: newPage })}
        onPageSizeChange={(newPageSize) => updateUrlParams({ pageSize: newPageSize, page: 1 })}
      />

    </div>
  );
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 text-center text-slate-400">
        <div className="w-10 h-10 border-4 border-[#1A94FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="font-semibold text-slate-600 text-sm">Đang tải danh sách cẩm nang...</p>
      </div>
    }>
      <ArticlesPageContent />
    </Suspense>
  );
}
