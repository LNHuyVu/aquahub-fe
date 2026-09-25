'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Zap,
  RefreshCw,
  Search,
  X,
  Droplets,
  Thermometer,
  FlameKindling,
  CalendarDays,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';

interface ElectricalDevice {
  id: string;
  name: string;
  watts: number;
  hoursPerDay: number;
}

interface ApiFish {
  id: string;
  nameVi: string;
  slug: string;
  tempMin?: number;
  tempMax?: number;
  phMin?: number;
  phMax?: number;
  sizeCm?: number;
  aggression?: string;
  category?: { name: string; slug: string };
}

interface ApiFishCategory {
  id: string;
  name: string;
  slug: string;
}

interface SelectedFish extends ApiFish {}

interface CalculatorsProps {
  isDarkMode?: boolean;
}

export default function Calculators({ isDarkMode = false }: CalculatorsProps) {
  // --- 1. Volume & Stocking Combined State ---
  const [length, setLength] = useState(60);
  const [width, setWidth] = useState(30);
  const [height, setHeight] = useState(36);

  const volumeLiter = Math.round(((length * width * height) / 1000) * 10) / 10;
  const volumeGallon = Math.round((volumeLiter * 0.264172) * 10) / 10;

  const [fishCount, setFishCount] = useState(15);
  const [avgFishSize, setAvgFishSize] = useState(3); // cm

  const totalFishCm = fishCount * avgFishSize;
  const maxRecommendedCm = Math.max(1, volumeLiter * 1.2);
  const densityPercent = Math.round((totalFishCm / maxRecommendedCm) * 100);

  // --- 2. Dynamic Electrical Devices State ---
  const [electricalDevices, setElectricalDevices] = useState<ElectricalDevice[]>([
    { id: '1', name: '💡 Đèn Thủy Sinh WRGB', watts: 24, hoursPerDay: 8 },
    { id: '2', name: '🌊 Máy Lọc Thùng Chính', watts: 15, hoursPerDay: 24 },
    { id: '3', name: '🔥 Sưởi Nước Mùa Đông', watts: 100, hoursPerDay: 4 },
    { id: '4', name: '🫧 Máy Sủi Oxy 2 Vòi', watts: 5, hoursPerDay: 24 },
  ]);

  const [electricityRate, setElectricityRate] = useState(2800);

  const addElectricalDevice = (presetName?: string, presetWatts?: number, presetHours?: number) => {
    setElectricalDevices([
      ...electricalDevices,
      {
        id: Date.now().toString() + Math.random(),
        name: presetName || '⚡ Thiết bị điện mới...',
        watts: presetWatts || 10,
        hoursPerDay: presetHours || 12,
      },
    ]);
  };

  const updateDeviceField = (id: string, field: keyof ElectricalDevice, value: any) => {
    setElectricalDevices((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeElectricalDevice = (id: string) => {
    setElectricalDevices((prev) => prev.filter((item) => item.id !== id));
  };

  const resetDefaultElectricalDevices = () => {
    setElectricalDevices([
      { id: '1', name: '💡 Đèn Thủy Sinh WRGB', watts: 24, hoursPerDay: 8 },
      { id: '2', name: '🌊 Máy Lọc Thùng Chính', watts: 15, hoursPerDay: 24 },
      { id: '3', name: '🔥 Sưởi Nước Mùa Đông', watts: 100, hoursPerDay: 4 },
      { id: '4', name: '🫧 Máy Sủi Oxy 2 Vòi', watts: 5, hoursPerDay: 24 },
    ]);
  };

  const totalKwhMonth = electricalDevices.reduce((acc, dev) => {
    const dailyKwh = ((Number(dev.watts) || 0) * (Number(dev.hoursPerDay) || 0)) / 1000;
    return acc + dailyKwh * 30;
  }, 0);

  const totalCostMonth = Math.round(totalKwhMonth * electricityRate);

  // --- 3. CO2 Calculator State ---
  const [ph, setPh] = useState(6.8);
  const [kh, setKh] = useState(4);

  const co2Ppm = Math.round(3 * kh * Math.pow(10, 7.0 - ph) * 10) / 10;
  const suggestedBps = Math.max(0.5, Math.round((volumeLiter / 35) * 10) / 10);

  // --- 4. Water Change Scheduler State ---
  const [wcPercent, setWcPercent] = useState(25);
  const [wcFrequency, setWcFrequency] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly'>('weekly');

  const wcLiters = Math.round((volumeLiter * wcPercent) / 100 * 10) / 10;
  const wcDechlorDose = Math.round(wcLiters * (5 / 50) * 10) / 10; // 5ml per 50L

  const wcFreqLabels: Record<string, string> = {
    daily: 'mỗi ngày',
    weekly: 'mỗi tuần',
    biweekly: 'mỗi 2 tuần',
    monthly: 'mỗi tháng',
  };

  const wcMonthlyLiters = (() => {
    const multipliers: Record<string, number> = { daily: 30, weekly: 4, biweekly: 2, monthly: 1 };
    return Math.round(wcLiters * (multipliers[wcFrequency] || 1));
  })();

  // --- 5. Heater Power Calculator State ---
  const [roomTemp, setRoomTemp] = useState(22);
  const [targetTemp, setTargetTemp] = useState(28);

  const tempDiff = Math.max(0, targetTemp - roomTemp);
  // Rule of thumb: ~1W per litre for every 2°C difference, min 25W
  const heaterWatts = Math.max(25, Math.round(volumeLiter * (tempDiff / 2)));
  const heaterSuggestion = (() => {
    if (heaterWatts <= 50) return '25W - 50W (Bể Nano ≤ 30L)';
    if (heaterWatts <= 100) return '50W - 100W (Bể Tiêu Chuẩn 30-60L)';
    if (heaterWatts <= 200) return '100W - 200W (Bể Trung 60-120L)';
    if (heaterWatts <= 300) return '200W - 300W (Bể Lớn 120-200L)';
    return '300W+ hoặc dùng 2 sưởi song song';
  })();

  // --- 6. Fish Compatibility — API-backed ---
  const [fishSearch, setFishSearch] = useState('');
  const [fishCategoryFilter, setFishCategoryFilter] = useState('');
  const [fishApiList, setFishApiList] = useState<ApiFish[]>([]);
  const [fishCategories, setFishCategories] = useState<ApiFishCategory[]>([]);
  const [fishLoading, setFishLoading] = useState(false);
  const [fishDropdownOpen, setFishDropdownOpen] = useState(false);
  const [selectedFish, setSelectedFish] = useState<SelectedFish[]>([]);

  // Fetch categories once
  useEffect(() => {
    api.get('/fish/categories').then((res: any) => {
      setFishCategories(res.data || []);
    }).catch(() => {});
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fishDropdownOpen) fetchFishList();
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fishSearch, fishCategoryFilter, fishDropdownOpen]);

  const fetchFishList = async () => {
    setFishLoading(true);
    try {
      const params: any = { limit: 20, page: 1 };
      if (fishSearch) params.search = fishSearch;
      if (fishCategoryFilter) params.category = fishCategoryFilter;
      const res: any = await api.get('/fish', { params });
      setFishApiList(res.data?.items || []);
    } catch {
      setFishApiList([]);
    } finally {
      setFishLoading(false);
    }
  };

  const openDropdown = () => {
    setFishDropdownOpen(true);
    fetchFishList();
  };

  const toggleSelectFish = (fish: ApiFish) => {
    if (selectedFish.find((f) => f.id === fish.id)) {
      if (selectedFish.length <= 2) return; // keep minimum 2
      setSelectedFish((prev) => prev.filter((f) => f.id !== fish.id));
    } else {
      setSelectedFish((prev) => [...prev, fish]);
    }
  };

  const removeFish = (id: string) => {
    if (selectedFish.length <= 2) return;
    setSelectedFish((prev) => prev.filter((f) => f.id !== id));
  };

  // Compatibility analysis on selected fish
  const validFish = selectedFish.filter(
    (f) => f.tempMin != null && f.tempMax != null && f.phMin != null && f.phMax != null
  );

  const maxTempMin = validFish.length > 0 ? Math.max(...validFish.map((f) => f.tempMin!)) : 0;
  const minTempMax = validFish.length > 0 ? Math.min(...validFish.map((f) => f.tempMax!)) : 0;
  const maxPhMin = validFish.length > 0 ? Math.max(...validFish.map((f) => f.phMin!)) : 0;
  const minPhMax = validFish.length > 0 ? Math.min(...validFish.map((f) => f.phMax!)) : 0;

  const isTempOk = validFish.length < 2 || maxTempMin <= minTempMax;
  const isPhOk = validFish.length < 2 || maxPhMin <= minPhMax;

  const hasPredatorIssue = selectedFish.some((f) => f.aggression === 'aggressive') &&
    selectedFish.some((f) => f.sizeCm != null && f.sizeCm <= 5);

  const isCommunitySafe = !hasPredatorIssue && isTempOk && isPhOk && selectedFish.length >= 2;

  const cardBg = isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-blue-100 text-slate-900';
  const inputBg = isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800';

  return (
    <div className="space-y-4">

      {/* SECTION 1 & 2: VOLUME & STOCKING */}
      <div className={`${cardBg} border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/50 pb-2.5">
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight">1. Kích Thước Bể, Thể Tích & Mật Độ Thả Cá</h2>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tự động tính dung tích nước, lưu lượng lọc và độ an toàn quần thể cá</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#0B74E5] font-bold text-xs border border-blue-200">
            Dung tích: {volumeLiter} Lít ({volumeGallon} Gal)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Left Inputs */}
          <div className="md:col-span-6 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold opacity-70 mb-1">Dài (cm)</label>
                <input type="number" value={length} onChange={(e) => setLength(Number(e.target.value))}
                  className={`w-full ${inputBg} rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#1A94FF] border`} />
              </div>
              <div>
                <label className="block text-[11px] font-bold opacity-70 mb-1">Rộng (cm)</label>
                <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))}
                  className={`w-full ${inputBg} rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#1A94FF] border`} />
              </div>
              <div>
                <label className="block text-[11px] font-bold opacity-70 mb-1">Cao (cm)</label>
                <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))}
                  className={`w-full ${inputBg} rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#1A94FF] border`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold opacity-70 mb-1">Số lượng cá (con)</label>
                <input type="number" value={fishCount} onChange={(e) => setFishCount(Number(e.target.value))}
                  className={`w-full ${inputBg} rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#1A94FF] border`} />
              </div>
              <div>
                <label className="block text-[11px] font-bold opacity-70 mb-1">Kích thước TB (cm)</label>
                <input type="number" value={avgFishSize} onChange={(e) => setAvgFishSize(Number(e.target.value))}
                  className={`w-full ${inputBg} rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#1A94FF] border`} />
              </div>
            </div>

            {/* Quick preset sizes */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[11px] font-bold opacity-60">Mẫu bể nhanh:</span>
              {[
                { label: 'Nano 30', l: 30, w: 20, h: 25 },
                { label: 'Chuẩn 60', l: 60, w: 30, h: 36 },
                { label: 'Trung 90', l: 90, w: 45, h: 45 },
                { label: 'Lớn 120', l: 120, w: 50, h: 50 },
              ].map((p) => (
                <button key={p.label} onClick={() => { setLength(p.l); setWidth(p.w); setHeight(p.h); }}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition cursor-pointer ${
                    length === p.l && width === p.w && height === p.h
                      ? 'bg-[#1A94FF] text-white border-[#1A94FF]'
                      : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-200'
                  }`}
                >{p.label}cm</button>
              ))}
            </div>
          </div>

          {/* Right Visual Stats */}
          <div className="md:col-span-6 space-y-2.5">
            {/* Density Gauge */}
            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'} space-y-1.5`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Mật độ sinh thái:</span>
                <span className={densityPercent > 100 ? 'text-rose-600 font-extrabold' : 'text-emerald-600 font-extrabold'}>
                  {densityPercent}% {densityPercent > 100 ? '⚠️ Quá tải' : '✅ An toàn'}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    densityPercent > 100 ? 'bg-rose-500' : densityPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, densityPercent)}%` }}
                />
              </div>
              <p className="text-[11px] opacity-70 leading-snug">
                {densityPercent <= 80 && 'Môi trường sinh thái thông thoáng, lượng vi sinh ổn định.'}
                {densityPercent > 80 && densityPercent <= 100 && 'Gần chạm ngưỡng tối đa. Cần thay nước 1 tuần/lần.'}
                {densityPercent > 100 && 'Bể bị quá tải! Cần nâng cấp lọc hoặc giảm bớt số lượng cá.'}
              </p>
            </div>

            {/* Pump Recommendation Badge */}
            <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-[#0B74E5] text-xs font-medium flex items-center justify-between">
              <span>🌊 Đề xuất lưu lượng máy lọc:</span>
              <strong className="font-extrabold text-slate-900">{Math.round(volumeLiter * 3)} - {Math.round(volumeLiter * 5)} L/h</strong>
            </div>

            {/* Light Recommendation */}
            <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-800 text-xs font-medium flex items-center justify-between">
              <span>💡 Diện tích chiếu sáng đủ:</span>
              <strong className="font-extrabold text-slate-900">{length * width} cm²</strong>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: ELECTRICITY CALCULATOR */}
      <div className={`${cardBg} border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/50 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>2. Tính Tiền Điện Bể Cá Hàng Tháng</span>
            </h2>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Thêm, sửa công suất (W) hoặc xóa các thiết bị điện đang sử dụng</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs font-bold">
              <span className="opacity-60">Đơn giá:</span>
              <input type="number" value={electricityRate} onChange={(e) => setElectricityRate(Number(e.target.value))}
                className="w-20 bg-amber-50 border border-amber-300 text-amber-900 rounded-lg px-2 py-1 text-xs font-bold text-right focus:outline-none" />
              <span className="text-[10px] opacity-60">đ/kWh</span>
            </div>
            <button onClick={resetDefaultElectricalDevices}
              className={`px-2.5 py-1 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer`}>
              <RefreshCw className="w-3.5 h-3.5" /> Nạp Mẫu
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-bold opacity-60 px-2">
            <div className="col-span-5">Tên thiết bị điện</div>
            <div className="col-span-3">Công suất (W)</div>
            <div className="col-span-3">Số giờ chạy/ngày</div>
            <div className="col-span-1 text-right">Xóa</div>
          </div>

          {electricalDevices.map((dev) => (
            <div key={dev.id}
              className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'} flex flex-col sm:grid sm:grid-cols-12 gap-2 items-center hover:border-blue-300 transition`}>
              <div className="col-span-5 w-full">
                <label className="sm:hidden text-[10px] font-bold opacity-60 mb-0.5 block">Tên thiết bị</label>
                <input type="text" value={dev.name} onChange={(e) => updateDeviceField(dev.id, 'name', e.target.value)}
                  className={`w-full ${inputBg} border rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#1A94FF]`}
                  placeholder="Tên thiết bị..." />
              </div>
              <div className="col-span-3 w-full">
                <label className="sm:hidden text-[10px] font-bold opacity-60 mb-0.5 block">Công suất (W)</label>
                <div className="relative">
                  <input type="number" min="0" value={dev.watts || ''}
                    onChange={(e) => updateDeviceField(dev.id, 'watts', Number(e.target.value))}
                    className={`w-full ${inputBg} border rounded-lg px-2.5 py-1.5 pr-7 text-xs font-bold focus:outline-none focus:border-[#1A94FF]`} />
                  <span className="absolute right-2 top-1.5 text-[10px] font-bold text-slate-400">W</span>
                </div>
              </div>
              <div className="col-span-3 w-full">
                <label className="sm:hidden text-[10px] font-bold opacity-60 mb-0.5 block">Số giờ chạy/ngày</label>
                <div className="relative">
                  <input type="number" min="0" max="24" value={dev.hoursPerDay || ''}
                    onChange={(e) => updateDeviceField(dev.id, 'hoursPerDay', Math.min(24, Math.max(0, Number(e.target.value))))}
                    className={`w-full ${inputBg} border rounded-lg px-2.5 py-1.5 pr-10 text-xs font-bold focus:outline-none focus:border-[#1A94FF]`} />
                  <span className="absolute right-2 top-1.5 text-[10px] font-bold text-slate-400">h/ngày</span>
                </div>
              </div>
              <div className="col-span-1 w-full flex justify-end">
                <button onClick={() => removeElectricalDevice(dev.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button onClick={() => addElectricalDevice()}
              className={`py-2 px-3 border-2 border-dashed ${isDarkMode ? 'border-slate-700 bg-slate-800/40 hover:bg-slate-800' : 'border-blue-200 bg-blue-50/40 hover:bg-blue-50'} text-[#0B74E5] font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer`}>
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Thiết Bị Điện Khác</span>
            </button>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold opacity-60">Gợi ý nhanh:</span>
              <button onClick={() => addElectricalDevice('💡 Đèn Phụ 15W', 15, 6)}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold transition cursor-pointer">+ Đèn 15W</button>
              <button onClick={() => addElectricalDevice('❄️ Quạt Làm Mát 4W', 4, 10)}
                className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-200 rounded-lg text-xs font-bold transition cursor-pointer">+ Quạt 4W</button>
              <button onClick={() => addElectricalDevice('🦠 Đèn UVC Diệt Tảo 7W', 7, 4)}
                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg text-xs font-bold transition cursor-pointer">+ Đèn UV 7W</button>
              <button onClick={() => addElectricalDevice('🌪️ Bơm Tạo Luồng 12W', 12, 12)}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-bold transition cursor-pointer">+ Bơm Luồng</button>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100 block">Ước tính tiêu thụ điện ({electricalDevices.length} thiết bị)</span>
              <span className="text-xs font-medium text-amber-50">{Math.round(totalKwhMonth * 10) / 10} kWh điện mỗi tháng</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-white">
                {totalCostMonth.toLocaleString('vi-VN')} <span className="text-xs font-normal text-amber-100">đ/tháng</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: CO2 CALCULATOR */}
      <div className={`${cardBg} border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3`}>
        <div className="border-b border-slate-200/50 pb-2">
          <h2 className="text-base sm:text-lg font-black tracking-tight">3. Tính Nồng Độ CO2 Hòa Tan (ppm)</h2>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Kéo thanh chỉ số pH & độ cứng KH để kiểm tra mức CO2 hòa tan an toàn</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Độ pH hiện tại:</span>
                <span className="text-[#1A94FF] font-black">{ph}</span>
              </div>
              <input type="range" min="5.5" max="8.0" step="0.1" value={ph}
                onChange={(e) => setPh(Number(e.target.value))} className="w-full accent-[#1A94FF] cursor-pointer" />
              <div className="flex justify-between text-[10px] opacity-50 mt-0.5">
                <span>5.5 (Acid)</span><span>8.0 (Base)</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Độ KH (dKH):</span>
                <span className="text-[#1A94FF] font-black">{kh} °dKH</span>
              </div>
              <input type="range" min="1" max="15" step="1" value={kh}
                onChange={(e) => setKh(Number(e.target.value))} className="w-full accent-[#1A94FF] cursor-pointer" />
              <div className="flex justify-between text-[10px] opacity-50 mt-0.5">
                <span>1 (Rất mềm)</span><span>15 (Rất cứng)</span>
              </div>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white space-y-2 text-center shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-100 block">Nồng độ CO2 hòa tan</span>
            <div className="text-4xl font-black">{co2Ppm} <span className="text-base font-normal text-cyan-100">ppm</span></div>
            <div className="text-xs font-bold bg-white/20 px-3 py-1 rounded-lg inline-block">
              {co2Ppm < 15 && '🟡 Thiếu CO2 (< 15 ppm)'}
              {co2Ppm >= 15 && co2Ppm <= 30 && '🟢 CO2 Lý Tưởng (15 - 30 ppm)'}
              {co2Ppm > 30 && '🔴 Thừa CO2 (> 30 ppm)'}
            </div>
            <p className="text-[11px] text-cyan-100">Đề xuất tốc độ đếm giọt: <strong>{suggestedBps} giọt/giây</strong></p>
          </div>
        </div>
      </div>

      {/* SECTION 4: WATER CHANGE SCHEDULER */}
      <div className={`${cardBg} border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3`}>
        <div className="border-b border-slate-200/50 pb-2">
          <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-teal-500" />
            <span>4. Lịch Thay Nước Thông Minh</span>
          </h2>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Thiết lập tần suất và tỷ lệ thay nước, tự động tính lượng nước & khử clo cần dùng</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            {/* Percent slider */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Tỷ lệ thay nước:</span>
                <span className="text-teal-600 font-black">{wcPercent}%</span>
              </div>
              <input type="range" min="10" max="80" step="5" value={wcPercent}
                onChange={(e) => setWcPercent(Number(e.target.value))} className="w-full accent-teal-500 cursor-pointer" />
              <div className="flex justify-between text-[10px] opacity-50 mt-0.5">
                <span>10% (Nhẹ)</span><span>80% (Toàn bộ)</span>
              </div>
            </div>

            {/* Frequency pills */}
            <div>
              <label className="block text-xs font-bold mb-1.5">Tần suất thay nước:</label>
              <div className="flex flex-wrap gap-2">
                {(['daily', 'weekly', 'biweekly', 'monthly'] as const).map((f) => (
                  <button key={f} onClick={() => setWcFrequency(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      wcFrequency === f
                        ? 'bg-teal-500 text-white border-teal-500 shadow-sm'
                        : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-teal-50 hover:border-teal-200'
                    }`}>
                    {f === 'daily' ? 'Hàng ngày' : f === 'weekly' ? '1 tuần/lần' : f === 'biweekly' ? '2 tuần/lần' : 'Hàng tháng'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-100 block">Mỗi lần thay ({wcFreqLabels[wcFrequency]})</span>
              <div className="text-3xl font-black">{wcLiters} <span className="text-sm font-normal text-teal-100">lít nước</span></div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/20 rounded-lg p-2 text-center">
                  <div className="text-teal-100 text-[10px] font-bold">Khử Clo cần dùng</div>
                  <div className="font-black">{wcDechlorDose} ml</div>
                </div>
                <div className="bg-white/20 rounded-lg p-2 text-center">
                  <div className="text-teal-100 text-[10px] font-bold">Tổng nước/tháng</div>
                  <div className="font-black">{wcMonthlyLiters} L</div>
                </div>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border text-xs ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-blue-50/70 border-blue-200 text-slate-700'}`}>
              <p className="font-bold mb-1 flex items-center gap-1"><Info className="w-3.5 h-3.5 text-blue-500" /> Lưu ý khi thay nước:</p>
              <ul className="space-y-0.5 text-[11px] opacity-80">
                <li>• Khử Clo nước mới trước khi đổ vào bể (2-5 phút)</li>
                <li>• Nhiệt độ nước mới nên chênh lệch &lt; 2°C so với bể</li>
                <li>• Tắt sưởi và máy lọc khi mực nước xuống thấp</li>
                <li>• Bổ sung vi sinh sau khi thay nước &gt; 40%</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: HEATER POWER CALCULATOR */}
      <div className={`${cardBg} border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3`}>
        <div className="border-b border-slate-200/50 pb-2">
          <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
            <FlameKindling className="w-5 h-5 text-orange-500" />
            <span>5. Máy Tính Công Suất Sưởi Cần Thiết</span>
          </h2>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Nhập nhiệt độ phòng & mục tiêu để tính công suất sưởi phù hợp với bể của bạn ({volumeLiter}L)</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1"><Thermometer className="w-3.5 h-3.5 text-blue-500" /> Nhiệt độ phòng hiện tại:</span>
                <span className="text-blue-600 font-black">{roomTemp}°C</span>
              </div>
              <input type="range" min="15" max="35" step="1" value={roomTemp}
                onChange={(e) => setRoomTemp(Number(e.target.value))} className="w-full accent-blue-500 cursor-pointer" />
              <div className="flex justify-between text-[10px] opacity-50 mt-0.5">
                <span>15°C</span><span>35°C</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1"><Thermometer className="w-3.5 h-3.5 text-orange-500" /> Nhiệt độ mục tiêu (°C):</span>
                <span className="text-orange-600 font-black">{targetTemp}°C</span>
              </div>
              <input type="range" min="20" max="35" step="1" value={targetTemp}
                onChange={(e) => setTargetTemp(Number(e.target.value))} className="w-full accent-orange-500 cursor-pointer" />
              <div className="flex justify-between text-[10px] opacity-50 mt-0.5">
                <span>20°C</span><span>35°C</span>
              </div>
            </div>

            {/* Quick species targets */}
            <div>
              <label className="block text-[11px] font-bold mb-1.5 opacity-70">Nhiệt độ mục tiêu theo loài:</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Cá Đĩa 30°C', t: 30 },
                  { label: 'Betta 28°C', t: 28 },
                  { label: 'Neon 26°C', t: 26 },
                  { label: 'Cá Vàng 22°C', t: 22 },
                ].map((p) => (
                  <button key={p.label} onClick={() => setTargetTemp(p.t)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition cursor-pointer ${
                      targetTemp === p.t
                        ? 'bg-orange-500 text-white border-orange-500'
                        : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-orange-50 hover:border-orange-200'
                    }`}>{p.label}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-sm space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-100 block">Công suất sưởi đề xuất</span>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-black">{heaterWatts}</div>
                <div className="text-base font-bold text-orange-100">W</div>
              </div>
              <div className="bg-white/20 rounded-lg px-3 py-2 text-xs font-bold">{heaterSuggestion}</div>
              <div className="text-[11px] text-orange-100">
                Chênh lệch nhiệt: <strong>{tempDiff}°C</strong> | Bể: <strong>{volumeLiter}L</strong>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border text-xs ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-amber-50/70 border-amber-200 text-slate-700'}`}>
              <ul className="space-y-0.5 text-[11px] opacity-80">
                <li>• Nên dùng 2 sưởi nhỏ thay vì 1 sưởi lớn cho bể &gt; 200L</li>
                <li>• Chọn sưởi có bộ điều nhiệt tự ngắt (thermostat)</li>
                <li>• Đặt sưởi theo chiều ngang gần máy lọc để đối lưu đều</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: FISH COMPATIBILITY — API-BACKED */}
      <div className={`${cardBg} border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3`}>
        <div className="border-b border-slate-200/50 pb-2">
          <h2 className="text-base sm:text-lg font-black tracking-tight">6. Tra Cứu Cá Nuôi Chung</h2>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tìm kiếm và chọn các loài cá từ database để kiểm tra khả năng nuôi chung</p>
        </div>

        {/* Search & Add fish from API */}
        <div className="space-y-2">
          {/* Selected fish pills */}
          {selectedFish.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-1">
              {selectedFish.map((f) => (
                <span key={f.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#1A94FF] text-white text-xs font-bold shadow-sm">
                  {f.nameVi}
                  {selectedFish.length > 2 && (
                    <button onClick={() => removeFish(f.id)} className="hover:text-red-200 transition cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}

          {/* Search input + category filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm tên loài cá..."
                value={fishSearch}
                onChange={(e) => setFishSearch(e.target.value)}
                onFocus={openDropdown}
                className={`w-full ${inputBg} border rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:border-[#1A94FF] transition`}
              />
            </div>
            <select
              value={fishCategoryFilter}
              onChange={(e) => { setFishCategoryFilter(e.target.value); if (!fishDropdownOpen) openDropdown(); }}
              className={`${inputBg} border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#1A94FF] cursor-pointer transition`}
            >
              <option value="">Tất cả loài</option>
              {fishCategories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
            <button onClick={openDropdown}
              className="px-3 py-2 bg-[#1A94FF] hover:bg-[#0D5CB6] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0">
              <Search className="w-3.5 h-3.5" /> Tìm
            </button>
          </div>

          {/* Dropdown fish results */}
          {fishDropdownOpen && (
            <div className={`border rounded-2xl shadow-lg overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <span className="text-[11px] font-bold opacity-60">Chọn loài để thêm vào danh sách</span>
                <button onClick={() => setFishDropdownOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {fishLoading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-[#1A94FF]" />
                  <span>Đang tải danh sách cá...</span>
                </div>
              ) : fishApiList.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">Không tìm thấy loài cá phù hợp</div>
              ) : (
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-100">
                  {fishApiList.map((fish) => {
                    const isSelected = selectedFish.some((f) => f.id === fish.id);
                    return (
                      <button key={fish.id} onClick={() => toggleSelectFish(fish)}
                        className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-2 transition cursor-pointer hover:bg-blue-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                        <div>
                          <p className={`text-xs font-bold ${isSelected ? 'text-[#1A94FF]' : isDarkMode ? 'text-white' : 'text-slate-800'}`}>{fish.nameVi}</p>
                          {fish.category && (
                            <p className="text-[10px] text-slate-400 font-medium">{fish.category.name}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {fish.tempMin && fish.tempMax && (
                            <span className="text-[10px] text-slate-400 font-medium">{fish.tempMin}-{fish.tempMax}°C</span>
                          )}
                          {isSelected ? (
                            <span className="w-5 h-5 rounded-full bg-[#1A94FF] flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-white stroke-[3]" />
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0">
                              <Plus className="w-3 h-3 text-slate-400" />
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Compatibility Result */}
        {selectedFish.length >= 2 ? (
          <div className={`p-3.5 rounded-xl border transition ${
            isCommunitySafe
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          } space-y-1.5 text-xs`}>
            <div className="font-bold text-sm flex items-center gap-1.5">
              {isCommunitySafe ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>🟢 {selectedFish.length} loài này có thể nuôi chung!</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>🟡 Cần lưu ý khi thả chung nhóm cá này!</span>
                </>
              )}
            </div>

            {hasPredatorIssue && (
              <p className="text-rose-700 font-bold">• Cảnh báo: Có loài cá hung dữ (aggressive) với loài cá nhỏ trong danh sách!</p>
            )}
            {!isTempOk && (
              <p className="text-amber-800 font-semibold">• Dải nhiệt độ yêu cầu của các loài không tương thích nhau.</p>
            )}
            {!isPhOk && (
              <p className="text-amber-800 font-semibold">• Dải pH yêu cầu của các loài không tương thích nhau.</p>
            )}

            {validFish.length >= 2 && (
              <div className="pt-1 border-t border-current/20 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Nhiệt độ chung: <strong>{maxTempMin}°C – {minTempMax}°C</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>pH chung: <strong>{maxPhMin.toFixed(1)} – {minPhMax.toFixed(1)}</strong></span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={`p-3 rounded-xl border border-dashed text-center text-xs ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-400'}`}>
            Chọn ít nhất 2 loài cá ở trên để kiểm tra tính tương thích
          </div>
        )}
      </div>

    </div>
  );
}
