'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';
import { Search, Fish, Shield, LogOut, Menu, X, Compass, HelpCircle, Layers, Wrench, BookOpen, Sparkles, ShoppingBag, Mail, MessageSquare } from 'lucide-react';


export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuSettings, setMenuSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadSettings() {
      try {
        const res: any = await api.get('/settings');
        if (res.data) {
          setMenuSettings(res.data);
        }
      } catch (err) {
        console.error('Failed to load menu settings', err);
      }
    }
    loadSettings();
  }, []);

  const allNavItems = [
    { key: 'menu_ca_canh', label: 'Tra cứu', href: '/ca-canh', icon: Fish },
    { key: 'menu_san_mua_ban', label: 'Sàn Mua Bán', href: '/san-mua-ban', icon: ShoppingBag },
    { key: 'menu_cam_nang', label: 'Cẩm nang', href: '/cam-nang', icon: BookOpen },
    { key: 'menu_cong_dong', label: 'Cộng đồng', href: '/cong-dong', icon: Compass },
    { key: 'menu_hoi_dap', label: 'Hỏi đáp', href: '/hoi-dap', icon: HelpCircle },
    { key: 'menu_ho_ca', label: 'Hồ cá', href: '/ho-ca', icon: Layers },
    { key: 'menu_cong_cu', label: 'Công cụ', href: '/cong-cu', icon: Wrench },
    { key: 'menu_lien_he', label: 'Liên hệ', href: '/lien-he', icon: Mail },
  ];

  const navItems = allNavItems.filter((item) => menuSettings[item.key] !== 'hidden');

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
        {/* TOP ROW: Logo + WIDE SEARCH BAR + User Profile */}
        <div className="flex items-center justify-between h-16 gap-4 sm:gap-8">
          
          {/* Logo - AquaHub Brand Image */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-95 transition shrink-0">
            <img src="/logo/logo.png" alt="AquaHub Logo" className="h-9 w-auto object-contain shrink-0" />
            <span className="tracking-tight text-slate-900 font-extrabold text-xl sm:text-2xl">Aqua<span className="text-[#1A94FF]">Hub</span></span>
          </Link>

          {/* ULTRA-WIDE SEARCH BAR */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-3xl relative mx-2 sm:mx-6">
            <div className="relative flex items-center w-full">
              <input
                type="text"
                placeholder="Tìm kiếm sinh vật thủy sinh, cá cảnh, thiết bị bể, bài viết cẩm nang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/90 hover:bg-slate-100 border border-slate-200 text-xs sm:text-sm rounded-full pl-10 pr-20 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1A94FF] focus:bg-white focus:ring-2 focus:ring-blue-500/20 shadow-xs transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <button
                type="submit"
                className="absolute right-1 px-5 py-1.5 rounded-full bg-gradient-to-r from-[#1A94FF] to-[#0B74E5] hover:from-[#0B74E5] hover:to-[#0D5CB6] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer"
              >
                Tìm kiếm
              </button>
            </div>
          </form>

          {/* Auth Actions with Account Dropdown & Chat Button */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/tin-nhan"
                  className="p-2 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-[#1A94FF] border border-slate-200 transition relative"
                  title="Tin nhắn mua bán"
                >
                  <MessageSquare className="w-4 h-4" />
                </Link>

                <div className="relative group">
                  <button
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 hover:border-blue-200 shadow-2xs transition-all duration-200 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#0B74E5] to-[#1A94FF] text-white flex items-center justify-center font-bold text-[11px] shadow-sm shrink-0">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-[#0B74E5] max-w-[130px] truncate">
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
                        href="/tin-nhan"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#1A94FF] font-medium transition"
                      >
                        <MessageSquare className="w-4 h-4 text-[#1A94FF]" />
                        <span>Tin nhắn mua bán</span>
                      </Link>

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
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-[#1A94FF] hover:bg-slate-100 transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* BOTTOM ROW: CENTERED NAVIGATION LINKS */}
        <div className="hidden md:flex items-center justify-center border-t border-slate-100/80 py-1.5">
          <nav className="flex items-center gap-1.5 lg:gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
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
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-blue-100 px-4 pt-2 pb-4 space-y-2 shadow-lg">
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
