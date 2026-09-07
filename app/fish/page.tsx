'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Fish, FishCategory } from '@/types';
import { Search, Filter, Sparkles, ChevronRight, ChevronLeft, Layers, Thermometer, Droplets, HelpCircle } from 'lucide-react';
import DraggableScrollContainer from '@/components/ui/draggable-scroll-container';

export default function FishPage() {
  const [fishList, setFishList] = useState<Fish[]>([]);
  const [categories, setCategories] = useState<FishCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [pageSize, setPageSize] = useState(12);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchFish();
  }, [search, selectedCategory, selectedDifficulty, page, pageSize]);

  const fetchCategories = async () => {
    try {
      const res: any = await api.get('/fish/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchFish = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: pageSize };
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;

      const res: any = await api.get('/fish', { params });
      setFishList(res.data.items || []);
      setTotalPages(res.data.meta?.totalPages || 1);
      setTotalItems(res.data.meta?.totalItems || res.data.meta?.total || 0);
    } catch (err) {
      console.error('Failed to load fish list', err);
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

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'EASY':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">Dễ nuôi</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">Trung bình</span>;
      case 'HARD':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">Khó</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">Chuyên gia</span>;
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 space-y-4 sm:space-y-6">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-600 p-8 text-white shadow-lg shadow-sky-500/10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Cơ sở dữ liệu cá cảnh AquaHub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Tra cứu các loài cá cảnh
        </h1>
        <p className="text-sky-100 text-sm sm:text-base leading-relaxed max-w-2xl">
          Tra cứu thông số môi trường (pH, nhiệt độ), tập tính bơi, thức ăn và khả năng nuôi chung của hàng trăm loài cá cảnh.
        </p>
      </div>

      {/* Drag-to-Scroll Category Tabs */}
      <DraggableScrollContainer className="pb-2">
        <button
          onClick={() => { setSelectedCategory(''); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition border shrink-0 cursor-pointer ${
            selectedCategory === ''
              ? 'bg-[#1A94FF] text-white border-[#1A94FF] shadow-md shadow-blue-500/20'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-[#1A94FF]'
          }`}
        >
          Tất cả loài cá
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition border shrink-0 cursor-pointer ${
              selectedCategory === cat.slug
                ? 'bg-[#1A94FF] text-white border-[#1A94FF] shadow-md shadow-blue-500/20 font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-[#1A94FF]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </DraggableScrollContainer>

      {/* Compact Horizontal Filter & Toolbar */}
      <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Tìm tên loài cá..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1A94FF] transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Compact Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="flex-1 md:flex-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#1A94FF] cursor-pointer transition"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Difficulty Select */}
            <select
              value={selectedDifficulty}
              onChange={(e) => { setSelectedDifficulty(e.target.value); setPage(1); }}
              className="flex-1 md:flex-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#1A94FF] cursor-pointer transition"
            >
              <option value="">Tất cả độ khó</option>
              <option value="EASY">Dễ nuôi</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HARD">Khó nuôi</option>
              <option value="EXPERT">Chuyên gia</option>
            </select>

            {(search || selectedCategory || selectedDifficulty) && (
              <button
                onClick={() => { setSearch(''); setSelectedCategory(''); setSelectedDifficulty(''); setPage(1); }}
                className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer shrink-0"
              >
                Xóa lọc
              </button>
            )}
          </div>

        </div>

        {/* Active Filter Badges & Count */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="text-slate-600">
            Kết quả: <strong className="text-[#1A94FF] font-extrabold">{totalItems}</strong> loài cá
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5">
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#1A94FF] border border-blue-200">
                {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                <button onClick={() => setSelectedCategory('')} className="hover:text-blue-800 cursor-pointer">✕</button>
              </span>
            )}
            {selectedDifficulty && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Độ khó: {selectedDifficulty}
                <button onClick={() => setSelectedDifficulty('')} className="hover:text-amber-900 cursor-pointer">✕</button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                "{search}"
                <button onClick={() => setSearch('')} className="hover:text-slate-900 cursor-pointer">✕</button>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Fish Cards Grid (Full 4 columns wide for maximum screen usage) */}
      <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 sm:h-80 bg-white border border-sky-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : fishList.length === 0 ? (
            <div className="bg-white border border-sky-100 rounded-2xl p-12 text-center space-y-3">
              <HelpCircle className="w-12 h-12 text-sky-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">Không tìm thấy loài cá phù hợp</h3>
              <p className="text-sm text-slate-500">Hãy thử thay đổi từ khóa hoặc xóa bộ lọc tìm kiếm.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {fishList.map((fish) => (
                <Link
                  key={fish.id}
                  href={`/ca-canh/${fish.slug}`}
                  className="group bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#1A94FF] transition-all duration-300 flex flex-col"
                >
                  {/* Fish Image */}
                  <div className="relative h-36 sm:h-48 bg-blue-50/50 overflow-hidden">
                    <img
                      src={fish.images?.[0] || 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800'}
                      alt={fish.nameVi}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 scale-90 sm:scale-100">
                      {getDifficultyBadge(fish.difficulty)}
                    </div>
                  </div>

                  {/* Fish Content */}
                  <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
                    <div>
                      <div className="text-xs text-[#1A94FF] font-extrabold uppercase tracking-wider mb-1">
                        {fish.category?.name || 'Cá cảnh'}
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#1A94FF] transition line-clamp-1">
                        {fish.nameVi}
                      </h2>
                      {fish.scientificName && (
                        <p className="text-xs text-slate-500 italic line-clamp-1">
                          {fish.scientificName}
                        </p>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs text-slate-700">
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
                        <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-medium">{fish.tempMin && fish.tempMax ? `${fish.tempMin}-${fish.tempMax}°C` : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                        <Droplets className="w-3.5 h-3.5 text-[#1A94FF]" />
                        <span className="font-medium">{fish.phMin && fish.phMax ? `pH ${fish.phMin}-${fish.phMax}` : 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-[#1A94FF] pt-1 border-t border-slate-50">
                      <span>Xem thông số chi tiết</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Standard Synchronized Pagination Bar */}
          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                <div>
                  Hiển thị <strong className="text-slate-800">{(page - 1) * pageSize + 1}</strong> - <strong className="text-slate-800">{Math.min(page * pageSize, totalItems)}</strong> trên tổng số <strong className="text-[#0B74E5]">{totalItems}</strong> loài cá
                </div>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <div className="flex items-center gap-2">
                  <span>Hiển thị mỗi trang:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#0B74E5] focus:outline-none focus:border-[#1A94FF] cursor-pointer"
                  >
                    <option value={12}>12 loài</option>
                    <option value={24}>24 loài</option>
                    <option value={50}>50 loài (Tất cả)</option>
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

    </div>
  );
}
