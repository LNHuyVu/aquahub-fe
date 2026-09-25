'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Listing, ListingCategory, ListingCondition, ListingStatus } from '@/types';
import ListingCard from '@/components/ui/listing-card';
import {
  ShoppingBag,
  PlusCircle,
  Search,
  Filter,
  Layers,
  MapPin,
  Tag,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Grid,
  List,
} from 'lucide-react';
import DraggableScrollContainer from '@/components/ui/draggable-scroll-container';
import DetailPageHeader from '@/components/ui/detail-page-header';

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<ListingCategory[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter params
  const categorySlug = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const province = searchParams.get('province') || '';
  const condition = searchParams.get('condition') || '';
  const statusFilter = searchParams.get('status') || '';
  const hasVideoFilter = searchParams.get('hasVideo') === 'true';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const page = parseInt(searchParams.get('page') || '1', 10);


  const [searchInput, setSearchInput] = useState(search);

  // Fetch Categories (Shared with Tra cứu)
  useEffect(() => {
    async function loadCategories() {
      try {
        const res: any = await api.get('/fish/categories');
        const data = res.data || res || [];
        setCategories(data);
      } catch (err) {
        console.error('Error fetching marketplace categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Fetch Listings
  useEffect(() => {
    async function loadListings() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (categorySlug) params.set('categorySlug', categorySlug);
        if (search) params.set('search', search);
        if (province) params.set('province', province);
        if (condition) params.set('condition', condition);
        if (statusFilter) params.set('status', statusFilter);
        if (hasVideoFilter) params.set('hasVideo', 'true');
        if (sortBy) params.set('sortBy', sortBy);

        params.set('page', page.toString());
        params.set('limit', '8');

        const res: any = await api.get(`/listings?${params.toString()}`);
        const items = res.data?.data || res.data || res || [];
        const meta = res.data?.meta || { total: items.length, totalPages: 1 };

        setListings(items);
        setTotal(meta.total);
        setTotalPages(meta.totalPages || 1);
      } catch (err) {
        console.error('Error fetching listings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadListings();
  }, [categorySlug, search, province, condition, statusFilter, sortBy, page]);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    params.set('page', '1'); // Reset to page 1 on filter change
    router.push(`/san-mua-ban?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Breadcrumb Header */}
      <DetailPageHeader
        breadcrumbs={[]}
        currentTitle="Sàn Mua Bán"
        showShare={false}
        showBack={false}
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1A94FF] via-[#0B74E5] to-[#0D5CB6] rounded-3xl p-8 sm:p-10 text-white shadow-lg shadow-blue-500/10 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wide border border-white/30">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Sàn Mua Bán AquaHub
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Mua Bán Cá Cảnh, Tép & Thiết Bị Thủy Sinh
            </h1>
            <p className="text-blue-100 text-sm sm:text-base max-w-2xl">
              Nơi kết nối đam mê thủy sinh toàn quốc. Đăng tin rao bán cực dễ, trao đổi trực tiếp với người nuôi thân thiện.
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/san-mua-ban/dang-ban"
              className="px-5 py-3 bg-white text-blue-600 hover:bg-blue-50 font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5 text-blue-600" />
              Đăng tin bán ngay
            </Link>
            <Link
              href="/san-mua-ban/tin-cua-toi"
              className="px-4 py-3 bg-blue-700/60 hover:bg-blue-700 border border-white/20 text-white font-medium text-sm rounded-xl backdrop-blur-md transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Tin đăng của tôi
            </Link>
          </div>
        </div>

        {/* SEARCH BAR - Light background */}
        <form onSubmit={handleSearchSubmit} className="relative z-10 max-w-3xl">
          <div className="relative flex items-center bg-white rounded-2xl shadow-lg p-1.5 border border-white/30 text-slate-800">
            <Search className="w-5 h-5 text-slate-400 ml-3.5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm tên cá, tép, cây thủy sinh, lọc, đèn, vị trí..."
              className="w-full px-3 py-2.5 text-sm bg-transparent text-slate-900 focus:outline-none placeholder-slate-400"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1A94FF] hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-all shrink-0 shadow-sm"
            >
              Tìm kiếm
            </button>
          </div>
        </form>
      </div>

      {/* CATEGORY BAR (SCROLLABLE) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm sticky top-14 z-20">
        <DraggableScrollContainer className="flex items-center gap-2 no-scrollbar overflow-x-auto">
          <button
            onClick={() => updateFilters({ category: null })}
            className={`px-4 py-2 text-xs font-semibold rounded-xl shrink-0 transition-all flex items-center gap-1.5 ${
              !categorySlug
                ? 'bg-[#1A94FF] text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Tất cả danh mục
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilters({ category: cat.slug })}
              className={`px-4 py-2 text-xs font-semibold rounded-xl shrink-0 transition-all flex items-center gap-1.5 ${
                categorySlug === cat.slug
                  ? 'bg-[#1A94FF] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.icon && <span>{cat.icon}</span>}
              {cat.name}
            </button>
          ))}
        </DraggableScrollContainer>
      </div>

      {/* SUB-FILTERS (CONDITION, SORT, STATUS) */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Lọc tin:
            </span>

            {/* Has Video Filter Toggle */}
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold cursor-pointer hover:bg-emerald-100 transition-all">
              <input
                type="checkbox"
                checked={hasVideoFilter}
                onChange={(e) => updateFilters({ hasVideo: e.target.checked ? 'true' : null })}
                className="w-3.5 h-3.5 text-emerald-600 rounded focus:ring-emerald-500"
              />
              🎥 Có Video HD
            </label>

            {/* Condition */}
            <select
              value={condition}
              onChange={(e) => updateFilters({ condition: e.target.value || null })}
              className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="">Tình trạng (Tất cả)</option>
              <option value="NEW">Mới 100%</option>
              <option value="LIKE_NEW">Như mới (99%)</option>
              <option value="USED">Đã qua sử dụng</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => updateFilters({ status: e.target.value || null })}
              className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="">Trạng thái (Đang & Đã bán)</option>
              <option value="ACTIVE">🟢 Đang bán</option>
              <option value="SOLD">🔴 Đã bán</option>
            </select>
          </div>

          {/* Sort By & View Toggle */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-white shadow text-[#1A94FF] font-bold' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Lưới Grid"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list' ? 'bg-white shadow text-[#1A94FF] font-bold' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Danh sách List"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <span className="text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Sắp xếp:
            </span>
            <select
              value={sortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value })}
              className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
            >
              <option value="createdAt">Mới nhất</option>
              <option value="price">Giá thấp đến cao</option>
              <option value="views">Xem nhiều nhất</option>
              <option value="likesCount">Yêu thích nhất</option>
            </select>
          </div>

        </div>

        {/* LISTINGS GRID */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-64 sm:h-72 bg-slate-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-800">
              Không tìm thấy tin rao bán phù hợp
            </h3>
            <p className="text-slate-500 text-sm mt-1 mb-4">
              Thử tìm kiếm từ khóa khác hoặc bỏ các bộ lọc hiện tại.
            </p>
            <button
              onClick={() => router.push('/san-mua-ban')}
              className="px-4 py-2 bg-[#1A94FF] text-white text-xs font-semibold rounded-xl hover:bg-blue-600 transition"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        )}

        {/* SYNCHRONIZED PAGINATION UI (Matches Cam Nang Standard) */}
        {totalPages > 1 && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
            <div className="text-xs text-slate-500">
              Hiển thị <span className="font-semibold text-slate-900">{listings.length}</span> /{' '}
              <span className="font-semibold text-slate-900">{total}</span> sản phẩm
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateFilters({ page: (page - 1).toString() })}
                disabled={page <= 1}
                className="p-2 border border-slate-200 rounded-xl text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => updateFilters({ page: pageNum.toString() })}
                    className={`w-9 h-9 text-xs font-bold rounded-xl transition-all ${
                      page === pageNum
                        ? 'bg-[#1A94FF] text-white shadow-md'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => updateFilters({ page: (page + 1).toString() })}
                disabled={page >= totalPages}
                className="p-2 border border-slate-200 rounded-xl text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
    </div>
  );
}

export default function MarketplaceMainPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1A94FF]"></div>
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}
