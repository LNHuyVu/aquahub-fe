'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Search, Fish, Shield, LogOut, Menu, X, Compass, HelpCircle, Layers, Wrench, BookOpen, Sparkles, ShoppingBag, Mail } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { label: 'Cá cảnh', href: '/ca-canh', icon: Fish },
    { label: 'Chợ Thủy Sinh', href: '/cho-thuy-sinh', icon: ShoppingBag },
    { label: 'Cẩm nang', href: '/cam-nang', icon: BookOpen },
    { label: 'Cộng đồng', href: '/cong-dong', icon: Compass },
    { label: 'Hỏi đáp', href: '/hoi-dap', icon: HelpCircle },
    { label: 'Hồ cá', href: '/ho-ca', icon: Layers },
    { label: 'Công cụ', href: '/cong-cu', icon: Wrench },
    { label: 'Liên hệ', href: '/lien-he', icon: Mail },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/ca-canh?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-blue-100 shadow-sm text-slate-800">
      
      {/* Top Banner Offer Bar */}
      <div className="bg-[#0B74E5] text-white text-xs py-1 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
        <span>Chào mừng bạn đến với AquaHub — Nơi chia sẻ kiến thức & Quản lý hồ cá cảnh #1 Việt Nam!</span>
      </div>

      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo - AquaHub Brand Image */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-95 transition shrink-0">
            <img src="/logo/aquahub.png" alt="AquaHub Logo" className="h-9 w-auto object-contain shrink-0" />
            <span className="tracking-tight text-slate-900 font-extrabold text-xl sm:text-2xl">Aqua<span className="text-[#1A94FF]">Hub</span></span>
          </Link>

          {/* Search bar - Compact Tiki Blue Search Input */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xs xl:max-w-sm relative mx-2">
            <div className="relative flex items-center w-full">
              <input
                type="text"
                placeholder="Tìm kiếm cá cảnh, thiết bị..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/90 hover:bg-slate-100 border border-slate-200 text-xs rounded-full pl-8 pr-16 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1A94FF] focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
              <button
                type="submit"
                className="absolute right-1 px-3 py-1 rounded-full bg-[#1A94FF] hover:bg-[#0B74E5] text-white text-[11px] font-semibold shadow-xs transition"
              >
                Tìm
              </button>
            </div>
          </form>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-0.5 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                    isActive
                      ? 'bg-[#E5F2FF] text-[#0B74E5] font-bold'
                      : 'text-slate-600 hover:text-[#1A94FF] hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#1A94FF] shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Auth Actions with Account Dropdown */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {user ? (
              <div className="relative group">
                <button
                  className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 hover:border-blue-200 shadow-2xs transition-all duration-200 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#0B74E5] to-[#1A94FF] text-white flex items-center justify-center font-bold text-[11px] shadow-sm shrink-0">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-[#0B74E5] max-w-[120px] truncate">
                    {user.displayName || user.username}
                  </span>
                  <svg className="w-3 h-3 text-slate-400 group-hover:text-[#0B74E5] group-hover:rotate-180 transition-transform duration-200 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                  <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                    <p className="text-[11px] text-slate-400 font-medium">Tài khoản</p>
                    <p className="text-xs font-bold text-slate-800 truncate">{user.displayName || user.username}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href={`/users/${user.username}`}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#1A94FF] font-medium transition"
                    >
                      <div className="w-4 h-4 rounded-full bg-blue-100 text-[#1A94FF] flex items-center justify-center text-[10px] font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span>Trang cá nhân</span>
                    </Link>

                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-amber-700 bg-amber-50/60 hover:bg-amber-100/80 font-semibold transition"
                      >
                        <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Trang quản trị (Admin)</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-slate-600 hover:text-[#1A94FF] px-3 py-1.5 rounded-full hover:bg-slate-100/80 transition whitespace-nowrap"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="text-xs font-bold bg-[#1A94FF] hover:bg-[#0B74E5] text-white px-3.5 py-1.5 rounded-full shadow-xs transition shrink-0 whitespace-nowrap"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-[#1A94FF] hover:bg-slate-100 transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-blue-100 px-4 pt-2 pb-4 space-y-2 shadow-lg">
          <form onSubmit={handleSearch} className="mb-3 relative">
            <input
              type="text"
              placeholder="Tìm cá, hồ cá..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 text-slate-800 placeholder-slate-400"
            />
            <Search className="w-4 h-4 text-[#1A94FF] absolute left-3 top-3" />
          </form>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-[#1A94FF] font-medium"
              >
                <Icon className="w-5 h-5 text-[#1A94FF]" />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-blue-100 flex items-center justify-between">
            {user ? (
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between w-full">
                  <Link
                    href={`/users/${user.username}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm text-slate-800"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1A94FF] text-white flex items-center justify-center font-bold text-xs">
                      {user.username.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold">{user.displayName || user.username}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-red-500 px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    Đăng xuất
                  </button>
                </div>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 py-2 rounded-lg font-bold hover:bg-amber-100"
                  >
                    <Shield className="w-4 h-4 text-amber-600" />
                    <span>Vào trang quản trị (Admin Panel)</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex gap-2 w-full">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 border border-blue-200 rounded-lg text-sm text-slate-700 hover:bg-blue-50"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-[#1A94FF] text-white font-medium rounded-lg text-sm shadow-md shadow-blue-500/20"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
