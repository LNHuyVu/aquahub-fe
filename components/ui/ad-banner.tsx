'use client';

import React, { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { ExternalLink, Sparkles, X } from 'lucide-react';

export interface AdItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  targetUrl: string;
  position: 'BANNER_TOP' | 'SIDEBAR' | 'IN_FEED' | 'POPUP';
  isActive: boolean;
  impressions: number;
  clicks: number;
}

interface AdBannerProps {
  position: 'BANNER_TOP' | 'SIDEBAR' | 'IN_FEED' | 'POPUP';
  className?: string;
  compact?: boolean;
}

export default function AdBanner({ position, className = '', compact = false }: AdBannerProps) {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const trackedRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    fetchActiveAds();
  }, [position]);

  const fetchActiveAds = async () => {
    try {
      const res: any = await api.get('/ads/active', { params: { position } });
      const items = res.data || res || [];
      if (Array.isArray(items) && items.length > 0) {
        setAds(items);
      }
    } catch (err) {
      console.error('Failed to load active ads', err);
    }
  };

  const currentAd = ads[currentAdIndex];

  // Track impression once when current ad becomes visible
  useEffect(() => {
    if (currentAd && !trackedRef.current[currentAd.id]) {
      trackedRef.current[currentAd.id] = true;
      api.post(`/ads/${currentAd.id}/impression`).catch(() => {});
    }
  }, [currentAd]);

  if (dismissed || !currentAd) {
    return null;
  }

  const handleAdClick = (e: React.MouseEvent) => {
    e.preventDefault();
    api.post(`/ads/${currentAd.id}/click`).catch(() => {});
    if (currentAd.targetUrl) {
      window.open(currentAd.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (position === 'BANNER_TOP') {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md border border-blue-500/20 my-4 ${className}`}>
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 rounded-full bg-black/40 hover:bg-black/70 text-slate-300 hover:text-white transition z-10"
          title="Ẩn quảng cáo"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <a
          href={currentAd.targetUrl}
          onClick={handleAdClick}
          className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 hover:opacity-95 transition group"
        >
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-400 text-slate-900 tracking-wider shrink-0">
              Tài trợ
            </span>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-800 border border-white/10 overflow-hidden shrink-0">
              <img src={currentAd.imageUrl} alt={currentAd.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-bold text-sm sm:text-base text-white group-hover:text-blue-200 transition line-clamp-1">
                {currentAd.title}
              </h4>
              {currentAd.description && (
                <p className="text-xs text-slate-300 line-clamp-1">{currentAd.description}</p>
              )}
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A94FF] hover:bg-[#0B74E5] text-white font-bold text-xs shadow-md shrink-0 transition">
            <span>Khám phá ngay</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </a>
      </div>
    );
  }

  if (position === 'SIDEBAR') {
    return (
      <div className={`bg-white border border-blue-100 rounded-2xl p-4 shadow-sm space-y-3 relative group ${className}`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-amber-100 text-amber-800 rounded tracking-wider">
            Quảng cáo
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-slate-600 transition"
            title="Ẩn"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <a href={currentAd.targetUrl} onClick={handleAdClick} className="block space-y-2 group">
          <div className="w-full h-40 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
            <img
              src={currentAd.imageUrl}
              alt={currentAd.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#1A94FF] transition line-clamp-2">
            {currentAd.title}
          </h4>
          {currentAd.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{currentAd.description}</p>
          )}
          <div className="flex items-center justify-between text-xs font-bold text-[#1A94FF] pt-1">
            <span>Xem thông tin</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>
      </div>
    );
  }

  // IN_FEED
  return (
    <div className={`my-4 bg-gradient-to-r from-blue-50/80 via-white to-blue-50/80 border border-blue-200/80 rounded-2xl p-4 shadow-xs relative ${className}`}>
      <span className="absolute top-2 right-3 text-[10px] font-extrabold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
        Quảng cáo tài trợ
      </span>
      <a href={currentAd.targetUrl} onClick={handleAdClick} className="flex items-center gap-4 group">
        <div className="w-20 h-20 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
          <img src={currentAd.imageUrl} alt={currentAd.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#1A94FF] transition">{currentAd.title}</h4>
          {currentAd.description && <p className="text-xs text-slate-600 line-clamp-2">{currentAd.description}</p>}
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0B74E5] hover:underline pt-0.5">
            <span>Truy cập ngay</span>
            <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </a>
    </div>
  );
}
