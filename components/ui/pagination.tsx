'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [12, 24, 48, 96],
  itemLabel = 'mục',
  className = '',
}) => {
  if (totalPages <= 0 && (!totalItems || totalItems <= 0)) return null;

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = renderPageNumbers();

  const startItem = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : 0;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 bg-white/80 border border-slate-200/80 rounded-2xl shadow-xs backdrop-blur-sm ${className}`}>
      {/* Item info & page size dropdown */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-600 font-medium">
        {totalItems !== undefined && pageSize !== undefined && totalItems > 0 && (
          <div>
            Hiển thị <strong className="text-slate-900 font-extrabold">{startItem}</strong> - <strong className="text-slate-900 font-extrabold">{endItem}</strong> trên tổng số <strong className="text-[#0B74E5] font-extrabold">{totalItems}</strong> {itemLabel}
          </div>
        )}

        {onPageSizeChange && pageSize !== undefined && (
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <span className="text-slate-500 font-normal">Hiển thị mỗi trang:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 hover:border-[#1A94FF] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#0B74E5] focus:outline-none focus:border-[#1A94FF] cursor-pointer transition shadow-2xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} {itemLabel}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          {/* First Page */}
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
            className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-[#0B74E5] hover:border-blue-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 disabled:hover:border-slate-200 transition cursor-pointer disabled:cursor-not-allowed"
            title="Trang đầu"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Prev Page */}
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-[#0B74E5] hover:border-blue-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 disabled:hover:border-slate-200 transition cursor-pointer disabled:cursor-not-allowed"
            title="Trang trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Number Buttons */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((p, idx) => (
              typeof p === 'number' ? (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs ${
                    currentPage === p
                      ? 'bg-gradient-to-r from-[#1A94FF] to-[#0B74E5] text-white border border-[#0B74E5] shadow-md shadow-blue-500/20 scale-105'
                      : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-blue-50 hover:text-[#0B74E5] hover:border-blue-200'
                  }`}
                >
                  {p}
                </button>
              ) : (
                <span key={`dots-${idx}`} className="w-7 text-center text-slate-400 font-bold select-none text-xs">
                  •••
                </span>
              )
            ))}
          </div>

          {/* Next Page */}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-[#0B74E5] hover:border-blue-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 disabled:hover:border-slate-200 transition cursor-pointer disabled:cursor-not-allowed"
            title="Trang tiếp"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last Page */}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
            className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-[#0B74E5] hover:border-blue-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 disabled:hover:border-slate-200 transition cursor-pointer disabled:cursor-not-allowed"
            title="Trang cuối"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
