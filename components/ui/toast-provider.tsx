'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ToastContextType {
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
  };
  confirm: (options: ConfirmOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmModal, setConfirmModal] = useState<ConfirmOptions | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const addToast = (type: ToastType, message: string, title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toast = {
    success: (message: string, title?: string) => addToast('success', message, title || 'Thành công'),
    error: (message: string, title?: string) => addToast('error', message, title || 'Có lỗi xảy ra'),
    warning: (message: string, title?: string) => addToast('warning', message, title || 'Cảnh báo'),
    info: (message: string, title?: string) => addToast('info', message, title || 'Thông báo'),
  };

  const confirm = (options: ConfirmOptions) => {
    setConfirmModal(options);
  };

  const handleConfirm = async () => {
    if (!confirmModal) return;
    setConfirmLoading(true);
    try {
      await confirmModal.onConfirm();
      setConfirmModal(null);
    } catch (error) {
      console.error('Confirm action error:', error);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirmModal?.onCancel) {
      confirmModal.onCancel();
    }
    setConfirmModal(null);
  };

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toast Notifications Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-slide-up ${
              t.type === 'success'
                ? 'bg-emerald-900/90 text-white border-emerald-700/50 shadow-emerald-900/20'
                : t.type === 'error'
                ? 'bg-rose-900/90 text-white border-rose-700/50 shadow-rose-900/20'
                : t.type === 'warning'
                ? 'bg-amber-900/90 text-white border-amber-700/50 shadow-amber-900/20'
                : 'bg-blue-900/90 text-white border-blue-700/50 shadow-blue-900/20'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
              {t.type === 'error' && <XCircle className="w-5 h-5 text-rose-300" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-300" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-blue-300" />}
            </div>
            <div className="flex-1 min-w-0">
              {t.title && <h4 className="text-xs font-extrabold uppercase tracking-wider opacity-90">{t.title}</h4>}
              <p className="text-xs font-medium leading-relaxed mt-0.5">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-white/60 hover:text-white transition p-0.5 rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Global Confirmation Modal Component */}
      {confirmModal && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-slate-100 relative text-slate-800">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  confirmModal.type === 'danger'
                    ? 'bg-rose-100 text-rose-600'
                    : confirmModal.type === 'warning'
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-blue-100 text-blue-600'
                }`}
              >
                {confirmModal.type === 'danger' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : confirmModal.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {confirmModal.title || 'Xác nhận thao tác'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Vui lòng kiểm tra kỹ trước khi xác nhận</p>
              </div>
            </div>

            <p className="text-xs font-medium text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 leading-relaxed">
              {confirmModal.message}
            </p>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                disabled={confirmLoading}
                onClick={handleCancel}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                {confirmModal.cancelText || 'Hủy bỏ'}
              </button>
              <button
                type="button"
                disabled={confirmLoading}
                onClick={handleConfirm}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  confirmModal.type === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                    : confirmModal.type === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                    : 'bg-[#1A94FF] hover:bg-[#0B74E5] shadow-blue-500/20'
                }`}
              >
                {confirmLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  confirmModal.confirmText || 'Xác nhận'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
