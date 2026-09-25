'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import MediaUploader from '@/components/ui/media-uploader';
import AddressPicker from '@/components/ui/address-picker';
import DetailPageHeader from '@/components/ui/detail-page-header';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { useToast } from '@/components/ui/toast-provider';
import { useAuth } from '@/contexts/auth-context';
import { Listing, ListingCategory, PriceType, ListingCondition, ListingImageData, ListingVideoData } from '@/types';
import {
  Sparkles,
  DollarSign,
  Phone,
  User,
  Truck,
  MapPin,
  ImageIcon,
  ShieldCheck,
  Eye,
  Tag,
  Zap,
} from 'lucide-react';

function PostListingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit') || undefined;
  const { toast } = useToast();
  const { user } = useAuth();

  const [categories, setCategories] = useState<ListingCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);

  // Form State
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [priceType, setPriceType] = useState<PriceType>(PriceType.FIXED);
  const [condition, setCondition] = useState<ListingCondition>(ListingCondition.LIKE_NEW);

  const [images, setImages] = useState<string[]>([]);
  const [imageData, setImageData] = useState<ListingImageData[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [videosData, setVideosData] = useState<ListingVideoData[]>([]);

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactZalo, setContactZalo] = useState('');

  // Auto-fill contactName from logged-in user account
  useEffect(() => {
    if (user && !editId && !contactName) {
      setContactName(user.displayName || user.username || '');
    }
  }, [user, editId, contactName]);

  const [address, setAddress] = useState({
    province: '',
    district: '',
    ward: '',
    streetAddress: '',
    oldAddressNote: '',
  });

  const [shippingAvailable, setShippingAvailable] = useState(false);
  const [shippingNote, setShippingNote] = useState('');

  // Fetch Categories & existing data if editing
  useEffect(() => {
    async function init() {
      try {
        const catRes: any = await api.get('/fish/categories');
        setCategories(catRes.data || catRes || []);

        if (editId) {
          const listingRes: any = await api.get(`/listings/${editId}`);
          const item: Listing = listingRes.data || listingRes;

          setTitle(item.title);
          setCategoryId(item.categoryId || '');
          setDescription(item.description);
          setPrice(item.price);
          setPriceType(item.priceType);
          setCondition(item.condition);
          setImages(item.images || []);
          setImageData(item.imageData || (item.images ? item.images.map((u) => ({ url: u })) : []));
          setVideoUrl(item.videoUrl || '');
          setVideosData(item.videosData || (item.videoUrl ? [{ url: item.videoUrl }] : []));
          setContactName(item.contactName);
          setContactPhone(item.contactPhone);
          setContactZalo(item.contactZalo || '');
          setAddress({
            province: item.province,
            district: item.district,
            ward: item.ward || '',
            streetAddress: item.streetAddress || '',
            oldAddressNote: item.oldAddressNote || '',
          });
          setShippingAvailable(item.shippingAvailable);
          setShippingNote(item.shippingNote || '');
        }
      } catch (err) {
        console.error('Error initializing form:', err);
      } finally {
        setFetching(false);
      }
    }
    init();
  }, [editId]);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !contactPhone || !address.province) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc (*)!');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        categoryId: categoryId || undefined,
        description,
        price: Number(price) || 0,
        priceType,
        condition,
        images,
        imageData,
        videoUrl,
        videosData,
        contactName,
        contactPhone,
        contactZalo,
        province: address.province,
        district: address.district,
        ward: address.ward,
        streetAddress: address.streetAddress,
        oldAddressNote: address.oldAddressNote,
        shippingAvailable,
        shippingNote,
      };

      if (editId) {
        await api.put(`/listings/${editId}`, payload);
        toast.success('Cập nhật tin đăng thành công!');
      } else {
        await api.post('/listings', payload);
        toast.success('Đăng tin bán thành công!');
      }
      router.push('/san-mua-ban/tin-cua-toi');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu tin');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1A94FF]"></div>
          <span className="text-sm font-medium text-slate-500">Đang tải thông tin tin đăng...</span>
        </div>
      </div>
    );
  }

  // Cover image for live preview
  const coverImage = imageData[0]?.url || images[0] || '';
  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 shadow-xs mb-6">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <DetailPageHeader
            breadcrumbs={[{ label: 'Sàn Mua Bán', href: '/san-mua-ban' }]}
            currentTitle={editId ? 'Chỉnh sửa tin rao bán' : 'Đăng tin rao bán mới'}
            showShare={false}
          />
        </div>
      </div>

      {/* FORM CONTAINER - Seamless 2-Column Grid */}
      <div className="container mx-auto px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT MAIN COLUMN: Master Unified Card */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">

              {/* SECTION: MEDIA UPLOADER */}
              <div className="p-6 space-y-4">
                <MediaUploader
                  imageData={imageData}
                  setImageData={setImageData}
                  videosData={videosData}
                  setVideosData={setVideosData}
                  legacyImages={images}
                  setLegacyImages={setImages}
                  legacyVideoUrl={videoUrl}
                  setLegacyVideoUrl={setVideoUrl}
                  className="space-y-5"
                />
              </div>

              {/* SECTION: BASIC INFORMATION & PRICE */}
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-2 pb-1">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1A94FF] flex items-center justify-center shrink-0 border border-blue-100">
                    <DollarSign className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Thông tin chi tiết & Giá bán</h2>
                    <p className="text-xs text-slate-500">Mô tả đầy đủ chủng loại, tình trạng & mức giá niêm yết</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tiêu đề tin đăng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ví dụ: Bán bầy cá Betta Dumbo Halfmoon gen đẹp, Đèn Thủy Sinh WRGB 60cm..."
                      required
                      className="w-full px-4 py-3 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A94FF] focus:bg-white transition-all font-medium"
                    />
                  </div>

                  {/* Category & Condition */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Danh mục sản phẩm
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-4 py-3 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A94FF] focus:bg-white transition-all font-medium"
                      >
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Tình trạng
                      </label>
                      <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value as ListingCondition)}
                        className="w-full px-4 py-3 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A94FF] focus:bg-white transition-all font-medium"
                      >
                        <option value={ListingCondition.NEW}>Mới 100%</option>
                        <option value={ListingCondition.LIKE_NEW}>Như mới (99%)</option>
                        <option value={ListingCondition.USED}>Đã qua sử dụng</option>
                      </select>
                    </div>
                  </div>

                  {/* Price & Price Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Hình thức giá
                      </label>
                      <select
                        value={priceType}
                        onChange={(e) => setPriceType(e.target.value as PriceType)}
                        className="w-full px-4 py-3 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A94FF] focus:bg-white transition-all font-medium"
                      >
                        <option value={PriceType.FIXED}>Giá cố định</option>
                        <option value={PriceType.NEGOTIABLE}>Thỏa thuận / Thương lượng</option>
                        <option value={PriceType.GIVEAWAY}>Tặng miễn phí 🎁</option>
                        <option value={PriceType.CONTACT}>Liên hệ báo giá</option>
                      </select>
                    </div>

                    {priceType !== PriceType.GIVEAWAY && priceType !== PriceType.CONTACT && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Giá bán (VNĐ) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            step={1000}
                            value={price}
                            onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                            placeholder="Ví dụ: 150000"
                            required
                            className="w-full pl-4 pr-12 py-3 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A94FF] focus:bg-white transition-all font-bold text-slate-900"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            đ
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Mô tả chi tiết <span className="text-red-500">*</span>
                    </label>
                    <RichTextEditor
                      value={description}
                      onChange={setDescription}
                      placeholder="Mô tả tuổi cá, kích thước, tình trạng sức khỏe, chế độ ăn, hoặc tình trạng hoạt động của lọc/đèn..."
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: ADDRESS PICKER */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 pb-1">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1A94FF] flex items-center justify-center shrink-0 border border-blue-100">
                    <MapPin className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Địa chỉ giao dịch & Xem hàng</h2>
                    <p className="text-xs text-slate-500">Giúp người mua gần bạn dễ dàng tìm thấy & xem hàng trực tiếp</p>
                  </div>
                </div>

                <AddressPicker
                  selectedProvince={address.province}
                  selectedDistrict={address.district}
                  selectedWard={address.ward}
                  streetAddress={address.streetAddress}
                  onChange={setAddress}
                  required={true}
                  className="space-y-4"
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR COLUMN: Contact, Live Preview & Sticky Action Bar */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-6">

            {/* SECTION: CONTACT & SHIPPING CARD */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Liên hệ & Vận chuyển</h2>
                  <p className="text-xs text-slate-500">Thông tin liên lạc chuẩn xác</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Contact Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tên người bán <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Họ tên hoặc Nickname"
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A94FF] focus:bg-white transition-all font-medium"
                  />
                  {user && (
                    <div className="flex items-center gap-1.5 mt-2 p-2 bg-blue-50/80 border border-blue-100 rounded-xl text-[11px] text-[#1A94FF] font-semibold">
                      <User className="w-3.5 h-3.5 shrink-0" />
                      <span>Đã liên kết tài khoản: <strong>{user.displayName || user.username}</strong></span>
                    </div>
                  )}
                </div>

                {/* Phone & Zalo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="0987654321"
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A94FF] focus:bg-white transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Số Zalo
                    </label>
                    <input
                      type="tel"
                      value={contactZalo}
                      onChange={(e) => setContactZalo(e.target.value)}
                      placeholder="0987654321"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A94FF] focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Shipping Toggle */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={shippingAvailable}
                      onChange={(e) => setShippingAvailable(e.target.checked)}
                      className="w-4.5 h-4.5 rounded text-[#1A94FF] focus:ring-[#1A94FF] accent-[#1A94FF]"
                    />
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#1A94FF]" /> Có hỗ trợ ship / ship COD / ship xa
                    </span>
                  </label>

                  {shippingAvailable && (
                    <input
                      type="text"
                      value={shippingNote}
                      onChange={(e) => setShippingNote(e.target.value)}
                      placeholder="Ghi chú vận chuyển (VD: Ship nội thành 20k, đóng xốp bảo đảm)..."
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A94FF] focus:bg-white transition-all"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* LIVE PREVIEW WIDGET */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#1A94FF]" /> Xem trước hiển thị
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  Live Card
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex gap-3 items-center">
                <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-400">
                  {coverImage ? (
                    <img src={coverImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Tag className="w-3 h-3 text-[#1A94FF]" />
                    <span className="truncate">{selectedCategoryObj?.name || 'Chưa chọn danh mục'}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {title || 'Tiêu đề tin rao bán của bạn...'}
                  </h4>
                  <div className="text-xs font-extrabold text-[#1A94FF]">
                    {priceType === PriceType.GIVEAWAY
                      ? 'Tặng miễn phí 🎁'
                      : priceType === PriceType.CONTACT
                        ? 'Liên hệ báo giá'
                        : price
                          ? `${Number(price).toLocaleString('vi-VN')} đ`
                          : '0 đ'}
                  </div>
                </div>
              </div>
            </div>

            {/* STICKY ACTIONS BOX */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-lg space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#1A94FF] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>{editId ? 'Lưu Cập Nhật Tin Bán' : 'Đăng Tin Bán Ngay'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all text-center cursor-pointer"
              >
                Hủy bỏ & Quay lại
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Bảo mật thông tin & Kiểm duyệt an toàn</span>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}

export default function PostListingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1A94FF]"></div>
        </div>
      }
    >
      <PostListingForm />
    </Suspense>
  );
}
