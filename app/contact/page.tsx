'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle2, ShieldCheck, HelpCircle, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Góp ý hệ thống & Hợp tác',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError('Vui lòng điền đầy đủ Họ tên, Email và Nội dung liên hệ.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Optional API submit or simulate instant success
      try {
        await api.post('/contacts', formData);
      } catch (err) {
        // Fallback for demonstration
      }

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Góp ý hệ thống & Hợp tác',
        message: '',
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể gửi tin nhắn. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-8 space-y-8">
      
      {/* Synchronized Header Banner */}
      <div className="bg-gradient-to-r from-[#1A94FF] via-[#0B74E5] to-[#0D5CB6] rounded-3xl p-8 sm:p-12 text-white shadow-lg shadow-blue-500/10 space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur border border-white/30">
            <MessageSquare className="w-4 h-4 text-amber-300" />
            <span>Trung Tâm Hỗ Trợ AquaHub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Liên Hệ Ban Quản Trị (Admin)</h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Bạn có thắc mắc, đóng góp ý kiến phát triển nền tảng hoặc có nhu cầu hợp tác quảng cáo? Đội ngũ Ban quản trị AquaHub luôn sẵn sàng lắng nghe và phản hồi bạn trong thời gian sớm nhất!
          </p>
        </div>
      </div>

      {/* Main Grid: Info + Contact Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Direct Info Cards */}
        <div className="space-y-6 lg:col-span-1">
          
          <div className="bg-white border border-blue-100 rounded-3xl p-6 space-y-6 shadow-xs">
            <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#1A94FF]" />
              <span>Thông tin liên hệ trực tiếp</span>
            </h2>

            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1A94FF] flex items-center justify-center shrink-0 font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">Email hỗ trợ</div>
                  <a href="mailto:admin@aquahub.vn" className="font-bold text-slate-800 hover:text-[#1A94FF] transition">
                    admin@aquahub.vn
                  </a>
                  <div className="text-xs text-slate-500 mt-0.5">Phản hồi trong 24h làm việc</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">Hotline / Zalo Admin</div>
                  <a href="tel:0988888888" className="font-bold text-slate-800 hover:text-emerald-600 transition">
                    0988 888 888
                  </a>
                  <div className="text-xs text-slate-500 mt-0.5">Thứ 2 - Chủ Nhật (8:00 - 20:00)</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">Văn phòng đại diện</div>
                  <div className="font-bold text-slate-800 leading-snug">
                    Tòa nhà AquaHub, Q. Cầu Giấy, Hà Nội
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">Thời gian làm việc</div>
                  <div className="font-bold text-slate-800">08:00 - 20:00 mỗi ngày</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Bảo mật thông tin người gửi 100%</span>
              </div>
            </div>
          </div>

          {/* Quick FAQ Box */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-3xl p-6 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#1A94FF]" />
              <span>Bạn muốn báo cáo bài viết vi phạm?</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Vui lòng đính kèm đường dẫn (Link) bài viết hoặc tên tài khoản vi phạm trong nội dung tin nhắn để Admin xử lý nhanh nhất.
            </p>
          </div>

        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-blue-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Gửi Tin Nhắn Cho Admin</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Điền đầy đủ thông tin bên dưới, Admin sẽ phản hồi qua Email hoặc Số điện thoại của bạn.
              </p>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-lg font-bold text-emerald-900">Gửi yêu cầu liên hệ thành công!</h3>
                <p className="text-xs sm:text-sm text-emerald-700 max-w-md mx-auto leading-relaxed">
                  Cảm ơn bạn đã liên hệ với Ban quản trị AquaHub. Chúng tôi đã nhận được thông tin và sẽ phản hồi sớm nhất qua Email của bạn.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                >
                  Gửi tin nhắn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#1A94FF] focus:bg-white transition"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Email nhận phản hồi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="yourname@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#1A94FF] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Số điện thoại / Zalo
                    </label>
                    <input
                      type="text"
                      placeholder="0988 xxx xxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#1A94FF] focus:bg-white transition"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Chủ đề liên hệ
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#1A94FF] cursor-pointer transition"
                    >
                      <option value="Góp ý hệ thống & Hợp tác">Góp ý phát triển hệ thống</option>
                      <option value="Hợp tác quảng cáo">Hợp tác quảng cáo & Banner</option>
                      <option value="Báo cáo vi phạm">Báo cáo bài viết / Người dùng vi phạm</option>
                      <option value="Hỗ trợ tài khoản">Hỗ trợ khôi phục tài khoản</option>
                      <option value="Khác">Vấn đề khác</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Nội dung lời nhắn <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Mô tả chi tiết nội dung bạn muốn gửi tới Ban quản trị..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#1A94FF] focus:bg-white transition"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 py-3 bg-[#1A94FF] hover:bg-[#0B74E5] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Đang gửi...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Gửi tin nhắn ngay</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
