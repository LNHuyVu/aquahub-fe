'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/toast-provider';
import { MessageSquare, Send, X, ShoppingBag, Loader2 } from 'lucide-react';

interface ContactSellerModalProps {
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  sellerName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactSellerModal({
  listingId,
  listingTitle,
  listingPrice,
  sellerName,
  isOpen,
  onClose,
}: ContactSellerModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [message, setMessage] = useState(`Chào ${sellerName}, sản phẩm "${listingTitle}" còn không ạ?`);
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Vui lòng đăng nhập để gửi tin nhắn cho người bán!');
      return;
    }

    setSending(true);
    try {
      // 1. Get or create conversation
      const convRes: any = await api.post('/messages/conversations/start', { listingId });
      const conversation = convRes.data || convRes;

      // 2. Send initial message
      if (message.trim()) {
        await api.post(`/messages/conversations/${conversation.id}/send`, {
          content: message.trim(),
        });
      }

      toast.success('Đã gửi tin nhắn cho người bán!');
      onClose();

      // Dispatch event to open floating chat widget directly
      window.dispatchEvent(
        new CustomEvent('open_chat_widget', {
          detail: { conversation },
        }),
      );
    } catch (err: any) {

      console.error(err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo cuộc trò chuyện');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#1A94FF]" /> Nhắn tin cho người bán
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Listing Context Info */}
        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1A94FF] text-white rounded-xl flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 text-xs truncate">{listingTitle}</h4>
            <div className="text-xs font-semibold text-red-600">
              {Number(listingPrice).toLocaleString('vi-VN')} đ
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleStartChat} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Lời nhắn ban đầu cho {sellerName}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              required
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1A94FF]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="px-6 py-2 bg-[#1A94FF] hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Gửi tin nhắn & Mở Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
