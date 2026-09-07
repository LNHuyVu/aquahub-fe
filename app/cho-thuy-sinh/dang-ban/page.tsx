'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Listing, ListingCategory, PriceType, ListingCondition } from '@/types';
import AddressPicker from '@/components/ui/address-picker';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { useToast } from '@/components/ui/toast-provider';
import {
  Upload,
  Video,
  X,
  Image as ImageIcon,
  DollarSign,
  Phone,
  User,
  Truck,
  CheckCircle2,
  ArrowLeft,
  ArrowLeft as ArrowLeftIcon,
  Sparkles,
} from 'lucide-react';

export default function PostListingPage() {
  const router = useRouter();
  const params = useParams();
  const editId = params?.id as string | undefined;
  const { toast } = useToast();

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
  const [videoUrl, setVideoUrl] = useState('');

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactZalo, setContactZalo] = useState('');

  const [address, setAddress] = useState({
    province: '',
    district: '',
    ward: '',
    streetAddress: '',
    oldAddressNote: '',
  });

  const [shippingAvailable, setShippingAvailable] = useState(false);
  const [shippingNote, setShippingNote] = useState('');

  // Uploading state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Fetch Categories & existing data if editing
  useEffect(() => {
    async function init() {
      try {
        const catRes: any = await api.get('/listings/categories');
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
          setVideoUrl(item.videoUrl || '');
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

  // Handle Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadedUrls: string[] = [...images];
      for (let i = 0; i < files.length; i++) {
        if (uploadedUrls.length >= 6) {
          toast.error('Tối đa 6 hình ảnh cho mỗi tin đăng');
          break;
        }
        const formData = new FormData();
        formData.append('file', files[i]);
        const res: any = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const url = res.data?.url || res.url;
        if (url) uploadedUrls.push(url);
      }
      setImages(uploadedUrls);
      toast.success('Tải ảnh thành công!');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi tải ảnh. Vui lòng thử lại!');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle Video Upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res: any = await api.post('/upload/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.url || res.url;
      if (url) {
        setVideoUrl(url);
        toast.success('Tải video thành công!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi tải video. Dung lượng tối đa 50MB!');
    } finally {
      setUploadingVideo(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !contactPhone || !address.province || !address.district) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc!');
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
        videoUrl,
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
      router.push('/cho-thuy-sinh/tin-cua-toi');
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1A94FF]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="container mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/cho-thuy-sinh"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#1A94FF] transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Quay lại Chợ Thủy Sinh
        </Link>

        {/* Page Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#1A94FF]" />
              {editId ? 'Chỉnh Sửa Tin Bán' : 'Đăng Tin Rao Bán Cá / Thiết Bị'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Điền thông tin chi tiết về sản phẩm để tiếp cận hàng ngàn anh em đồng ngư trên AquaHub.
            </p>
          </div>
        </div>

        {/* FORM CONTAINER */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. MEDIA SECTION (IMAGES & VIDEO) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#1A94FF]" /> Hình ảnh & Video sản phẩm
            </h2>

            {/* Images Grid */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">
                Hình ảnh (Tối đa 6 ảnh)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-200">
                    <img src={img} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {images.length < 6 && (
                  <label className="aspect-square border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#1A94FF] hover:bg-blue-50/50 transition-all text-slate-400 hover:text-[#1A94FF]">
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-[11px] font-medium">Thêm ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Video Upload */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-500 mb-2">
                Video quay trực tiếp cá / bể / thiết bị (Tối đa 50MB)
              </label>
              {videoUrl ? (
                <div className="relative rounded-2xl overflow-hidden bg-black max-w-md">
                  <video src={videoUrl} controls className="w-full h-48 object-contain" />
                  <button
                    type="button"
                    onClick={() => setVideoUrl('')}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full shadow"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer transition-all">
                  <Video className="w-4 h-4 text-[#1A94FF]" />
                  {uploadingVideo ? 'Đang tải video...' : 'Tải lên Video sản phẩm'}
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    disabled={uploadingVideo}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* 2. BASIC INFORMATION */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#1A94FF]" /> Thông tin chi tiết & Giá bán
            </h2>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Tiêu đề tin đăng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Bán bầy cá Betta Dumbo Halfmoon gen đẹp, Đèn Thủy Sinh WRGB 60cm..."
                required
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A94FF]"
              />
            </div>

            {/* Category & Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Danh mục sản phẩm</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A94FF]"
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
                <label className="block text-xs font-semibold text-slate-500 mb-1">Tình trạng</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ListingCondition)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A94FF]"
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
                <label className="block text-xs font-semibold text-slate-500 mb-1">Loại giá</label>
                <select
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value as PriceType)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A94FF]"
                >
                  <option value={PriceType.FIXED}>Giá cố định</option>
                  <option value={PriceType.NEGOTIABLE}>Thỏa thuận / Thương lượng</option>
                  <option value={PriceType.GIVEAWAY}>Tặng miễn phí 🎁</option>
                  <option value={PriceType.CONTACT}>Liên hệ báo giá</option>
                </select>
              </div>

              {priceType !== PriceType.GIVEAWAY && priceType !== PriceType.CONTACT && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Giá bán (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={price}
                    onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Ví dụ: 150000"
                    required
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A94FF]"
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Mô tả chi tiết <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Mô tả tuổi cá, kích thước, tình trạng sức khỏe, chế độ ăn, hoặc tình trạng hoạt động của lọc/đèn..."
              />
            </div>
          </div>

          {/* 3. ADDRESS PICKER */}
          <AddressPicker
            selectedProvince={address.province}
            selectedDistrict={address.district}
            selectedWard={address.ward}
            streetAddress={address.streetAddress}
            onChange={setAddress}
            required={true}
          />

          {/* 4. CONTACT & SHIPPING INFO */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#1A94FF]" /> Thông tin liên hệ & Vận chuyển
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Tên người bán</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Họ tên hoặc Nickname"
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A94FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="0987654321"
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A94FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Số Zalo (nếu có)</label>
                <input
                  type="tel"
                  value={contactZalo}
                  onChange={(e) => setContactZalo(e.target.value)}
                  placeholder="0987654321"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A94FF]"
                />
              </div>
            </div>

            {/* Shipping Toggle */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shippingAvailable}
                  onChange={(e) => setShippingAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1A94FF] focus:ring-[#1A94FF]"
                />
                <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#1A94FF]" /> Có hỗ trợ ship / ship COD / ship xa
                </span>
              </label>

              {shippingAvailable && (
                <input
                  type="text"
                  value={shippingNote}
                  onChange={(e) => setShippingNote(e.target.value)}
                  placeholder="Ghi chú vận chuyển (VD: Ship nội thành 20k, đóng oxy đóng xốp bảo đảm an toàn)..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A94FF]"
                />
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-300 transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#1A94FF] hover:bg-blue-600 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {editId ? 'Lưu thay đổi' : 'Đăng tin rao bán ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
