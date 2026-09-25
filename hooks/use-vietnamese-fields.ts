import { useMemo } from 'react';

// Dictionary mapping English DB field keys to Vietnamese labels
export const FIELD_LABELS_VI: Record<string, string> = {
  // Identity & Metadata
  id: 'Mã định danh (ID)',
  name: 'Tên hiển thị',
  nameVi: 'Tên tiếng Việt',
  nameEn: 'Tên tiếng Anh',
  title: 'Tiêu đề',
  scientificName: 'Tên khoa học',
  commonName: 'Tên thường gọi',
  vietnameseName: 'Tên tiếng Việt',
  categoryName: 'Danh mục',
  categorySlug: 'Slug danh mục',
  categoryId: 'Mã danh mục',
  slug: 'Đường dẫn tĩnh (Slug)',
  type: 'Phân loại',
  order: 'Thứ tự hiển thị',
  tags: 'Thẻ phân loại (Tags)',
  
  // Pricing & Inventory
  price: 'Giá niêm yết (VNĐ)',
  priceRange: 'Khoảng giá tham khảo',
  discountPrice: 'Giá khuyến mãi',
  sku: 'Mã sản phẩm (SKU)',
  stock: 'Số lượng tồn kho',
  unit: 'Đơn vị tính',
  
  // Engagement & Metrics
  views: 'Tổng lượt xem',
  likesCount: 'Lượt yêu thích',
  commentsCount: 'Số lượng bình luận',
  rating: 'Đánh giá (Điểm số)',
  
  // Aquatic / Biological Parameters
  size: 'Kích thước / Chiều dài',
  sizeMin: 'Kích thước tối thiểu (cm)',
  sizeMax: 'Kích thước tối đa (cm)',
  maxSize: 'Kích thước tối đa',
  origin: 'Nguồn gốc / Xuất xứ',
  temperament: 'Tính cách / Tập tính',
  diet: 'Chế độ ăn / Thức ăn',
  waterType: 'Môi trường nước',
  temperature: 'Nhiệt độ thích hợp (°C)',
  tempMin: 'Nhiệt độ tối thiểu (°C)',
  tempMax: 'Nhiệt độ tối đa (°C)',
  phRange: 'Độ pH chuẩn',
  phMin: 'Độ pH tối thiểu',
  phMax: 'Độ pH tối đa',
  careLevel: 'Mức độ chăm sóc',
  difficulty: 'Độ khó nuôi',
  waterFlow: 'Dòng chảy nước',
  lighting: 'Cường độ ánh sáng',
  co2: 'Nhu cầu CO2',
  substrates: 'Phân nền / Giá thể',
  tankSize: 'Dung tích bể tối thiểu (Lít)',
  minTankSize: 'Thể tích bể tối thiểu',
  swimmingLayer: 'Tầng bơi chính',
  lifespan: 'Tuổi thọ trung bình',
  breeding: 'Khả năng sinh sản',
  habitat: 'Môi trường sống tự nhiên',
  
  // Tank & Equipment Specs
  dimensions: 'Kích thước bể (DxRxC)',
  volume: 'Dung tích bể (Lít)',
  material: 'Chất liệu chế tạo',
  
  // User & Contact Details
  role: 'Vai trò tài khoản',
  email: 'Địa chỉ Email',
  phone: 'Số điện thoại',
  contactPhone: 'SĐT liên hệ',
  address: 'Địa chỉ nhà / Khu vực',
  location: 'Khu vực mua bán',
  authorName: 'Tên tác giả',
  sellerName: 'Tên người bán',
  
  // Content & Articles / Cẩm Nang Specific
  excerpt: 'Đoạn trích ngắn',
  summary: 'Tóm tắt bài viết',
  author: 'Tác giả',
  authorId: 'Mã tác giả',
  articleCategory: 'Danh mục bài viết',
  articleCategoryId: 'Mã danh mục bài viết',
  publishedAt: 'Thời gian xuất bản',
  isPublished: 'Trạng thái xuất bản',
  viewCount: 'Số lượt xem bài viết',
  readTime: 'Thời gian đọc (phút)',
  readingTime: 'Thời gian đọc (phút)',
  metaTitle: 'Thẻ tiêu đề SEO (Meta Title)',
  metaDescription: 'Thẻ mô tả SEO (Meta Description)',
  metaKeywords: 'Từ khóa SEO (Meta Keywords)',
  featured: 'Bài viết nổi bật',
  pinned: 'Bài viết được ghim',
  source: 'Nguồn tham khảo',
  sourceUrl: 'Đường dẫn nguồn',

  // System Status & Controls
  status: 'Trạng thái',
  isActive: 'Trạng thái hoạt động',
  isApproved: 'Trạng thái phê duyệt',
  isFeatured: 'Hàng nổi bật',
  isPinned: 'Ghim đầu trang',
  placement: 'Vị trí Banner quảng cáo',
  link: 'Đường dẫn liên kết (URL)',
  
  // Content & Descriptions
  description: 'Mô tả tóm tắt',
  content: 'Nội dung chi tiết',
  details: 'Thông tin chi tiết',
  question: 'Nội dung câu hỏi',
  answer: 'Nội dung phản hồi',
  
  // Timestamps
  createdAt: 'Ngày tạo',
  updatedAt: 'Ngày cập nhật mới nhất',
};

