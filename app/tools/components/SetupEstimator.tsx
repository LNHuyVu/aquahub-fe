'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles, 
  ExternalLink, 
  RefreshCw, 
  Calculator, 
  Copy, 
  Search, 
  X, 
  CheckCircle2, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  FileText
} from 'lucide-react';
import Link from 'next/link';

export interface PresetItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  desc: string;
  enabled: boolean;
}

export interface CustomItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

interface SetupEstimatorProps {
  isDarkMode?: boolean;
}

// Catalog of quick-add accessories for aquarists in Vietnam
const accessoryCatalog = [
  // 💡 Đèn
  { name: 'Đèn LED kẹp mánh Mini 5W', category: 'Đèn', price: 45000, desc: 'Ánh sáng trắng đủ chiếu sáng nhẹ' },
  { name: 'Đèn LED Máng Kaokui 60cm', category: 'Đèn', price: 150000, desc: 'Đèn LED thủy sinh phổ thông' },
  { name: 'Đèn Chihiros A2 601 RGB App', category: 'Đèn RGB', price: 1250000, desc: 'Điều chỉnh ánh sáng qua app điện thoại' },
  { name: 'Đèn Week Aqua Titan L600 RGB', category: 'Đèn RGB', price: 1650000, desc: 'Quang phổ full sắc màu châm lá đỏ' },
  { name: 'Đèn Chihiros WRGB 2 Slim 60cm', category: 'Đèn Cao Cấp', price: 2900000, desc: 'Châm màu cây lá cực tốt' },
  // 🌊 Lọc
  { name: 'Lọc treo Sobbo SH-280 tích hợp váng', category: 'Máy Lọc', price: 110000, desc: 'Lọc thác nhỏ gọn tiết kiệm điện' },
  { name: 'Lọc thùng Sunsun HW-702A (800L/h)', category: 'Máy Lọc', price: 450000, desc: 'Lọc ngoài công suất 800L/h' },
  { name: 'Lọc thùng Atman DF-700', category: 'Máy Lọc Thùng', price: 780000, desc: 'Bơm êm ái, thể tích chứa 4L' },
  { name: 'Lọc Inox 304 phi 168mm + Bơm Sicce', category: 'Máy Lọc Inox', price: 2400000, desc: 'Lọc inox vĩnh cửu không rỉ' },
  { name: 'Máy lọc váng Sunsun JY-03', category: 'Máy Lọc Váng', price: 85000, desc: 'Hút sạch váng dầu bề mặt nước' },
  { name: 'Bơm tạo luồng Sobbo 3W', category: 'Máy Bơm', price: 95000, desc: 'Tạo dòng luân chuyển nước trong bể' },
  // 🫧 CO2 & Sủi
  { name: 'Bộ bình CO2 nhôm 1L van điện Mufan', category: 'Hệ Thống CO2', price: 450000, desc: 'Bình CO2 van hẹn giờ tự động' },
  { name: 'Bộ bình CO2 thép 2kg van điện Mufan', category: 'Hệ Thống CO2', price: 840000, desc: 'Van điện tự ngắt đêm theo hẹn giờ' },
  { name: 'Bộ trộn CO2 cánh quạt chìm', category: 'Hệ Thống CO2', price: 140000, desc: 'Hòa tan 100% khí CO2 vào nước' },
  { name: 'Máy sủi Oxy 2 vòi siêu êm Gex', category: 'Máy Sủi', price: 120000, desc: 'Cung cấp oxy cho cá sinh sống' },
  { name: 'Quạt tản nhiệt làm mát nước 2 quạt', category: 'Quạt Làm Mát', price: 180000, desc: 'Giảm 2-3 độ C mùa hè' },
  // 🌿 Phân nền & VL Lọc
  { name: 'Phân nền Master Soil 9L', category: 'Phân Nền', price: 480000, desc: 'Nhập khẩu cao cấp dưỡng chất bền' },
  { name: 'Phân nền Gex Xanh 8L', category: 'Phân Nền', price: 350000, desc: 'Túi 8L đủ dải nền bể 60cm' },
  { name: 'Phân nền ADA Amazonia Ver.2 9L', category: 'Phân Nền Nhật', price: 950000, desc: 'Chuẩn phân nền nghệ thuật Nhật Bản' },
  { name: 'Vật liệu lọc Seachem Matrix 1L', category: 'Vật Liệu Lọc', price: 230000, desc: 'Trú ẩn vi sinh xốp cao cấp' },
  { name: 'Đá nham thạch đỏ dải nền 3kg', category: 'Nền Thô', price: 60000, desc: 'Tạo độ thoáng cho bộ nền' },
  { name: 'Cát nắng vàng dải bể 5kg', category: 'Cát Nền', price: 75000, desc: 'Tạo thảm cát tự nhiên' },
  // ❄️ Sưởi & Điện
  { name: 'Máy sưởi Inverter chống nổ 100W', category: 'Sưởi Nước', price: 165000, desc: 'Giữ nhiệt độ ổn định mùa đông' },
  { name: 'Ổ cắm hẹn giờ điện tử Timer', category: 'Thiết Bị Điện', price: 110000, desc: 'Tự động bật/tắt đèn & CO2' },
  { name: 'Đèn UVC tiệt trùng diệt rêu hại 7W', category: 'Diệt Rêu UV', price: 135000, desc: 'Xử lý nước xanh & rêu hại' },
  // 🧪 Vệ sinh & Hóa chất
  { name: 'Men vi sinh ExtraBio 500ml', category: 'Vi Sinh', price: 95000, desc: 'Làm trong nước & khử mùi hôi' },
  { name: 'Khử clo Seachem Prime 100ml', category: 'Khử Clo', price: 180000, desc: 'Khử clo & kim loại nặng cấp tốc' },
  { name: 'Bộ kéo tỉa & nhíp gắp Inox (3 món)', category: 'Dụng Cụ', price: 150000, desc: 'Chăm sóc cây thủy sinh chuyên nghiệp' },
  { name: 'Dụng cụ cạo rêu cán dài Inox', category: 'Dụng Cụ', price: 90000, desc: 'Vệ sinh mặt kính bể sạch bóng' },
  // 🪨 Trang trí
  { name: 'Set Đá Seiryu chọn lọc (10kg)', category: 'Hardscape', price: 250000, desc: 'Đá vân xám xếp layout núi' },
  { name: 'Combo Lũa Đỗ Quyên / Linh Sam 60cm', category: 'Lũa Thủy Sinh', price: 350000, desc: 'Lũa nghệ thuật tự nhiên' },
  { name: 'Set Cá Neon Xanh (15 con)', category: 'Sinh Vật', price: 90000, desc: 'Cá đàn bơi đẹp mắt' },
  { name: 'Set Tép Red Cherry (10 con)', category: 'Sinh Vật', price: 50000, desc: 'Tép dọn rêu ăn tạp' },
];

