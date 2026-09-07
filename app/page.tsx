'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Fish, Tank, Question, Article } from '@/types';
import {
  Search,
  Sparkles,
  ChevronRight,
  Layers,
  Wrench,
  HelpCircle,
  Thermometer,
  Droplets,
  ArrowRight,
  Fish as FishIcon,
  Compass,
  BookOpen,
  Calculator,
  Users,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Eye,
  Calendar,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import AdBanner from '@/components/ui/ad-banner';
import DraggableScrollContainer from '@/components/ui/draggable-scroll-container';
export default function Home() {
  const [settings, setSettings] = useState<Record<string, string>>({
    heroBadge: 'Nền tảng sinh vật cảnh & Quản lý hồ cá #1 Việt Nam',
    heroTitle: 'Khám Phá Cá Cảnh &\nQuản Lý Hồ Cá Số',
    heroSubtitle: 'Tra cứu chuẩn xác thông số nước (pH, nhiệt độ), tập tính bơi, khả năng phối nuôi. Tạo nhật ký hồ cá số và kết nối cộng đồng thủy sinh năng động.',
    heroBannerImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
    heroTankName: 'Hồ Thủy Sinh Iwagumi',
    heroOwnerName: 'Minh Thủy Sinh',
    heroTankVolume: '64.8',
    heroTemp: '25.5°C',
    heroPh: '6.8',
    heroFishCount: '24 con',
    statsFish: '500+',
    statsTanks: '1,200+',
    statsMembers: '3,400+',
    statsSupport: '99.8%',
  });

  const [featuredFish, setFeaturedFish] = useState<Fish[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [featuredTanks, setFeaturedTanks] = useState<Tank[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Calculator state inside Hero
  const [calcLength, setCalcLength] = useState(60);
  const [calcWidth, setCalcWidth] = useState(30);
  const [calcHeight, setCalcHeight] = useState(36);
  const calcVolume = Math.round(((calcLength * calcWidth * calcHeight) / 1000) * 10) / 10;

  useEffect(() => {
    fetchHomepageData();
  }, []);

  const fetchHomepageData = async () => {
    try {
      const [fishRes, catRes, tankRes, qRes, artRes, settingsRes]: any = await Promise.all([
        api.get('/fish?limit=6'),
        api.get('/fish/categories'),
        api.get('/tanks?limit=3'),
        api.get('/questions?limit=4'),
        api.get('/articles?limit=3'),
        api.get('/settings').catch(() => null),
      ]);
      setFeaturedFish(fishRes.data?.items || []);
      setCategories(catRes.data || [
        { id: '1', name: 'Cá nước ngọt', slug: 'ca-nuoc-nghot' },
        { id: '2', name: 'Cá thủy sinh', slug: 'ca-thuy-sinh' },
        { id: '3', name: 'Cá Betta', slug: 'ca-betta' },
        { id: '4', name: 'Cá Guppy (Bảy màu)', slug: 'ca-guppy' },
        { id: '5', name: 'Cá Koi & Cá Vàng', slug: 'ca-koi-ca-vang' },
        { id: '6', name: 'Cá biển', slug: 'ca-bien' },
        { id: '7', name: 'Tép cảnh', slug: 'tep-canh' },
        { id: '8', name: 'Ốc cảnh', slug: 'oc-canh' },
        { id: '9', name: 'Cây thủy sinh', slug: 'cay-thuy-sinh' },
      ]);
      setFeaturedTanks(tankRes.data || []);
      setQuestions(qRes.data?.items || []);
      setArticles(artRes.data?.items || []);
      if (settingsRes?.data) {
        setSettings((prev) => ({ ...prev, ...settingsRes.data }));
      }
    } catch (err) {
      console.error('Failed to load homepage data', err);
    }
  };

  const handleSelectCategory = async (slug: string) => {
    setSelectedCategory(slug);
    try {
      const params: any = { limit: 6 };
      if (slug) params.category = slug;
      const res: any = await api.get('/fish', { params });
      setFeaturedFish(res.data?.items || []);
    } catch (err) {
      console.error('Failed to filter fish by category', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/ca-canh?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const quickSearchTags = [
    { label: 'Cá Neon Xanh', query: 'Neon' },
    { label: 'Cá Betta Halfmoon', query: 'Betta' },
    { label: 'Cá Guppy Full Red', query: 'Guppy' },
    { label: 'Cá Chuột Panda', query: 'Panda' },
    { label: 'Nấm cá', query: 'nấm' },
  ];

  return (
    <div className="space-y-16 pb-16 bg-[#F5F5FA]">
      
      {/* SECTION 1: HERO BANNER (TIKI BLUE BRANDING WITH AQUATIC ANIMATIONS) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1A94FF] via-[#0B74E5] to-[#0D5CB6] text-white pt-16 pb-24 border-b border-blue-600 shadow-lg">
        
        {/* Decorative background glow circles */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-5 right-10 w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-[140px] pointer-events-none" />

        {/* Animated Swimming Fish Icons in Background */}
        <div className="absolute top-16 left-0 right-0 h-40 pointer-events-none overflow-hidden z-0 opacity-40">
          <div className="animate-swim-1 absolute top-4">
            <FishIcon className="w-10 h-10 text-cyan-200 filter drop-shadow-md" />
          </div>
          <div className="animate-swim-2 absolute top-20">
            <FishIcon className="w-8 h-8 text-amber-200 filter drop-shadow-md" />
          </div>
        </div>

        {/* Floating Water Bubbles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute left-1/6 bottom-0 w-4 h-4 rounded-full bg-white/25 blur-[1px] animate-bubble-1" />
          <div className="absolute left-1/3 bottom-0 w-6 h-6 rounded-full bg-cyan-200/30 blur-[1px] animate-bubble-2" />
          <div className="absolute left-2/3 bottom-0 w-3 h-3 rounded-full bg-white/20 blur-[1px] animate-bubble-3" />
          <div className="absolute left-5/6 bottom-0 w-5 h-5 rounded-full bg-cyan-100/25 blur-[1px] animate-bubble-1" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs sm:text-sm font-bold tracking-wide backdrop-blur border border-white/30 shadow-sm animate-pulse-subtle shimmer-badge">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
                <span>{settings.heroBadge}</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight whitespace-pre-line">
                {settings.heroTitle}
              </h1>

              <p className="text-blue-100 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                {settings.heroSubtitle}
              </p>

              {/* Search Bar (Tiki Style) */}
              <form onSubmit={handleSearch} className="relative max-w-2xl">
                <div className="relative flex items-center shadow-2xl rounded-2xl overflow-hidden bg-white p-1.5 transition-transform duration-300 focus-within:scale-[1.01] focus-within:shadow-cyan-400/20">
                  <Search className="w-5 h-5 text-[#1A94FF] ml-3.5" />
                  <input
                    type="text"
                    placeholder="Tìm tên cá, triệu chứng bệnh cá, dung tích hồ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-0 px-3 py-3 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-[#1A94FF] hover:bg-[#0D5CB6] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 active:scale-95"
                  >
                    <span>Tìm kiếm</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Popular Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-3 text-xs text-blue-100 justify-center lg:justify-start">
                  <span className="font-semibold text-white">Gợi ý tìm nhanh:</span>
                  {quickSearchTags.map((tag) => (
                    <button
                      key={tag.query}
                      type="button"
                      onClick={() => { setSearchQuery(tag.query); window.location.href = `/ca-canh?search=${encodeURIComponent(tag.query)}`; }}
                      className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/35 hover:scale-105 text-white font-medium transition-all duration-200 backdrop-blur border border-white/20 active:scale-95"
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/ca-canh"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-[#0B74E5] font-bold text-sm hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-lg active:scale-95"
                >
                  <FishIcon className="w-5 h-5 text-[#1A94FF] animate-bounce" style={{ animationDuration: '3s' }} />
                  Khám phá cơ sở dữ liệu
                </Link>
                <Link
                  href="/ho-ca"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/15 border border-white/30 text-white font-bold text-sm hover:bg-white/30 hover:scale-105 transition-all duration-300 backdrop-blur active:scale-95"
                >
                  <Layers className="w-5 h-5 text-cyan-200" />
                  Tạo hồ cá kỹ thuật số
                </Link>
              </div>

            </div>

            {/* Right Floating Visual Card with Animated Glow */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-amber-300 rounded-3xl blur-lg opacity-40 animate-pulse-subtle pointer-events-none" />
              <div className="relative mx-auto w-full max-w-md bg-white rounded-3xl p-4 text-slate-800 shadow-2xl border border-blue-100 animate-float space-y-3">
                
                <div className="flex items-center justify-between border-b border-blue-50 pb-3">
                  <div className="flex items-center gap-2">
                    <img src="/logo/aquahub.png" alt="AquaHub Logo" className="w-8 h-8 object-contain shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{settings.heroTankName}</span>
                      <p className="text-[11px] text-slate-400">Owner: {settings.heroOwnerName}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[11px] animate-pulse">Active</span>
                </div>

                <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 group">
                  <img
                    src={settings.heroBannerImage}
                    alt={settings.heroTankName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute bottom-2 right-2 px-3 py-1 rounded-full bg-slate-900/70 text-white font-bold text-xs backdrop-blur">
                    {settings.heroTankVolume} Liters
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-[#E5F2FF] p-2 rounded-xl border border-blue-100 hover:scale-105 transition-transform duration-200">
                    <span className="text-[10px] text-slate-400 block">Nhiệt độ</span>
                    <strong className="text-[#0B74E5] font-bold">{settings.heroTemp}</strong>
                  </div>
                  <div className="bg-[#E5F2FF] p-2 rounded-xl border border-blue-100 hover:scale-105 transition-transform duration-200">
                    <span className="text-[10px] text-slate-400 block">pH</span>
                    <strong className="text-[#0B74E5] font-bold">{settings.heroPh}</strong>
                  </div>
                  <div className="bg-[#E5F2FF] p-2 rounded-xl border border-blue-100 hover:scale-105 transition-transform duration-200">
                    <span className="text-[10px] text-slate-400 block">Số lượng cá</span>
                    <strong className="text-[#0B74E5] font-bold">{settings.heroFishCount}</strong>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: STATS COUNTER BAR */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <AdBanner position="BANNER_TOP" />
        <div className="bg-white border border-blue-100 rounded-3xl p-4 sm:p-6 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#1A94FF]">{settings.statsFish}</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-600">Loài cá cảnh chuẩn dữ liệu</div>
          </div>

          <div className="space-y-1 border-l border-slate-100">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#1A94FF]">{settings.statsTanks}</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-600">Hồ cá số khởi tạo</div>
          </div>

          <div className="space-y-1 border-l border-slate-100">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#1A94FF]">{settings.statsMembers}</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-600">Thành viên đam mê</div>
          </div>

          <div className="space-y-1 border-l border-slate-100">
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600">{settings.statsSupport}</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-600">Hỏi đáp được tư vấn</div>
          </div>

        </div>
      </section>

      {/* SECTION 3: FEATURE HIGHLIGHTS */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white border border-blue-100 rounded-3xl p-4 space-y-3 shadow-sm hover:shadow-md hover:border-blue-300 transition group">
            <div className="w-12 h-12 rounded-2xl bg-[#E5F2FF] text-[#1A94FF] flex items-center justify-center font-bold group-hover:bg-[#1A94FF] group-hover:text-white transition duration-300">
              <FishIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Cơ sở dữ liệu sinh vật chuẩn</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Thông tin chi tiết về độ pH, nhiệt độ, kích thước bể tối thiểu, thức ăn và bệnh thường gặp.
            </p>
          </div>

          <div className="bg-white border border-blue-100 rounded-3xl p-4 space-y-3 shadow-sm hover:shadow-md hover:border-teal-300 transition group">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold group-hover:bg-teal-600 group-hover:text-white transition duration-300">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Nhật ký & Quản lý hồ cá số</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Lưu giữ lịch sử thay nước, theo dõi thông số vi sinh, thống kê số lượng cá và cây thủy sinh.
            </p>
          </div>

          <div className="bg-white border border-blue-100 rounded-3xl p-4 space-y-3 shadow-sm hover:shadow-md hover:border-indigo-300 transition group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition duration-300">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Công cụ hỗ trợ chính xác</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tính dung tích thể tích bể, mật độ thả cá an toàn và kiểm tra độ tương thích giữa các loài cá.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 4: FEATURED FISH GRID */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#1A94FF] uppercase tracking-wider mb-1">Cơ sở dữ liệu cá cảnh</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Các loài cá cảnh phổ biến</h2>
          </div>
          <Link href="/ca-canh" className="inline-flex items-center gap-1 text-sm font-bold text-[#1A94FF] hover:underline">
            <span>Xem tất cả loài cá</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Responsive Drag-to-Scroll Category Pills Navigation Menu */}
        <DraggableScrollContainer className="pb-2">
          <button
            onClick={() => handleSelectCategory('')}
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
              key={cat.id || cat.slug}
              onClick={() => handleSelectCategory(cat.slug)}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredFish.map((fish) => (
            <Link
              key={fish.id}
              href={`/ca-canh/${fish.slug}`}
              className="group bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 flex flex-col"
            >
              <div className="h-48 bg-blue-50 overflow-hidden relative">
                <img
                  src={fish.images?.[0] || 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800'}
                  alt={fish.nameVi}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E5F2FF] text-[#0B74E5] border border-blue-200">
                  {fish.category?.name || 'Cá cảnh'}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-[#1A94FF] transition">{fish.nameVi}</h3>
                  <p className="text-xs text-slate-400 italic mt-0.5">{fish.scientificName}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-blue-50 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5 bg-blue-50/60 px-2.5 py-1.5 rounded-lg border border-blue-100">
                    <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                    <span>{fish.tempMin && fish.tempMax ? `${fish.tempMin}-${fish.tempMax}°C` : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-blue-50/60 px-2.5 py-1.5 rounded-lg border border-blue-100">
                    <Droplets className="w-3.5 h-3.5 text-[#1A94FF]" />
                    <span>{fish.phMin && fish.phMax ? `pH ${fish.phMin}-${fish.phMax}` : 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-[#1A94FF] pt-1">
                  <span>Chi tiết chăm sóc</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* IN-FEED AD BANNER */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AdBanner position="IN_FEED" />
      </section>

      {/* SECTION 5: INTERACTIVE QUICK TOOL SANDBOX */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-50 via-white to-cyan-50 border border-blue-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5F2FF] text-[#0B74E5] text-xs font-bold">
                <Calculator className="w-3.5 h-3.5 text-[#1A94FF]" />
                <span>Dùng thử công cụ nhanh</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Tính nhanh dung tích hồ cá của bạn</h2>
            </div>
            <Link
              href="/cong-cu"
              className="inline-flex items-center gap-1 text-sm font-bold text-[#1A94FF] hover:underline"
            >
              <span>Xem đầy đủ công cụ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Form Sliders */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <div className="flex justify-between text-sm font-bold text-slate-800 mb-1">
                  <span>Chiều dài bể:</span>
                  <span className="text-[#1A94FF]">{calcLength} cm</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={calcLength}
                  onChange={(e) => setCalcLength(Number(e.target.value))}
                  className="w-full accent-[#1A94FF] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold text-slate-800 mb-1">
                  <span>Chiều rộng bể:</span>
                  <span className="text-[#1A94FF]">{calcWidth} cm</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="100"
                  value={calcWidth}
                  onChange={(e) => setCalcWidth(Number(e.target.value))}
                  className="w-full accent-[#1A94FF] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold text-slate-800 mb-1">
                  <span>Chiều cao bể:</span>
                  <span className="text-[#1A94FF]">{calcHeight} cm</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="100"
                  value={calcHeight}
                  onChange={(e) => setCalcHeight(Number(e.target.value))}
                  className="w-full accent-[#1A94FF] cursor-pointer"
                />
              </div>
            </div>

            {/* Result Box */}
            <div className="lg:col-span-5 bg-white border border-blue-200 rounded-2xl p-4 text-center space-y-3 shadow-md">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kết quả dung tích chứa nước</div>
              <div className="text-5xl font-black text-[#1A94FF]">
                {calcVolume} <span className="text-2xl font-normal text-slate-600">Lít</span>
              </div>
              
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-xs text-slate-700 space-y-1 text-left">
                <div className="flex items-center justify-between font-bold text-[#0B74E5]">
                  <span>🌊 Bơm lọc đề xuất:</span>
                  <span>{Math.round(calcVolume * 3)} - {Math.round(calcVolume * 5)} L/h</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Gợi ý thả tối đa khoảng <strong className="text-slate-800">{Math.round(calcVolume * 0.4)} con cá</strong> cỡ nhỏ (2-3cm).
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 6: HOT COMMUNITY Q&A DISCUSSIONS */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#1A94FF] uppercase tracking-wider mb-1">Góc tư vấn</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Câu hỏi được quan tâm nhiều nhất</h2>
          </div>
          <Link href="/hoi-dap" className="inline-flex items-center gap-1 text-sm font-bold text-[#1A94FF] hover:underline">
            <span>Đến diễn đàn hỏi đáp</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {questions.map((q) => (
            <div key={q.id} className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition space-y-3">
              <div className="flex items-center gap-2">
                {q.isSolved && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Đã giải đáp
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  Bởi <strong className="text-slate-700">{q.author?.username || 'Thành viên'}</strong>
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-lg hover:text-[#1A94FF] transition">
                {q.title}
              </h3>

              <p className="text-slate-600 text-sm line-clamp-2">{q.content}</p>

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-blue-50">
                <div className="flex items-center gap-1 text-[#1A94FF]">
                  <MessageSquare className="w-4 h-4" />
                  <span>{q.answersCount || 0} Bình luận</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span>{q.viewsCount || 0} Lượt xem</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7: ARTICLES & GUIDES */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#1A94FF] uppercase tracking-wider mb-1">Cẩm nang nuôi cá</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Bài viết & Hướng dẫn mới nhất</h2>
          </div>
          <Link href="/cam-nang" className="inline-flex items-center gap-1 text-sm font-bold text-[#1A94FF] hover:underline">
            <span>Xem tất cả bài viết</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((art) => (
            <Link
              key={art.id}
              href={`/cam-nang/${art.slug}`}
              className="group bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col"
            >
              <div className="h-44 bg-blue-50 overflow-hidden relative">
                <img
                  src={art.coverImage || 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800'}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-[#1A94FF] transition line-clamp-2">
                    {art.title}
                  </h3>
                  {art.excerpt && (
                    <p className="text-slate-600 text-xs mt-2 line-clamp-2 leading-relaxed">
                      {art.excerpt}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-[#1A94FF] pt-3 border-t border-blue-50">
                  <span>Đọc bài viết</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 8: COMMUNITY CALLOUT BANNER (TIKI BLUE GRADIENT) */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#1A94FF] via-[#0B74E5] to-[#0D5CB6] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-blue-500/20 text-white relative overflow-hidden">
          <div className="space-y-4 max-w-xl z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Tham gia hoàn toàn miễn phí</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Bắt đầu tạo hồ cá kỹ thuật số của bạn ngay hôm nay!
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Theo dõi thông số nước, quản lý danh sách cá đang nuôi và nhận sự trợ giúp miễn phí từ các thành viên kinh nghiệm.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 z-10 w-full sm:w-auto">
            <Link
              href="/register"
              className="px-6 py-3.5 rounded-2xl bg-white text-[#0B74E5] font-bold text-sm text-center shadow-lg hover:bg-blue-50 transition"
            >
              Đăng ký tài khoản
            </Link>
            <Link
              href="/ho-ca"
              className="px-6 py-3.5 rounded-2xl bg-white/20 border border-white/30 text-white font-bold text-sm text-center hover:bg-white/30 transition backdrop-blur"
            >
              Xem danh sách hồ cá
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
