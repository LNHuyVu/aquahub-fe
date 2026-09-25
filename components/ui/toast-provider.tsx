'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration: number; // ms
  createdAt: number; // timestamp
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
    success: (message: string, title?: string, duration?: number) => void;
    error: (message: string, title?: string, duration?: number) => void;
    warning: (message: string, title?: string, duration?: number) => void;
    info: (message: string, title?: string, duration?: number) => void;
  };
  confirm: (options: ConfirmOptions) => void;
  showLoading: (label?: string) => void;
  hideLoading: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ─── Toast Item ──────────────────────────────────────────────────────────────

const TOAST_STYLES: Record<
  ToastType,
  { bg: string; border: string; icon: React.ReactNode; progress: string; text: string }
> = {
  success: {
    bg: 'bg-white',
    border: 'border-emerald-200',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    progress: 'bg-emerald-500',
    text: 'text-emerald-700',
  },
  error: {
    bg: 'bg-white',
    border: 'border-rose-200',
    icon: <XCircle className="w-5 h-5 text-rose-500" />,
    progress: 'bg-rose-500',
    text: 'text-rose-700',
  },
  warning: {
    bg: 'bg-white',
    border: 'border-amber-200',
    icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    progress: 'bg-amber-400',
    text: 'text-amber-700',
  },
  info: {
    bg: 'bg-white',
    border: 'border-blue-200',
    icon: <Info className="w-5 h-5 text-[#1A94FF]" />,
    progress: 'bg-[#1A94FF]',
    text: 'text-blue-700',
  },
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}) {
  const s = TOAST_STYLES[toast.type];
  const [width, setWidth] = useState(100);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Slide-in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Countdown progress bar
  useEffect(() => {
    const step = 50; // ms
    const decrement = (step / toast.duration) * 100;
    intervalRef.current = setInterval(() => {
      setWidth((prev) => {
        if (prev <= 0) {
          clearInterval(intervalRef.current!);
          handleDismiss();
          return 0;
        }
        return prev - decrement;
      });
    }, step);
    return () => clearInterval(intervalRef.current!);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`
        pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-lg border
        ${s.bg} ${s.border}
        overflow-hidden relative
        transition-all duration-300 ease-out
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
      `}
      style={{ maxWidth: 360 }}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.progress} rounded-l-2xl`} />

      <div className="shrink-0 mt-0.5 ml-1">{s.icon}</div>

      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={`text-[11px] font-extrabold uppercase tracking-wider ${s.text}`}>
            {toast.title}
          </p>
        )}
        <p className="text-xs font-medium text-slate-700 leading-relaxed mt-0.5">
          {toast.message}
        </p>
      </div>

      <button
        onClick={handleDismiss}
        className="shrink-0 text-slate-400 hover:text-slate-600 transition p-0.5 rounded-lg hover:bg-slate-100"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${s.progress} transition-all ease-linear opacity-40`}
        style={{ width: `${width}%`, transitionDuration: '50ms' }}
      />
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmModal, setConfirmModal] = useState<ConfirmOptions | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('Đang tải...');

  const addToast = (type: ToastType, message: string, title?: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message, duration, createdAt: Date.now() }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toast = {
    success: (message: string, title = 'Thành công', duration?: number) =>
      addToast('success', message, title, duration),
    error: (message: string, title = 'Có lỗi xảy ra', duration?: number) =>
      addToast('error', message, title, duration),
    warning: (message: string, title = 'Cảnh báo', duration?: number) =>
      addToast('warning', message, title, duration),
    info: (message: string, title = 'Thông báo', duration?: number) =>
      addToast('info', message, title, duration),
  };

  const confirm = (options: ConfirmOptions) => setConfirmModal(options);

  const showLoading = (label = 'Đang tải...') => {
    setLoadingLabel(label);
    setLoadingVisible(true);
  };

  const hideLoading = () => setLoadingVisible(false);

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
    confirmModal?.onCancel?.();
    setConfirmModal(null);
  };

  return (
    <ToastContext.Provider value={{ toast, confirm, showLoading, hideLoading }}>
      {children}

      {/* ── Toast Stack ─────────────────────────────────────── */}
      <div className="fixed bottom-20 md:bottom-5 right-4 z-[9999] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>

      {/* ── Global Loading Overlay ──────────────────────────── */}
      <div
        className={`fixed inset-0 z-[99998] flex flex-col items-center justify-center transition-all duration-300 ${
          loadingVisible
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />

        {/* Spinner card */}
        <div className="relative flex flex-col items-center gap-4 bg-white border border-slate-100 rounded-3xl shadow-2xl shadow-slate-200/80 px-10 py-8">
          {/* Ripple rings */}
          <div className="relative w-14 h-14 flex items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#1A94FF]/20 animate-ping" />
            <span className="absolute inline-flex h-10 w-10 rounded-full bg-[#1A94FF]/10 animate-ping [animation-delay:0.3s]" />
            {/* Spinner */}
            <svg
              className="w-14 h-14 animate-spin"
              viewBox="0 0 56 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="#E2EDFF"
                strokeWidth="5"
              />
              <path
                d="M28 6 a22 22 0 0 1 22 22"
                stroke="#1A94FF"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="text-center space-y-1">
            <p className="text-sm font-bold text-slate-800">{loadingLabel}</p>
            <p className="text-[11px] text-slate-400">Vui lòng chờ trong giây lát</p>
          </div>

          {/* Animated dots */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#1A94FF] animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Confirm Modal ───────────────────────────────────── */}
      {confirmModal && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl shadow-slate-300/50 space-y-4 border border-slate-100 relative text-slate-800
            animate-[fadeInScale_0.2s_ease-out]"
          >
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
                {confirmModal.type === 'info' ? (
                  <Info className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {confirmModal.title || 'Xác nhận thao tác'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Vui lòng kiểm tra kỹ trước khi xác nhận</p>
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
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
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

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}

/** Convenience alias exposing only loading controls */
export function useLoading() {
  const { showLoading, hideLoading } = useToast();
  return { showLoading, hideLoading };
}
