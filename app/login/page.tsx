'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res: any = await api.post('/auth/login', form);
      const { accessToken, refreshToken, user } = res.data;
      login(accessToken, refreshToken, user);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-sky-100 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-200/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-200/50 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-200 text-sky-600 flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chào mừng trở lại!</h1>
          <p className="text-sm text-slate-500 mt-1">Đăng nhập vào tài khoản AquaHub của bạn</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-600 text-sm relative z-10">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-In Button — Real OAuth */}
        <div className="relative z-10 mb-5">
          <GoogleSignInButton
            mode="signin"
            onError={(msg) => setError(msg)}
            onLoading={(l) => setLoading(l)}
          />
        </div>

        {/* Divider */}
        <div className="relative z-10 flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">hoặc đăng nhập bằng tài khoản</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Tên đăng nhập hoặc Email
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="nhap_username hoac email@domain.com"
                value={form.usernameOrEmail}
                onChange={(e) => setForm({ ...form, usernameOrEmail: e.target.value })}
                className="w-full bg-sky-50/50 border border-sky-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20 transition"
              />
              <Mail className="w-4 h-4 text-sky-500 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Mật khẩu
              </label>
              <Link href="/forgot-password" className="text-xs text-sky-600 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-sky-50/50 border border-sky-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20 transition"
              />
              <Lock className="w-4 h-4 text-sky-500 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Đang xử lý...</span>
            ) : (
              <>
                <span>Đăng nhập</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8 relative z-10">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-sky-600 font-semibold hover:underline">
            Đăng ký ngay
          </Link>
        </p>

      </div>
    </div>
  );
}
