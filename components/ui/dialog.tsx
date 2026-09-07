'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
}

const sizeClasses: Record<NonNullable<DialogProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  full: 'max-w-[95vw] h-[90vh]',
};

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = '2xl',
  showCloseButton = true,
  closeOnBackdropClick = true,
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full bg-white border border-blue-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transform transition-all animate-in zoom-in-95 duration-200 ${
          sizeClasses[size]
        } ${className}`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-5 py-4 sm:px-6 border-b border-blue-50 bg-gradient-to-r from-blue-50/50 to-white">
            <div className="space-y-0.5 min-w-0 pr-4">
              {typeof title === 'string' ? (
                <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                  {title}
                </h3>
              ) : (
                title
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 font-normal truncate">{subtitle}</p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer shrink-0"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-slate-700 space-y-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-3.5 sm:px-6 border-t border-blue-50 bg-slate-50/80 flex items-center justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dialog;