const defaultPresetPackages: Record<string, Record<string, { totalEst: number; items: { name: string; category: string; price: number; desc: string }[] }>> = {
  '30': {
    ultrabudget: {
      totalEst: 390000,
      items: [
        { name: 'Bể kính thường 30x18x20cm (4mm)', category: 'Bể Kính', price: 90000, desc: 'Bể kính thường dán thủ công siêu rẻ' },
        { name: 'Đèn LED kẹp mánh mini 5W', category: 'Đèn', price: 45000, desc: 'Ánh sáng trắng đủ chiếu sáng nhẹ' },
        { name: 'Lọc thác Sobbo WP-606H / RS', category: 'Máy Lọc', price: 65000, desc: 'Lọc treo nhỏ gọn tiết kiệm điện' },
        { name: 'Cát thạch anh / Sỏi dải nền (2kg)', category: 'Nền Thô', price: 40000, desc: 'Nền thô đơn giản không làm đục nước' },
        { name: 'Vật liệu lọc sứ lọc bông + Men vi sinh gói', category: 'Vật Liệu Lọc', price: 50000, desc: 'Tạo vi sinh cơ bản' },
        { name: 'Cây giả / Rêu Java + Cá bảy màu (5 con)', category: 'Sinh Vật', price: 100000, desc: 'Dễ chăm sóc không cần CO2' },
      ],
    },
    budget: {
      totalEst: 650000,
      items: [
        { name: 'Bể kính siêu trong 30x18x20cm (5mm)', category: 'Bể Kính', price: 180000, desc: 'Kính mài viền vi sinh xinh xắn' },
        { name: 'Đèn LED kẹp mánh LED-30 (White/Blue)', category: 'Đèn', price: 90000, desc: 'Đủ độ sáng cho ráy và rêu' },
        { name: 'Lọc treo Sobbo SH-280', category: 'Máy Lọc', price: 110000, desc: 'Lọc thác nhỏ gọn tích hợp lọc váng' },
        { name: 'Phân nền Gex Đỏ 2kg', category: 'Phân Nền', price: 120000, desc: 'Nền công nghiệp sạch nước' },
        { name: 'Vật liệu lọc Matrix (200g) + Vi sinh', category: 'Vật Liệu Lọc', price: 80000, desc: 'Trông vi sinh khởi tạo' },
        { name: 'Cây & Tép rái nana (Set mầm)', category: 'Cây & Sinh Vật', price: 70000, desc: 'Cây ráy nana kẹp đá' },
      ],
    },
    standard: {
      totalEst: 1650000,
      items: [
        { name: 'Bể kính siêu trong Đúc viền 30x30x30cm (5mm)', category: 'Bể Kính', price: 320000, desc: 'Kính siêu trong đúc vuông vắn' },
        { name: 'Đèn Chihiros C2 RGB / Netlea AT3', category: 'Đèn RGB', price: 580000, desc: 'Đèn chuyên dụng châm màu cây' },
        { name: 'Lọc thùng mini Sunsun HW-603B', category: 'Máy Lọc', price: 340000, desc: 'Lọc thùng ngoài thẩm mỹ cao' },
        { name: 'Phân nền Master Soil 3L', category: 'Phân Nền', price: 210000, desc: 'Ổn định pH 6.5 lý tưởng' },
        { name: 'Vật liệu lọc Seachem Matrix 0.5L', category: 'Vật Liệu Lọc', price: 120000, desc: 'Nhà cho vi sinh cư trú' },
        { name: 'Cá Neon + Tép Red Cherry + Cây thảm', category: 'Cây & Cá', price: 80000, desc: '10 cá neon + 5 tép đỏ' },
      ],
    },
    highend: {
      totalEst: 3400000,
      items: [
        { name: 'Bể ADA Cube Garden 30x30x30cm Super Clear', category: 'Bể Kính Premium', price: 850000, desc: 'Kính siêu trong cao cấp mài keo mỏng' },
        { name: 'Đèn Week Aqua T90 Pro RGB-UV', category: 'Đèn Cao Cấp', price: 1250000, desc: 'Đèn điều chỉnh app Bluetooth' },
        { name: 'Lọc Inox 304 Khung Chữ Nhật + Bơm Sicce', category: 'Máy Lọc Inox', price: 850000, desc: 'Lọc inox xịn sò thẩm mỹ' },
        { name: 'Bộ bình CO2 nhôm 1L van điện Mufan', category: 'Hệ Thống CO2', price: 450000, desc: 'Bình CO2 van hẹn giờ tự động' },
      ],
    },
  },
  '60': {
    ultrabudget: {
      totalEst: 950000,
      items: [
        { name: 'Bể kính thường 60x30x36cm (5mm)', category: 'Bể Kính', price: 250000, desc: 'Kính Việt Nhật thường mài mỏng' },
        { name: 'Đèn LED máng Kaokui KK-60cm (Led trắng)', category: 'Đèn', price: 150000, desc: 'Đèn LED thủy sinh phổ thông' },
        { name: 'Lọc treo đôi Sobbo / RS 608H', category: 'Máy Lọc', price: 180000, desc: 'Lọc thác công suất 500L/h' },
        { name: 'Phân nền sông / Nền trộn 5kg', category: 'Phân Nền', price: 120000, desc: 'Nền phù hợp nuôi cá & rêu dễ' },
        { name: 'Vật liệu lọc sứ xốp + Đá nham thạch thô', category: 'Vật Liệu Lọc', price: 100000, desc: 'Vật liệu lọc giá rẻ hiệu quả' },
        { name: 'Cá Trâm / Bảy Màu + Cây dễ trồng (Rong/Ráy)', category: 'Sinh Vật', price: 150000, desc: 'Set cá và cây thủy sinh dễ sống' },
      ],
    },
    budget: {
      totalEst: 1850000,
      items: [
        { name: 'Bể kính siêu trong 60x30x36cm (8mm)', category: 'Bể Kính', price: 550000, desc: 'Kính siêu trong mài viền sắc nét' },
        { name: 'Đèn LED Máng Kaokui / Odyssea 60cm', category: 'Đèn', price: 320000, desc: 'Đèn LED trắng ấm hoặc RGB cơ bản' },
        { name: 'Lọc thùng Sunsun HW-702A / Sobbo 808', category: 'Máy Lọc', price: 450000, desc: 'Lọc ngoài công suất 800L/h' },
        { name: 'Phân nền Gex Xanh / Control Soil 8L', category: 'Phân Nền', price: 350000, desc: 'Túi 8L đủ dải nền dày 5cm' },
        { name: 'Vật liệu lọc Đá Nham Thạch + Matrix', category: 'Vật Liệu Lọc', price: 180000, desc: 'Sứ lọc vi sinh và đá nham thạch' },
      ],
    },
    standard: {
      totalEst: 4200000,
      items: [
        { name: 'Bể kính siêu trong 60x40x40cm Siêu Trong (8mm)', category: 'Bể Kính', price: 850000, desc: 'Tỉ lệ chuẩn thủy sinh chuyên nghiệp' },
        { name: 'Đèn Chihiros A2 601 / Week Aqua Aqua 60cm', category: 'Đèn Chuyên Dụng', price: 1250000, desc: 'Điều chỉnh ánh sáng qua app điện thoại' },
        { name: 'Lọc thùng Atman DF-700 / Sunsun 703A', category: 'Máy Lọc Thùng', price: 780000, desc: 'Bơm êm ái, thể tích chứa 4L' },
        { name: 'Phân nền Master Soil / Tropica Soil 9L', category: 'Phân Nền', price: 480000, desc: 'Nhập khẩu cao cấp dưỡng chất bền' },
        { name: 'Hệ thống CO2 bình thép 2kg van điện Mufan', category: 'Hệ Thống CO2', price: 840000, desc: 'Van điện tự ngắt đêm theo hẹn giờ' },
      ],
    },
    highend: {
      totalEst: 8900000,
      items: [
        { name: 'Bể kính siêu trong 60x40x40 (10mm) Keo đen giấu keo', category: 'Bể Cao Cấp', price: 1400000, desc: 'Đường keo mỏng như không có' },
        { name: 'Đèn Chihiros WRGB 2 Slim / Week Titan 60cm', category: 'Đèn Đỉnh Cao', price: 2900000, desc: 'Quang phổ RGB châm màu lá đỏ rực' },
        { name: 'Lọc Inox 304 đường kính 168mm + Bơm Sicce Syncra', category: 'Máy Lọc Inox', price: 2400000, desc: 'Lọc inox vĩnh cửu không rỉ' },
        { name: 'Phân nền ADA Amazonia Ver.2 9L', category: 'Phân Nền Nhật', price: 950000, desc: 'Chuẩn phân nền nghệ thuật Nhật Bản' },
        { name: 'Bình CO2 nhôm 3L van điện điện từ SMC Nhật', category: 'Hệ Thống CO2', price: 1250000, desc: 'Chống rò rỉ khí an toàn' },
      ],
    },
  },
  '90': {
    ultrabudget: {
      totalEst: 2300000,
      items: [
        { name: 'Bể kính thường 90x45x45cm (8mm)', category: 'Bể Kính', price: 850000, desc: 'Bể lớn kính Việt Nhật thường' },
        { name: 'Đèn LED máng nhôm 90cm 30W', category: 'Đèn', price: 350000, desc: 'Chiếu sáng phủ diện tích 90cm' },
        { name: 'Lọc tràn trên 5 ngăn 90cm + Bơm 1200L/h', category: 'Máy Lọc', price: 450000, desc: 'Lọc tràn trên dung tích lớn giá rẻ' },
        { name: 'Cát nắng vàng / Phân nền trộn 12L', category: 'Nền & Cát', price: 350000, desc: 'Phù hợp làm bể biotope / nuôi cá' },
        { name: 'Vật liệu lọc nham thạch + Sứ củ sắn 3kg', category: 'Vật Liệu Lọc', price: 300000, desc: 'Lọc vi sinh bền bỉ' },
      ],
    },
    budget: {
      totalEst: 4500000,
      items: [
        { name: 'Bể kính siêu trong 90x45x45cm (10mm)', category: 'Bể Kính', price: 1600000, desc: 'Bể lớn không giằng sang trọng' },
        { name: 'Đèn LED Máng Odyssea T5HO / Kaokui 90cm', category: 'Đèn', price: 750000, desc: 'Máng 90cm phù hợp chiều dài' },
        { name: 'Lọc thùng Sunsun HW-704A (1400L/h)', category: 'Máy Lọc', price: 950000, desc: 'Lọc công suất lớn cho bể 180L' },
        { name: 'Phân nền Gex Xanh 16L (2 túi 8L)', category: 'Phân Nền', price: 700000, desc: 'Độ phủ rộng 90cm' },
        { name: 'Vật liệu lọc + Đá lũa trang trí', category: 'Trang Trí', price: 500000, desc: 'Đá Seiryu & Lũa cổ thạch' },
      ],
    },
    standard: {
      totalEst: 8800000,
      items: [
        { name: 'Bể kính siêu trong 90x45x45cm (10mm) Kính Việt Nhật', category: 'Bể Kính', price: 1950000, desc: 'Mài viền kim cương' },
        { name: 'Đèn Week Aqua Titan / Chihiros WRGB 2 90cm', category: 'Đèn RGB App', price: 3400000, desc: 'Quang phổ full sắc màu' },
        { name: 'Lọc thùng Atman DF-1300 / Sunsun 704B UV', category: 'Máy Lọc', price: 1450000, desc: 'Tích hợp đèn tiệt trùng UVC' },
        { name: 'Bộ bình CO2 3kg van điện hẹn giờ', category: 'Hệ Thống CO2', price: 950000, desc: 'Có đếm giọt + trộn CO2 mượt' },
        { name: 'Phân nền Master Soil 18L', category: 'Phân Nền', price: 1050000, desc: 'Nền dinh dưỡng cao' },
      ],
    },
    highend: {
      totalEst: 17500000,
      items: [
        { name: 'Bể kính siêu trong 90x45x45 (12mm) Siêu trong Mỹ', category: 'Bể Đỉnh Cao', price: 3200000, desc: 'Kính siêu trong dầy dặn an toàn tuyệt đối' },
        { name: 'Đèn Chihiros WRGB 2 PRO 90cm', category: 'Đèn Chihiros Pro', price: 5800000, desc: 'Công suất khủng 110W RGB' },
        { name: 'Lọc Inox 304 phi 219mm + Lọc phụ + Bơm Sicce 2.0', category: 'Lọc Inox Đôi', price: 4200000, desc: 'Lọc đôi khủng siêu trong nước' },
        { name: 'Chân tủ gỗ sồi tự nhiên chống ẩm', category: 'Chân Tụ Hồ', price: 2800000, desc: 'Tủ giấu dây điện gọn gàng' },
        { name: 'Phân nền ADA Amazonia Ver.2 (18L)', category: 'Phân Nền ADA', price: 1500000, desc: 'Nền chuẩn nghệ nhân' },
      ],
    },
  },
  '120': {
    ultrabudget: {
      totalEst: 4200000,
      items: [
        { name: 'Bể kính thường 120x50x50cm (10mm giằng kính)', category: 'Bể Kính', price: 1600000, desc: 'Bể kính lớn gia cố giằng chắc chắn' },
        { name: 'Đèn LED máng Odyssea Slim 120cm', category: 'Đèn', price: 650000, desc: 'Máng LED dài đủ phủ bể 1m2' },
        { name: 'Lọc tràn trên kính 4 ngăn 1m2 + Bơm 2500L/h', category: 'Máy Lọc', price: 750000, desc: 'Hệ lọc tràn trên xử lý nước bể lớn' },
        { name: 'Cát thạch anh / Phân nền trộn 20L', category: 'Nền', price: 500000, desc: 'Nền thô phủ diện tích rộng' },
        { name: 'Chân khung sắt hộp 4x4 sơn chống rỉ', category: 'Chân Khung', price: 700000, desc: 'Chịu tải an toàn cho bể lớn' },
      ],
    },
    budget: {
      totalEst: 7800000,
      items: [
        { name: 'Bể kính siêu trong 120x50x50cm (12mm)', category: 'Bể Kính', price: 2800000, desc: 'Bể đại diện phòng khách' },
        { name: 'Đèn LED Máng 120cm Odyssea / T5HO', category: 'Đèn', price: 1200000, desc: 'Đủ sáng bể dài 1m2' },
        { name: 'Lọc thùng Sunsun 704A + Lọc phụ HW-604', category: 'Máy Lọc Đôi', price: 1500000, desc: 'Dung tích chứa lọc 10L' },
        { name: 'Phân nền Gex Xanh 24L', category: 'Phân Nền', price: 1050000, desc: 'Túi 3 x 8L' },
        { name: 'Đá lũa + Vật liệu lọc', category: 'Vật Liệu', price: 1250000, desc: 'Set đá xanh hoặc lũa đỗ quyên lớn' },
      ],
    },
    standard: {
      totalEst: 14500000,
      items: [
        { name: 'Bể kính siêu trong 120x50x50cm (12mm) Chuẩn Thủy Sinh', category: 'Bể Kính', price: 3400000, desc: 'Đúc mài siêu đẹp' },
        { name: 'Đèn Week Aqua Titan L1200 / Chihiros WRGB 2 120cm', category: 'Đèn RGB App', price: 4800000, desc: 'Điều chỉnh từng dải màu' },
        { name: 'Lọc thùng Atman AT-3338S / Sunsun 304B', category: 'Máy Lọc', price: 2200000, desc: 'Lưu lượng 1800L/h' },
        { name: 'Bộ bình CO2 4kg Van Điện Mufan', category: 'CO2 System', price: 1100000, desc: 'Chạy thoải mái 6 tháng/lần nạp' },
        { name: 'Phân nền Tropica / Master Soil 27L', category: 'Phân Nền', price: 1600000, desc: 'Nền dinh dưỡng bền 2 năm' },
        { name: 'Chân tủ khung sắt sơn tĩnh điện bọc gỗ Mdf', category: 'Chân Tủ', price: 1400000, desc: 'Chịu tải 500kg' },
      ],
    },
    highend: {
      totalEst: 28500000,
      items: [
        { name: 'Bể ADA Super Clear Glass 120x50x50cm (12mm)', category: 'Bể Đỉnh Cao', price: 5800000, desc: 'Nhập khẩu mài viền cao cấp nhất' },
        { name: 'Đèn Chihiros WRGB 2 PRO 120cm (2 Đèn Twin)', category: 'Bộ Đèn Dual', price: 9800000, desc: 'Hệ thống đèn kép bao phủ tuyệt đối' },
        { name: 'Lọc Inox 304 phi 250mm + Bơm Sicce Syncra 3.0', category: 'Hệ Thống Lọc Khủng', price: 5500000, desc: 'Lọc tuần hoàn vô địch' },
        { name: 'Bộ tủ gỗ Sồi tự nhiên thiết kế ADA style', category: 'Chân Tủ Luxury', price: 4200000, desc: 'Phong cách tối giản giấu phụ kiện' },
        { name: 'Phân nền ADA Amazonia 27L + Nền lót Power Sand', category: 'Full Set Nền ADA', price: 3200000, desc: 'Nền lót đáy chuyên nghiệp' },
      ],
    },
  },
};

