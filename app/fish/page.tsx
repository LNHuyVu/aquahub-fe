'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Fish, FishCategory } from '@/types';
import { Search, Filter, Sparkles, ChevronRight, Layers, Thermometer, Droplets, HelpCircle, Copy } from 'lucide-react';
import DraggableScrollContainer from '@/components/ui/draggable-scroll-container';
import Pagination from '@/components/ui/pagination';
import DetailPageHeader from '@/components/ui/detail-page-header';
import { useToast } from '@/components/ui/toast-provider';

function FishPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [fishList, setFishList] = useState<Fish[]>([]);
  const [categories, setCategories] = useState<FishCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize state from URL Search Params so state is preserved when pressing BACK
  const search = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedDifficulty = searchParams.get('difficulty') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '24', 10);

  const [searchInput, setSearchInput] = useState(search);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Keep local search input in sync if URL search param changes
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Helper to push state into URL params
  const updateUrlParams = (newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '' || val === undefined) {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    });
    router.push(`/ca-canh?${params.toString()}`);
  };

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
    <div className="container mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Breadcrumb Header */}
      <DetailPageHeader
        breadcrumbs={[]}
        currentTitle="Tra cứu loài cá cảnh"
        showShare={false}
        showBack={false}
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1A94FF] via-[#0B74E5] to-[#0D5CB6] rounded-3xl p-8 sm:p-10 text-white shadow-lg shadow-blue-500/10 space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur border border-white/30">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Cơ sở dữ liệu cá cảnh AquaHub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Tra cứu các loài cá cảnh
          </h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed max-w-2xl">
            Tra cứu thông số môi trường (pH, nhiệt độ), tập tính bơi, thức ăn và khả năng nuôi chung của hàng trăm loài cá cảnh.
          </p>
        </div>
      </div>

      {/* Drag-to-Scroll Category Tabs */}
      <DraggableScrollContainer className="pb-2">
        <button
          onClick={() => updateUrlParams({ category: null, page: 1 })}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition border shrink-0 cursor-pointer ${
            selectedCategory === ''
              ? 'bg-[#1A94FF] text-white border-[#1A94FF] shadow-md shadow-blue-500/20'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-[#1A94FF]'
          }`}
        >
          Tất cả loài cá
        </button>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id || selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => updateUrlParams({ category: cat.id, page: 1 })}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition border shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-[#1A94FF] text-white border-[#1A94FF] shadow-md shadow-blue-500/20 font-bold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-[#1A94FF]'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </DraggableScrollContainer>

      {/* Compact Horizontal Filter & Toolbar */}
      <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateUrlParams({ search: searchInput, page: 1 });
            }}
            className="relative flex-1 w-full"
          >
            <input
              type="text"
              placeholder="Tìm tên loài cá (Bấm Enter)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1A94FF] transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          {/* Compact Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Category Select */}
            <select
              value={categories.find((c) => c.id === selectedCategory || c.slug === selectedCategory)?.id || selectedCategory}
              onChange={(e) => updateUrlParams({ category: e.target.value || null, page: 1 })}
              className="flex-1 md:flex-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#1A94FF] cursor-pointer transition"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Difficulty Select */}
            <select
              value={selectedDifficulty}
              onChange={(e) => updateUrlParams({ difficulty: e.target.value || null, page: 1 })}
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
                onClick={() => {
                  setSearchInput('');
                  updateUrlParams({ search: null, category: null, difficulty: null, page: 1 });
                }}
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
                {categories.find((c) => c.id === selectedCategory || c.slug === selectedCategory)?.name || 'Danh mục đã chọn'}
                <button onClick={() => updateUrlParams({ category: null, page: 1 })} className="hover:text-blue-800 cursor-pointer">✕</button>
              </span>
            )}
            {selectedDifficulty && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Độ khó: {selectedDifficulty}
                <button onClick={() => updateUrlParams({ difficulty: null, page: 1 })} className="hover:text-amber-900 cursor-pointer">✕</button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                "{search}"
                <button onClick={() => { setSearchInput(''); updateUrlParams({ search: null, page: 1 }); }} className="hover:text-slate-900 cursor-pointer">✕</button>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Fish Cards Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {fishList.map((fish) => {
              // Extract all categories if available (single object, array, or comma-separated names)
              const rawCategories: string[] = [];
              if (fish.category?.name) rawCategories.push(fish.category.name);
              if (Array.isArray((fish as any).categories)) {
                (fish as any).categories.forEach((c: any) => {
                  const catName = typeof c === 'string' ? c : c?.name;
                  if (catName && !rawCategories.includes(catName)) rawCategories.push(catName);
                });
              }
              if (rawCategories.length === 0) rawCategories.push('Cá cảnh');

              const handleCopyName = (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof window !== 'undefined') {
                  navigator.clipboard.writeText(fish.nameVi);
                  toast.success(`Đã sao chép tên: "${fish.nameVi}"`);
                }
              };

              return (
                <div
                  key={fish.id}
                  onClick={() => router.push(`/ca-canh/${fish.slug}`)}
                  className="group bg-white border border-slate-200/90 hover:border-blue-400 rounded-2xl overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
                >
                  {/* Fish Image with Gradient Overlay */}
                  <div className="relative h-40 sm:h-52 bg-slate-100 overflow-hidden">
                    <img
                      src={fish.images?.[0] || 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800'}
                      alt={fish.nameVi}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    />
                    
                    {/* Glassmorphism Badge Header Overlay */}
                    <div className="absolute inset-x-0 top-0 p-2.5 flex items-center justify-between bg-gradient-to-b from-slate-900/60 via-slate-900/20 to-transparent">
                      {fish.sizeMin && fish.sizeMax ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white bg-slate-900/40 backdrop-blur-md border border-white/20">
                          {fish.sizeMin}-{fish.sizeMax} cm
                        </span>
                      ) : <div />}

                      <div className="shadow-sm">
                        {getDifficultyBadge(fish.difficulty)}
                      </div>
                    </div>
                  </div>

                  {/* Fish Content */}
                  <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      
                      {/* 1. Fish Name & Quick Copy */}
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <h2 
                            className="text-sm sm:text-base font-black text-slate-900 group-hover:text-[#0B74E5] transition leading-snug break-words select-text cursor-text"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {fish.nameVi}
                          </h2>
                          {fish.scientificName && (
                            <p 
                              className="text-xs text-indigo-700 italic font-semibold truncate select-text cursor-text"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {fish.scientificName}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleCopyName}
                          className="p-1.5 text-slate-400 hover:text-[#0B74E5] hover:bg-blue-50 rounded-lg transition cursor-pointer shrink-0"
                          title={`Sao chép tên "${fish.nameVi}"`}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* 2. Multi-category Badges */}
                      <div className="flex flex-wrap items-center gap-1">
                        {rawCategories.map((catName, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-sky-50 text-[#0B74E5] border border-sky-100 max-w-[130px] truncate"
                            title={catName}
                          >
                            {catName}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Quick Stat Chips (3 Stats) */}
                    <div className="grid grid-cols-2 gap-1.5 pt-2.5 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5 bg-amber-50/70 text-amber-900 px-2.5 py-1 rounded-xl border border-amber-100 font-semibold">
                        <Thermometer className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{fish.tempMin && fish.tempMax ? `${fish.tempMin}-${fish.tempMax}°C` : 'N/A'}</span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-blue-50/70 text-blue-900 px-2.5 py-1 rounded-xl border border-blue-100 font-semibold">
                        <Droplets className="w-3.5 h-3.5 text-[#1A94FF] shrink-0" />
                        <span className="truncate">{fish.phMin && fish.phMax ? `pH ${fish.phMin}-${fish.phMax}` : 'N/A'}</span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between text-xs font-extrabold text-[#0B74E5] pt-1 border-t border-slate-100 group-hover:text-blue-700">
                      <span>Xem thông số chi tiết</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Standardized Responsive Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          itemLabel="loài cá"
          onPageChange={(newPage) => updateUrlParams({ page: newPage })}
          onPageSizeChange={(newPageSize) => updateUrlParams({ pageSize: newPageSize, page: 1 })}
        />
      </div>

    </div>
  );
}

export default function FishPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 text-center text-slate-400">
        <div className="w-10 h-10 border-4 border-[#1A94FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="font-semibold text-slate-600 text-sm">Đang tải danh sách cá cảnh...</p>
      </div>
    }>
      <FishPageContent />
    </Suspense>
  );
}
