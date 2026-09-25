'use client';

import { useState } from 'react';
import { ListingImageData, ListingVideoData } from '@/types';
import { Maximize2, X, ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface ListingGalleryProps {
  imageData?: ListingImageData[];
  images?: string[];
  videosData?: ListingVideoData[];
  videoUrl?: string;
  title: string;
  isSold?: boolean;
  className?: string;
}

export default function ListingGallery({
  imageData = [],
  images = [],
  videosData = [],
  videoUrl,
  title,
  isSold = false,
  className = '',
}: ListingGalleryProps) {
  // Build unified media array
  const mediaItems: Array<{ type: 'image' | 'video'; url: string; thumbUrl: string }> = [];

  if (imageData && imageData.length > 0) {
    imageData.forEach((img) =>
      mediaItems.push({ type: 'image', url: img.url, thumbUrl: img.thumbnailUrl || img.url }),
    );
  } else if (images && images.length > 0) {
    images.forEach((url) => mediaItems.push({ type: 'image', url, thumbUrl: url }));
  }

  if (videosData && videosData.length > 0) {
    videosData.forEach((vid) =>
      mediaItems.push({ type: 'video', url: vid.url, thumbUrl: vid.thumbnailUrl || vid.url }),
    );
  } else if (videoUrl) {
    mediaItems.push({ type: 'video', url: videoUrl, thumbUrl: videoUrl });
  }

  if (mediaItems.length === 0) {
    mediaItems.push({
      type: 'image',
      url: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800',
      thumbUrl: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800',
    });
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const currentMedia = mediaItems[activeIndex] || mediaItems[0];

  const prevMedia = () => {
    setActiveIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const nextMedia = () => {
    setActiveIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs space-y-2.5 ${className}`}>
      {/* Main Display Area */}
      <div className="relative aspect-[16/10] bg-black/90 flex items-center justify-center overflow-hidden group">
        {currentMedia.type === 'video' ? (
          <video src={currentMedia.url} controls className="w-full h-full object-contain" />
        ) : (
          <img
            src={currentMedia.url}
            alt={title}
            className={`w-full h-full object-contain cursor-zoom-in transition-transform duration-300 ${
              isSold ? 'grayscale opacity-75' : ''
            }`}
            onClick={() => setLightboxOpen(true)}
          />
        )}

        {/* Sold Overlay */}
        {isSold && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center pointer-events-none">
            <span className="px-6 py-2 bg-red-600 text-white font-extrabold text-lg rounded-full shadow-2xl tracking-widest animate-pulse border-2 border-white">
              ĐÃ BÁN
            </span>
          </div>
        )}

        {/* Navigation Arrows */}
        {mediaItems.length > 1 && (
          <>
            <button
              onClick={prevMedia}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMedia}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Lightbox Expand Button */}
        {currentMedia.type === 'image' && (
          <button
            onClick={() => setLightboxOpen(true)}
            className="absolute bottom-3 right-3 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 shadow-lg transition-all"
          >
            <Maximize2 className="w-4 h-4" /> Xem toàn màn hình
          </button>
        )}
      </div>

      {/* Thumbnail Strip */}
      {mediaItems.length > 1 && (
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {mediaItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-square w-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                activeIndex === idx
                  ? 'border-[#1A94FF] ring-2 ring-blue-400/30 scale-105 shadow-sm'
                  : 'border-slate-200 opacity-60 hover:opacity-100'
              }`}
            >
              {item.type === 'video' ? (
                <div className="w-full h-full bg-slate-900 text-emerald-400 flex flex-col items-center justify-center text-[10px] font-bold">
                  <Play className="w-4 h-4 fill-emerald-400" />
                  VIDEO
                </div>
              ) : (
                <img src={item.thumbUrl} alt="thumb" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4">
          {/* Header Bar */}
          <div className="w-full flex items-center justify-between text-white border-b border-white/10 pb-3">
            <span className="text-sm font-bold truncate max-w-xl">{title}</span>
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-400">
                {activeIndex + 1} / {mediaItems.length}
              </span>
              <button
                onClick={() => setLightboxOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Lightbox Center Image */}
          <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-4">
            <img
              src={currentMedia.url}
              alt={title}
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />

            {mediaItems.length > 1 && (
              <>
                <button
                  onClick={prevMedia}
                  className="absolute left-2 p-3 bg-white/10 hover:bg-white/30 text-white rounded-full transition"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={nextMedia}
                  className="absolute right-2 p-3 bg-white/10 hover:bg-white/30 text-white rounded-full transition"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Thumbnails Bottom */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-3xl py-2">
            {mediaItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`relative aspect-square w-14 rounded-lg overflow-hidden border-2 transition-all ${
                  activeIndex === idx ? 'border-blue-400 scale-110' : 'border-transparent opacity-40'
                }`}
              >
                <img src={item.thumbUrl} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