export default function SetupEstimator({ isDarkMode = false }: SetupEstimatorProps) {
  const [activeTab, setActiveTab] = useState<'preset' | 'manual'>('preset');

  // --- 1. Preset Estimator State ---
  const [tankLength, setTankLength] = useState<number>(60);
  const [tankWidth, setTankWidth] = useState<number>(30);
  const [tankHeight, setTankHeight] = useState<number>(36);
  const [selectedSize, setSelectedSize] = useState<'30' | '60' | '90' | '120'>('60');
  const [selectedTier, setSelectedTier] = useState<'ultrabudget' | 'budget' | 'standard' | 'highend'>('standard');
  const [selectedPurpose, setSelectedPurpose] = useState<'fish' | 'planted' | 'biotope' | 'scape'>('planted');

  // Dynamic state for preset items (allows checking/unchecking, adding, deleting, editing quantity)
  const [presetItems, setPresetItems] = useState<PresetItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showCatalogModal, setShowCatalogModal] = useState<boolean>(false);
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [catalogCategory, setCatalogCategory] = useState<string>('all');
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  const calculatedVolume = Math.round(((tankLength || 0) * (tankWidth || 0) * (tankHeight || 0)) / 1000 * 10) / 10;

  // Initialize or update preset items when size/tier changes
  useEffect(() => {
    const rawItems = defaultPresetPackages[selectedSize]?.[selectedTier]?.items || [];
    setPresetItems(
      rawItems.map((item, index) => ({
        id: `preset_${selectedSize}_${selectedTier}_${index}`,
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: 1,
        desc: item.desc,
        enabled: true,
      }))
    );
  }, [selectedSize, selectedTier]);

  const handleApplyDimensions = () => {
    if (calculatedVolume <= 25) {
      setSelectedSize('30');
    } else if (calculatedVolume <= 100) {
      setSelectedSize('60');
    } else if (calculatedVolume <= 220) {
      setSelectedSize('90');
    } else {
      setSelectedSize('120');
    }
  };

  // Preset items handlers
  const togglePresetItem = (id: string) => {
    setPresetItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  };

  const updatePresetItemQuantity = (id: string, delta: number) => {
    setPresetItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const removePresetItem = (id: string) => {
    setPresetItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updatePresetItemField = (id: string, field: keyof PresetItem, value: any) => {
    setPresetItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const resetPresetItems = () => {
    const rawItems = defaultPresetPackages[selectedSize]?.[selectedTier]?.items || [];
    setPresetItems(
      rawItems.map((item, index) => ({
        id: `preset_${selectedSize}_${selectedTier}_${index}_${Date.now()}`,
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: 1,
        desc: item.desc,
        enabled: true,
      }))
    );
  };

  const addPresetCustomItem = () => {
    const newItem: PresetItem = {
      id: `custom_preset_${Date.now()}`,
      name: 'Tên phụ kiện mới...',
      category: 'Tự Thêm',
      price: 100000,
      quantity: 1,
      desc: 'Phụ kiện bổ sung tùy chỉnh',
      enabled: true,
    };
    setPresetItems([...presetItems, newItem]);
    setEditingItemId(newItem.id);
  };

  // Calculated active total for preset package
  const presetActiveTotal = presetItems
    .filter((item) => item.enabled)
    .reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);

  // --- 2. Manual Custom Calculator State ---
  const [customItems, setCustomItems] = useState<CustomItem[]>([
    { id: '1', name: 'Bể kính siêu trong 60x30x36cm (8mm)', category: 'Bể Kính', price: 550000, quantity: 1 },
    { id: '2', name: 'Đèn LED Thủy Sinh RGB 60cm', category: 'Đèn', price: 650000, quantity: 1 },
    { id: '3', name: 'Lọc Thùng Thủy Sinh 800L/h', category: 'Máy Lọc', price: 480000, quantity: 1 },
    { id: '4', name: 'Bao phân nền Gex Xanh 8L', category: 'Phân Nền', price: 350000, quantity: 2 },
  ]);

  const addCustomItem = () => {
    setCustomItems([
      ...customItems,
      {
        id: Date.now().toString(),
        name: '',
        price: 0,
        quantity: 1,
        category: 'Tự Thêm',
      },
    ]);
  };

  const updateCustomItem = (id: string, field: keyof CustomItem, value: any) => {
    setCustomItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeCustomItem = (id: string) => {
    setCustomItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAllCustomItems = () => {
    setCustomItems([]);
  };

  const loadDefaultCustomItems = () => {
    setCustomItems([
      { id: '1', name: 'Bể kính siêu trong 60x30x36cm (8mm)', category: 'Bể Kính', price: 550000, quantity: 1 },
      { id: '2', name: 'Đèn LED Thủy Sinh RGB 60cm', category: 'Đèn', price: 650000, quantity: 1 },
      { id: '3', name: 'Lọc Thùng Thủy Sinh 800L/h', category: 'Máy Lọc', price: 480000, quantity: 1 },
      { id: '4', name: 'Bao phân nền Gex Xanh 8L', category: 'Phân Nền', price: 350000, quantity: 2 },
    ]);
  };

  // Convert current preset items to manual custom items
  const copyPresetToManual = () => {
    const activePreset = presetItems
      .filter((item) => item.enabled)
      .map((item) => ({
        id: `manual_from_preset_${Date.now()}_${Math.random()}`,
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: item.quantity,
      }));

    setCustomItems(activePreset);
    setActiveTab('manual');
  };

  // Catalog item click handler
  const handleAddFromCatalog = (item: { name: string; category: string; price: number; desc: string }) => {
    if (activeTab === 'preset') {
      const newItem: PresetItem = {
        id: `catalog_preset_${Date.now()}_${Math.random()}`,
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: 1,
        desc: item.desc,
        enabled: true,
      };
      setPresetItems([...presetItems, newItem]);
    } else {
      const newItem: CustomItem = {
        id: `catalog_custom_${Date.now()}_${Math.random()}`,
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: 1,
      };
      setCustomItems([...customItems, newItem]);
    }
  };

  // Copy itemized budget estimate text to clipboard
  const handleCopyBudgetSummary = () => {
    const activeList = activeTab === 'preset'
      ? presetItems.filter(i => i.enabled).map(i => `- ${i.name} (${i.category}): ${i.quantity}x ${i.price.toLocaleString('vi-VN')}đ = ${(i.price * i.quantity).toLocaleString('vi-VN')}đ`)
      : customItems.map(i => `- ${i.name}: ${i.quantity}x ${(i.price || 0).toLocaleString('vi-VN')}đ = ${((i.price || 0) * i.quantity).toLocaleString('vi-VN')}đ`);

    const total = activeTab === 'preset' ? presetActiveTotal : manualTotal;
    const text = `📋 [AquaHub] DỰ TOÁN NGÂN SÁCH SETUP BỂ CÁ\n-----------------------------------\n${activeList.join('\n')}\n-----------------------------------\n💰 TỔNG CHI PHÍ DỰ TOÁN: ${total.toLocaleString('vi-VN')} VNĐ\n👉 Tạo tại: AquaHub Utility Suite`;

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const manualTotal = customItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);

  const cardBgClass = isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-blue-100 text-slate-900';
  const inputBgClass = isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-blue-200 text-slate-800';

  const purposeNotes: Record<string, string> = {
    fish: '🐟 Nhu cầu nuôi cá cảnh: Ưu tiên hệ lọc mạnh, vật liệu lọc vi sinh dồi dào, không bắt buộc đèn RGB đắt tiền hay CO2.',
    planted: '🌿 Nhu cầu thủy sinh trồng cây: Cần đèn RGB chuẩn quang phổ + hệ thống CO2 van điện & phân nền dinh dưỡng tốt.',
    biotope: '🍂 Nhu cầu bể Biotope / Tự nhiên: Tập trung đá, lũa, lá bàng & cát nền thô. Ánh sáng vàng/ấm vừa phải.',
    scape: '🗻 Nhu cầu Layout Scape Nghệ Thuật: Đòi hỏi bể kính siêu trong mài viền, đá/lũa hình dáng độc lạ & cây thảm.',
  };

  // Filter catalog items
  const filteredCatalog = accessoryCatalog.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(catalogSearch.toLowerCase()) || item.category.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchCat = catalogCategory === 'all' || item.category === catalogCategory;
    return matchSearch && matchCat;
  });

  const catalogCategories = Array.from(new Set(accessoryCatalog.map((i) => i.category)));

  return (
    <div className="space-y-4">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1A94FF] via-[#0B74E5] to-[#0D5CB6] rounded-2xl p-4 sm:p-5 text-white shadow-md space-y-2 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
            <span>Smart Custom Setup Budget Tool</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Dự Toán Chi Phí Setup Hồ Cá Từ A - Z</h2>
          <p className="text-blue-100 text-xs max-w-2xl leading-normal">
            Tùy biến linh hoạt phụ kiện: Bật/Tắt thiết bị đã có sẵn, chỉnh sửa giá, chọn từ thư viện mẫu hoặc tự thêm phụ kiện theo ý muốn.
          </p>
        </div>

        {/* Quick Action Button to Open Catalog Modal */}
        <button
          onClick={() => setShowCatalogModal(true)}
          className="relative z-10 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-slate-900" />
          <span>📖 Thư Viện Phụ Kiện Mẫu</span>
        </button>
      </div>

      {/* Mode Sub-Tab Switcher */}
      <div className={`${cardBgClass} border rounded-2xl p-1.5 shadow-sm flex gap-2`}>
        <button
          onClick={() => setActiveTab('preset')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 ${
            activeTab === 'preset'
              ? 'bg-[#1A94FF] text-white shadow-sm'
              : isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>📦 Gói Dự Toán Có Sẵn & Tùy Biến</span>
        </button>

        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 ${
            activeTab === 'manual'
              ? 'bg-[#1A94FF] text-white shadow-sm'
              : isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>✏️ Tính Chi Phí Thủ Công ({customItems.length} món)</span>
        </button>
      </div>

      {/* MODE 1: PRESET ESTIMATOR WITH DYNAMIC CUSTOMIZATION */}
      {activeTab === 'preset' && (
        <div className="space-y-4">
          
          {/* STEP 1: TANK DIMENSIONS & CALCULATOR */}
          <div className={`${cardBgClass} border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#1A94FF] text-white flex items-center justify-center text-[11px] font-black">1</span>
                Nhập Kích Thước Bể Cá Để Tự Động Gợi Ý (Dài x Rộng x Cao cm):
              </h3>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0B74E5] text-xs font-bold">
                💧 Dung tích: <span className="font-extrabold text-[#1A94FF]">{calculatedVolume} Lít</span>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 items-center">
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block">Dài (cm)</label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={tankLength || ''}
                  onChange={(e) => setTankLength(Number(e.target.value))}
                  className={`w-full ${inputBgClass} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#1A94FF]`}
                  placeholder="Dài"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block">Rộng (cm)</label>
                <input
                  type="number"
                  min="10"
                  max="150"
                  value={tankWidth || ''}
                  onChange={(e) => setTankWidth(Number(e.target.value))}
                  className={`w-full ${inputBgClass} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#1A94FF]`}
                  placeholder="Rộng"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block">Cao (cm)</label>
                <input
                  type="number"
                  min="10"
                  max="150"
                  value={tankHeight || ''}
                  onChange={(e) => setTankHeight(Number(e.target.value))}
                  className={`w-full ${inputBgClass} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#1A94FF]`}
                  placeholder="Cao"
                />
              </div>
              <div className="col-span-3 sm:col-span-1">
                <label className="text-[10px] font-bold text-transparent mb-1 block hidden sm:block">Action</label>
                <button
                  onClick={handleApplyDimensions}
                  className="w-full py-2 px-3 bg-[#1A94FF] hover:bg-[#0B74E5] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Áp Dụng Gợi Ý</span>
                </button>
              </div>
            </div>
          </div>

          {/* STEP 2: CHOOSE SIZE */}
          <div className={`${cardBgClass} border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3`}>
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1A94FF] text-white flex items-center justify-center text-[11px] font-black">2</span>
              Chọn Kích Thước Bể Gợi Ý Phù Hợp:
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { key: '30', label: 'Bể Nano 30cm', dims: '30 x 18 x 20 cm', vol: '~10 - 25 Lít', icon: '🐟' },
                { key: '60', label: 'Bể Tiêu Chuẩn 60cm', dims: '60 x 30 x 36 cm', vol: '~25 - 100 Lít (Phổ biến)', icon: '🌿' },
                { key: '90', label: 'Bể Trung 90cm', dims: '90 x 45 x 45 cm', vol: '~100 - 220 Lít', icon: '🌊' },
                { key: '120', label: 'Bể Lớn 120cm', dims: '120 x 50 x 50 cm', vol: '> 220 Lít', icon: '👑' },
              ].map((size) => (
                <button
                  key={size.key}
                  onClick={() => setSelectedSize(size.key as any)}
                  className={`p-3 rounded-xl border text-left transition relative overflow-hidden cursor-pointer ${
                    selectedSize === size.key
                      ? 'border-[#1A94FF] bg-blue-50/80 shadow-sm ring-2 ring-[#1A94FF]/20 text-slate-900'
                      : isDarkMode
                      ? 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-200'
                      : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50 text-slate-900'
                  }`}
                >
                  <div className="text-xl mb-0.5">{size.icon}</div>
                  <div className="font-extrabold text-xs">{size.label}</div>
                  <div className="text-[10px] font-medium opacity-70">{size.dims}</div>
                  <div className="text-[10px] font-bold text-[#0B74E5] mt-0.5">{size.vol}</div>
                  {selectedSize === size.key && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#1A94FF] text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3: SELECT PURPOSE */}
          <div className={`${cardBgClass} border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3`}>
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1A94FF] text-white flex items-center justify-center text-[11px] font-black">3</span>
              Chọn Nhu Cầu / Mục Đích Sử Dụng Hồ:
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { key: 'fish', label: 'Nuôi Cá Cảnh', icon: '🐟', desc: 'Tập trung lọc nước & cá khỏe' },
                { key: 'planted', label: 'Hồ Thủy Sinh Cây', icon: '🌿', desc: 'Cần phân nền, đèn RGB & CO2' },
                { key: 'biotope', label: 'Phong Cách Biotope', icon: '🍂', desc: 'Đá, lũa & cá tự nhiên' },
                { key: 'scape', label: 'Bố Cục Hardscape', icon: '🗻', desc: 'Bố cục nghệ thuật đỉnh cao' },
              ].map((purpose) => (
                <button
                  key={purpose.key}
                  onClick={() => setSelectedPurpose(purpose.key as any)}
                  className={`p-3 rounded-xl border text-left transition relative cursor-pointer ${
                    selectedPurpose === purpose.key
                      ? 'border-[#1A94FF] bg-blue-50/80 shadow-sm ring-2 ring-[#1A94FF]/20 text-slate-900'
                      : isDarkMode
                      ? 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-200'
                      : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50 text-slate-900'
                  }`}
                >
                  <div className="text-lg mb-0.5">{purpose.icon}</div>
                  <div className="font-extrabold text-xs">{purpose.label}</div>
                  <div className="text-[10px] opacity-70 leading-tight mt-0.5">{purpose.desc}</div>
                  {selectedPurpose === purpose.key && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#1A94FF] text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 4: CHOOSE BUDGET TIER */}
          <div className={`${cardBgClass} border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3`}>
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1A94FF] text-white flex items-center justify-center text-[11px] font-black">4</span>
              Chọn Gói Ngân Sách Đầu Tư:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Ultra Budget */}
              <button
                onClick={() => setSelectedTier('ultrabudget')}
                className={`p-3.5 rounded-2xl border text-left transition relative cursor-pointer ${
                  selectedTier === 'ultrabudget'
                    ? 'border-slate-500 bg-slate-100 shadow-sm ring-2 ring-slate-400/30 text-slate-900'
                    : isDarkMode
                    ? 'border-slate-800 bg-slate-800/60 text-slate-200'
                    : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold mb-1.5">
                  ⚪ Siêu Tiết Kiệm
                </div>
                <h4 className="text-sm font-black">Chi Phí Tối Thấp</h4>
                <p className="text-[10px] opacity-70 mt-0.5 leading-snug">Vật tư cơ bản rẻ nhất, tận dụng kính thường & lọc treo đơn giản.</p>
                <div className="mt-2 text-base font-black text-slate-700">
                  {defaultPresetPackages[selectedSize].ultrabudget.totalEst.toLocaleString('vi-VN')} đ
                </div>
              </button>

              {/* Economy Budget */}
              <button
                onClick={() => setSelectedTier('budget')}
                className={`p-3.5 rounded-2xl border text-left transition relative cursor-pointer ${
                  selectedTier === 'budget'
                    ? 'border-emerald-500 bg-emerald-50/80 shadow-sm ring-2 ring-emerald-500/20 text-slate-900'
                    : isDarkMode
                    ? 'border-slate-800 bg-slate-800/60 text-slate-200'
                    : 'border-slate-200 bg-white text-slate-900 hover:border-emerald-200'
                }`}
              >
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold mb-1.5">
                  🟢 Tiết Kiệm (Economy)
                </div>
                <h4 className="text-sm font-black">Chi Phí Tối Ưu</h4>
                <p className="text-[10px] opacity-70 mt-0.5 leading-snug">Dành cho người mới tập chơi, thiết bị kính siêu trong cơ bản.</p>
                <div className="mt-2 text-base font-black text-emerald-600">
                  {defaultPresetPackages[selectedSize].budget.totalEst.toLocaleString('vi-VN')} đ
                </div>
              </button>

              {/* Standard */}
              <button
                onClick={() => setSelectedTier('standard')}
                className={`p-3.5 rounded-2xl border text-left transition relative cursor-pointer ${
                  selectedTier === 'standard'
                    ? 'border-blue-500 bg-blue-50/80 shadow-sm ring-2 ring-blue-500/20 text-slate-900'
                    : isDarkMode
                    ? 'border-slate-800 bg-slate-800/60 text-slate-200'
                    : 'border-slate-200 bg-white text-slate-900 hover:border-blue-200'
                }`}
              >
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-[#0B74E5] text-[10px] font-bold mb-1.5">
                  🔵 Tiêu Chuẩn ⭐
                </div>
                <h4 className="text-sm font-black">Khuyên Dùng</h4>
                <p className="text-[10px] opacity-70 mt-0.5 leading-snug">Đèn RGB tươi sáng, lọc thùng êm ái, bình CO2 van điện tiện lợi.</p>
                <div className="mt-2 text-base font-black text-[#1A94FF]">
                  {defaultPresetPackages[selectedSize].standard.totalEst.toLocaleString('vi-VN')} đ
                </div>
              </button>

              {/* High-End */}
              <button
                onClick={() => setSelectedTier('highend')}
                className={`p-3.5 rounded-2xl border text-left transition relative cursor-pointer ${
                  selectedTier === 'highend'
                    ? 'border-purple-500 bg-purple-50/80 shadow-sm ring-2 ring-purple-500/20 text-slate-900'
                    : isDarkMode
                    ? 'border-slate-800 bg-slate-800/60 text-slate-200'
                    : 'border-slate-200 bg-white text-slate-900 hover:border-purple-200'
                }`}
              >
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold mb-1.5">
                  🟣 High-End (Cao Cấp)
                </div>
                <h4 className="text-sm font-black">Đỉnh Cao Nghệ Thuật</h4>
                <p className="text-[10px] opacity-70 mt-0.5 leading-snug">Kính mài keo ẩn, lọc Inox 304 vĩnh cửu, đèn Pro app cao cấp.</p>
                <div className="mt-2 text-base font-black text-purple-600">
                  {defaultPresetPackages[selectedSize].highend.totalEst.toLocaleString('vi-VN')} đ
                </div>
              </button>
            </div>
          </div>

          {/* ITEM LIST SUMMARY WITH LIVE CUSTOMIZATION CONTROLS */}
          <div className={`${cardBgClass} border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
              <div>
                <h3 className="text-lg font-extrabold flex items-center gap-2">
                  <span>
                    Bảng Phụ Kiện Gói (Bể {selectedSize}cm - {
                      selectedTier === 'ultrabudget' ? 'Siêu Tiết Kiệm' :
                      selectedTier === 'budget' ? 'Tiết Kiệm' :
                      selectedTier === 'standard' ? 'Tiêu Chuẩn' : 'High-End'
                    })
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-[#0B74E5] rounded-full font-bold">
                    {presetItems.filter((i) => i.enabled).length}/{presetItems.length} món đã chọn
                  </span>
                </h3>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tự do bật/tắt thiết bị đã có sẵn, chỉnh số lượng, thêm hoặc xóa món trực tiếp</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={resetPresetItems}
                  className={`px-2.5 py-1.5 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer`}
                  title="Khôi phục danh sách mặc định"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Đặt Lại Mẫu</span>
                </button>

                <button
                  onClick={() => setShowCatalogModal(true)}
                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Chọn Từ Thư Viện</span>
                </button>

                <button
                  onClick={copyPresetToManual}
                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0B74E5] border border-blue-200 text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                  title="Sao chép toàn bộ sang chế độ tự nhập thủ công"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Chuyển Sang Thủ Công</span>
                </button>
              </div>
            </div>

            {/* Purpose Note Box */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{purposeNotes[selectedPurpose]}</span>
            </div>

            {/* List of Customizable Items */}
            <div className="space-y-2">
              {presetItems.map((item) => {
                const isEditing = editingItemId === item.id;
                const subtotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      !item.enabled
                        ? isDarkMode ? 'bg-slate-900/40 border-slate-800 opacity-50' : 'bg-slate-100/60 border-slate-200 opacity-50'
                        : isDarkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {/* Item Checkbox & Information */}
                    <div className="flex items-start sm:items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={() => togglePresetItem(item.id)}
                        className="mt-1 sm:mt-0 w-4 h-4 rounded text-[#1A94FF] focus:ring-[#1A94FF] cursor-pointer"
                        title={item.enabled ? 'Bỏ chọn mục này' : 'Chọn lại mục này'}
                      />

                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-[#0B74E5]">
                            {item.category}
                          </span>

                          {isEditing ? (
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updatePresetItemField(item.id, 'name', e.target.value)}
                              className={`text-xs font-bold ${inputBgClass} rounded px-2 py-0.5 border border-blue-400`}
                            />
                          ) : (
                            <h4 className={`text-xs font-bold ${!item.enabled ? 'line-through' : ''}`}>
                              {item.name}
                            </h4>
                          )}
                        </div>

                        <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    {/* Quantity, Price Controls & Action Buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden text-xs bg-white text-slate-800">
                        <button
                          onClick={() => updatePresetItemQuantity(item.id, -1)}
                          disabled={!item.enabled}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 font-bold disabled:opacity-40 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-1 font-bold text-center min-w-[2rem]">{item.quantity}</span>
                        <button
                          onClick={() => updatePresetItemQuantity(item.id, 1)}
                          disabled={!item.enabled}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 font-bold disabled:opacity-40 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {/* Price Control / Display */}
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updatePresetItemField(item.id, 'price', Number(e.target.value))}
                            className="w-24 text-xs font-bold rounded px-1.5 py-1 border border-blue-400 text-slate-900 bg-white"
                          />
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-[10px] font-bold"
                          >
                            Lưu
                          </button>
                        </div>
                      ) : (
                        <div className="text-right">
                          <div className={`text-xs font-extrabold ${item.enabled ? 'text-[#0B74E5]' : 'text-slate-400'}`}>
                            {subtotal.toLocaleString('vi-VN')} đ
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-[10px] text-slate-400">
                              ({item.price.toLocaleString('vi-VN')}đ / cái)
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions: Edit & Trash */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingItemId(isEditing ? null : item.id)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Sửa tên / giá tiền"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => removePresetItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Xóa phụ kiện này khỏi gói"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Add & Total Banner */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={addPresetCustomItem}
                  className={`py-2 px-3.5 border-2 border-dashed ${
                    isDarkMode ? 'border-slate-700 bg-slate-800/40 hover:bg-slate-800' : 'border-blue-200 bg-blue-50/40 hover:bg-blue-50'
                  } text-[#0B74E5] font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Phụ Kiện Tùy Chọn Mới</span>
                </button>

                <button
                  onClick={handleCopyBudgetSummary}
                  className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-300" />
                  <span>{copiedNotification ? '✅ Đã Sao Chép Bảng Giá!' : 'Sao Chép Bảng Báo Giá'}</span>
                </button>
              </div>

              {/* Total Price Card */}
              <div className="bg-gradient-to-r from-[#1A94FF] via-[#0B74E5] to-[#0D5CB6] text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
                <div>
                  <span className="text-[11px] font-bold text-blue-100 uppercase tracking-wider block">
                    Tổng Chi Phí Đã Tùy Biến ({presetItems.filter(i => i.enabled).length} món)
                  </span>
                  <span className="text-[10px] text-blue-100">
                    Tự động loại trừ các thiết bị bạn bỏ chọn hoặc đã có sẵn
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {presetActiveTotal.toLocaleString('vi-VN')} <span className="text-xs font-normal text-blue-100">VNĐ</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODE 2: MANUAL CUSTOM CALCULATOR */}
      {activeTab === 'manual' && (
        <div className={`${cardBgClass} border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-[#0B74E5] text-[10px] font-extrabold mb-1">
                <Calculator className="w-3 h-3" /> Công Cụ Tính Nhẩm Tự Nhập
              </div>
              <h3 className="text-lg font-extrabold">Tính Chi Phí Phụ Kiện Thủ Công</h3>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Nhập tên thiết bị, giá tiền & số lượng để tính toán tổng ngân sách cá nhân</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowCatalogModal(true)}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Thư Viện Mẫu
              </button>

              <button
                onClick={loadDefaultCustomItems}
                className={`px-3 py-1.5 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer`}
              >
                <RefreshCw className="w-3.5 h-3.5" /> Nạp Mẫu
              </button>
              {customItems.length > 0 && (
                <button
                  onClick={clearAllCustomItems}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa Tất Cả
                </button>
              )}
            </div>
          </div>

          {customItems.length > 0 ? (
            <div className="space-y-2">
              <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-bold opacity-60 px-2">
                <div className="col-span-5">Tên sản phẩm / Phụ kiện</div>
                <div className="col-span-3">Đơn giá (VNĐ)</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className="col-span-2 text-right">Thành tiền</div>
              </div>

              {customItems.map((item) => {
                const subtotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
                return (
                  <div
                    key={item.id}
                    className={`p-2.5 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} rounded-xl border flex flex-col sm:grid sm:grid-cols-12 gap-2 items-center hover:border-blue-300 transition`}
                  >
                    <div className="col-span-5 w-full">
                      <label className="sm:hidden text-[10px] font-bold opacity-60 mb-0.5 block">Tên phụ kiện</label>
                      <input
                        type="text"
                        placeholder="Nhập tên sản phẩm..."
                        value={item.name}
                        onChange={(e) => updateCustomItem(item.id, 'name', e.target.value)}
                        className={`w-full ${inputBgClass} rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-[#1A94FF]`}
                      />
                    </div>

                    <div className="col-span-3 w-full">
                      <label className="sm:hidden text-[10px] font-bold opacity-60 mb-0.5 block">Đơn giá (VNĐ)</label>
                      <input
                        type="number"
                        placeholder="0"
                        min="0"
                        value={item.price || ''}
                        onChange={(e) => updateCustomItem(item.id, 'price', Number(e.target.value))}
                        className={`w-full ${inputBgClass} rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#1A94FF]`}
                      />
                    </div>

                    <div className="col-span-2 w-full">
                      <label className="sm:hidden text-[10px] font-bold opacity-60 mb-0.5 block">Số lượng</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity || 1}
                        onChange={(e) => updateCustomItem(item.id, 'quantity', Math.max(1, Number(e.target.value)))}
                        className={`w-full ${inputBgClass} rounded-lg px-2.5 py-1.5 text-xs font-bold text-center focus:outline-none focus:border-[#1A94FF]`}
                      />
                    </div>

                    <div className="col-span-2 w-full flex items-center justify-between sm:justify-end gap-2 text-right">
                      <div className="text-xs font-black text-[#0B74E5]">
                        {subtotal.toLocaleString('vi-VN')} đ
                      </div>
                      <button
                        onClick={() => removeCustomItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Xóa mục này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`p-6 text-center ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'} border border-dashed rounded-2xl space-y-2`}>
              <Calculator className="w-10 h-10 mx-auto opacity-40" />
              <p className="text-xs font-medium opacity-70">Danh sách tính toán đang trống</p>
              <button
                onClick={addCustomItem}
                className="px-3.5 py-1.5 bg-[#1A94FF] text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer"
              >
                + Thêm Sản Phẩm Đầu Tiên
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={addCustomItem}
              className={`py-2.5 px-4 border-2 border-dashed ${isDarkMode ? 'border-slate-700 bg-slate-800/40 hover:bg-slate-800' : 'border-blue-200 bg-blue-50/40 hover:bg-blue-50'} text-[#0B74E5] font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Món / Phụ Kiện Khác</span>
            </button>

            <button
              onClick={handleCopyBudgetSummary}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-amber-300" />
              <span>{copiedNotification ? '✅ Đã Sao Chép Bảng Báo Giá!' : 'Sao Chép Bảng Giá'}</span>
            </button>
          </div>

          {/* Grand Total Card */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div>
              <span className="text-[11px] font-bold text-blue-100 uppercase tracking-wider block">Tổng Chi Phí Đã Nhập ({customItems.length} món)</span>
              <span className="text-[10px] text-blue-100">Tự động tính theo đơn giá x số lượng</span>
            </div>

            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-black text-white">
                {manualTotal.toLocaleString('vi-VN')} <span className="text-xs font-normal text-blue-100">VNĐ</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK-ADD ACCESSORY CATALOG MODAL */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${cardBgClass} border rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200/60 flex items-center justify-between bg-gradient-to-r from-[#1A94FF] to-[#0B74E5] text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-extrabold text-base">Thư Viện Phụ Kiện Thủy Sinh Mẫu</h3>
                  <p className="text-[11px] text-blue-100">Bấm chọn sản phẩm để thêm trực tiếp vào bảng dự toán</p>
                </div>
              </div>
              <button
                onClick={() => setShowCatalogModal(false)}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search & Category Filter */}
            <div className="p-3 border-b border-slate-200/60 space-y-2 bg-slate-50/50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm tên phụ kiện, đèn, lọc, phân nền, CO2..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border ${inputBgClass} focus:outline-none focus:border-[#1A94FF]`}
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setCatalogCategory('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition cursor-pointer ${
                    catalogCategory === 'all'
                      ? 'bg-[#1A94FF] text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Tất cả ({accessoryCatalog.length})
                </button>
                {catalogCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCatalogCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition cursor-pointer ${
                      catalogCategory === cat
                        ? 'bg-[#1A94FF] text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body: Accessories List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              {filteredCatalog.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} hover:border-blue-400 transition flex items-center justify-between gap-3`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-[#0B74E5]">
                        {item.category}
                      </span>
                      <h4 className="text-xs font-bold">{item.name}</h4>
                    </div>
                    <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-xs font-black text-[#0B74E5]">
                      {item.price.toLocaleString('vi-VN')} đ
                    </div>
                    <button
                      onClick={() => handleAddFromCatalog(item)}
                      className="px-3 py-1.5 bg-[#1A94FF] hover:bg-[#0B74E5] text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-200/60 bg-slate-50/50 flex items-center justify-between text-xs">
              <span className="opacity-70 font-medium">Đang xem {filteredCatalog.length} sản phẩm</span>
              <button
                onClick={() => setShowCatalogModal(false)}
                className="px-4 py-1.5 bg-slate-800 text-white font-bold rounded-lg cursor-pointer"
              >
                Đóng Thư Viện
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
