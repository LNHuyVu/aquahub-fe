'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Fish, Layers, Users, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Synchronized Header Banner */}
      <div className="bg-gradient-to-r from-[#1A94FF] via-[#0B74E5] to-[#0D5CB6] rounded-3xl p-8 sm:p-10 text-white shadow-lg shadow-blue-500/10 space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur border border-white/30">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Về AquaHub Việt Nam</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Nơi Kết Nối Đam Mê Sinh Vật Cảnh</h1>
          <p className="text-blue-100 text-sm sm:text-base">
            AquaHub được xây dựng với mục tiêu mang đến cho cộng đồng người chơi cá cảnh nền tảng tra cứu chuẩn xác, công cụ quản lý hồ cá thông minh và diễn đàn giao lưu văn minh.
          </p>
        </div>
      </div>

      {/* Core Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-blue-100 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-2xl bg-[#E5F2FF] text-[#0B74E5] flex items-center justify-center font-bold">
            <Fish className="w-6 h-6 text-[#1A94FF]" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Cơ sở dữ liệu sinh vật</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Cung cấp đầy đủ thông số độ pH, nhiệt độ, kích thước bể và tập tính bơi của hàng trăm loài cá cảnh.
          </p>
        </div>

        <div className="bg-white border border-blue-100 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Hồ cá kỹ thuật số</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Giúp bạn lưu giữ thông số nước, lịch thay nước định kỳ và ghi chép sự phát triển của bể cá theo thời gian.
          </p>
        </div>

        <div className="bg-white border border-blue-100 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Cộng đồng sẻ chia</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Giao lưu, đặt câu hỏi về bệnh cá và cùng nhau hỗ trợ xử lý sự cố vi sinh bể cá một cách dễ dàng.
          </p>
        </div>
      </div>

      {/* Call to action */}
      <div className="bg-gradient-to-r from-[#1A94FF] via-[#0B74E5] to-[#0D5CB6] rounded-3xl p-8 sm:p-12 text-white text-center space-y-4 shadow-xl shadow-blue-500/20">
        <h2 className="text-2xl sm:text-3xl font-extrabold">Bắt đầu trải nghiệm AquaHub ngay hôm nay!</h2>
        <p className="text-blue-100 text-sm sm:text-base max-w-md mx-auto">
          Đăng ký tài khoản miễn phí để tạo hồ cá kỹ thuật số và trao đổi cùng cộng đồng.
        </p>
        <div className="pt-2">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-[#0B74E5] font-bold text-sm shadow-md hover:bg-blue-50 transition"
          >
            <span>Tạo tài khoản ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}
