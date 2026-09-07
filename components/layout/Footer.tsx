'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer completely in admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  return (
    <footer className="bg-white border-t border-blue-100 text-slate-600 py-12 pb-20 md:pb-12">
      <div className="container mx-auto px-3 sm:px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        
        {/* Brand */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-[#1A94FF]">
            <img src="/logo/aquahub.png" alt="AquaHub Logo" className="h-8 w-auto object-contain shrink-0" />
            <span className="text-slate-900 font-extrabold text-xl">Aqua<span className="text-[#1A94FF]">Hub</span></span>
          </Link>
          <p className="text-sm text-slate-500 leading-relaxed">
            Nơi quản lý hồ cá, tìm hiểu kiến thức sinh vật cảnh và kết nối cộng đồng người chơi cá tại Việt Nam.
          </p>
        </div>

        {/* Explore Links */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Khám phá</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/ca-canh" className="hover:text-[#1A94FF] transition">Cơ sở dữ liệu cá cảnh</Link></li>
            <li><Link href="/cho-thuy-sinh" className="hover:text-[#1A94FF] transition font-semibold text-[#1A94FF]">Chợ Thủy Sinh (Mua Bán)</Link></li>
            <li><Link href="/cong-dong" className="hover:text-[#1A94FF] transition">Cộng đồng thảo luận</Link></li>
            <li><Link href="/hoi-dap" className="hover:text-[#1A94FF] transition">Hỏi đáp & tư vấn bệnh</Link></li>
            <li><Link href="/ho-ca" className="hover:text-[#1A94FF] transition">Hồ cá nổi bật</Link></li>
            <li><Link href="/cam-nang" className="hover:text-[#1A94FF] transition">Cẩm nang & Hướng dẫn</Link></li>
          </ul>
        </div>

        {/* Tools Links */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Công cụ hỗ trợ</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/cong-cu" className="hover:text-[#1A94FF] transition">Tính dung tích hồ cá</Link></li>
            <li><Link href="/cong-cu" className="hover:text-[#1A94FF] transition">Tính mật độ thả cá</Link></li>
            <li><Link href="/cong-cu" className="hover:text-[#1A94FF] transition">Tra cứu cá nuôi chung</Link></li>
          </ul>
        </div>

        {/* Account & Info */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Tài khoản & Quy định</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/login" className="hover:text-[#1A94FF] transition">Đăng nhập</Link></li>
            <li><Link href="/register" className="hover:text-[#1A94FF] transition">Đăng ký thành viên</Link></li>
            <li><Link href="/about" className="hover:text-[#1A94FF] transition">Về AquaHub</Link></li>
            <li><Link href="/lien-he" className="hover:text-[#1A94FF] transition font-bold text-[#1A94FF]">Liên hệ Ban quản trị</Link></li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 mt-12 pt-6 border-t border-blue-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <p>© {new Date().getFullYear()} AquaHub. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Aquarium Enthusiasts
        </p>
      </div>
    </footer>
  );
}
