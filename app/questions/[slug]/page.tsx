'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/toast-provider';
import { api } from '@/lib/api';
import { Question } from '@/types';
import RichTextEditor from '@/components/ui/rich-text-editor';
import ReportModal from '@/components/ui/report-modal';
import {
  HelpCircle,
  MessageSquare,
  CheckCircle2,
  Eye,
  ArrowLeft,
  Bot,
  Sparkles,
  Send,
  ThumbsUp,
  Award,
  User as UserIcon,
  Trash2,
  ChevronRight,
  Share2,
  AlertTriangle,
} from 'lucide-react';

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const slugOrId = (params?.slug || params?.id) as string;
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const fetchQuestionDetail = async (isFirstLoad = false) => {
    if (isFirstLoad) setLoading(true);
    try {
      const res: any = await api.get(`/questions/${slugOrId}`);
      setQuestion(res.data?.data || res.data || res);
    } catch (err) {
      if (isFirstLoad) {
        console.error('Failed to load question details:', err);
        toast.error('Không thể tải chi tiết câu hỏi');
      }
    } finally {
      if (isFirstLoad) setLoading(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết câu hỏi!');
    }
  };

  useEffect(() => {
    if (slugOrId) {
      fetchQuestionDetail(true);

      const interval = setInterval(() => {
        fetchQuestionDetail(false);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [slugOrId]);

  const handleAddAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Vui lòng đăng nhập để gửi câu trả lời');
      router.push('/login');
      return;
    }
    if (!answerContent.trim() || !question) {
      toast.error('Vui lòng nhập nội dung câu trả lời');
      return;
    }

    setSubmittingAnswer(true);
    try {
      await api.post(`/questions/${question.id}/answers`, {
        content: answerContent,
      });

      toast.success('Đã gửi câu trả lời thành công!');
      setAnswerContent('');
      fetchQuestionDetail(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi gửi câu trả lời');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleSelectBestAnswer = async (answerId: string) => {
    if (!user || !question) return;
    try {
      await api.patch(`/questions/${question.id}/best-answer/${answerId}`);
      toast.success('Đã chọn câu trả lời hay nhất!');
      fetchQuestionDetail(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể chọn câu trả lời hay nhất');
    }
  };

  const handleDeleteQuestion = async () => {
    if (!user || !question) return;
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) return;

    try {
      await api.delete(`/questions/${question.id}`);
      toast.success('Đã xóa câu hỏi thành công!');
      router.push('/hoi-dap');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Không thể xóa câu hỏi này');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1A94FF] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium text-sm">Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center border border-slate-100 shadow-sm space-y-4">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Không tìm thấy câu hỏi</h2>
          <p className="text-slate-500 text-sm">Câu hỏi này có thể đã bị xóa hoặc không tồn tại.</p>
          <button
            onClick={() => router.push('/hoi-dap')}
            className="inline-flex items-center gap-2 bg-[#1A94FF] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại Hỏi Đáp
          </button>
        </div>
      </div>
    );
  }

  const isQuestionAuthorOrAdmin = user && (user.id === question.authorId || (user as any).role === 'ADMIN');

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 space-y-4 max-w-6xl">
        {/* SYNCHRONIZED BREADCRUMB & TOP ACTIONS */}
        <div className="flex items-center justify-between gap-3 flex-wrap bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-[#1A94FF] transition">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <Link href="/hoi-dap" className="hover:text-[#1A94FF] transition">Hỏi Đáp</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-[360px]">
              {question.title}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isQuestionAuthorOrAdmin && (
              <button
                type="button"
                onClick={handleDeleteQuestion}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold text-xs transition cursor-pointer"
                title="Xóa bài viết này"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Xóa câu hỏi</span>
              </button>
            )}

            <button
              onClick={() => setShowReportModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs transition cursor-pointer"
              title="Báo cáo vi phạm"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Báo cáo</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#1A94FF]" />
              <span>Chia sẻ</span>
            </button>

            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:text-[#1A94FF] text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#1A94FF]" />
              <span>Quay lại</span>
            </button>
          </div>
        </div>

        {/* Question Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {question.author?.avatar ? (
                <img
                  src={question.author.avatar}
                  alt={question.author.displayName || question.author.username}
                  className="w-10 h-10 rounded-full object-cover border border-blue-100"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 text-[#1A94FF] flex items-center justify-center font-bold text-sm">
                  {(question.author?.displayName || question.author?.username || 'Q')[0].toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {question.author?.displayName || question.author?.username || 'Thành viên'}
                </h3>
                <p className="text-xs text-slate-400">
                  Đăng ngày {new Date(question.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>

            {question.isSolved && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Đã được giải đáp
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
            {question.title}
          </h1>

          <div
            className="prose prose-slate max-w-none text-slate-700 text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: question.content }}
          />

          {/* Question Stats & Tags */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                {question.answers?.length || question.answersCount || 0} câu trả lời
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-slate-400" />
                {question.viewsCount || 0} lượt xem
              </span>
            </div>

            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {question.tags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Answers Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 px-1">
            <MessageSquare className="w-5 h-5 text-[#1A94FF]" />
            Các câu trả lời ({question.answers?.length || 0})
          </h2>

          {question.answers && question.answers.length > 0 ? (
            question.answers.map((answer: any) => {
              const isAiBot = answer.isAiGenerated || answer.author?.username === 'aquahub_ai';
              const isQuestionAuthor = user?.id === question.authorId;

              return (
                <div
                  key={answer.id}
                  className={`rounded-2xl p-6 border transition shadow-sm ${
                    answer.isBestAnswer
                      ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-200'
                      : isAiBot
                      ? 'bg-blue-50/40 border-blue-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  {/* Answer Header */}
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      {isAiBot ? (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1A94FF] to-blue-400 text-white flex items-center justify-center shadow-md">
                          <Bot className="w-5 h-5" />
                        </div>
                      ) : answer.author?.avatar ? (
                        <img
                          src={answer.author.avatar}
                          alt={answer.author.displayName || answer.author.username}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">
                          {(answer.author?.displayName || answer.author?.username || 'A')[0].toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                            {answer.author?.displayName || answer.author?.username || (isAiBot ? 'AquaHub AI Assistant' : 'Thành viên')}
                          </h4>
                          {isAiBot && (
                            <span className="inline-flex items-center gap-1 bg-blue-100 text-[#1A94FF] px-2 py-0.5 rounded-full text-xs font-bold">
                              <Sparkles className="w-3 h-3" />
                              AI Trợ Lý
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {new Date(answer.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    {answer.isBestAnswer && (
                      <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        <Award className="w-4 h-4" />
                        Câu trả lời hay nhất
                      </span>
                    )}
                  </div>

                  {/* Answer Content */}
                  <div
                    className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed mb-4"
                    dangerouslySetInnerHTML={{ __html: answer.content }}
                  />

                  {/* Actions */}
                  {isQuestionAuthor && !answer.isBestAnswer && (
                    <div className="border-t border-slate-100 pt-3 flex justify-end">
                      <button
                        onClick={() => handleSelectBestAnswer(answer.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl transition"
                      >
                        <Award className="w-3.5 h-3.5" />
                        Chọn làm câu trả lời hay nhất
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
              Chưa có câu trả lời nào. Hãy là người đầu tiên giúp đỡ thành viên này!
            </div>
          )}
        </div>

        {/* Add Answer Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-[#1A94FF]" />
            Gửi câu trả lời của bạn
          </h3>

          <form onSubmit={handleAddAnswer} className="space-y-4">
            <RichTextEditor
              value={answerContent}
              onChange={setAnswerContent}
              placeholder="Nhập chi tiết câu trả lời, kinh nghiệm hoặc giải pháp của bạn..."
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingAnswer || !answerContent.trim()}
                className="bg-[#1A94FF] text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-600 disabled:opacity-50 transition inline-flex items-center gap-2 shadow-sm"
              >
                <Send className="w-4 h-4" />
                {submittingAnswer ? 'Đang gửi...' : 'Gửi câu trả lời'}
              </button>
            </div>
          </form>
        </div>

        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          targetId={question.id}
          targetType="POST"
          title={question.title}
        />
      </div>
  );
}
