'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Article } from '@/types';
import { BookOpen, Calendar, Eye, ChevronRight, Search, ChevronLeft } from 'lucide-react';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([
    'Tất cả cẩm nang',
    'Kỹ thuật nuôi & Làm nước',
    'Bệnh cá & Điều trị',
    'Dinh dưỡng & Thức ăn',
    'Thủy sinh & Bể kính',
    'Kinh nghiệm chọn cá',
  ]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

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

  const renderPaginationButtons = () => {
    const pages = [];
    const maxButtons = 5;
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`w-9 h-9 rounded-xl text-xs font-bold transition cursor-pointer ${
            page === i
              ? 'bg-[#1A94FF] text-white shadow-md shadow-blue-500/20'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 space-y-4 sm:space-y-6">
      
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
                onClick={() => {
                  setSelectedCategory(cat === 'Tất cả cẩm nang' ? '' : cat);
                  setPage(1);
                }}
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
        <div className="flex items-center justify-between gap-4 bg-white border border-blue-100 p-4 rounded-2xl shadow-xs">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Tìm cẩm nang (ví dụ: Nấm cá, Betta, Guppy, Cycle bể...)"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#1A94FF] transition"
            />
            <Search className="w-4 h-4 text-[#1A94FF] absolute left-3.5 top-3" />
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-white border border-blue-100 rounded-2xl animate-pulse" />
          ))
        ) : articles.length === 0 ? (
          <div className="col-span-3 bg-white border border-blue-100 rounded-2xl p-12 text-center text-slate-400 space-y-2">
            <BookOpen className="w-10 h-10 text-[#1A94FF] mx-auto" />
            <p className="font-bold text-slate-700">Không tìm thấy bài viết cẩm nang phù hợp</p>
            <p className="text-xs text-slate-400">Hãy thử thay đổi từ khóa tìm kiếm.</p>
          </div>
        ) : (
          articles.map((art) => (
            <Link
              key={art.id}
              href={`/cam-nang/${art.slug}`}
              className="group bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col"
            >
              <div className="h-44 bg-blue-50 relative overflow-hidden">
                <img
                  src={art.coverImage || 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800'}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 text-[#0B74E5] border border-blue-100 shadow-xs backdrop-blur">
                  {art.category || 'Kỹ thuật nuôi & Làm nước'}
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#1A94FF]" />
                      {new Date(art.publishedAt || Date.now()).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      {art.viewsCount || 0} lượt xem
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-[#1A94FF] transition line-clamp-2">
                    {art.title}
                  </h3>

                  {art.excerpt && (
                    <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                      {art.excerpt}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-[#1A94FF] pt-3 border-t border-blue-50">
                  <span>Đọc tiếp cẩm nang</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination Bar */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
            <div>
              Hiển thị <strong className="text-slate-800">{(page - 1) * pageSize + 1}</strong> - <strong className="text-slate-800">{Math.min(page * pageSize, totalItems)}</strong> trên tổng số <strong className="text-[#0B74E5]">{totalItems}</strong> cẩm nang
            </div>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <span>Hiển thị mỗi trang:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#0B74E5] focus:outline-none focus:border-[#1A94FF] cursor-pointer"
              >
                <option value={12}>12 bài</option>
                <option value={24}>24 bài</option>
                <option value={50}>50 bài (Tất cả)</option>
              </select>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>

              <div className="flex items-center gap-1">
                {renderPaginationButtons()}
              </div>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
