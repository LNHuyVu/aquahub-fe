'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Listing, ListingStatus } from '@/types';
import ListingCard from '@/components/ui/listing-card';
import DetailPageHeader from '@/components/ui/detail-page-header';
import { useToast } from '@/components/ui/toast-provider';
import { ShoppingBag, PlusCircle, ArrowLeft, Layers } from 'lucide-react';

export default function MyListingsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMyListings = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/listings/my-listings');
      const items = res.data?.data || res.data || res || [];
      setListings(items);
    } catch (err) {
      console.error('Error fetching my listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyListings();
  }, []);

  const handleToggleStatus = async (id: string) => {
    try {
      await api.put(`/listings/${id}/toggle-status`);
      toast.success('Đã cập nhật trạng thái tin thành công!');
      loadMyListings();
    } catch (err) {
      toast.error('Có lỗi xảy ra khi đổi trạng thái!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="container mx-auto space-y-6">
        <DetailPageHeader
          breadcrumbs={[{ label: 'Sàn Mua Bán', href: '/san-mua-ban' }]}
          currentTitle="Tin rao bán của tôi"
          showShare={false}
        />

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-[#1A94FF]" /> Tin Rao Bán Của Tôi
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Quản lý danh sách các bài đăng cá/thiết bị của bạn và bật/tắt trạng thái Đang bán - Đã bán.
            </p>
          </div>

          <Link
            href="/san-mua-ban/dang-ban"
            className="px-5 py-2.5 bg-[#1A94FF] hover:bg-blue-600 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0"
          >
            <PlusCircle className="w-4 h-4" /> Đăng tin mới
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-72 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-800">
              Bạn chưa có tin đăng bán nào
            </h3>
            <p className="text-slate-500 text-sm mt-1 mb-4">
              Hãy tạo tin rao bán đầu tiên để kết nối với người mua trên AquaHub!
            </p>
            <Link
              href="/san-mua-ban/dang-ban"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A94FF] text-white text-xs font-semibold rounded-xl"
            >
              <PlusCircle className="w-4 h-4" /> Đăng tin bán ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((item) => (
              <ListingCard
                key={item.id}
                listing={item}
                isOwner={true}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
