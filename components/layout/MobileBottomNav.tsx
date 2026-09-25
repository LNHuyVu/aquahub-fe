'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Fish, ShoppingBag, HelpCircle, User, Compass } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { label: 'Trang chủ', href: '/', icon: Home },
    { label: 'Tra cứu', href: '/ca-canh', icon: Fish },
    { label: 'Sàn mua bán', href: '/san-mua-ban', icon: ShoppingBag },
    { label: 'Hỏi đáp', href: '/hoi-dap', icon: HelpCircle },
    { label: user ? 'Tài khoản' : 'Đăng nhập', href: user ? (user.role === 'ADMIN' ? '/admin' : '/cong-dong') : '/login', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg md:hidden">
      <div className="flex items-center justify-around h-14 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-colors duration-150 ${
                isActive ? 'text-[#0B74E5] font-semibold' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#0B74E5] rounded-full ring-2 ring-white animate-pulse" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
