'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Listing, ListingStatus, PriceType } from '@/types';
import { formatPrice, getConditionBadge } from '@/components/ui/listing-card';
import { useToast } from '@/components/ui/toast-provider';
import {
  MapPin,
  Phone,
  MessageCircle,
  Truck,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Send,
  User,
  Clock,
} from 'lucide-react';

export default function ListingDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { toast } = useToast();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  // Interaction States
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);

  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    async function loadListing() {
      if (!slug) return;
      setLoading(true);
      try {
        const res: any = await api.get(`/listings/${slug}`);
        const item: Listing = res.data || res;
        setListing(item);
        setIsLiked(!!item.isLiked);
        setLikesCount(item.likesCount || 0);
      } catch (err) {
        console.error('Error fetching listing details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadListing();
  }, [slug]);

  const handleLikeToggle = async () => {
    if (!listing) return;
    try {
      const res: any = await api.post(`/listings/${listing.id}/like`);
      setIsLiked(res.data?.liked ?? !isLiked);
      setLikesCount(res.data?.likesCount ?? (isLiked ? likesCount - 1 : likesCount + 1));
    } catch (err) {
      toast.error('Vui lòng đăng nhập để thích tin đăng này!');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing || !commentText.trim()) return;

    setCommenting(true);
    try {
      const res: any = await api.post(`/listings/${listing.id}/comments`, {
        content: commentText.trim(),
      });
      const newComment = res.data || res;

      setListing((prev) =>
        prev
          ? {
              ...prev,
              commentsCount: (prev.commentsCount || 0) + 1,
              comments: [newComment, ...(prev.comments || [])],
            }
          : null,
      );
      setCommentText('');
      toast.success('Đã gửi bình luận!');
    } catch (err) {
      toast.error('Vui lòng đăng nhập để bình luận!');
    } finally {
      setCommenting(false);
    }
  };

  const handleReportSubmit = async () => {
    if (!listing || !reportReason.trim()) return;
    try {
      await api.post(`/listings/${listing.id}/reports`, {
        reason: reportReason.trim(),
      });
      toast.success('Đã gửi báo cáo vi phạm. BQT sẽ xem xét!');
      setShowReportModal(false);
      setReportReason('');
    } catch (err) {
      toast.error('Vui lòng đăng nhập để báo cáo vi phạm!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1A94FF]"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Không tìm thấy sản phẩm này
        </h2>
        <Link href="/cho-thuy-sinh" className="mt-4 inline-block px-4 py-2 bg-[#1A94FF] text-white rounded-xl text-xs font-semibold">
          Về trang Chợ Thủy Sinh
        </Link>
      </div>
    );
  }

  const isSold = listing.status === ListingStatus.SOLD;
  const mediaList: string[] = [];
  if (listing.images && listing.images.length > 0) mediaList.push(...listing.images);
  if (listing.videoUrl) mediaList.push(listing.videoUrl);
  if (mediaList.length === 0) mediaList.push('/placeholder-fish.jpg');

  const conditionBadge = getConditionBadge(listing.condition);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/cho-thuy-sinh"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#1A94FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại Chợ Thủy Sinh
        </Link>

        {/* MAIN LAYOUT: LEFT (GALLERY + DETAILS + COMMENTS), RIGHT (SELLER INFO CARD) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT 2 COLUMNS */}
          <div className="lg:col-span-2 space-y-6">
            {/* GALLERY CONTAINER */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="relative aspect-[16/10] bg-black flex items-center justify-center overflow-hidden">
                {mediaList[activeMediaIndex]?.endsWith('.mp4') || mediaList[activeMediaIndex]?.includes('video') ? (
                  <video src={mediaList[activeMediaIndex]} controls className="w-full h-full object-contain" />
                ) : (
                  <img
                    src={mediaList[activeMediaIndex]}
                    alt={listing.title}
                    className={`w-full h-full object-contain ${isSold ? 'grayscale opacity-75' : ''}`}
                  />
                )}

                {/* STATUS OVERLAY BADGE */}
                {isSold && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                    <span className="px-6 py-2 bg-red-600 text-white font-extrabold text-lg rounded-full shadow-2xl tracking-widest animate-pulse border-2 border-white">
                      ĐÃ BÁN
                    </span>
                  </div>
                )}
              </div>

              {/* THUMBNAILS */}
              {mediaList.length > 1 && (
                <div className="p-3 bg-slate-100 dark:bg-slate-800/80 flex items-center gap-2 overflow-x-auto">
                  {mediaList.map((media, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveMediaIndex(idx)}
                      className={`relative aspect-square w-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        activeMediaIndex === idx ? 'border-[#1A94FF] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      {media.endsWith('.mp4') || media.includes('video') ? (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold">
                          VIDEO
                        </div>
                      ) : (
                        <img src={media} alt="thumb" className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* DETAILS CONTENT */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 text-xs font-semibold border rounded-md ${conditionBadge.bg}`}>
                    {conditionBadge.text}
                  </span>
                  {listing.category && (
                    <span className="px-2.5 py-0.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                      {listing.category.name}
                    </span>
                  )}
                  {isSold ? (
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-red-600 text-white rounded-md">
                      ĐÃ BÁN
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500 text-white rounded-md">
                      Đang bán
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                  {listing.title}
                </h1>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-red-600 dark:text-red-400">
                    {formatPrice(Number(listing.price), listing.priceType)}
                  </span>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" /> {listing.views || 0} lượt xem
                    </span>
                    <button
                      onClick={handleLikeToggle}
                      className={`flex items-center gap-1 font-semibold transition-colors ${
                        isLiked ? 'text-rose-500' : 'hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} /> {likesCount} Thích
                    </button>
                  </div>
                </div>
              </div>

              {/* ADDRESS & SHIPPING INFO */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-sm">
                <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-[#1A94FF] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Địa chỉ:</span>{' '}
                    {[listing.streetAddress, listing.ward, listing.district, listing.province]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                </div>

                {listing.oldAddressNote && (
                  <div className="pl-6 text-xs text-blue-600 dark:text-blue-400 italic">
                    💡 Ghi chú địa chính: {listing.oldAddressNote}
                  </div>
                )}

                {listing.shippingAvailable && (
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                    <Truck className="w-4 h-4 shrink-0" />
                    <span>Có giao hàng / Ghi chú ship: {listing.shippingNote || 'Ship toàn quốc/nội thành'}</span>
                  </div>
                )}
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Mô tả sản phẩm</h3>
                <div
                  className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: listing.description }}
                />
              </div>

              {/* REPORT ACTION */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Báo cáo tin rao vi phạm
                </button>
              </div>
            </div>

            {/* COMMENTS SECTION */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#1A94FF]" /> Hỏi đáp & Bình luận ({listing.commentsCount || 0})
              </h3>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-3">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Viết câu hỏi cho người bán..."
                  className="flex-1 px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A94FF]"
                />
                <button
                  type="submit"
                  disabled={commenting || !commentText.trim()}
                  className="px-5 py-2.5 bg-[#1A94FF] hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-4 h-4" /> Gửi
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {listing.comments && listing.comments.length > 0 ? (
                  listing.comments.map((cmt) => (
                    <div
                      key={cmt.id}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex items-start gap-3 text-sm"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-[#1A94FF] dark:text-blue-300 font-bold flex items-center justify-center shrink-0">
                        {cmt.user?.username?.substring(0, 2).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {cmt.user?.displayName || cmt.user?.username || 'Người dùng'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(cmt.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-xs">{cmt.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">
                    Chưa có bình luận nào. Hãy là người đầu tiên đặt câu hỏi!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: SELLER CONTACT CARD */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 sticky top-20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#1A94FF] to-blue-400 text-white font-bold text-lg flex items-center justify-center shadow-md shrink-0">
                  {listing.contactName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    {listing.contactName}
                  </h4>
                  <p className="text-xs text-slate-400">Người bán uy tín trên AquaHub</p>
                </div>
              </div>

              {/* CONTACT BUTTONS */}
              <div className="space-y-3">
                <a
                  href={`tel:${listing.contactPhone}`}
                  className="w-full py-3 bg-[#1A94FF] hover:bg-blue-600 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" /> Gọi điện: {listing.contactPhone}
                </a>

                {listing.contactZalo && (
                  <a
                    href={`https://zalo.me/${listing.contactZalo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" /> Nhắn Zalo: {listing.contactZalo}
                  </a>
                )}
              </div>

              {/* SAFETY NOTICE */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 space-y-1.5">
                <div className="font-bold flex items-center gap-1 text-amber-900 dark:text-amber-200">
                  <ShieldCheck className="w-4 h-4 text-amber-600" /> Mua hàng an toàn trên Chợ
                </div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Nên đến xem cá / thiết bị trực tiếp trước khi thanh toán.</li>
                  <li>Không chuyển khoản đặt cọc khi chưa xác minh uy tín.</li>
                  <li>Báo cáo cho BQT nếu có dấu hiệu lừa đảo.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Báo cáo tin rao vi phạm
            </h3>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Nêu rõ lý do (VD: Tin sai sự thật, hàng nhái, thông tin liên hệ ảo...)"
              rows={4}
              className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A94FF]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-xs font-semibold rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleReportSubmit}
                disabled={!reportReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl disabled:opacity-50"
              >
                Gửi báo cáo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
