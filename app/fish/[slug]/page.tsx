'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
  ChevronLeft,
  Sparkles,
  Info,
} from 'lucide-react';

export default function FishDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [fish, setFish] = useState<Fish | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      fetchFishDetail();
    }
  }, [slug]);

  const fetchFishDetail = async () => {
    try {
      const res: any = await api.get(`/fish/${slug}`);
      setFish(res.data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin loài cá này.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
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
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy loài cá này</h2>
        <p className="text-slate-500">{error || 'Có thể thông tin đã bị xóa hoặc đường dẫn không đúng.'}</p>
        <Link
          href="/fish"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-500 transition shadow-md shadow-sky-500/20"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại danh sách cá
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Breadcrumb */}
      <Link
        href="/fish"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-sky-600 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Danh sách cá cảnh</span>
      </Link>

      {/* Main Header & Image Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Image */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-sky-50 border border-sky-100 shadow-md h-[360px] sm:h-[420px]">
            <img
              src={fish.images?.[0] || 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800'}
              alt={fish.nameVi}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Primary Info */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>{fish.category?.name || 'Cá cảnh'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {fish.nameVi}
            </h1>
            {fish.scientificName && (
              <p className="text-base text-slate-500 italic mt-1">
                Tên khoa học: <span className="text-sky-700 font-medium">{fish.scientificName}</span>
              </p>
            )}
            {fish.nameEn && (
              <p className="text-sm text-slate-500 mt-0.5">Tên tiếng Anh: {fish.nameEn}</p>
            )}
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-sky-100 rounded-2xl p-4 text-center space-y-1 shadow-sm">
              <Thermometer className="w-5 h-5 text-amber-500 mx-auto" />
              <div className="text-xs text-slate-400">Nhiệt độ</div>
              <div className="text-sm font-bold text-slate-800">
                {fish.tempMin && fish.tempMax ? `${fish.tempMin} - ${fish.tempMax}°C` : 'N/A'}
              </div>
            </div>

            <div className="bg-white border border-sky-100 rounded-2xl p-4 text-center space-y-1 shadow-sm">
              <Droplets className="w-5 h-5 text-sky-500 mx-auto" />
              <div className="text-xs text-slate-400">Độ pH</div>
              <div className="text-sm font-bold text-slate-800">
                {fish.phMin && fish.phMax ? `${fish.phMin} - ${fish.phMax}` : 'N/A'}
              </div>
            </div>

            <div className="bg-white border border-sky-100 rounded-2xl p-4 text-center space-y-1 shadow-sm">
              <Ruler className="w-5 h-5 text-emerald-500 mx-auto" />
              <div className="text-xs text-slate-400">Kích thước</div>
              <div className="text-sm font-bold text-slate-800">
                {fish.sizeMin && fish.sizeMax ? `${fish.sizeMin} - ${fish.sizeMax} cm` : 'N/A'}
              </div>
            </div>

            <div className="bg-white border border-sky-100 rounded-2xl p-4 text-center space-y-1 shadow-sm">
              <Layers className="w-5 h-5 text-indigo-500 mx-auto" />
              <div className="text-xs text-slate-400">Bể tối thiểu</div>
              <div className="text-sm font-bold text-slate-800">
                {fish.minTankSize ? `${fish.minTankSize} Lít` : 'N/A'}
              </div>
            </div>

            <div className="bg-white border border-sky-100 rounded-2xl p-4 text-center space-y-1 shadow-sm">
              <Clock className="w-5 h-5 text-yellow-500 mx-auto" />
              <div className="text-xs text-slate-400">Tuổi thọ</div>
              <div className="text-sm font-bold text-slate-800">
                {fish.lifespan || 'N/A'}
              </div>
            </div>

            <div className="bg-white border border-sky-100 rounded-2xl p-4 text-center space-y-1 shadow-sm">
              <HeartPulse className="w-5 h-5 text-rose-500 mx-auto" />
              <div className="text-xs text-slate-400">Tầng bơi</div>
              <div className="text-sm font-bold text-slate-800">
                {fish.swimLevel || 'MIDDLE'}
              </div>
            </div>
          </div>

          {/* Description */}
          {fish.description && (
            <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-5 text-slate-700 text-sm leading-relaxed">
              {fish.description}
            </div>
          )}
        </div>
      </div>

      {/* Detail Care Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Compatibility */}
        <div className="bg-white border border-sky-100 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Khả năng phối nuôi
          </h3>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                Có thể nuôi chung với
              </span>
              <p className="text-slate-700 bg-sky-50/50 p-3 rounded-xl border border-sky-100">
                {fish.compatibleFish || 'Các loài cá hiền lành có cùng kích thước và điều kiện nước.'}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-1">
                Không nên nuôi chung
              </span>
              <p className="text-slate-700 bg-sky-50/50 p-3 rounded-xl border border-sky-100">
                {fish.incompatibleFish || 'Cá săn mồi kích thước lớn hoặc các loài hung dữ cắn vây.'}
              </p>
            </div>
          </div>
        </div>

        {/* Diet & Diseases */}
        <div className="bg-white border border-sky-100 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Info className="w-5 h-5 text-sky-500" />
            Chế độ ăn & Bệnh thường gặp
          </h3>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block mb-1">
                Thức ăn yêu thích
              </span>
              <p className="text-slate-700 bg-sky-50/50 p-3 rounded-xl border border-sky-100">
                {fish.diet || 'Ăn tạp: Cám hạt, cám chìm, trùn chỉ, atemia sấy khang.'}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
                Bệnh hay gặp & lưu ý
              </span>
              <p className="text-slate-700 bg-sky-50/50 p-3 rounded-xl border border-sky-100">
                {fish.commonDiseases || 'Nấm trắng, thối vây, tuột nhớt do thay đổi nhiệt độ đột ngột.'}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
