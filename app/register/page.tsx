'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';
import { UserPlus, User, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res: any = await api.post('/auth/register', form);
      const { accessToken, refreshToken, user } = res.data?.data || res.data || res;
      login(accessToken, refreshToken, user);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-blue-100 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-100/60 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-[#E5F2FF] border border-blue-200 text-[#1A94FF] flex items-center justify-center mx-auto mb-3 font-bold shadow-xs">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tạo tài khoản AquaHub</h1>
          <p className="text-xs text-slate-500 mt-1">Tham gia cộng đồng người yêu cá cảnh & thủy sinh #1 Việt Nam</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-600 text-xs font-semibold relative z-10">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-In Button — Real OAuth */}
        <div className="relative z-10 mb-5">
          <GoogleSignInButton
            mode="signup"
            onError={(msg) => setError(msg)}
            onLoading={(l) => setLoading(l)}
          />
        </div>

        {/* Divider */}
        <div className="relative z-10 flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">hoặc đăng ký bằng email</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Email Registration Form */}
        <form onSubmit={handleSubmitEmail} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Tên đăng nhập (Username) *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="aquaman99"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1A94FF] focus:bg-white transition"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Địa chỉ Email xác nhận *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="yourname@gmail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1A94FF] focus:bg-white transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Tên hiển thị (Tùy chọn)
            </label>
            <input
              type="text"
              placeholder="Nguyễn Văn A"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1A94FF] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Mật khẩu *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Tối thiểu 6 ký tự"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1A94FF] focus:bg-white transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 bg-[#1A94FF] hover:bg-[#0B74E5] text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Đang xử lý đăng ký...</span>
            ) : (
              <>
                <span>Xác nhận đăng ký qua Email</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Bảo mật thông tin & Điều khoản thành viên AquaHub</span>
        </div>

        <p className="text-center text-xs sm:text-sm text-slate-500 mt-4 relative z-10">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-[#1A94FF] font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </p>

      </div>
    </div>
  );
}
