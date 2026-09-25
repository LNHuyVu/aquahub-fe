'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart } from 'lucide-react';
import { api } from '@/lib/api';

export default function Footer() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadSettings() {
      try {
        const res: any = await api.get('/settings');
        if (res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error('Failed to load settings in Footer', err);
      }
    }
    loadSettings();
  }, []);

  // Hide footer completely in admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const exploreLinks = [
    { key: 'menu_ca_canh', label: 'Cơ sở dữ liệu cá cảnh', href: '/ca-canh' },
    { key: 'menu_san_mua_ban', label: 'Sàn Mua Bán (Thủy Sinh)', href: '/san-mua-ban', highlight: true },
    { key: 'menu_cong_dong', label: 'Cộng đồng thảo luận', href: '/cong-dong' },
    { key: 'menu_hoi_dap', label: 'Hỏi đáp & tư vấn bệnh', href: '/hoi-dap' },
    { key: 'menu_ho_ca', label: 'Hồ cá nổi bật', href: '/ho-ca' },
    { key: 'menu_cam_nang', label: 'Cẩm nang & Hướng dẫn', href: '/cam-nang' },
  ].filter((item) => settings[item.key] !== 'hidden');

  const showTools = settings['menu_cong_cu'] !== 'hidden';
  const showContact = settings['menu_lien_he'] !== 'hidden';

  const siteDescription =
    settings.footer_description ||
    settings.site_description ||
    'Nơi quản lý hồ cá, tìm hiểu kiến thức sinh vật cảnh và kết nối cộng đồng người chơi cá tại Việt Nam.';

  const copyrightText =
    settings.copyright_text ||
    `© ${new Date().getFullYear()} ${settings.site_name || 'AquaHub'}. All rights reserved.`;

  return (
    <footer className="bg-white border-t border-blue-100 text-slate-600 py-12 pb-20 md:pb-12">
      <div className="container mx-auto px-3 sm:px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        
        {/* Brand */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-[#1A94FF]">
            <img src={settings.site_logo || "/logo/logo.png"} alt="AquaHub Logo" className="h-8 w-auto object-contain shrink-0" />
            <span className="text-slate-900 font-extrabold text-xl">Aqua<span className="text-[#1A94FF]">Hub</span></span>
          </Link>
          <p className="text-sm text-slate-500 leading-relaxed">
            {siteDescription}
          </p>
        </div>

        {/* Explore Links */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Khám phá</h3>
          <ul className="space-y-2.5 text-sm">
            {exploreLinks.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={`hover:text-[#1A94FF] transition ${
                    item.highlight ? 'font-semibold text-[#1A94FF]' : ''
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Tools Links */}
        {showTools && (
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Công cụ hỗ trợ</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/cong-cu" className="hover:text-[#1A94FF] transition">Tính dung tích hồ cá</Link></li>
              <li><Link href="/cong-cu" className="hover:text-[#1A94FF] transition">Tính mật độ thả cá</Link></li>
              <li><Link href="/cong-cu" className="hover:text-[#1A94FF] transition">Tra cứu cá nuôi chung</Link></li>
            </ul>
          </div>
        )}

        {/* Account & Info */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Tài khoản & Quy định</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/login" className="hover:text-[#1A94FF] transition">Đăng nhập</Link></li>
            <li><Link href="/register" className="hover:text-[#1A94FF] transition">Đăng ký thành viên</Link></li>
            <li><Link href="/about" className="hover:text-[#1A94FF] transition">Về AquaHub</Link></li>
            {showContact && (
              <li><Link href="/lien-he" className="hover:text-[#1A94FF] transition font-bold text-[#1A94FF]">Liên hệ Ban quản trị</Link></li>
            )}
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 mt-12 pt-6 border-t border-blue-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <p>{copyrightText}</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Aquarium Enthusiasts
        </p>
      </div>
    </footer>
  );
}

