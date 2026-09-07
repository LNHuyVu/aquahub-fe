'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';
import { AlertCircle, Loader2 } from 'lucide-react';

// Extend window with Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  mode?: 'signin' | 'signup';
  onError?: (message: string) => void;
  onLoading?: (loading: boolean) => void;
}

export default function GoogleSignInButton({ mode = 'signin', onError, onLoading }: GoogleSignInButtonProps) {
  const router = useRouter();
  const { login } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [gsiReady, setGsiReady] = useState(false);
  const [processing, setProcessing] = useState(false);

  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  const handleCredentialResponse = async (response: any) => {
    if (!response.credential) {
      onError?.('Không nhận được thông tin từ Google. Vui lòng thử lại.');
      return;
    }

    setProcessing(true);
    onLoading?.(true);

    try {
      const res: any = await api.post('/auth/google', {
        credential: response.credential,
      });

      const { accessToken, refreshToken, user } = res.data?.data || res.data || res;
      login(accessToken, refreshToken, user);
      router.push('/');
    } catch (err: any) {
      const message = err?.message || err?.data?.message || 'Đăng nhập bằng Google thất bại. Vui lòng thử lại.';
      onError?.(message);
    } finally {
      setProcessing(false);
      onLoading?.(false);
    }
  };

  useEffect(() => {
    // Wait for Google GIS script to load
    const checkGsi = () => {
      if (window.google?.accounts?.id) {
        setGsiReady(true);
        return;
      }
      // Retry after a short delay
      setTimeout(checkGsi, 200);
    };
    checkGsi();
  }, []);

  useEffect(() => {
    if (!gsiReady || !buttonRef.current || !GOOGLE_CLIENT_ID) return;

    try {
      window.google!.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google!.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: mode === 'signup' ? 'signup_with' : 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: buttonRef.current.offsetWidth,
        locale: 'vi',
      });
    } catch (err) {
      console.error('Google Sign-In initialization error:', err);
    }
  }, [gsiReady, GOOGLE_CLIENT_ID, mode]);

  // If no client ID configured, show fallback message
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
    return (
      <div className="w-full">
        <button
          type="button"
          disabled
          className="w-full py-3 bg-white border-2 border-slate-200 text-slate-400 font-semibold rounded-xl flex items-center justify-center gap-2.5 text-xs sm:text-sm cursor-not-allowed opacity-60"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Google Sign-In (chưa cấu hình Client ID)</span>
        </button>
        <p className="text-[10px] text-amber-600 mt-1.5 text-center">
          ⚠️ Cần cấu hình NEXT_PUBLIC_GOOGLE_CLIENT_ID trong .env.local
        </p>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {processing && (
        <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-xl">
          <Loader2 className="w-5 h-5 text-[#4285F4] animate-spin" />
          <span className="ml-2 text-xs font-semibold text-slate-600">Đang xác thực với Google...</span>
        </div>
      )}
      {/* Google renders its own button into this container */}
      <div
        ref={buttonRef}
        className="w-full flex items-center justify-center [&>div]:!w-full"
      />
      {!gsiReady && (
        <div className="w-full py-3 bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Đang tải Google Sign-In...</span>
        </div>
      )}
    </div>
  );
}
