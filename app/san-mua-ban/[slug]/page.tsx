'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Listing, ListingStatus } from '@/types';
import ListingCard, { formatPrice, getConditionBadge } from '@/components/ui/listing-card';
import ListingGallery from '@/components/ui/listing-gallery';
import ContactSellerModal from '@/components/ui/contact-seller-modal';
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
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Pencil,
  Send,
  User,
  Sparkles,
  ShoppingBag,
  Info,
} from 'lucide-react';

import { useAuth } from '@/contexts/auth-context';
import ReportModal from '@/components/ui/report-modal';
import DetailPageHeader from '@/components/ui/detail-page-header';

export default function ListingDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const slug = params?.slug as string;

  const router = useRouter();
  const { toast } = useToast();

  const [listing, setListing] = useState<Listing | null>(null);
  const [relatedListings, setRelatedListings] = useState<Listing[]>([]);
  const [newListings, setNewListings] = useState<Listing[]>([]);
  const [activeTab, setActiveTab] = useState<'related' | 'new'>('related');
  const [loading, setLoading] = useState(true);

  // Interaction States
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);

  // Report & Contact Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    async function loadListing(isFirstLoad = false) {
      if (!slug) return;
      if (isFirstLoad) setLoading(true);
      try {
        const res: any = await api.get(`/listings/${slug}`);
        const item: Listing = res.data || res;
        setListing(item);
        setIsLiked(!!item.isLiked);
        setLikesCount(item.likesCount || 0);

        if (isFirstLoad) {
          // Fetch related products (same category)
          try {
            let relUrl = `/listings?limit=8`;
            if (item.categoryId) {
              relUrl += `&categoryId=${item.categoryId}`;
            }
            const relRes: any = await api.get(relUrl);
            const relItems = relRes.data?.data || relRes.data || relRes || [];
            const filteredRel = relItems.filter((i: Listing) => i.id !== item.id);
            setRelatedListings(filteredRel.slice(0, 4));
          } catch (e) {
            console.error('Error fetching related listings:', e);
          }

          // Fetch new products (latest)
          try {
            const newRes: any = await api.get(`/listings?sortBy=createdAt&limit=8`);
            const newItems = newRes.data?.data || newRes.data || newRes || [];
            const filteredNew = newItems.filter((i: Listing) => i.id !== item.id);
            setNewListings(filteredNew.slice(0, 4));
          } catch (e) {
            console.error('Error fetching new listings:', e);
          }
        }
      } catch (err) {
        console.error('Error fetching listing details:', err);
      } finally {
        if (isFirstLoad) setLoading(false);
      }
    }

    if (slug) {
      loadListing(true);

      const interval = setInterval(() => {
        loadListing(false);
      }, 4000);

      return () => clearInterval(interval);
    }
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

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết tin rao bán vào khay nhớ tạm!');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#1A94FF] border-t-transparent rounded-full animate-spin" />
        <p className="font-semibold text-slate-600 text-sm">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-50/50 py-16 text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy sản phẩm này</h2>
        <p className="text-slate-500 text-sm">Tin đăng này không tồn tại hoặc đã bị ẩn bởi người bán.</p>
        <Link
          href="/san-mua-ban"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#1A94FF] bg-white border border-slate-200 hover:border-blue-300 px-4 py-2.5 rounded-xl transition shadow-xs hover:bg-blue-50/50 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#1A94FF]" />
          <span>Quay lại Sàn Mua Bán</span>
        </Link>
      </div>
    );
  }

  const isSold = listing.status === ListingStatus.SOLD;
  const conditionBadge = getConditionBadge(listing.condition);

  const breadcrumbs = [
    { label: 'Sàn Mua Bán', href: '/san-mua-ban' },
    ...(listing.category
      ? [{ label: listing.category.name, href: `/san-mua-ban?category=${listing.category.slug}` }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-4 max-w-6xl">
        
        {/* UNIFIED SHARED BREADCRUMB & HEADER */}
        <DetailPageHeader
          breadcrumbs={breadcrumbs}
          currentTitle={listing.title}
          onReport={() => setShowReportModal(true)}
          reportLabel="Báo cáo"
          shareTitle="tin rao bán"
        />

        {/* UNIFIED HERO CARD (GALLERY LEFT + PRIMARY INFO & CONTACT RIGHT) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-2xs space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* GALLERY (LG: 7 COLUMNS) */}
            <div className="lg:col-span-7">
              <ListingGallery
                imageData={listing.imageData}
                images={listing.images}
                videosData={listing.videosData}
                videoUrl={listing.videoUrl}
                title={listing.title}
                isSold={isSold}
                className="border-0 shadow-none bg-transparent rounded-2xl"
              />
            </div>

            {/* PRODUCT QUICK INFO & CONTACT (LG: 5 COLUMNS) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-1 text-xs font-semibold border rounded-lg ${conditionBadge.bg}`}>
                  {conditionBadge.text}
                </span>
                {listing.category && (
                  <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg">
                    {listing.category.name}
                  </span>
                )}
                {isSold ? (
                  <span className="px-2.5 py-1 text-xs font-bold bg-red-600 text-white rounded-lg">
                    ĐÃ BÁN
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500 text-white rounded-lg">
                    Đang bán
                  </span>
                )}
                {(listing as any).shopeeProductUrl && (
                  <span className="px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg flex items-center gap-1 shadow-2xs border border-orange-300">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-white text-orange-500" />
                    Shopee
                  </span>
                )}
                {user && user.id === listing.userId && (
                  <Link
                    href={`/san-mua-ban/dang-ban?edit=${listing.id}`}
                    className="ml-auto px-2.5 py-1 bg-blue-50 text-[#1A94FF] hover:bg-blue-100 text-xs font-bold rounded-lg border border-blue-200 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Sửa tin
                  </Link>
                )}
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {listing.title}
              </h1>

              {/* Highlight Price Box */}
              <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200/80 flex items-center justify-between gap-3 shadow-2xs">
                <div>
                  <div className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">Giá niêm yết</div>
                  <div className="text-2xl sm:text-3xl font-black text-rose-600 leading-none mt-1">
                    {formatPrice(Number(listing.price), listing.priceType)}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl border border-rose-100 text-slate-600 font-semibold shadow-2xs">
                    <Eye className="w-3.5 h-3.5 text-[#1A94FF]" /> {listing.views || 0}
                  </span>
                  <button
                    onClick={handleLikeToggle}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold ${
                      isLiked
                        ? 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                        : 'bg-white border-rose-200 text-rose-600 hover:bg-rose-100'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} /> {likesCount}
                  </button>
                </div>
              </div>

              {/* Location & Shipping Info */}
              <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-start gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-[#1A94FF] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">Vị trí:</span>{' '}
                    {[listing.streetAddress, listing.ward, listing.district, listing.province]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                </div>

                {listing.shippingAvailable && (
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold pt-1 border-t border-slate-200/60">
                    <Truck className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Giao hàng: {listing.shippingNote || 'Có hỗ trợ vận chuyển'}</span>
                  </div>
                )}
              </div>

              {/* Integrated Seller Contact Section */}
              <div className="p-4 bg-gradient-to-br from-blue-50/50 to-slate-50 rounded-2xl border border-blue-100 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1A94FF] to-blue-500 text-white font-extrabold text-sm flex items-center justify-center shadow-2xs shrink-0">
                    {listing.contactName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-extrabold text-slate-900 text-sm truncate">
                      {listing.contactName}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">Người bán uy tín trên AquaHub</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {user && user.id === listing.userId ? (
                    <div className="p-2.5 bg-blue-100/70 border border-blue-200 rounded-xl text-center text-xs font-bold text-[#0B74E5]">
                      ✨ Bạn là chủ tin đăng này
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowContactModal(true)}
                      className="w-full py-2.5 bg-[#1A94FF] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" /> Nhắn tin trực tiếp
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${listing.contactPhone}`}
                      className="py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" /> Gọi: {listing.contactPhone}
                    </a>

                    {listing.contactZalo ? (
                      <a
                        href={`https://zalo.me/${listing.contactZalo}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Zalo: {listing.contactZalo}
                      </a>
                    ) : (
                      <div className="py-2 bg-slate-100 text-slate-400 font-semibold text-xs rounded-xl text-center flex items-center justify-center">
                        Không có Zalo
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* DETAILED CONTENT & COMMENTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT 8 COLUMNS: DESCRIPTION + COMMENTS */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* DESCRIPTION CARD */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-[#1A94FF]" />
                Mô tả chi tiết sản phẩm
              </h3>

              <div
                className="prose max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed pt-1 space-y-2"
                dangerouslySetInnerHTML={{ __html: listing.description }}
              />

              {/* SHOPEE AFFILIATE CARD IF PRESENT */}
              {(listing as any).shopeeProductUrl && (
                <div className="mt-4 p-4 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {(listing as any).shopeeImageUrl ? (
                      <img
                        src={(listing as any).shopeeImageUrl}
                        alt={(listing as any).shopeeProductName || 'Shopee Product'}
                        className="w-12 h-12 object-cover rounded-xl border border-orange-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 text-lg font-bold shrink-0">
                        🛒
                      </div>
                    )}
                    <div>
                      <div className="text-[10px] uppercase font-bold text-orange-600 tracking-wider">
                        Sản phẩm tham khảo Shopee
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                        {(listing as any).shopeeProductName || 'Xem sản phẩm tương tự trên Shopee'}
                      </h4>
                      {(listing as any).shopeePrice && (
                        <div className="text-xs font-semibold text-rose-600">
                          Giá từ: {Number((listing as any).shopeePrice).toLocaleString('vi-VN')} đ
                        </div>
                      )}
                    </div>
                  </div>
                  <a
                    href={(listing as any).shopeeProductUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto text-center px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-2xs transition-all whitespace-nowrap"
                  >
                    Xem Shopee ↗
                  </a>
                </div>
              )}
            </div>

            {/* COMMENTS & DISCUSSION CARD */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <MessageSquare className="w-4 h-4 text-[#1A94FF]" />
                Hỏi đáp & Bình luận ({listing.commentsCount || 0})
              </h3>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Viết thắc mắc hoặc câu hỏi cho người bán..."
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A94FF]"
                />
                <button
                  type="submit"
                  disabled={commenting || !commentText.trim()}
                  className="px-4 py-2.5 bg-[#1A94FF] hover:bg-blue-600 text-white font-bold text-xs rounded-2xl transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" /> Gửi
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-2.5 pt-1">
                {listing.comments && listing.comments.length > 0 ? (
                  listing.comments.map((cmt) => (
                    <div
                      key={cmt.id}
                      className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/70 flex items-start gap-3 text-xs sm:text-sm"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1A94FF] font-extrabold text-xs flex items-center justify-center shrink-0">
                        {cmt.user?.username?.substring(0, 2).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            {cmt.user?.displayName || cmt.user?.username || 'Người dùng AquaHub'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(cmt.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-slate-700 text-xs leading-relaxed">{cmt.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">
                    Chưa có bình luận nào. Hãy là người đầu tiên đặt câu hỏi cho sản phẩm này!
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT 4 COLUMNS: SAFETY TIPS & REPORT PROMPT */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Safety Tips Card */}
            <div className="bg-amber-50/80 p-5 rounded-3xl border border-amber-200/80 space-y-3">
              <div className="font-extrabold flex items-center gap-2 text-amber-900 text-sm">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Mua bán an toàn trên AquaHub</span>
              </div>
              <ul className="list-disc pl-4 space-y-1.5 text-xs text-amber-800 leading-relaxed font-medium">
                <li>Nên kiểm tra trực tiếp tình trạng cá/thiết bị trước khi thanh toán.</li>
                <li>Không thực hiện chuyển khoản cọc nếu chưa xác minh rõ người bán.</li>
                <li>Giao dịch trực tiếp tại nơi công cộng hoặc địa chỉ nhà riêng rõ ràng.</li>
              </ul>
            </div>

            {/* Violation Report Action Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 text-xs">
              <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Phát hiện nội dung vi phạm?</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Nếu sản phẩm có dấu hiệu lừa đảo, đăng sai sự thật hoặc hình ảnh không đúng, hãy báo cho BQT.
              </p>
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs rounded-xl transition cursor-pointer text-center"
              >
                Gửi báo cáo tin rao
              </button>
            </div>

          </div>

        </div>

        {/* RELATED & NEW PRODUCTS SECTION */}
        {(relatedListings.length > 0 || newListings.length > 0) && (
          <section className="pt-6 border-t border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-100 text-[#0B74E5] text-[11px] font-extrabold uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Gợi ý mua sắm
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Sản phẩm tương tự & Tin đăng mới nhất
                </h2>
              </div>

              {/* TAB SELECTOR */}
              <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs self-start sm:self-auto">
                {relatedListings.length > 0 && (
                  <button
                    onClick={() => setActiveTab('related')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'related'
                        ? 'bg-[#1A94FF] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Cùng danh mục ({relatedListings.length})
                  </button>
                )}
                {newListings.length > 0 && (
                  <button
                    onClick={() => setActiveTab('new')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'new'
                        ? 'bg-[#1A94FF] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Mới đăng gần đây ({newListings.length})
                  </button>
                )}
                <Link
                  href="/san-mua-ban"
                  className="px-3 py-1.5 text-xs font-bold text-[#1A94FF] hover:underline flex items-center gap-1"
                >
                  Xem tất cả ↗
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(activeTab === 'related' && relatedListings.length > 0 ? relatedListings : newListings).map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* UNIFIED REPORT MODAL */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={listing.id}
        targetType="LISTING"
        title={listing.title}
      />
      {/* CONTACT SELLER MODAL */}
      <ContactSellerModal
        listingId={listing.id}
        listingTitle={listing.title}
        listingPrice={Number(listing.price)}
        sellerName={listing.contactName}
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  );
}
