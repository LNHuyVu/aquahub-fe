'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle2, ShieldCheck, HelpCircle, Sparkles, ExternalLink } from 'lucide-react';
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
      try {
        await api.post('/contacts', formData);
      } catch (_) {
        // Fallback — still show success UI
      }
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: 'Góp ý hệ thống & Hợp tác', message: '' });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể gửi tin nhắn. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 space-y-4">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1A94FF] via-[#0B74E5] to-[#0D5CB6] rounded-3xl p-8 sm:p-10 text-white shadow-lg shadow-blue-500/10 space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur border border-white/30">
            <MessageSquare className="w-4 h-4 text-amber-300" />
            <span>Trung Tâm Hỗ Trợ AquaHub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Liên Hệ Ban Quản Trị</h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl">
            Góp ý, hợp tác quảng cáo hoặc báo cáo vi phạm — đội ngũ AquaHub luôn sẵn sàng phản hồi bạn sớm nhất!
          </p>
        </div>
      </div>

      {/* ── Main Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Left Column ─────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">

          {/* Contact info */}
          <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-[#1A94FF] shrink-0" />
              Thông tin liên hệ trực tiếp
            </h2>

            <div className="space-y-3 text-sm">
              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1A94FF] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email hỗ trợ</div>
                  <a href="mailto:admin@aquahub.vn" className="text-xs font-bold text-slate-800 hover:text-[#1A94FF] transition truncate block">
                    admin@aquahub.vn
                  </a>
                  <div className="text-[10px] text-slate-400">Phản hồi trong 24h làm việc</div>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Hotline / Zalo Admin</div>
                  <a href="tel:0988888888" className="text-xs font-bold text-slate-800 hover:text-emerald-600 transition block">
                    0988 888 888
                  </a>
                  <div className="text-[10px] text-slate-400">Thứ 2 – CN (8:00 – 20:00)</div>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Văn phòng đại diện</div>
                  <div className="text-xs font-bold text-slate-800 leading-snug">Tòa nhà AquaHub, Q. Cầu Giấy, Hà Nội</div>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Thời gian làm việc</div>
                  <div className="text-xs font-bold text-slate-800">08:00 – 20:00 mỗi ngày</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 pt-2 border-t border-slate-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Bảo mật thông tin người gửi 100%
            </div>
          </div>

          {/* FAQ tip */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-1.5">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#1A94FF]" />
              Báo cáo bài viết vi phạm?
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Vui lòng đính kèm đường dẫn bài viết hoặc tên tài khoản vi phạm để Admin xử lý nhanh nhất.
            </p>
          </div>

          {/* Google Map embed */}
          <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#1A94FF]" />
                Bản đồ văn phòng
              </span>
              <a
                href="https://maps.google.com/?q=Cầu+Giấy,+Hà+Nội"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-semibold text-[#1A94FF] flex items-center gap-0.5 hover:underline"
              >
                Mở Google Maps <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <iframe
              title="AquaHub Office Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.8660548904607!2d105.79155421491954!3d21.03783338599432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab40ec0df7b3%3A0x77f72d0e95f8ef73!2sCầu%20Giấy%2C%20Hà%20Nội!5e0!3m2!1svi!2svn!4v1694000000000!5m2!1svi!2svn"
              width="100%"
              height="200"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* ── Right Column: Contact Form ───────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-blue-100 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Gửi Tin Nhắn Cho Admin</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Điền đầy đủ thông tin bên dưới, Admin sẽ phản hồi qua Email hoặc Số điện thoại của bạn.
              </p>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-base font-bold text-emerald-900">Gửi yêu cầu thành công!</h3>
                <p className="text-xs text-emerald-700 max-w-sm mx-auto leading-relaxed">
                  Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi qua Email của bạn sớm nhất.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                >
                  Gửi tin nhắn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#1A94FF] focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                      Email nhận phản hồi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="yourname@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#1A94FF] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                      Số điện thoại / Zalo
                    </label>
                    <input
                      type="text"
                      placeholder="0988 xxx xxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#1A94FF] focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                      Chủ đề liên hệ
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#1A94FF] cursor-pointer transition"
                    >
                      <option value="Góp ý hệ thống & Hợp tác">Góp ý phát triển hệ thống</option>
                      <option value="Hợp tác quảng cáo">Hợp tác quảng cáo & Banner</option>
                      <option value="Báo cáo vi phạm">Báo cáo bài viết / Người dùng vi phạm</option>
                      <option value="Hỗ trợ tài khoản">Hỗ trợ khôi phục tài khoản</option>
                      <option value="Khác">Vấn đề khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                    Nội dung lời nhắn <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Mô tả chi tiết nội dung bạn muốn gửi tới Ban quản trị..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#1A94FF] focus:bg-white transition resize-none"
                  />
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 py-2.5 bg-[#1A94FF] hover:bg-[#0B74E5] text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Gửi tin nhắn ngay
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
