'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Fish } from '@/types';
import {
  Thermometer,
  Droplets,
  Layers,
  HeartPulse,
  Ruler,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Info,
  Copy,
  Share2,
  ShieldAlert,
  AlertTriangle,
  Fish as FishIcon
} from 'lucide-react';
import { useToast } from '@/components/ui/toast-provider';
import ReportModal from '@/components/ui/report-modal';

import DetailPageHeader from '@/components/ui/detail-page-header';

export default function FishDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { toast } = useToast();

  const [fish, setFish] = useState<Fish | null>(null);
  const [relatedFish, setRelatedFish] = useState<Fish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchFishDetail();
    }
  }, [slug]);

  const fetchFishDetail = async () => {
    setLoading(true);
    try {
      const res: any = await api.get(`/fish/${slug}`);
      const data: Fish = res.data || res;
      setFish(data);

      fetchRelatedFish(data.category?.slug || data.categoryId, data.id);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin loài cá này.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedFish = async (categorySlug?: string, currentId?: string) => {
    try {
      const params: any = { limit: 8 };
      if (categorySlug) params.category = categorySlug;

      const res: any = await api.get('/fish', { params });
      const items: Fish[] = res.data?.items || res.data || [];
      const filtered = items.filter((item) => item.id !== currentId && item.slug !== slug);
      setRelatedFish(filtered.slice(0, 4));
    } catch (err) {
      console.error('Failed to load related fish species', err);
    }
  };

  const handleCopyName = () => {
    if (fish && typeof window !== 'undefined') {
      navigator.clipboard.writeText(fish.nameVi);
      toast.success(`Đã sao chép tên: "${fish.nameVi}"`);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết trang tra cứu!');
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'EASY':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Dễ nuôi</span>;
      case 'MEDIUM':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Trung bình</span>;
      case 'HARD':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">Khó nuôi</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">Chuyên gia</span>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-16 space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 h-96 bg-slate-200 rounded-3xl" />
          <div className="lg:col-span-7 space-y-4">
            <div className="h-10 w-3/4 bg-slate-200 rounded-lg" />
            <div className="h-6 w-1/2 bg-slate-200 rounded-lg" />
            <div className="h-32 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !fish) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy loài cá này</h2>
        <p className="text-slate-500">{error || 'Có thể thông tin đã bị xóa hoặc đường dẫn không đúng.'}</p>
        <Link
          href="/ca-canh"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#1A94FF] bg-white border border-slate-200 hover:border-blue-300 px-4 py-2.5 rounded-xl transition shadow-xs hover:bg-blue-50/50 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#1A94FF]" />
          <span>Quay lại danh sách Tra cứu</span>
        </Link>
      </div>
    );
  }

  const rawCategories: string[] = [];
  if (fish.category?.name) rawCategories.push(fish.category.name);
  if (Array.isArray((fish as any).categories)) {
    (fish as any).categories.forEach((c: any) => {
      const catName = typeof c === 'string' ? c : c?.name;
      if (catName && !rawCategories.includes(catName)) rawCategories.push(catName);
    });
  }
  if (rawCategories.length === 0) rawCategories.push('Cá cảnh');

  const breadcrumbs = [
    { label: 'Tra cứu loài cá', href: '/ca-canh' },
    ...(rawCategories.length > 0 ? [{ label: rawCategories[0] }] : []),
  ];

  return (
    <div className="bg-slate-50/50 min-h-screen pb-12">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 space-y-4 max-w-6xl">
        
        {/* Schema.org JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "DefinedTerm",
              "name": fish.nameVi,
              "alternateName": fish.scientificName,
              "description": fish.description || `Hướng dẫn chăm sóc và thông số môi trường sống loài ${fish.nameVi}`,
              "inDefinedTermSet": "https://aquahub.vn/ca-canh",
              "image": fish.images?.[0] || undefined,
            })
          }}
        />
        
        {/* UNIFIED SHARED BREADCRUMB & HEADER */}
        <DetailPageHeader
          breadcrumbs={breadcrumbs}
          currentTitle={fish.nameVi}
          onReport={() => setShowReportModal(true)}
          reportLabel="Báo cáo"
          shareTitle="thông tin cá cảnh"
        />

        {/* Main Clean Card Section */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-5">
          
          {/* Header Title & Actions */}
          <div className="border-b border-slate-100 pb-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight select-text">
                    {fish.nameVi}
                  </h1>
                  {getDifficultyBadge(fish.difficulty)}
                </div>
                {fish.scientificName && (
                  <p className="text-xs sm:text-sm text-indigo-700 italic font-semibold select-text">
                    Tên khoa học: <span>{fish.scientificName}</span>
                    {fish.nameEn && <span className="text-slate-500 not-italic font-normal ml-2">({fish.nameEn})</span>}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyName}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#0B74E5] font-extrabold text-xs transition cursor-pointer shrink-0"
                  title={`Sao chép tên "${fish.nameVi}"`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép tên</span>
                </button>
              </div>
            </div>

            {/* Multi-category Badges */}
            <div className="flex flex-wrap items-center gap-1 pt-1">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Danh mục:</span>
              {rawCategories.map((catName, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wide bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {catName}
                </span>
              ))}
            </div>
          </div>

          {/* Floated Image Block + Clean Spec List */}
          <div className="flow-root">
            
            {/* Image (Compact & Floated Left) */}
            <div className="float-none sm:float-left sm:mr-5 mb-4 w-full sm:w-[240px] md:w-[280px] space-y-2">
              <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-4/3 group">
                <img
                  src={fish.images?.[0] || 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800'}
                  alt={fish.nameVi}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>

              {/* Thumbnails if multiple */}
              {Array.isArray(fish.images) && fish.images.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {fish.images.map((imgUrl, idx) => (
                    <div key={idx} className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-white">
                      <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Clean Spec Grid & Overview */}
            <div className="space-y-4">
              
              {/* Quick Environmental Parameters Grid (Simple border boxes) */}
              <div className="space-y-1.5">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thông số môi trường chuẩn</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 text-center">
                    <div className="text-[10px] text-slate-500 font-medium">Nhiệt độ</div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                      {fish.tempMin && fish.tempMax ? `${fish.tempMin} - ${fish.tempMax}°C` : 'N/A'}
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 text-center">
                    <div className="text-[10px] text-slate-500 font-medium">Độ pH</div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                      {fish.phMin && fish.phMax ? `${fish.phMin} - ${fish.phMax}` : 'N/A'}
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 text-center">
                    <div className="text-[10px] text-slate-500 font-medium">Kích thước</div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                      {fish.sizeMin && fish.sizeMax ? `${fish.sizeMin} - ${fish.sizeMax} cm` : 'N/A'}
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 text-center">
                    <div className="text-[10px] text-slate-500 font-medium">Bể tối thiểu</div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                      {fish.minTankSize ? `${fish.minTankSize}L` : 'N/A'}
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 text-center">
                    <div className="text-[10px] text-slate-500 font-medium">Tuổi thọ</div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                      {fish.lifespan || 'N/A'}
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 text-center">
                    <div className="text-[10px] text-slate-500 font-medium">Tầng bơi</div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                      {fish.swimLevel === 'TOP' ? 'Tầng mặt' : fish.swimLevel === 'BOTTOM' ? 'Tầng đáy' : 'Tầng giữa'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {fish.description && (
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-1">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng quan & Tập tính</h3>
                  {typeof fish.description === 'string' && (fish.description.includes('<') && fish.description.includes('>')) ? (
                    <div
                      className="text-slate-600 leading-normal prose prose-sm max-w-none text-xs sm:text-sm"
                      dangerouslySetInnerHTML={{ __html: fish.description }}
                    />
                  ) : (
                    <p className="text-slate-600 leading-normal whitespace-pre-line">{fish.description}</p>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Care & Diet Information - Integrated side-by-side without nested big card borders */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            
            {/* Compatibility Section */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Ghép phối nuôi</span>
              </h3>
              
              <div className="space-y-2">
                <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100/80">
                  <span className="text-[11px] font-bold text-emerald-800 block mb-0.5">✓ Nuôi chung thích hợp:</span>
                  <p className="text-slate-700 text-xs">
                    {fish.compatibleFish || 'Các loài cá hiền lành cùng kích thước và thông số nước.'}
                  </p>
                </div>
                <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-100/80">
                  <span className="text-[11px] font-bold text-rose-800 block mb-0.5">✕ Tránh nuôi chung:</span>
                  <p className="text-slate-700 text-xs">
                    {fish.incompatibleFish || 'Cá săn mồi lớn hoặc các loài hung dữ cắn vây.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Diet & Disease Section */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                <Info className="w-4 h-4 text-[#1A94FF]" />
                <span>Thức ăn & Lưu ý bệnh</span>
              </h3>

              <div className="space-y-2">
                <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100/80">
                  <span className="text-[11px] font-bold text-[#0B74E5] block mb-0.5">🍤 Thức ăn ưa thích:</span>
                  <p className="text-slate-700 text-xs">
                    {fish.diet || 'Ăn tạp: Cám hạt tổng hợp, cám chìm, trùn chỉ, atemia sấy khô.'}
                  </p>
                </div>
                <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100/80">
                  <span className="text-[11px] font-bold text-amber-800 block mb-0.5">🦠 Phòng bệnh:</span>
                  <p className="text-slate-700 text-xs">
                    {fish.commonDiseases || 'Nấm trắng, thối vây, tuột nhớt do thay đổi thông số nước đột ngột.'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Report Prompt Banner */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Phát hiện thông tin sai hoặc thiếu dữ liệu về loài cá này?</span>
            <button
              onClick={() => setShowReportModal(true)}
              className="font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Gửi báo cáo / Đóng góp dữ liệu</span>
            </button>
          </div>

        </div>

        {/* Related Species Section */}
        {relatedFish.length > 0 && (
          <section className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-1.5">
                <FishIcon className="w-4 h-4 text-[#1A94FF]" />
                <span>Các loài cá cảnh liên quan</span>
              </h2>

              <Link
                href="/ca-canh"
                className="inline-flex items-center gap-1 text-slate-600 hover:text-[#0B74E5] font-bold text-xs transition"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {relatedFish.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => router.push(`/ca-canh/${rel.slug}`)}
                  className="group bg-white border border-slate-200/80 rounded-xl overflow-hidden hover:border-[#1A94FF] transition flex flex-col cursor-pointer p-2.5 space-y-2"
                >
                  <div className="relative h-28 bg-slate-100 rounded-lg overflow-hidden">
                    <img
                      src={rel.images?.[0] || 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800'}
                      alt={rel.nameVi}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="font-bold text-slate-900 text-xs group-hover:text-[#1A94FF] transition line-clamp-1">
                      {rel.nameVi}
                    </h3>
                    {rel.scientificName && (
                      <p className="text-[11px] text-slate-500 italic truncate">{rel.scientificName}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Global Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={fish.id}
        targetType="FISH"
        title={fish.nameVi}
      />
    </div>
  );
}

