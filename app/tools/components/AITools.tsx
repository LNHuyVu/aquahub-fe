'use client';

import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Upload, 
  Search, 
  Stethoscope, 
  ShieldAlert, 
  CheckCircle2, 
  AlertOctagon, 
  Layers, 
  Palette, 
  Compass, 
  RefreshCw, 
  FileText, 
  Pill,
  Leaf,
  Thermometer,
  Droplets,
  Sun
} from 'lucide-react';

interface AIToolsProps {
  isDarkMode?: boolean;
}

export default function AITools({ isDarkMode = false }: AIToolsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'scanner' | 'identifier' | 'generator'>('scanner');

  // --- 1. AI Fish Disease Scanner State ---
  const [diseaseImage, setDiseaseImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [diseaseResult, setDiseaseResult] = useState<any>(null);
  const diseaseFileInputRef = useRef<HTMLInputElement>(null);

  const mockDiseaseDiagnoses = [
    {
      diseaseName: 'Bệnh Nấm Trắng (Ich / White Spot Disease)',
      confidence: 96,
      severity: 'Medium',
      severityText: 'Vừa phải - Cần xử lý sớm trong 48h',
      symptomsDetected: ['Đốm trắng li ti như hạt muối trên thân & vây', 'Cá cọ xát người vào đá', 'Kẹp vây, lờ đờ'],
      cause: 'Ký sinh trùng Ichthyophthirius multifiliis bùng phát khi nhiệt độ nước giảm đột ngột hoặc sút giảm sức đề kháng cá.',
      treatmentSteps: [
        'Tăng nhiệt độ nước lên 29°C - 30°C để cắt đứt chu kỳ sinh sản của ký sinh trùng.',
        'Thay 20-30% nước sạch đã khử Clo.',
        'Sử dụng Muối hột (1-2g / 1 lít nước) hoặc dung dịch trị nấm chuyên dụng Bio-Knock 2 / Methylene Blue.',
        'Bật sủi O2 mạnh vì nhiệt độ cao làm giảm lượng O2 hòa tan trong nước.',
      ],
      recommendedMeds: ['Bio-Knock 2', 'Muối hột sinh học', 'API White Spot Cure', 'Sưởi Inverter 30°C'],
    },
    {
      diseaseName: 'Bệnh Thối Vây & Rách Đuôi (Fin Rot / Tail Rot)',
      confidence: 92,
      severity: 'High',
      severityText: 'Nghiêm trọng - Nguy cơ ăn sâu vào thân cá',
      symptomsDetected: ['Rìa vây bị sờn, rách, hóa trắng hoặc đen mờ', 'Xuất huyết nhẹ mép đuôi'],
      cause: 'Vi khuẩn Pseudomonas / Aeromonas phát triển mạnh do chất lượng nước kém (Ammonia, Nitrite cao) hoặc cá cắn nhau.',
      treatmentSteps: [
        'Vệ sinh lọc, thay 30% nước ngay lập tức.',
        'Cách ly cá bị bệnh sang hồ dưỡng riêng (nếu có).',
        'Châm dung dịch dưỡng vây Bio-Knock 1 hoặc API Melafix theo đúng liều lượng.',
        'Bổ sung Vitamin C vào thức ăn để tăng đề kháng.',
      ],
      recommendedMeds: ['API Melafix', 'Bio-Knock 1', 'Tetra Japan Anti-Bacteria', 'Vitamin C trộn cám'],
    },
    {
      diseaseName: 'Bệnh Xù Vảy / Trướng Bụng (Dropsy)',
      confidence: 88,
      severity: 'Critical',
      severityText: 'Rất nguy hiểm - Cần cách ly ngay lập tức',
      symptomsDetected: ['Vảy dựng đứng như quả thông', 'Bụng sưng to, mắt hơi lồi'],
      cause: 'Suy gan/thận do nhiễm trùng vi khuẩn bên trong nội tạng.',
      treatmentSteps: [
        'Cách ly cá sang bể riêng 100%.',
        'Dùng Epsom Salt (muối Magie) liều 1g/L để giảm tích nước trong cơ thể.',
        'Đánh kháng sinh chuyên dụng Kanamycin hoặc Oxytetracycline.',
      ],
      recommendedMeds: ['Epsom Salt', 'Kanamycin', 'Seachem KanaPlex'],
    },
  ];

  const handleDiseaseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setDiseaseImage(url);
      runDiseaseScan();
    }
  };

  const runDiseaseScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setDiseaseResult(null);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          const selected = mockDiseaseDiagnoses[Math.floor(Math.random() * mockDiseaseDiagnoses.length)];
          setDiseaseResult(selected);
          return 100;
        }
        return prev + 12;
      });
    }, 200);
  };

  // --- 2. AI Species Identifier State ---
  const [speciesImage, setSpeciesImage] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [speciesResult, setSpeciesResult] = useState<any>(null);
  const speciesFileInputRef = useRef<HTMLInputElement>(null);

  const mockSpeciesData = [
    {
      name: 'Cá Neon Xanh (Paracheirodon innesi)',
      category: 'Cá Thủy Sinh (Tetra)',
      careDifficulty: 'Dễ nuôi',
      difficultyBadge: 'bg-emerald-100 text-emerald-800',
      description: 'Loài cá bầy đàn quốc dân nổi tiếng với vạch màu xanh neon dạ quang phát sáng rực rỡ dưới ánh đèn thủy sinh.',
      params: {
        ph: '6.0 - 7.2',
        temp: '22°C - 28°C',
        light: 'Vừa phải (Medium)',
        tankSize: 'Từ 30 Lít trở lên',
      },
      compatibleMates: ['Cá Chuột Panda', 'Cá Sọc Ngựa', 'Cá Trâm', 'Tép Cảnh Red Cherry', 'Cá Bống Vàng'],
      tips: 'Nên nuôi theo bầy từ 10-20 con trở lên để cá bơi đàn đẹp mắt và bớt nhút nhát.',
    },
    {
      name: 'Cây Rái Lá Nhỏ (Anubias nana nana)',
      category: 'Cây Thủy Sinh (Dễ trồng)',
      careDifficulty: 'Rất dễ',
      difficultyBadge: 'bg-emerald-100 text-emerald-800',
      description: 'Loài cây thủy sinh bán cạn có lá xanh đậm dai khỏe, không cần đất nền, thích hợp cột giá thể đá hoặc lũa.',
      params: {
        ph: '6.0 - 7.5',
        temp: '20°C - 30°C',
        light: 'Yếu - Vừa (Low to Medium)',
        co2: 'Không bắt buộc (Tốt hơn nếu có)',
      },
      compatibleMates: ['Thích hợp với mọi loại cá thủy sinh, cá Betta, tép cảnh, cá Đĩa'],
      tips: 'Không vùi gốc xuống phân nền vì sẽ làm thối củ. Dùng chỉ hoặc keo dán dán chặt vào lũa đá.',
    },
    {
      name: 'Cá Betta Halfmoon (Betta splendens)',
      category: 'Cá Xiêm / Cá Chọi',
      careDifficulty: 'Trung bình',
      difficultyBadge: 'bg-amber-100 text-amber-800',
      description: 'Dòng cá cảnh sở hữu bộ vây đuôi xòe rộng 180 độ như nửa vầng trăng quyến rũ.',
      params: {
        ph: '6.5 - 7.5',
        temp: '24°C - 30°C',
        light: 'Vừa phải',
        tankSize: 'Từ 10 Lít trở lên',
      },
      compatibleMates: ['Cá Chuột', 'Ốc Ngựa Vằn', 'Tép mũi đỏ (Hạn chế nuôi đực chung đực)'],
      tips: 'Tuyệt đối không nuôi 2 con cá Betta đực trong cùng một bể nhỏ.',
    },
  ];

  const handleSpeciesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSpeciesImage(url);
      setIsIdentifying(true);
      setTimeout(() => {
        setIsIdentifying(false);
        const selected = mockSpeciesData[Math.floor(Math.random() * mockSpeciesData.length)];
        setSpeciesResult(selected);
      }, 1800);
    }
  };

  // --- 3. Aquascape Style Generator State ---
  const [styleTankSize, setStyleTankSize] = useState('60');
  const [styleBudget, setStyleBudget] = useState('medium');
  const [generatedStyle, setGeneratedStyle] = useState<any>(null);

  const styleBlueprints: Record<string, any> = {
    Iwagumi: {
      title: 'Phong cách Iwagumi (Thạch Cảnh Nhật Bản)',
      tagline: 'Tối giản, thanh thoát & bình yên với bố cục đá chính phụ vàng',
      mainStones: 'Đá Seiryu / Đá Nâu Cổ Thạch / Đá Trầm Tích',
      plants: [
        'Tiền cảnh: Trải thảm Trân Châu Ngọc Trai (HC) hoặc Ngưu Mao Chiên Lùn Xòe',
        'Hậu cảnh: Cỏ Thìa, Tóc Tiên Thủy Sinh',
      ],
      description: 'Lấy cảm hứng từ nghệ thuật đá Nhật Bản với 1 đá chủ Oyaishi và các đá phụ Fubuki xung quanh thảm cỏ xanh mướt.',
      co2Need: 'Bắt buộc có CO2 (để thảm ngọc trai bò căng)',
      lightNeed: 'Ánh sáng mạnh (RGB Light)',
      careDifficulty: 'Trung bình - Cần cắt tỉa thảm cỏ 2 tuần/lần',
    },
    Dutch: {
      title: 'Phong cách Hà Lan (Dutch Style)',
      tagline: 'Vườn hoa dưới nước rực rỡ đầy màu sắc',
      mainStones: 'Gần như không dùng đá/lũa lớn. Tập trung hoàn toàn vào mật độ cây trồng',
      plants: [
        'Tiền cảnh: Rau Má Hương, Tiêu Thảo Lùn',
        'Trung cảnh: Tân Đế Tài Hồng, Diệp Tài Hồng Lá Táo, Vảy Ốc Xanh',
        'Hậu cảnh: Luân Thảo, Rái Cá, Huyết Tâm Lan (Cây đỏ nổi bật)',
      ],
      description: 'Sử dụng kỹ thuật sắp xếp tầng cây thủy sinh theo góc đường hà lan (Dutch Street), đan xen cây lá đỏ và lá xanh.',
      co2Need: 'Rất cao (Đảm bảo cây đỏ rực căng màu)',
      lightNeed: 'Rất mạnh (Đèn chuyên dụng châm màu)',
      careDifficulty: 'Cao - Cần châm phân nước NPK/Fe chuẩn xác',
    },
    Biotope: {
      title: 'Phong cách Biotope (Tự Nhiên Nguyên Sinh)',
      tagline: 'Mô phỏng chân thực hệ sinh thái sông suối Amazon / Nam Mỹ',
      mainStones: 'Lũa Đỗ Quyên, Lũa Linh Nam, Cát Vàng Nắng, Lá Bàng Khô',
      plants: [
        'Cây không đòi hỏi cao: Ráy Anubias, Dương Xỉ Thủy Sinh, Bèo Nhật',
      ],
      description: 'Tạo dòng nước ấm màu trà tự nhiên từ lá bàng và nhánh lũa, nuôi các loài cá bầy Amazon như cá Đĩa, cá Altum, cá Neon.',
      co2Need: 'Không bắt buộc',
      lightNeed: 'Êm dịu (Warm Light)',
      careDifficulty: 'Rất dễ - Ít bảo trì, tự nhiên tuyệt đối',
    },
    Jungle: {
      title: 'Phong cách Jungle (Rừng Rậm Hoang Sơ)',
      tagline: 'Hệ sinh thái bạt ngàn hoang dã',
      mainStones: 'Lũa Rễ Cổ Thụ + Đá Nâu',
      plants: [
        'Dương xỉ Mỹ Nhân, Ráy Nana, Rêu Java, Cỏ Thìa, Cây Lưỡi Mác',
      ],
      description: 'Kết hợp tầng lá rậm rạp của rêu và dương xỉ phủ kín lũa rễ, tạo không gian ẩn nấp lý tưởng cho sinh vật.',
      co2Need: 'Trung bình',
      lightNeed: 'Vừa phải',
      careDifficulty: 'Dễ - Càng mọc tự nhiên càng đẹp',
    },
  };

  const handleGenerateStyle = () => {
    let key = 'Iwagumi';
    if (styleBudget === 'low') key = 'Biotope';
    else if (styleBudget === 'medium') key = styleTankSize === '30' ? 'Iwagumi' : 'Jungle';
    else key = 'Dutch';

    setGeneratedStyle(styleBlueprints[key]);
  };

  const cardBgClass = isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-blue-100 text-slate-900';
  const inputBgClass = isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-blue-200 text-slate-800';

  return (
    <div className="space-y-4">
      
      {/* Sub-Tab Header */}
      <div className={`border rounded-2xl p-1.5 shadow-sm flex flex-wrap gap-1.5 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-100'}`}>
        <button
          onClick={() => setActiveSubTab('scanner')}
          className={`flex-1 min-w-[150px] py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'scanner'
              ? 'bg-[#1A94FF] text-white shadow-sm'
              : isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>AI Chẩn Đoán Bệnh Cá</span>
        </button>

        <button
          onClick={() => setActiveSubTab('identifier')}
          className={`flex-1 min-w-[150px] py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'identifier'
              ? 'bg-[#1A94FF] text-white shadow-sm'
              : isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>AI Nhận Diện Cá & Cây</span>
        </button>

        <button
          onClick={() => setActiveSubTab('generator')}
          className={`flex-1 min-w-[150px] py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'generator'
              ? 'bg-[#1A94FF] text-white shadow-sm'
              : isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Gợi Ý Phong Cách Thủy Sinh</span>
        </button>
      </div>

      {/* SECTION 1: AI FISH DISEASE SCANNER */}
      {activeSubTab === 'scanner' && (
        <div className={`${cardBgClass} border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4`}>
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-bold mb-1">
              <Sparkles className="w-3 h-3 text-rose-500" /> AI Vision Diagnostics
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">AI Chẩn Đoán Bệnh Cá Qua Hình Ảnh</h2>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tải ảnh vùng bị tổn thương trên cá để AI phân tích triệu chứng & phác đồ điều trị</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-5 space-y-3">
              <input
                type="file"
                ref={diseaseFileInputRef}
                onChange={handleDiseaseUpload}
                accept="image/*"
                className="hidden"
              />
              
              <div 
                onClick={() => diseaseFileInputRef.current?.click()}
                className={`border-2 border-dashed ${isDarkMode ? 'border-slate-700 bg-slate-800/40 hover:bg-slate-800' : 'border-blue-200 bg-blue-50/40 hover:bg-blue-50'} rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[170px] relative overflow-hidden group`}
              >
                {diseaseImage ? (
                  <div className="w-full h-36 relative rounded-xl overflow-hidden shadow-inner">
                    <img src={diseaseImage} alt="Fish disease preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-2">
                      <Upload className="w-4 h-4" /> Thay đổi ảnh khác
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-white text-[#1A94FF] shadow-sm flex items-center justify-center mx-auto border border-blue-100">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Bấm vào đây để tải ảnh cá bị bệnh</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Hỗ trợ JPG, PNG, WEBP</p>
                    </div>
                  </div>
                )}
              </div>

              {diseaseImage && (
                <button
                  onClick={runDiseaseScan}
                  disabled={isScanning}
                  className="w-full py-2.5 bg-[#1A94FF] hover:bg-[#0D5CB6] text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  {isScanning ? 'AI Đang Quét Triệu Chứng...' : 'Quét Lại Hình Ảnh'}
                </button>
              )}
            </div>

            <div className="lg:col-span-7">
              {isScanning && (
                <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 border-blue-200'} border rounded-2xl p-6 space-y-4 text-center flex flex-col items-center justify-center min-h-[200px]`}>
                  <div className="w-10 h-10 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-cyan-700">AI Đang Phân Tích...</h3>
                    <p className="text-xs text-slate-500">Đang đối chiếu triệu chứng với kho dữ liệu AquaHub.</p>
                  </div>
                  <div className="w-full max-w-xs bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                  </div>
                </div>
              )}

              {!isScanning && diseaseResult && (
                <div className={`rounded-2xl p-4 space-y-3 border ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-800 text-white shadow-md'
                    : 'bg-white border-blue-200 text-slate-900 shadow-sm'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider">Kết Quả Chẩn Đoán AI</span>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">{diseaseResult.diseaseName}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Độ tin cậy</span>
                      <span className="text-sm font-black text-emerald-600">{diseaseResult.confidence}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/50">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <div className="text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Mức độ nguy hiểm: </span>
                      <strong className="text-amber-800 dark:text-amber-300 font-bold">{diseaseResult.severityText}</strong>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-200">🔍 Triệu chứng AI phát hiện:</div>
                    <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-0.5 pl-1 font-medium">
                      {diseaseResult.symptomsDetected.map((sym: string, idx: number) => (
                        <li key={idx}>{sym}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Phác đồ điều trị đề xuất:
                    </div>
                    <ol className="list-decimal list-inside text-slate-700 dark:text-slate-300 space-y-0.5 pl-1 leading-snug font-medium">
                      {diseaseResult.treatmentSteps.map((step: string, idx: number) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl space-y-1 border border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-bold text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      Loại thuốc khuyên dùng:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {diseaseResult.recommendedMeds.map((med: string, idx: number) => (
                        <span key={idx} className="bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-800 text-cyan-900 dark:text-cyan-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {med}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!isScanning && !diseaseResult && (
                <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-400'} border border-dashed rounded-2xl p-6 text-center space-y-2 flex flex-col items-center justify-center min-h-[200px]`}>
                  <Stethoscope className="w-8 h-8 text-slate-300" />
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tải ảnh cá bị bệnh để nhận phân tích chẩn đoán AI</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: AI SPECIES IDENTIFIER */}
      {activeSubTab === 'identifier' && (
        <div className={`${cardBgClass} border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4`}>
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-600 text-[10px] font-bold mb-1">
              <Sparkles className="w-3 h-3 text-indigo-500" /> Species Identifier
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">AI Nhận Diện Sinh Vật & Cây Thủy Sinh</h2>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tải ảnh cá, tép hoặc cây thủy sinh để xem thông số môi trường chuẩn</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-5 space-y-3">
              <input
                type="file"
                ref={speciesFileInputRef}
                onChange={handleSpeciesUpload}
                accept="image/*"
                className="hidden"
              />

              <div 
                onClick={() => speciesFileInputRef.current?.click()}
                className={`border-2 border-dashed ${isDarkMode ? 'border-slate-700 bg-slate-800/40 hover:bg-slate-800' : 'border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50'} rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[170px] relative overflow-hidden group`}
              >
                {speciesImage ? (
                  <div className="w-full h-36 relative rounded-xl overflow-hidden shadow-inner">
                    <img src={speciesImage} alt="Species preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-white text-indigo-600 shadow-sm flex items-center justify-center mx-auto border border-indigo-100">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Tải ảnh Cá / Cây Thủy Sinh</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Tự động phân tích giống loài</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-7">
              {isIdentifying && (
                <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 border-indigo-200'} border rounded-2xl p-6 space-y-3 text-center flex flex-col items-center justify-center min-h-[180px]`}>
                  <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin" />
                  <p className="text-xs font-bold text-indigo-800">Đang đối chiếu cơ sở dữ liệu AquaHub...</p>
                </div>
              )}

              {!isIdentifying && speciesResult && (
                <div className={`rounded-2xl p-4 space-y-3 border ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-800 text-white shadow-md'
                    : 'bg-white border-indigo-200 text-slate-900 shadow-sm'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{speciesResult.category}</span>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{speciesResult.name}</h3>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${speciesResult.difficultyBadge}`}>
                      {speciesResult.careDifficulty}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{speciesResult.description}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold mb-0.5">
                        <Droplets className="w-3 h-3 text-blue-600" /> pH
                      </div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">{speciesResult.params.ph}</div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold mb-0.5">
                        <Thermometer className="w-3 h-3 text-amber-600" /> Nhiệt độ
                      </div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">{speciesResult.params.temp}</div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold mb-0.5">
                        <Sun className="w-3 h-3 text-yellow-600" /> Ánh sáng
                      </div>
                      <div className="text-[11px] font-extrabold text-slate-900 dark:text-white">{speciesResult.params.light}</div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold mb-0.5">
                        <Leaf className="w-3 h-3 text-emerald-600" /> CO2
                      </div>
                      <div className="text-[11px] font-extrabold text-slate-900 dark:text-white">{speciesResult.params.co2 || speciesResult.params.tankSize}</div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-200">🐟 Có thể nuôi chung:</div>
                    <div className="flex flex-wrap gap-1">
                      {speciesResult.compatibleMates.map((mate: string, idx: number) => (
                        <span key={idx} className="bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          {mate}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!isIdentifying && !speciesResult && (
                <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-400'} border border-dashed rounded-2xl p-6 text-center space-y-2 flex flex-col items-center justify-center min-h-[180px]`}>
                  <Search className="w-8 h-8 text-slate-300" />
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tải ảnh để nhận diện giống loài & môi trường sống</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: AQUASCAPE STYLE GENERATOR */}
      {activeSubTab === 'generator' && (
        <div className={`${cardBgClass} border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4`}>
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold mb-1">
              <Sparkles className="w-3 h-3 text-emerald-500" /> Aquascape Style Advisor
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Gợi Ý Phong Cách Thủy Sinh</h2>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Nhập kích thước bể & ngân sách để tạo bố cục phù hợp</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-5 space-y-3">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Chiều dài bể mong muốn (cm)</label>
                <select
                  value={styleTankSize}
                  onChange={(e) => setStyleTankSize(e.target.value)}
                  className={`w-full ${inputBgClass} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#1A94FF]`}
                >
                  <option value="30">Bể Nano 30cm (Bàn làm việc)</option>
                  <option value="60">Bể Tiêu Chuẩn 60cm (Kích thước vàng)</option>
                  <option value="90">Bể Trung 90cm (Bố cục hùng vĩ)</option>
                  <option value="120">Bể Lớn 120cm (Đỉnh cao thủy sinh)</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Mức ngân sách đầu tư</label>
                <select
                  value={styleBudget}
                  onChange={(e) => setStyleBudget(e.target.value)}
                  className={`w-full ${inputBgClass} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#1A94FF]`}
                >
                  <option value="low">Tiết kiệm (Dưới 2 triệu)</option>
                  <option value="medium">Tiêu chuẩn (2 - 5 triệu)</option>
                  <option value="high">High-End (Trên 5 triệu)</option>
                </select>
              </div>

              <button
                onClick={handleGenerateStyle}
                className="w-full py-2.5 bg-[#1A94FF] hover:bg-[#0D5CB6] text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Tạo Bố Cục Thủy Sinh Gợi Ý
              </button>
            </div>

            <div className="lg:col-span-7">
              {generatedStyle ? (
                <div className={`rounded-2xl p-4 space-y-3 border ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-800 text-white shadow-md'
                    : 'bg-white border-emerald-200 text-slate-900 shadow-sm'
                }`}>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Bố Cục Đề Xuất</span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{generatedStyle.title}</h3>
                    <p className="text-xs text-slate-500 italic mt-0.5 font-medium">{generatedStyle.tagline}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-bold block mb-0.5">🪨 Hardscape (Đá / Lũa):</span>
                      <strong className="text-cyan-700 dark:text-cyan-400">{generatedStyle.mainStones}</strong>
                    </div>

                    <div>
                      <span className="text-slate-500 font-bold block mb-0.5">🌱 Cây khuyên trồng:</span>
                      <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-0.5 pl-1 font-medium">
                        {generatedStyle.plants.map((p: string, idx: number) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-center">
                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">CO2</span>
                      <strong className="text-cyan-800 dark:text-cyan-300 text-xs font-bold">{generatedStyle.co2Need}</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Ánh sáng</span>
                      <strong className="text-amber-800 dark:text-amber-300 text-xs font-bold">{generatedStyle.lightNeed}</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Độ chăm sóc</span>
                      <strong className="text-emerald-800 dark:text-emerald-300 text-xs font-bold">{generatedStyle.careDifficulty}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-400'} border border-dashed rounded-2xl p-6 text-center space-y-2 flex flex-col items-center justify-center min-h-[180px]`}>
                  <Compass className="w-8 h-8 text-slate-300" />
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Bấm nút "Tạo Bố Cục Thủy Sinh" để xem gợi ý phù hợp nhất</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
