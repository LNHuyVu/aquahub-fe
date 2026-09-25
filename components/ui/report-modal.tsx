'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, Send, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/toast-provider';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'FISH' | 'ARTICLE' | 'POST' | 'LISTING';
  title?: string;
}

const REPORT_REASON_OPTIONS = {
  FISH: [
    'Thông tin sai lệch (Nhiệt độ, pH, kích thước...)',
    'Thiếu dữ liệu chăm sóc / ghép phối',
    'Hình ảnh loài cá không chính xác',
    'Khác (nhập chi tiết bên dưới)',
  ],
  ARTICLE: [
    'Thông tin cẩm nang không chính xác',
    'Thiếu dữ liệu kỹ thuật / quy trình',
    'Hình ảnh minh họa sai hoặc lỗi',
    'Nội dung sao chép / vi phạm bản quyền',
    'Khác (nhập chi tiết bên dưới)',
  ],
  POST: [
    'Thông tin sai sự thật / gây hiểu lầm',
    'Nội dung spam / quảng cáo không phù hợp',
    'Ngôn từ xúc phạm / thiếu văn hóa',
    'Khác (nhập chi tiết bên dưới)',
  ],
  LISTING: [
    'Thông tin tin rao không đúng sự thật',
    'Hàng nhái / lừa đảo cọc',
    'Thông tin liên hệ giả mạo',
    'Khác (nhập chi tiết bên dưới)',
  ],
};

export default function ReportModal({
  isOpen,
  onClose,
  targetId,
  targetType,
  title,
}: ReportModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedOption, setSelectedOption] = useState<string>('');
  const [detailReason, setDetailReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const options = REPORT_REASON_OPTIONS[targetType] || REPORT_REASON_OPTIONS.POST;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Vui lòng đăng nhập để gửi báo cáo!');
      router.push('/login');
      return;
    }

    const finalReason = selectedOption
      ? selectedOption.startsWith('Khác')
        ? detailReason.trim()
        : detailReason.trim()
        ? `${selectedOption}: ${detailReason.trim()}`
        : selectedOption
      : detailReason.trim();

    if (!finalReason) {
      toast.error('Vui lòng chọn hoặc nhập lý do báo cáo.');
      return;
    }

    setSubmitting(true);
    try {
      let endpoint = '';
      if (targetType === 'FISH') endpoint = `/fish/${targetId}/report`;
      else if (targetType === 'ARTICLE') endpoint = `/articles/${targetId}/report`;
      else if (targetType === 'POST') endpoint = `/posts/${targetId}/report`;
      else if (targetType === 'LISTING') endpoint = `/listings/${targetId}/reports`;

      const res: any = await api.post(endpoint, {
        reason: finalReason,
        targetType,
      });

      const message = res?.data?.message || res?.message || 'Đã gửi báo cáo thành công. Ban quản trị sẽ sớm xem xét!';
      toast.success(message);
      onClose();
      setSelectedOption('');
      setDetailReason('');
    } catch (err: any) {
      console.error('Failed to submit report:', err);
      toast.error(err.response?.data?.message || 'Lỗi khi gửi báo cáo. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  const getTargetTitle = () => {
    switch (targetType) {
      case 'FISH':
        return 'Báo cáo thông tin Tra cứu sai / thiếu dữ liệu';
      case 'ARTICLE':
        return 'Báo cáo bài viết Cẩm nang sai / thiếu dữ liệu';
      case 'POST':
        return 'Báo cáo bài viết Cộng đồng vi phạm / nội dung sai';
      default:
        return 'Báo cáo vi phạm';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 leading-tight">
                {getTargetTitle()}
              </h3>
              {title && (
                <p className="text-[11px] text-slate-500 font-medium truncate max-w-[240px] sm:max-w-[280px]">
                  {title}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Chọn lý do báo cáo:
            </label>
            <div className="space-y-1.5">
              {options.map((opt, idx) => (
                <label
                  key={idx}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                    selectedOption === opt
                      ? 'bg-blue-50/80 border-[#1A94FF] text-[#0B74E5] font-bold shadow-2xs'
                      : 'bg-slate-50/60 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={opt}
                    checked={selectedOption === opt}
                    onChange={() => setSelectedOption(opt)}
                    className="w-3.5 h-3.5 text-[#1A94FF] focus:ring-blue-500"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Detailed Reason Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Mô tả chi tiết / Gợi ý bổ sung dữ liệu (*):
            </label>
            <textarea
              rows={3}
              value={detailReason}
              onChange={(e) => setDetailReason(e.target.value)}
              placeholder="Nhập chi tiết nội dung bị sai hoặc cần bổ sung thông tin..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1A94FF] focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition resize-none font-medium"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={submitting || (!selectedOption && !detailReason.trim())}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{submitting ? 'Đang gửi...' : 'Gửi báo cáo'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
