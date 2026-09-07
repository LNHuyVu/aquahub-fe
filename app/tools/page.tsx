'use client';

import React, { useState } from 'react';
import { Calculator, Layers, Fish, Sparkles, CheckCircle2, AlertTriangle, Wrench } from 'lucide-react';
import { api } from '@/lib/api';

export default function ToolsPage() {
  // Tank calculator state
  const [length, setLength] = useState(60);
  const [width, setWidth] = useState(30);
  const [height, setHeight] = useState(36);

  const volumeLiter = Math.round(((length * width * height) / 1000) * 10) / 10;
  const volumeGallon = Math.round((volumeLiter * 0.264172) * 10) / 10;

  // Stocking calculator state
  const [tankSize, setTankSize] = useState(60);
  const [fishCount, setFishCount] = useState(15);
  const [avgFishSize, setAvgFishSize] = useState(3); // cm

  const totalFishCm = fishCount * avgFishSize;
  const maxRecommendedCm = tankSize * 1.2;
  const densityPercent = Math.round((totalFishCm / maxRecommendedCm) * 100);

  // Fish compatibility state
  const [fish1, setFish1] = useState('ca-neon-xanh');
  const [fish2, setFish2] = useState('ca-betta-halfmoon');
  const [compResult, setCompResult] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  const handleCheckCompatibility = async () => {
    setChecking(true);
    try {
      const res: any = await api.get(`/fish/compatibility?fish1=${fish1}&fish2=${fish2}`);
      setCompResult(res.data);
    } catch (err: any) {
      console.error('Compatibility check error', err);
      setCompResult({
        isCompatible: false,
        advice: 'Không thể kết nối máy chủ hoặc hai loài cá này có sự khác biệt về môi trường sống.',
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Synchronized Header Banner */}
      <div className="bg-gradient-to-r from-[#1A94FF] via-[#0B74E5] to-[#0D5CB6] rounded-3xl p-8 sm:p-10 text-white shadow-lg shadow-blue-500/10 space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur border border-white/30">
            <Wrench className="w-4 h-4 text-amber-300" />
            <span>Bộ công cụ người chơi cá</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Công Cụ Tính Toán & Tra Cứu</h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl">
            Các công cụ hỗ trợ người chơi cá cảnh tính toán chính xác thể tích hồ, mật độ thả cá phù hợp và kiểm tra tính tương thích giữa các loài cá.
          </p>
        </div>
      </div>

      {/* Tool 1: Tank Volume Calculator */}
      <div className="bg-white border border-blue-100 rounded-3xl p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center shadow-sm hover:shadow-md transition">
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E5F2FF] border border-blue-200 text-[#0B74E5] flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">1. Tính dung tích hồ cá (Tank Volume)</h2>
              <p className="text-xs text-slate-500">Nhập kích thước 3 chiều bằng centimet (cm)</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chiều dài (cm)</label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full bg-slate-50 border border-blue-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#1A94FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chiều rộng (cm)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full bg-slate-50 border border-blue-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#1A94FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chiều cao (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-slate-50 border border-blue-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#1A94FF]"
              />
            </div>
          </div>
        </div>

        {/* Volume & Pump Flow Output Card */}
        <div className="lg:col-span-6 bg-gradient-to-br from-blue-50 via-white to-cyan-50 border border-blue-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-3">
          <div className="text-xs font-bold text-[#0B74E5] uppercase tracking-wider">
            Thể tích & Đề xuất lưu lượng máy bơm
          </div>
          
          <div className="text-5xl font-extrabold text-[#1A94FF]">
            {volumeLiter} <span className="text-2xl text-slate-600 font-normal">Lít</span>
          </div>
          
          <div className="text-xs text-slate-600 font-medium">
            Tương đương khoảng <span className="text-slate-900 font-bold">{volumeGallon} US Gallons</span>
          </div>

          {/* Pump Flow Rate Suggestion Box */}
          <div className="w-full bg-white/80 border border-blue-200 rounded-xl p-3.5 space-y-1.5 shadow-sm text-left">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>🌊 Đề xuất công suất máy bơm lọc:</span>
              <span className="text-[#0B74E5] font-extrabold">{Math.round(volumeLiter * 3)} - {Math.round(volumeLiter * 5)} L/h</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              • **Hồ thủy sinh / cá nhỏ**: Dùng bơm luân chuyển <strong>{Math.round(volumeLiter * 3)} - {Math.round(volumeLiter * 4)} L/h</strong> (khoảng 3-4 lần thể tích bể/giờ).<br />
              • **Hồ cá Koi / Cichlid / Cá rồng**: Dùng bơm công suất <strong>{Math.round(volumeLiter * 5)} - {Math.round(volumeLiter * 8)} L/h</strong> (khoảng 5-8 lần thể tích bể/giờ).
            </p>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            * Thể tích nước thực tế có thể giảm 10-15% do cặn phân nền, sỏi và lũa đá trang trí.
          </p>
        </div>
      </div>

      {/* Tool 2: Stocking Calculator */}
      <div className="bg-white border border-blue-100 rounded-3xl p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center shadow-sm hover:shadow-md transition">
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center font-bold">
              <Fish className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">2. Tính mật độ thả cá (Stocking Calculator)</h2>
              <p className="text-xs text-slate-500">Ước tính số lượng cá tối đa nên thả để tránh quá tải vi sinh</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dung tích hồ (Lít)</label>
              <input
                type="number"
                value={tankSize}
                onChange={(e) => setTankSize(Number(e.target.value))}
                className="w-full bg-slate-50 border border-blue-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#1A94FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số lượng cá</label>
              <input
                type="number"
                value={fishCount}
                onChange={(e) => setFishCount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-blue-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#1A94FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kích thước TB (cm)</label>
              <input
                type="number"
                value={avgFishSize}
                onChange={(e) => setAvgFishSize(Number(e.target.value))}
                className="w-full bg-slate-50 border border-blue-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#1A94FF]"
              />
            </div>
          </div>
        </div>

        {/* Stocking Density Output */}
        <div className="lg:col-span-6 bg-slate-50 border border-blue-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-sm font-medium">
            <span className="text-slate-700">Mật độ tải bể:</span>
            <span className={`font-bold ${densityPercent > 100 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {densityPercent}% {densityPercent > 100 ? '(Quá tải!)' : '(An toàn)'}
            </span>
          </div>

          <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                densityPercent > 100 ? 'bg-rose-500' : densityPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, densityPercent)}%` }}
            />
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {densityPercent <= 80 && '✅ Mật độ thả cá rất lý tưởng. Bể có môi trường sống thoải mái và ổn định.'}
            {densityPercent > 80 && densityPercent <= 100 && '⚠️ Mật độ thả cá ở mức tối đa cho phép. Cần chú ý lọc và thay nước định kỳ.'}
            {densityPercent > 100 && '🚨 Bể đang bị quá tải cá! Nguy cơ cao bùng phát khí độc Ammonia và làm cá suy yếu.'}
          </p>
        </div>
      </div>

      {/* Tool 3: Fish Compatibility */}
      <div className="bg-white border border-blue-100 rounded-3xl p-4 space-y-4 shadow-sm hover:shadow-md transition">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">3. Tra cứu cá nuôi chung (Fish Compatibility)</h2>
            <p className="text-xs text-slate-500">So sánh điều kiện môi trường giữa 2 loài cá</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Loài cá 1</label>
            <select
              value={fish1}
              onChange={(e) => setFish1(e.target.value)}
              className="w-full bg-slate-50 border border-blue-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#1A94FF]"
            >
              <option value="ca-neon-xanh">Cá Neon Xanh</option>
              <option value="ca-betta-halfmoon">Cá Betta Halfmoon</option>
              <option value="ca-guppy-full-red">Cá Guppy Full Red</option>
              <option value="ca-chuot-panda">Cá Chuột Panda</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Loài cá 2</label>
            <select
              value={fish2}
              onChange={(e) => setFish2(e.target.value)}
              className="w-full bg-slate-50 border border-blue-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#1A94FF]"
            >
              <option value="ca-betta-halfmoon">Cá Betta Halfmoon</option>
              <option value="ca-neon-xanh">Cá Neon Xanh</option>
              <option value="ca-guppy-full-red">Cá Guppy Full Red</option>
              <option value="ca-chuot-panda">Cá Chuột Panda</option>
            </select>
          </div>

          <button
            onClick={handleCheckCompatibility}
            disabled={checking}
            className="w-full py-2.5 bg-[#1A94FF] hover:bg-[#0D5CB6] text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition"
          >
            {checking ? 'Đang so sánh...' : 'Kiểm tra độ tương thích'}
          </button>
        </div>

        {compResult && (
          <div className={`p-4 rounded-2xl border ${compResult.isCompatible ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'} space-y-3`}>
            <div className="flex items-center gap-2 font-bold text-base">
              {compResult.isCompatible ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-700">Có thể nuôi chung!</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span className="text-amber-700">Cần cân nhắc cẩn thận!</span>
                </>
              )}
            </div>
            <p className="text-sm text-slate-700">{compResult.advice}</p>
          </div>
        )}
      </div>

    </div>
  );
}
