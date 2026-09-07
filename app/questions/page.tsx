'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/toast-provider';
import { api } from '@/lib/api';
import { Question } from '@/types';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { Dialog } from '@/components/ui/dialog';
import {
  HelpCircle,
  MessageSquare,
  CheckCircle2,
  Eye,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Paperclip,
  Image as ImageIcon,
  Video as VideoIcon,
  Trash2,
  Loader2,
  FileText
} from 'lucide-react';

export default function QuestionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAskModal, setShowAskModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Attachments state
  const [attachments, setAttachments] = useState<{ url: string; type: 'image' | 'video'; size: number; name: string }[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  const currentTotalSize = attachments.reduce((acc, item) => acc + item.size, 0);
  const usedMB = (currentTotalSize / (1024 * 1024)).toFixed(2);
  const usedPercent = Math.min(100, Math.round((currentTotalSize / MAX_TOTAL_SIZE) * 100));

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
          toast.error(`Tổng dung lượng file đính kèm vượt quá giới hạn 10MB! (Còn lại: ${remainingMB}MB)`);
          break;
        }

        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');

        if (!isImage && !isVideo) {
          toast.error(`File "${file.name}" không hợp lệ. Chỉ chấp nhận định dạng ảnh hoặc video!`);
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

  const renderPaginationButtons = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - 1 && i <= page + 1)
      ) {
        pages.push(
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer ${
              page === i
                ? 'bg-[#1A94FF] text-white shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {i}
          </button>
        );
      } else if (i === page - 2 || i === page + 2) {
        pages.push(
          <span key={i} className="px-1 text-slate-400 text-xs">
            ...
          </span>
        );
      }
    }
    return pages;
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 space-y-4 sm:space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1A94FF] via-[#0B74E5] to-[#0D5CB6] rounded-3xl p-8 sm:p-10 text-white shadow-lg shadow-blue-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur border border-white/30">
            <HelpCircle className="w-4 h-4 text-amber-300" />
            <span>Hỏi đáp & Tư vấn cá cảnh</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Góc Giải Đáp Thủy Sinh</h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-xl">
            Bạn có thắc mắc về bệnh cá, thông số pH, xử lý nước hay cách chọn thức ăn? Hãy đặt câu hỏi ngay!
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) {
              toast.error('Vui lòng đăng nhập để đặt câu hỏi!');
              router.push('/login');
              return;
            }
            setShowAskModal(true);
          }}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-[#0B74E5] font-bold text-sm shadow-md hover:bg-blue-50 transition flex-shrink-0 relative z-10 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#1A94FF]" />
          <span>Đặt câu hỏi mới</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Tìm kiếm câu hỏi (ví dụ: Nấm cá Betta, Hồ 60L nuôi bao nhiêu cá...)"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full bg-white border border-blue-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1A94FF] focus:ring-2 focus:ring-blue-500/20 shadow-sm transition"
        />
        <Search className="w-5 h-5 text-[#1A94FF] absolute left-4 top-4" />
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white border border-blue-100 rounded-2xl animate-pulse" />
          ))
        ) : questions.length === 0 ? (
          <div className="bg-white border border-blue-100 rounded-2xl p-12 text-center text-slate-400 space-y-2">
            <HelpCircle className="w-10 h-10 text-[#1A94FF] mx-auto" />
            <p className="font-bold text-slate-700">Chưa có câu hỏi nào</p>
            <p className="text-xs text-slate-400">Hãy là người đầu tiên đặt câu hỏi cho cộng đồng!</p>
          </div>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  {q.isSolved && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Đã giải đáp
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    Bởi <strong className="text-slate-700">{q.author?.username || 'Thành viên'}</strong> • {new Date(q.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg hover:text-[#1A94FF] transition cursor-pointer" onClick={() => router.push(`/questions/${q.id}`)}>
                  {q.title}
                </h3>
                <div 
                  className="text-slate-600 text-sm line-clamp-2 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: q.content }}
                />

                {/* Attached Media Previews on Post Item */}
                {Array.isArray(q.images) && q.images.length > 0 && (
                  <div className="flex items-center gap-2 pt-2 overflow-x-auto">
                    {q.images.map((url, idx) => {
                      const isVid = url.match(/\.(mp4|webm|ogg|mov)$/i);
                      return (
                        <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 group">
                          {isVid ? (
                            <video src={url} className="w-full h-full object-cover" />
                          ) : (
                            <img src={url} alt={`attachment-${idx}`} className="w-full h-full object-cover" />
                          )}
                          {isVid && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <VideoIcon className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium border-t md:border-t-0 pt-3 md:pt-0 border-blue-50 flex-shrink-0">
                <div className="flex items-center gap-1 bg-[#E5F2FF] px-3 py-1.5 rounded-xl border border-blue-100 text-[#0B74E5] font-bold">
                  <MessageSquare className="w-4 h-4 text-[#1A94FF]" />
                  <span>{q.answersCount || 0} Trả lời</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span>{q.viewsCount || 0} Lượt xem</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Bar */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
            <div>
              Hiển thị <strong className="text-slate-800">{(page - 1) * pageSize + 1}</strong> - <strong className="text-slate-800">{Math.min(page * pageSize, totalItems)}</strong> trên tổng số <strong className="text-[#0B74E5]">{totalItems}</strong> câu hỏi
            </div>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <span>Hiển thị mỗi trang:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#0B74E5] focus:outline-none focus:border-[#1A94FF] cursor-pointer"
              >
                <option value={12}>12 câu hỏi</option>
                <option value={24}>24 câu hỏi</option>
                <option value={50}>50 câu hỏi (Tất cả)</option>
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