// Tab translation map
export const TAB_LABELS_VI: Record<string, string> = {
  fish: 'Sinh vật thủy sinh',
  categories: 'Danh mục cá & thủy sinh',
  community: 'Bài viết cộng đồng',
  questions: 'Thảo luận & Hỏi đáp',
  tanks: 'Mẫu Bể cá & Thiết lập',
  articles: 'Bài viết & Cẩm nang',
  market: 'Tin rao Chợ mua bán',
  ads: 'Quảng cáo Banner',
  users: 'Tài khoản người dùng',
  overview: 'Tổng quan hệ thống',
};

/**
 * Translates an English DB key to Vietnamese.
 * If unmapped, converts camelCase to spaced Title Case.
 */
export function getVietnameseFieldLabel(key: string): string {
  if (FIELD_LABELS_VI[key]) return FIELD_LABELS_VI[key];

  const lowerKeyMap: Record<string, string> = {
    namevi: 'Tên tiếng Việt',
    nameen: 'Tên tiếng Anh',
    sizemin: 'Kích thước tối thiểu (cm)',
    sizemax: 'Kích thước tối đa (cm)',
    phmin: 'Độ pH tối thiểu',
    phmax: 'Độ pH tối đa',
    tempmin: 'Nhiệt độ tối thiểu (°C)',
    tempmax: 'Nhiệt độ tối đa (°C)',
    categoryid: 'Mã danh mục (ID)',
    categoryslug: 'Slug danh mục',
    categoryname: 'Tên danh mục',
    articlecategoryid: 'Mã danh mục bài viết',
    articlecategoryname: 'Tên danh mục bài viết',
    authorid: 'Mã tác giả',
    authorname: 'Tên tác giả',
    publishedat: 'Thời gian xuất bản',
    ispublished: 'Trạng thái xuất bản',
    viewcount: 'Số lượt xem bài viết',
    readtime: 'Thời gian đọc (phút)',
    readingtime: 'Thời gian đọc (phút)',
    metatitle: 'Thẻ tiêu đề SEO',
    metadescription: 'Thẻ mô tả SEO',
    metakeywords: 'Từ khóa SEO',
    isfeatured: 'Bài viết nổi bật',
    ispinned: 'Bài viết được ghim',
    sourceurl: 'Đường dẫn nguồn',
  };

  const lowerKey = key.toLowerCase().replace(/_/g, '');
  if (lowerKeyMap[lowerKey]) return lowerKeyMap[lowerKey];
  
  // Convert camelCase or snake_case to spaced Vietnamese title
  const cleanKey = key.replace(/_/g, ' ');
  const spaced = cleanKey.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Formats a field value nicely for Vietnamese presentation.
 */
export function formatVietnameseFieldValue(key: string, value: any): string {
  if (value === null || value === undefined || value === '') return '—';

  if (typeof value === 'boolean') {
    return value ? '✓ Có / Đã bật' : '✕ Không / Đã tắt';
  }

  if (key === 'role') {
    return value === 'ADMIN' ? '👑 Quản trị viên (ADMIN)' : '👤 Thành viên (USER)';
  }

  if (key.toLowerCase().includes('date') || key.toLowerCase().includes('at')) {
    const parsedDate = new Date(value);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toLocaleString('vi-VN');
    }
  }

  if (key === 'price' && typeof value === 'number') {
    return value > 0 ? `${value.toLocaleString('vi-VN')} VNĐ` : 'Liên hệ';
  }

  if (Array.isArray(value)) {
    return value.map(v => (typeof v === 'object' && v !== null ? (v.name || v.title || v.username || JSON.stringify(v)) : String(v))).join(', ');
  }

  if (typeof value === 'object' && value !== null) {
    if (value.name) return String(value.name);
    if (value.title) return String(value.title);
    if (value.username) return String(value.username);
    if (value.displayName) return String(value.displayName);
    if (value.slug) return String(value.slug);
    return '—';
  }

  return String(value);
}

/**
 * Custom hook providing translation helpers.
 */
export function useVietnameseFields() {
  return useMemo(() => ({
    getLabel: getVietnameseFieldLabel,
    formatValue: formatVietnameseFieldValue,
    getTabName: (tab: string) => TAB_LABELS_VI[tab] || tab.toUpperCase(),
    fieldLabels: FIELD_LABELS_VI,
  }), []);
}

export default useVietnameseFields;
