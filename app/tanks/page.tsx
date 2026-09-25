'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';
import { Tank } from '@/types';
import { ChevronLeft, ChevronRight, Layers, Plus, User as UserIcon, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast-provider';
import DetailPageHeader from '@/components/ui/detail-page-header';

export default function TanksPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast, confirm } = useToast();
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [length, setLength] = useState(60);
  const [width, setWidth] = useState(30);
  const [height, setHeight] = useState(36);
  const [ph, setPh] = useState<number | ''>(6.8);
  const [temperature, setTemperature] = useState<number | ''>(26);
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTank, setEditingTank] = useState<Tank | null>(null);

  // Pagination States
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

  useEffect(() => {
    fetchTanks();
  }, []);

  const fetchTanks = async () => {
    try {
      const res: any = await api.get('/tanks');
      setTanks(res.data || []);
    } catch (err) {
      console.error('Failed to load tanks', err);
    } finally {
      setLoading(false);
    }
  };

  const totalItems = tanks.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const currentTanks = tanks.slice((page - 1) * pageSize, page * pageSize);

  const renderPaginationButtons = () => {
    const pages = [];
    const maxButtons = 5;
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`w-9 h-9 rounded-xl text-xs font-bold transition cursor-pointer ${
            page === i
              ? 'bg-[#1A94FF] text-white shadow-md shadow-blue-500/20'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  const handleCreateTank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const res: any = await api.post('/tanks', {
        name,
        length: Number(length),
        width: Number(width),
        height: Number(height),
        ph: ph !== '' ? Number(ph) : undefined,
        temperature: temperature !== '' ? Number(temperature) : undefined,
      });
      setTanks([res.data, ...tanks]);
      setShowCreateModal(false);
      setName('');
      toast.success('Tạo hồ cá thành công!');
    } catch (err) {
      console.error('Failed to create tank', err);
      toast.error('Lỗi khi tạo hồ cá!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditModal = (tank: Tank) => {
    setEditingTank(tank);
    setName(tank.name);
    setLength(tank.length || 60);
    setWidth(tank.width || 30);
    setHeight(tank.height || 36);
    setPh(tank.ph || 6.8);
    setTemperature(tank.temperature || 26);
    setShowEditModal(true);
  };

  const handleUpdateTank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTank || !name.trim()) return;

    setSubmitting(true);
    try {
      const res: any = await api.put(`/tanks/${editingTank.id}`, {
        name,
        length: Number(length),
        width: Number(width),
        height: Number(height),
        ph: ph !== '' ? Number(ph) : undefined,
        temperature: temperature !== '' ? Number(temperature) : undefined,
      });
      setTanks(tanks.map((t) => (t.id === editingTank.id ? { ...t, ...res.data } : t)));
      setShowEditModal(false);
      setEditingTank(null);
      toast.success('Cập nhật thông tin hồ cá thành công!');
    } catch (err) {
      console.error('Failed to update tank', err);
      toast.error('Lỗi khi cập nhật hồ cá!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTank = (tankId: string) => {
    confirm({
      title: 'Xóa hồ cá',
      message: 'Bạn có chắc chắn muốn xóa hồ cá này không? Dữ liệu không thể phục hồi.',
      type: 'danger',
      confirmText: 'Xóa hồ cá',
      onConfirm: async () => {
        try {
          await api.delete(`/tanks/${tankId}`);
          setTanks(tanks.filter((t) => t.id !== tankId));
          toast.success('Đã xóa hồ cá thành công!');
        } catch (err) {
          console.error('Failed to delete tank', err);
          toast.error('Lỗi khi xóa hồ cá!');
        }
      },
    });
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Breadcrumb Header */}
      <DetailPageHeader
        breadcrumbs={[]}
        currentTitle="Bộ Sưu Tập Hồ Cá"
        showShare={false}
        showBack={false}
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1A94FF] via-[#0B74E5] to-[#0D5CB6] rounded-3xl p-8 sm:p-10 text-white shadow-lg shadow-blue-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur border border-white/30">
            <Layers className="w-4 h-4 text-amber-300" />
            <span>Quản lý hồ cá kỹ thuật số</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Bộ Sưu Tập Hồ Cá AquaHub</h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl">
            Nơi theo dõi nhật ký chăm sóc bể cá, thống kê thông số pH, nhiệt độ và danh sách loài cá đang nuôi trong bể.
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) {
              router.push('/login');
              return;
            }
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-[#0B74E5] font-bold text-sm shadow-md hover:bg-blue-50 transition flex-shrink-0 relative z-10 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#1A94FF]" />
          <span>Tạo hồ cá mới</span>
        </button>
      </div>

      {/* Tanks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-white border border-blue-100 rounded-2xl animate-pulse" />
          ))
        ) : tanks.length === 0 ? (
          <div className="col-span-3 bg-white border border-blue-100 rounded-2xl p-12 text-center text-slate-400 space-y-2">
            <Layers className="w-10 h-10 text-[#1A94FF] mx-auto" />
            <p className="font-bold text-slate-700">Chưa có hồ cá nào được chia sẻ</p>
            <p className="text-xs text-slate-400">Hãy là người đầu tiên tạo hồ cá của riêng bạn!</p>
          </div>
        ) : (
          currentTanks.map((tank) => {
            const isOwner = user && (user.id === tank.ownerId || user.role === 'ADMIN');
            return (
              <div key={tank.id} className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col group">
                <div className="h-44 bg-blue-50 relative overflow-hidden">
                  <img
                    src={tank.coverImage || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'}
                    alt={tank.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {isOwner && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-slate-900/70 backdrop-blur-md p-1 rounded-xl">
                      <button
                        onClick={() => handleOpenEditModal(tank)}
                        className="p-1.5 hover:bg-white/20 text-white rounded-lg transition cursor-pointer"
                        title="Chỉnh sửa hồ cá"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTank(tank.id)}
                        className="p-1.5 hover:bg-red-500 text-white rounded-lg transition cursor-pointer"
                        title="Xóa hồ cá"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{tank.name}</h3>
                    <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                      <div className="flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-[#1A94FF]" />
                        <span>{tank.owner?.displayName || tank.owner?.username || 'Chủ hồ'}</span>
                      </div>
                      {isOwner && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          Hồ của tôi
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs pt-3 border-t border-blue-50 text-slate-600">
                    <div className="bg-[#E5F2FF] p-2 rounded-xl text-center border border-blue-100">
                      <span className="block text-[10px] text-slate-400">Dung tích</span>
                      <strong className="text-[#0B74E5] font-bold">{tank.volume || '60'} L</strong>
                    </div>
                    <div className="bg-[#E5F2FF] p-2 rounded-xl text-center border border-blue-100">
                      <span className="block text-[10px] text-slate-400">pH</span>
                      <strong className="text-[#0B74E5] font-bold">{tank.ph || '6.8'}</strong>
                    </div>
                    <div className="bg-[#E5F2FF] p-2 rounded-xl text-center border border-blue-100">
                      <span className="block text-[10px] text-slate-400">Nhiệt độ</span>
                      <strong className="text-[#0B74E5] font-bold">{tank.temperature || '26'}°C</strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Standard Synchronized Pagination Bar */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
            <div>
              Hiển thị <strong className="text-slate-800">{(page - 1) * pageSize + 1}</strong> - <strong className="text-slate-800">{Math.min(page * pageSize, totalItems)}</strong> trên tổng số <strong className="text-[#0B74E5]">{totalItems}</strong> hồ cá
            </div>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <span>Hiển thị mỗi trang:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#0B74E5] focus:outline-none focus:border-[#1A94FF] cursor-pointer"
              >
                <option value={12}>12 hồ</option>
                <option value={24}>24 hồ</option>
                <option value={48}>48 hồ</option>
                <option value={96}>96 hồ</option>
              </select>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>

              <div className="flex items-center gap-1">
                {renderPaginationButtons()}
              </div>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Tank Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-blue-950/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Tạo hồ cá kỹ thuật số</h2>
            <form onSubmit={handleCreateTank} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tên hồ cá *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hồ Thủy Sinh Bàn Làm Việc 60L"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-blue-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#1A94FF]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dài (cm)</label>
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-blue-200 rounded-xl px-2.5 py-2 text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rộng (cm)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-blue-200 rounded-xl px-2.5 py-2 text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cao (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-blue-200 rounded-xl px-2.5 py-2 text-sm text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">pH</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="6.8"
                    value={ph}
                    onChange={(e) => setPh(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-50 border border-blue-200 rounded-xl px-2.5 py-2 text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nhiệt độ (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="26"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-50 border border-blue-200 rounded-xl px-2.5 py-2 text-sm text-slate-800"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#1A94FF] hover:bg-[#0D5CB6] text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20"
                >
                  {submitting ? 'Đang tạo...' : 'Lưu hồ cá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tank Modal */}
      {showEditModal && editingTank && (
        <div className="fixed inset-0 z-50 bg-blue-950/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Chỉnh sửa thông tin hồ cá</h2>
            <form onSubmit={handleUpdateTank} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tên hồ cá *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-blue-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#1A94FF]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dài (cm)</label>
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-blue-200 rounded-xl px-2.5 py-2 text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rộng (cm)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-blue-200 rounded-xl px-2.5 py-2 text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cao (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-blue-200 rounded-xl px-2.5 py-2 text-sm text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">pH</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ph}
                    onChange={(e) => setPh(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-50 border border-blue-200 rounded-xl px-2.5 py-2 text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nhiệt độ (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-50 border border-blue-200 rounded-xl px-2.5 py-2 text-sm text-slate-800"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingTank(null); }}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#1A94FF] hover:bg-[#0D5CB6] text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
