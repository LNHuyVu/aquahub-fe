'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/toast-provider';
import { api } from '@/lib/api';
import { Question } from '@/types';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { Dialog } from '@/components/ui/dialog';
import Pagination from '@/components/ui/pagination';
import DetailPageHeader from '@/components/ui/detail-page-header';
import {
  HelpCircle,
  MessageSquare,
  CheckCircle2,
  Eye,
  Plus,
  Search,
  X,
  Paperclip,
  Image as ImageIcon,
  Video as VideoIcon,
  Trash2,
  Loader2,
  FileText
} from 'lucide-react';

function QuestionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Read search & page states from URL search params to preserve on BACK button
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '24', 10);

  const [searchInput, setSearchInput] = useState(search);
  const [showAskModal, setShowAskModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Attachments state
  const [attachments, setAttachments] = useState<{ url: string; type: 'image' | 'video'; size: number; name: string }[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  const currentTotalSize = attachments.reduce((acc, item) => acc + item.size, 0);
  const usedMB = (currentTotalSize / (1024 * 1024)).toFixed(2);
  const usedPercent = Math.min(100, Math.round((currentTotalSize / MAX_TOTAL_SIZE) * 100));

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const updateUrlParams = (newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '' || val === undefined) {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    });
    router.push(`/hoi-dap?${params.toString()}`);
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/questions', {
        params: { search, page, limit: pageSize },
      });
      if (Array.isArray(res.data)) {
        setQuestions(res.data);
        setTotalItems(res.data.length);
        setTotalPages(1);
      } else if (res.data?.data) {
        setQuestions(res.data.data);
        setTotalItems(res.data.total || res.data.data.length);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setQuestions([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [search, page, pageSize]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let pendingSize = currentTotalSize;
    const newItems: { url: string; type: 'image' | 'video'; size: number; name: string }[] = [];

    setUploadingMedia(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (pendingSize + file.size > MAX_TOTAL_SIZE) {
          const remainingMB = ((MAX_TOTAL_SIZE - pendingSize) / (1024 * 1024)).toFixed(1);
          toast.error(`Tệp "${file.name}" vượt quá dung lượng còn lại (${remainingMB}MB). Vui lòng chọn tệp nhỏ hơn!`);
          continue;
        }

        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');

        if (!isVideo && !isImage) {
          toast.error(`Định dạng tệp "${file.name}" không được hỗ trợ!`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);
        const endpoint = isVideo ? '/upload/video' : '/upload';

        const res: any = await api.post(endpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const url = res.data?.url || res.url;
        if (url) {
          pendingSize += file.size;
          newItems.push({
            url,
            type: isVideo ? 'video' : 'image',
            size: file.size,
            name: file.name,
          });
        }
      }

      setAttachments((prev) => [...prev, ...newItems]);
      if (newItems.length > 0) {
        toast.success(`Đã tải lên thành công ${newItems.length} tệp đính kèm!`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Lỗi tải tệp đính kèm. Vui lòng thử lại!');
    } finally {
      setUploadingMedia(false);
      e.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    toast.info('Đã xóa tệp đính kèm');
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Vui lòng nhập tiêu đề và nội dung câu hỏi!');
      return;
    }

    setSubmitting(true);
    try {
      const mediaUrls = attachments.map((a) => a.url);
      const res: any = await api.post('/questions', {
        title: newTitle,
        content: newContent,
        images: mediaUrls,
      });

      const createdQuestion = res.data?.data || res.data || res;
      setQuestions([createdQuestion, ...questions]);
      setShowAskModal(false);
      setNewTitle('');
      setNewContent('');
      setAttachments([]);
      toast.success('Đã gửi câu hỏi mới thành công!');
    } catch (err: any) {
      console.error('Failed to post question', err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi gửi câu hỏi!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestionCard = async (e: React.MouseEvent, questionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) return;

    try {
      await api.delete(`/questions/${questionId}`);
      toast.success('Đã xóa câu hỏi thành công!');
      fetchQuestions();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Không thể xóa câu hỏi này');
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Breadcrumb Header */}
      <DetailPageHeader
        breadcrumbs={[]}
        currentTitle="Hỏi Đáp Thủy Sinh"
        showShare={false}
        showBack={false}
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1A94FF] via-[#0B74E5] to-[#0D5CB6] rounded-3xl p-8 sm:p-10 text-white shadow-lg shadow-blue-500/10 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur border border-white/30">
              <HelpCircle className="w-4 h-4 text-amber-300" />
              <span>Hỏi Đáp Thủy Sinh</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Cộng Đồng Giải Đáp & Tư Vấn</h1>
            <p className="text-blue-100 text-sm sm:text-base max-w-2xl">
              Nơi trao đổi kinh nghiệm, giải đáp thắc mắc về bệnh cá, cách chăm sóc và xử lý sự cố hồ cá nhanh nhất.
            </p>
          </div>

          <button
            onClick={() => {
              if (!user) {
                toast.warning('Vui lòng đăng nhập để đặt câu hỏi!');
                router.push('/login');
                return;
              }
              setShowAskModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-[#0B74E5] font-extrabold text-sm rounded-2xl shadow-lg hover:bg-blue-50 hover:shadow-xl transition cursor-pointer shrink-0"
          >
            <Plus className="w-5 h-5 text-[#1A94FF]" />
            <span>Đặt câu hỏi mới</span>
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateUrlParams({ search: searchInput, page: 1 });
          }}
          className="relative flex-1 w-full"
        >
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi (ví dụ: Nấm cá, Betta, lọc thùng, nước đục... Nhấn Enter)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#1A94FF] transition"
          />
          <Search className="w-4 h-4 text-[#1A94FF] absolute left-3.5 top-3" />
        </form>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white border border-blue-100 rounded-2xl animate-pulse" />
          ))
        ) : questions.length === 0 ? (
          <div className="bg-white border border-blue-100 rounded-2xl p-12 text-center text-slate-400 space-y-3">
            <HelpCircle className="w-12 h-12 text-[#1A94FF] mx-auto opacity-80" />
            <h3 className="font-bold text-slate-700 text-base">Chưa có câu hỏi nào phù hợp</h3>
            <p className="text-xs text-slate-500">Hãy là người đầu tiên đặt câu hỏi cho cộng đồng!</p>
          </div>
        ) : (
          questions.map((q) => {
            const canDelete = user && (user.id === q.authorId || (user as any).role === 'ADMIN');

            return (
              <div
                key={q.id}
                onClick={() => router.push(`/hoi-dap/${q.slug || q.id}`)}
                className="group bg-white border border-blue-100 hover:border-blue-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition cursor-pointer space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {q.isSolved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã được giải đáp
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <HelpCircle className="w-3.5 h-3.5" /> Đang chờ phản hồi
                        </span>
                      )}
                      <span className="text-xs text-slate-400">• {new Date(q.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#1A94FF] transition leading-snug">
                      {q.title}
                    </h3>
                  </div>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteQuestionCard(e, q.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer shrink-0 opacity-80 group-hover:opacity-100"
                      title="Xóa câu hỏi này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {q.content && (
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {q.content.replace(/<[^>]*>?/gm, '')}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-[#0B74E5] font-bold flex items-center justify-center text-[10px]">
                      {(q.author?.displayName || q.author?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-slate-700">{q.author?.displayName || q.author?.username || 'Thành viên'}</span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> {q.viewsCount || 0}
                    </span>
                    <span className="flex items-center gap-1 text-[#0B74E5] font-bold">
                      <MessageSquare className="w-3.5 h-3.5" /> {q.answersCount || 0} câu trả lời
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Standardized Responsive Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        itemLabel="câu hỏi"
        onPageChange={(newPage) => updateUrlParams({ page: newPage })}
        onPageSizeChange={(newPageSize) => updateUrlParams({ pageSize: newPageSize, page: 1 })}
      />

      {/* Ask Question Modal */}
      <Dialog
        isOpen={showAskModal}
        onClose={() => setShowAskModal(false)}
        size="3xl"
        title={
          <div className="flex items-center gap-2 text-[#0B74E5] font-extrabold text-lg sm:text-xl">
            <HelpCircle className="w-6 h-6 text-[#1A94FF]" />
            <span>Đặt câu hỏi mới</span>
          </div>
        }
        subtitle="Mô tả thắc mắc chi tiết để nhận được giải đáp tốt nhất từ cộng đồng"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowAskModal(false)}
              className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="ask-question-form"
              disabled={submitting || uploadingMedia || !newTitle.trim() || !newContent.trim()}
              className="px-6 py-2.5 bg-[#1A94FF] hover:bg-[#0D5CB6] text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Đang gửi...' : 'Gửi câu hỏi ngay'}
            </button>
          </>
        }
      >
        <form id="ask-question-form" onSubmit={handleAsk} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Tiêu đề câu hỏi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Cá Betta bị thối vây xử lý thế nào? Lọc thùng loại nào tốt cho bể 60cm?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-[#1A94FF] focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Nội dung câu hỏi chi tiết <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              value={newContent}
              onChange={setNewContent}
              placeholder="Mô tả triệu chứng bệnh cá, kích thước hồ cá, hệ thống lọc, thông số nước hiện tại (pH, nhiệt độ)..."
              minHeight="220px"
            />
          </div>

          {/* Media Attachment Upload Section */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase">
                <Paperclip className="w-4 h-4 text-[#1A94FF]" />
                <span>Đính kèm tệp hình ảnh / video (Tối đa 10MB tổng cộng)</span>
              </div>

              {/* Dynamic Capacity Bar */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span>{usedMB}MB / 10MB</span>
                <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      usedPercent >= 90 ? 'bg-red-500' : usedPercent >= 70 ? 'bg-amber-500' : 'bg-[#1A94FF]'
                    }`}
                    style={{ width: `${usedPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-blue-200 text-[#0B74E5] font-bold text-xs hover:bg-blue-50 cursor-pointer shadow-sm transition disabled:opacity-50">
                {uploadingMedia ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#1A94FF]" />
                ) : (
                  <Paperclip className="w-4 h-4 text-[#1A94FF]" />
                )}
                <span>{uploadingMedia ? 'Đang tải lên...' : 'Chọn file hình/video'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  disabled={uploadingMedia || currentTotalSize >= MAX_TOTAL_SIZE}
                  className="hidden"
                />
              </label>

              <span className="text-xs text-slate-400">
                Hỗ trợ PNG, JPG, GIF, MP4, WEBM (Tối đa 10MB cho toàn bộ bài đăng)
              </span>
            </div>

            {/* Attached Files List/Grid */}
            {attachments.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {attachments.map((item, idx) => (
                  <div key={idx} className="relative group bg-white border border-slate-200 rounded-xl overflow-hidden p-1.5 shadow-sm space-y-1">
                    <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                      {item.type === 'video' ? (
                        <div className="relative w-full h-full flex items-center justify-center bg-slate-900/60">
                          <video src={item.url} className="w-full h-full object-cover" />
                          <VideoIcon className="w-6 h-6 text-white absolute" />
                        </div>
                      ) : (
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-1 px-1">
                      <span className="text-[10px] text-slate-600 font-medium truncate max-w-[90px]">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {(item.size / (1024 * 1024)).toFixed(1)}MB
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-90 hover:opacity-100 hover:scale-110 transition shadow-md"
                      title="Xóa tệp đính kèm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </Dialog>

    </div>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 text-center text-slate-400">
        <div className="w-10 h-10 border-4 border-[#1A94FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="font-semibold text-slate-600 text-sm">Đang tải danh sách câu hỏi...</p>
      </div>
    }>
      <QuestionsPageContent />
    </Suspense>
  );
}
