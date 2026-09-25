'use client';

import React, { useState } from 'react';
import { Calculator, ShoppingBag, Wrench, Sun, Moon } from 'lucide-react';
import DetailPageHeader from '@/components/ui/detail-page-header';
import Calculators from './components/Calculators';
import SetupEstimator from './components/SetupEstimator';

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<'calculators' | 'estimator'>('calculators');
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={`transition-colors duration-300 min-h-screen ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50/50 text-slate-900'}`}>
      <div className="container mx-auto px-3 sm:px-4 py-4 space-y-4">
        {/* Breadcrumb Header */}
        <DetailPageHeader
          breadcrumbs={[]}
          currentTitle="Bộ Công Cụ Thủy Sinh"
          showShare={false}
          showBack={false}
        />

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#1A94FF] via-[#0B74E5] to-[#0D5CB6] rounded-3xl p-8 sm:p-10 text-white shadow-lg shadow-blue-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur border border-white/30">
              <Wrench className="w-4 h-4 text-amber-300" />
              <span>Tiện ích & Tính toán AquaHub</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Bộ Công Cụ Thủy Sinh Smart</h1>
            
            <p className="text-blue-100 text-sm sm:text-base max-w-2xl">
              Giải pháp tiện ích toàn diện giúp người chơi cá tính toán chính xác thể tích, công suất sưởi, nồng độ CO2, thay nước định kỳ và dự toán ngân sách setup bể từ A-Z.
            </p>
          </div>

          {/* Light / Dark Mode Toggle Switch */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="relative z-10 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-extrabold backdrop-blur transition flex items-center gap-2 shrink-0 shadow-sm cursor-pointer"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-300" />
                <span>Chuyển Tone Sáng (Light)</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-cyan-200" />
                <span>Chuyển Tone Tối (Dark)</span>
              </>
            )}
          </button>
        </div>

        {/* Main Tab Navigation */}
        <div className={`border rounded-2xl p-1.5 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-2 transition ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-100'
        }`}>
          <button
            onClick={() => setActiveTab('calculators')}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 ${
              activeTab === 'calculators'
                ? 'bg-[#1A94FF] text-white shadow-md shadow-blue-500/20'
                : isDarkMode
                ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>🧮 Bộ Công Cụ Tính Toán</span>
          </button>

          <button
            onClick={() => setActiveTab('estimator')}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 ${
              activeTab === 'estimator'
                ? 'bg-[#1A94FF] text-white shadow-md shadow-blue-500/20'
                : isDarkMode
                ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>🛒 Dự Toán Setup Bể</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="transition-all duration-300">
          {activeTab === 'calculators' && <Calculators isDarkMode={isDarkMode} />}
          {activeTab === 'estimator' && <SetupEstimator isDarkMode={isDarkMode} />}
        </div>

      </div>
    </div>
  );
}
