'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Listing, ListingStatus, PriceType } from '@/types';
import { MapPin, Eye, Heart, MessageSquare, Truck, ShieldCheck, CheckCircle2, Pencil } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  onToggleStatus?: (id: string) => void;
  isOwner?: boolean;
}

export function formatPrice(price: number, priceType: PriceType): string {
  if (priceType === PriceType.GIVEAWAY) return 'Tặng miễn phí 🎁';
  if (priceType === PriceType.CONTACT) return 'Thỏa thuận 💬';
  if (price === 0) return 'Thỏa thuận';
  return `${new Intl.NumberFormat('vi-VN').format(price)} đ`;
}

export function getConditionBadge(condition: string) {
  switch (condition) {
    case 'NEW':
      return { text: 'Mới 100%', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
    case 'LIKE_NEW':
      return { text: 'Như mới (99%)', bg: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
    case 'USED':
    default:
      return { text: 'Đã qua sử dụng', bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
  }
}

export default function ListingCard({ listing, onToggleStatus, isOwner }: ListingCardProps) {
  const isSold = listing.status === ListingStatus.SOLD;
  
  // Extract all images
  const allImages = listing.imageData && listing.imageData.length > 0
    ? listing.imageData.map((i) => i.thumbnailUrl || i.url)
    : listing.images && listing.images.length > 0
    ? listing.images
    : ['https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800'];

  const hasVideo = !!listing.videoUrl || (listing.videosData && listing.videosData.length > 0);
  const conditionBadge = getConditionBadge(listing.condition);

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image Thumbnail Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 group/img">
        <Link href={`/san-mua-ban/${listing.slug}`} className="block w-full h-full">
          <img
            src={allImages[0]}
            alt={listing.title}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              isSold ? 'grayscale opacity-70' : ''
            }`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800';
            }}
          />
        </Link>

        {/* STATUS & MEDIA BADGES */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {isSold ? (
            <span className="px-2.5 py-1 text-xs font-bold bg-red-600 text-white rounded-full shadow-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              ĐÃ BÁN
            </span>
          ) : (
            <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/90 text-white backdrop-blur-md rounded-full shadow-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              Đang bán
            </span>
          )}

          {hasVideo && (
            <span className="px-2 py-1 text-xs font-bold bg-emerald-600 text-white rounded-full shadow-md flex items-center gap-1 animate-pulse">
              🎥 Có Video HD
            </span>
          )}

          {listing.isPinned && (
            <span className="px-2 py-1 text-xs font-bold bg-amber-500 text-white rounded-full shadow">
              📌 Nổi bật
            </span>
          )}
        </div>

        {/* Image Count Indicator Badge */}
        {allImages.length > 1 && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="px-2 py-0.5 text-[11px] font-bold bg-slate-900/70 text-white backdrop-blur-md rounded-full">
              📷 {allImages.length}
            </span>
          </div>
        )}


        {/* Category Pill */}
        {listing.category && (
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="px-2.5 py-0.5 text-[11px] font-medium bg-slate-900/70 text-white backdrop-blur-md rounded-lg">
              {listing.category.name}
            </span>
          </div>
        )}

        {/* Shipping Icon */}
        {listing.shippingAvailable && (
          <div className="absolute bottom-2.5 right-2.5 z-10" title="Có giao hàng toàn quốc/nội thành">
            <span className="p-1.5 bg-blue-600/80 text-white backdrop-blur-md rounded-lg flex items-center gap-1 text-[11px]">
              <Truck className="w-3.5 h-3.5" />
            </span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <Link href={`/san-mua-ban/${listing.slug}`}>
            <h3 className="font-semibold text-slate-900 line-clamp-2 hover:text-[#1A94FF] transition-colors leading-snug">
              {listing.title}
            </h3>
          </Link>

          {/* Price */}
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-bold text-red-600">
              {formatPrice(Number(listing.price), listing.priceType)}
            </span>
            <span className={`px-2 py-0.5 text-[11px] font-medium border rounded-md ${conditionBadge.bg}`}>
              {conditionBadge.text}
            </span>
          </div>

          {/* Address */}
          <div className="mt-2.5 flex items-center gap-1 text-xs text-slate-500 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-[#1A94FF]" />
            <span>
              {listing.district ? `${listing.district}, ` : ''}
              {listing.province}
            </span>
          </div>
        </div>

        {/* Footer info & owner controls */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {listing.views || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              {listing.likesCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              {listing.commentsCount || 0}
            </span>
          </div>

          {/* Owner Buttons */}
          {isOwner && (
            <div className="flex items-center gap-1.5">
              <Link
                href={`/san-mua-ban/dang-ban?edit=${listing.id}`}
                className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all flex items-center gap-1 border border-blue-200"
                title="Sửa tin đăng"
              >
                <Pencil className="w-3 h-3" /> Sửa
              </Link>

              {onToggleStatus && (
                <button
                  onClick={() => onToggleStatus(listing.id)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                    isSold
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-200 text-slate-700 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  {isSold ? 'Đánh dấu Đang bán' : 'Đánh dấu Đã bán'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
