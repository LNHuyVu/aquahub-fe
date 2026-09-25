'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ArrowLeft, Share2, AlertTriangle, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast-provider';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DetailPageHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  currentTitle: string;
  onReport?: () => void;
  onDelete?: () => void;
  reportLabel?: string;
  shareTitle?: string;
  deleteLabel?: string;
  showShare?: boolean;
  showBack?: boolean;
}

export default function DetailPageHeader({
  breadcrumbs,
  currentTitle,
  onReport,
  onDelete,
  reportLabel = 'Báo cáo',
  shareTitle = 'liên kết',
  deleteLabel = 'Xóa',
  showShare = true,
  showBack = true,
}: DetailPageHeaderProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success(`Đã sao chép ${shareTitle} vào khay nhớ tạm!`);
    }
  };

  return (
    <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
      {/* Breadcrumb Links */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap max-w-full">
        <Link href="/" className="hover:text-[#1A94FF] transition shrink-0">Trang chủ</Link>
        {breadcrumbs.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 shrink-0">
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            {item.href ? (
              <Link href={item.href} className="hover:text-[#1A94FF] transition">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </div>
        ))}
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        <span className="text-slate-900 font-bold truncate max-w-[180px] sm:max-w-[320px]">
          {currentTitle}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>{deleteLabel}</span>
          </button>
        )}

        {onReport && (
          <button
            type="button"
            onClick={onReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs transition cursor-pointer"
            title="Báo cáo nội dung vi phạm"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>{reportLabel}</span>
          </button>
        )}

        {showShare && (
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-[#1A94FF]" />
            <span>Chia sẻ</span>
          </button>
        )}

        {showBack && (
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:text-[#1A94FF] text-slate-700 font-bold text-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#1A94FF]" />
            <span>Quay lại</span>
          </button>
        )}
      </div>
    </div>
  );
}
