'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/toast-provider';
import { api } from '@/lib/api';
import { Question } from '@/types';
import RichTextEditor from '@/components/ui/rich-text-editor';
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
} from 'lucide-react';

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const questionId = params?.id as string;
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const fetchQuestionDetail = async () => {
    setLoading(true);
    try {
      const res: any = await api.get(`/questions/${questionId}`);
      setQuestion(res.data?.data || res.data || res);
    } catch (err) {
      console.error('Failed to load question details:', err);
      toast.error('Không thể tải chi tiết câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (questionId) {
      fetchQuestionDetail();
    }
  }, [questionId]);

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerContent.trim()) {
      toast.error('Vui lòng nhập nội dung câu trả lời!');
      return;
    }

    if (!user) {
      toast.error('Vui lòng đăng nhập để trả lời câu hỏi!');
      router.push('/login');
      return;
    }

    setSubmittingAnswer(true);
    try {
      await api.post(`/questions/${questionId}/answers`, {
        content: answerContent,
      });

      setAnswerContent('');
      toast.success('Đã gửi câu trả lời của bạn!');
      fetchQuestionDetail();
    } catch (err: any) {
      console.error('Failed to post answer:', err);
      toast.error(err.response?.data?.message || 'Không thể gửi câu trả lời');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleSelectBestAnswer = async (answerId: string) => {
    try {
      await api.post(`/questions/${questionId}/best-answer`, { answerId });
      toast.success('Đã chọn câu trả lời hay nhất!');
      fetchQuestionDetail();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể chọn câu trả lời hay nhất');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-slate-400">
        <div className="w-10 h-10 border-4 border-[#1A94FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="font-semibold text-slate-600 text-sm">Đang tải chi tiết câu hỏi...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-700">Không tìm thấy câu hỏi</h2>
        <button
          onClick={() => router.push('/hoi-dap')}
          className="px-4 py-2 bg-[#1A94FF] text-white rounded-xl font-bold text-xs shadow-md"
        >
          Quay lại trang Hỏi đáp
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 space-y-6 max-w-4xl">
      {/* Back Button */}
      <button
        onClick={() => router.push('/hoi-dap')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#1A94FF] transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách câu hỏi</span>
      </button>

      {/* Main Question Card */}
      <div className="bg-white border border-blue-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {question.isSolved && (
              <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Đã giải đáp
              </span>
            )}
            <span className="text-xs text-slate-400">
              Đăng bởi <strong className="text-slate-700">{question.author?.displayName || question.author?.username || 'Thành viên'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {question.viewsCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-[#1A94FF]" />
              {question.answersCount || question.answers?.length || 0}
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
          {question.title}
        </h1>

        <div
          className="text-slate-700 text-sm sm:text-base leading-relaxed prose prose-blue max-w-none pt-2 border-t border-slate-100"
          dangerouslySetInnerHTML={{ __html: question.content }}
        />

        {/* Attached Images */}
        {Array.isArray(question.images) && question.images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
            {question.images.map((imgUrl: string, idx: number) => (
              <img key={idx} src={imgUrl} alt={`attachment-${idx}`} className="w-full h-40 object-cover rounded-2xl border border-slate-200" />
            ))}
          </div>
        )}
      </div>

      {/* Answers List */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#1A94FF]" />
          <span>Các câu trả lời ({question.answers?.length || 0})</span>
        </h2>

        {(!question.answers || question.answers.length === 0) ? (
          <div className="bg-white border border-blue-100 rounded-2xl p-8 text-center text-slate-400 space-y-2">
            <Bot className="w-10 h-10 text-[#1A94FF] mx-auto animate-pulse" />
            <p className="font-bold text-slate-700">Chưa có câu trả lời nào</p>
            <p className="text-xs text-slate-400">Hãy là người đầu tiên trả lời câu hỏi này!</p>
          </div>
        ) : (
          question.answers.map((ans: any) => {
            const isAi = ans.isAiGenerated || ans.author?.username === 'aquahub_ai';

            return (
              <div
                key={ans.id}
                className={`rounded-3xl p-6 space-y-3 transition border ${
                  ans.isBestAnswer
                    ? 'bg-emerald-50/50 border-emerald-300 shadow-md shadow-emerald-500/5'
                    : isAi
                    ? 'bg-gradient-to-br from-blue-50/70 via-sky-50/50 to-cyan-50/70 border-blue-200 shadow-sm'
                    : 'bg-white border-blue-100 shadow-xs'
                }`}
              >
                {/* Answer Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    {isAi ? (
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1A94FF] to-cyan-500 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                        <Bot className="w-5 h-5 text-amber-300" />
                      </div>
                    ) : (
                      <img
                        src={ans.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                        alt={ans.author?.displayName || 'User'}
                        className="w-10 h-10 rounded-2xl object-cover border border-slate-200"
                      />
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {isAi ? 'AquaHub AI Assistant' : ans.author?.displayName || ans.author?.username || 'Thành viên'}
                        </span>
                        
                        {/* AI Generated Badge Notice */}
                        {isAi && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#1A94FF] text-white shadow-xs">
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            <span>Câu trả lời từ AI</span>
                          </span>
                        )}

                        {ans.isBestAnswer && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-600 text-white shadow-xs">
                            <Award className="w-3 h-3" />
                            <span>Hay nhất</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(ans.createdAt).toLocaleDateString('vi-VN')} {new Date(ans.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  {/* Best Answer Action for Question Owner */}
                  {user && user.id === question.authorId && !ans.isBestAnswer && (
                    <button
                      onClick={() => handleSelectBestAnswer(ans.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition border border-emerald-200 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Chọn hay nhất</span>
                    </button>
                  )}
                </div>

                {/* Answer Content */}
                <div
                  className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans"
                  dangerouslySetInnerHTML={{ __html: ans.content }}
                />

                {/* AI Disclaimer Footer Note */}
                {isAi && (
                  <div className="mt-3 p-3 rounded-2xl bg-white/80 border border-blue-200/60 text-xs text-blue-900 space-y-1 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#1A94FF] shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-extrabold text-[#0B74E5]">Lưu ý từ hệ thống:</strong> Đây là câu trả lời được tự động tổng hợp bởi trợ lý trí tuệ nhân tạo **AquaHub AI**. Thông tin chỉ mang tính chất tham khảo kỹ thuật.
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Answer Form Box */}
      <div className="bg-white border border-blue-100 rounded-3xl p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base">Gửi câu trả lời của bạn</h3>
        <form onSubmit={handlePostAnswer} className="space-y-3">
          <RichTextEditor
            minHeight="150px"
            placeholder="Chia sẻ kinh nghiệm hoặc hướng dẫn cách khắc phục cho thành viên..."
            value={answerContent}
            onChange={(val) => setAnswerContent(val)}
          />
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submittingAnswer || !answerContent.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1A94FF] hover:bg-[#0B74E5] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submittingAnswer ? 'Đang gửi...' : 'Đăng câu trả lời'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
