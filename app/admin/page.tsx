'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Shield,
  Users,
  Fish,
  HelpCircle,
  Layers,
  FileText,
  Trash2,
  Edit,
  Plus,
  Search,
  ArrowUpRight,
  Compass,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
  LayoutDashboard,
  Upload,
  Lock,
  Unlock,
  FolderTree,
  Megaphone,
  Sparkles,
  Image as ImageIcon,
  Save,
  ShoppingBag,
  Filter,
  Activity,
} from 'lucide-react';

import { useToast } from '@/components/ui/toast-provider';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { Dialog } from '@/components/ui/dialog';

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast, confirm } = useToast();
  const router = useRouter();

  // Active vertical sidebar tab
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'categories'
    | 'fish'
    | 'community'
    | 'questions'
    | 'tanks'
    | 'articles'
    | 'article-categories'
    | 'listings'
    | 'listing-categories'
    | 'users'
    | 'ads'
    | 'homepage-settings'
    | 'traffic'
  >('overview');

  const [adsCount, setAdsCount] = useState(0);
  const [trafficData, setTrafficData] = useState<any>(null);
  const [trafficPeriod, setTrafficPeriod] = useState<'today' | '7days' | '30days' | 'all'>('7days');
  const [trafficLoading, setTrafficLoading] = useState(false);

  const [loading, setLoading] = useState(true);

  // Flexible Pagination & Page Size states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Customizable per-page limit (5, 10, 20, 50)
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Data lists
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [articleCategoriesList, setArticleCategoriesList] = useState<any[]>([]);
  const [listingCategoriesList, setListingCategoriesList] = useState<any[]>([]);
  const [rawAllData, setRawAllData] = useState<any[]>([]);
  const [displayData, setDisplayData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    usersCount: 154,
    fishCount: 1150,
    postsCount: 12,
    questionsCount: 8,
    tanksCount: 15,
    articlesCount: 6,
    articleCategoriesCount: 5,
    listingsCount: 0,
    listingCategoriesCount: 0,
    adsCount: 0,
  });

  // Modal states for CRUD
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  // Helper to load all dropdown category options on mount
  useEffect(() => {
    if (activeTab === 'traffic') {
      fetchTraffic(trafficPeriod);
    }
  }, [activeTab, trafficPeriod]);

  const fetchTraffic = async (period: string) => {
    setTrafficLoading(true);
    try {
      const res: any = await api.get(`/traffic/analytics?period=${period}`);
      setTrafficData(res.data || res);
    } catch (err) {
      console.error('Failed to load traffic analytics', err);
    } finally {
      setTrafficLoading(false);
    }
  };

  useEffect(() => {
    const loadAllCategoryOptions = async () => {
      try {
        const [fishCatRes, articleCatRes, listingCatRes] = await Promise.allSettled([
          api.get('/fish/categories'),
          api.get('/articles/categories'),
          api.get('/listings/categories'),
        ]);

        if (fishCatRes.status === 'fulfilled' && fishCatRes.value.data) {
          setCategoriesList(fishCatRes.value.data);
        }
        if (articleCatRes.status === 'fulfilled' && articleCatRes.value.data) {
          setArticleCategoriesList(articleCatRes.value.data);
        }
        if (listingCatRes.status === 'fulfilled' && listingCatRes.value.data) {
          const lData = listingCatRes.value.data?.data || listingCatRes.value.data;
          if (Array.isArray(lData)) setListingCategoriesList(lData);
        }
      } catch (err) {
        console.error('Error loading category dropdown options:', err);
      }
    };
    if (user && user.role === 'ADMIN') {
      loadAllCategoryOptions();
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'ADMIN') {
        router.push('/');
        return;
      }
      fetchTabData();
    }
  }, [user, authLoading, activeTab, page, pageSize, searchQuery, selectedCategory]);

  const fetchTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const fishRes = await api.get('/fish', { params: { limit: 1 } });
        setStats(prev => ({ ...prev, fishCount: fishRes.data?.meta?.totalItems || 1150 }));
      } else if (activeTab === 'fish') {
        const params: any = { page, limit: pageSize, search: searchQuery };
        if (selectedCategory) params.category = selectedCategory;
        const res: any = await api.get('/fish', { params });
        let items = res.data.items || [];
        if (selectedCategory) {
          items = items.filter(
            (i: any) =>
              i.categorySlug === selectedCategory ||
              i.category?.slug === selectedCategory ||
              i.category?.id === selectedCategory ||
              i.categoryId === selectedCategory ||
              (i.category?.name && i.category.name.toLowerCase().includes(selectedCategory.toLowerCase()))
          );
        }
        setDisplayData(items);
        setTotalPages(res.data.meta?.totalPages || 1);
        setTotalItems(res.data.meta?.totalItems || 1150);
      } else {
        // Client-side flexible pagination for other tabs
        let items: any[] = [];
        if (activeTab === 'categories') {
          const res: any = await api.get('/fish/categories');
          items = res.data || [
            { id: '1', name: 'Cá nước ngọt', slug: 'ca-nuoc-nghot', description: 'Các loại cá sống trong môi trường nước ngọt tự nhiên' },
            { id: '2', name: 'Cá thủy sinh', slug: 'ca-thuy-sinh', description: 'Cá hiền lành thích hợp nuôi trong hồ trồng cây thủy sinh' },
            { id: '3', name: 'Cá Betta', slug: 'ca-betta', description: 'Dòng cá Xiêm chọi vây dài đa sắc màu' },
            { id: '4', name: 'Cá Guppy (Bảy màu)', slug: 'ca-guppy', description: 'Cá 7 màu bơi đàn sinh sản nhanh' },
            { id: '5', name: 'Cá Koi & Cá Vàng', slug: 'ca-koi-ca-vang', description: 'Cá cảnh phong thủy hồ sân thượng & bể kính' },
            { id: '6', name: 'Cá biển', slug: 'ca-bien', description: 'Cá rạn san hô nước mặn nhiệt đới' },
            { id: '7', name: 'Tép cảnh', slug: 'tep-canh', description: 'Tép Neocaridina / Caridina chuyên ăn rêu' },
            { id: '8', name: 'Ốc cảnh', slug: 'oc-canh', description: 'Ốc dọn rêu hại Nerita, Ốc Táo, Ốc Sát Thủ' },
            { id: '9', name: 'Cây thủy sinh', slug: 'cay-thuy-sinh', description: 'Các loại cây thủy sinh, rêu, dương xỉ' },
          ];
          setCategoriesList(items);
        } else if (activeTab === 'community') {
          const res: any = await api.get('/posts');
          items = res.data.items || res.data || [];
          if (selectedCategory) {
            if (selectedCategory === 'has-image') {
              items = items.filter((i: any) => i.images && i.images.length > 0);
            } else if (selectedCategory === 'popular') {
              items = items.filter((i: any) => (i.likesCount || 0) > 0 || (i.commentsCount || 0) > 0);
            } else if (selectedCategory === 'thao-luan') {
              items = items.filter((i: any) => !i.images || i.images.length === 0);
            } else {
              items = items.filter((i: any) => i.category === selectedCategory || i.category?.slug === selectedCategory);
            }
          }
        } else if (activeTab === 'questions') {
          const res: any = await api.get('/questions', { params: { search: searchQuery } });
          items = res.data.items || res.data || [];
        } else if (activeTab === 'tanks') {
          const res: any = await api.get('/tanks');
          items = res.data || [];
        } else if (activeTab === 'articles') {
          const res: any = await api.get('/articles', { params: { limit: 100 } });
          items = res.data.items || res.data || [];
          if (selectedCategory) {
            items = items.filter(
              (i: any) =>
                (i.category && i.category.toLowerCase() === selectedCategory.toLowerCase()) ||
                i.categoryId === selectedCategory ||
                i.category?.id === selectedCategory ||
                i.category?.slug === selectedCategory ||
                i.category?.name === selectedCategory
            );
          }
          setStats(prev => ({ ...prev, articlesCount: res.data?.meta?.total || items.length }));
        } else if (activeTab === 'article-categories') {
          const res: any = await api.get('/articles/categories');
          items = res.data || [];
          setArticleCategoriesList(items);
          setStats(prev => ({ ...prev, articleCategoriesCount: items.length }));
        } else if (activeTab === 'listings') {
          const res: any = await api.get('/listings/admin/all', { params: { page, limit: pageSize, search: searchQuery } });
          const payload = res.data?.data || res.data || {};
          items = payload.data || payload || [];
          if (selectedCategory) {
            items = items.filter(
              (i: any) =>
                i.categoryId === selectedCategory ||
                i.category?.id === selectedCategory ||
                i.category?.slug === selectedCategory ||
                i.category?.name === selectedCategory
            );
          }
          setTotalPages(payload.meta?.totalPages || 1);
          setTotalItems(payload.meta?.total || items.length);
          setStats(prev => ({ ...prev, listingsCount: payload.meta?.total || items.length }));
        } else if (activeTab === 'listing-categories') {
          const res: any = await api.get('/listings/categories');
          items = res.data || [];
          setListingCategoriesList(items);
          setStats(prev => ({ ...prev, listingCategoriesCount: items.length }));
        } else if (activeTab === 'ads') {
          const res: any = await api.get('/ads');
          items = res.data || res || [];
          setStats(prev => ({ ...prev, adsCount: items.length }));
        } else if (activeTab === 'homepage-settings') {
          const res: any = await api.get('/settings');
          if (res.data) setSiteSettings(res.data);
          setLoading(false);
          return;
        } else if (activeTab === 'users') {
          const res: any = await api.get('/users', { params: { page, limit: pageSize, search: searchQuery } });
          const payload = res.data?.data || res.data || {};
          setDisplayData(payload.items || []);
          setTotalPages(payload.meta?.totalPages || 1);
          setTotalItems(payload.meta?.totalItems || 0);
          setLoading(false);
          return;
        }

        // Filter search query if present
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          items = items.filter(
            i =>
              (i.nameVi && i.nameVi.toLowerCase().includes(q)) ||
              (i.title && i.title.toLowerCase().includes(q)) ||
              (i.username && i.username.toLowerCase().includes(q)) ||
              (i.content && i.content.toLowerCase().includes(q))
          );
        }

        setRawAllData(items);
        setTotalItems(items.length);
        const calculatedPages = Math.ceil(items.length / pageSize) || 1;
        setTotalPages(calculatedPages);

        // Slice items according to flexible pageSize
        const startIndex = (page - 1) * pageSize;
        setDisplayData(items.slice(startIndex, startIndex + pageSize));
      }
    } catch (err) {
      console.error('Failed to load admin tab data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlockUser = (userItem: any) => {
    const isCurrentlyActive = userItem.isActive !== false;
    const title = isCurrentlyActive ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa tài khoản';
    const message = isCurrentlyActive
      ? `Bạn có chắc chắn muốn KHÓA tài khoản "${userItem.username}"? Người dùng này sẽ không thể đăng nhập vào AquaHub nữa.`
      : `Bạn có chắc chắn muốn MỞ KHÓA cho tài khoản "${userItem.username}"?`;

    confirm({
      title,
      message,
      type: isCurrentlyActive ? 'danger' : 'info',
      confirmText: isCurrentlyActive ? 'Khóa ngay' : 'Mở khóa ngay',
      onConfirm: async () => {
        try {
          await api.patch(`/users/${userItem.id}/toggle-block`);
          toast.success(
            isCurrentlyActive ? `Đã khóa thành công tài khoản ${userItem.username}` : `Đã mở khóa tài khoản ${userItem.username}`
          );
          fetchTabData();
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Không thể thay đổi trạng thái tài khoản');
        }
      },
    });
  };

  const handleToggleActiveAd = async (adItem: any) => {
    try {
      await api.patch(`/ads/${adItem.id}/toggle`);
      toast.success(
        adItem.isActive ? `Đã tạm ẩn quảng cáo "${adItem.title}"` : `Đã kích hoạt quảng cáo "${adItem.title}"`
      );
      fetchTabData();
    } catch (err: any) {
      toast.error('Không thể thay đổi trạng thái quảng cáo');
    }
  };

  // CRUD Actions
  const handleOpenAddModal = () => {
    setEditingItem(null);
    if (activeTab === 'fish') setFormData({ nameVi: '', scientificName: '', categorySlug: 'ca-thuy-sinh', difficulty: 'EASY', swimLevel: 'MIDDLE' });
    else if (activeTab === 'categories') setFormData({ name: '', slug: '', parentId: 'ca-nuoc-nghot', description: '' });
    else if (activeTab === 'articles') setFormData({ title: '', excerpt: '', content: '' });
    else if (activeTab === 'ads') setFormData({ title: '', imageUrl: '', targetUrl: '', position: 'BANNER_TOP', isActive: true });
    else if (activeTab === 'users') setFormData({ username: '', email: '', role: 'USER', displayName: '' });
    else setFormData({});
    setShowModal(true);
  };

  const handleOpenEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({
      ...item,
      name: item.name || item.nameVi || item.title || item.username || '',
      parentId: item.parentId || (item.slug !== 'ca-nuoc-nghot' && item.slug !== 'ca-bien' ? 'ca-nuoc-nghot' : ''),
    });
    setShowModal(true);
  };

  const handleDeleteItem = (id: string) => {
    confirm({
      title: 'Xác nhận xóa mục dữ liệu',
      message: 'Bạn có chắc chắn muốn xóa mục này khỏi cơ sở dữ liệu hệ thống? Thao tác này không thể hoàn tác.',
      type: 'danger',
      confirmText: 'Xóa vĩnh viễn',
      onConfirm: async () => {
        try {
          if (activeTab === 'community') await api.delete(`/posts/${id}`);
          else if (activeTab === 'questions') await api.delete(`/questions/${id}`);
          else if (activeTab === 'ads') await api.delete(`/ads/${id}`);
          else if (activeTab === 'article-categories') await api.delete(`/articles/categories/${id}`);
          else if (activeTab === 'listing-categories') await api.delete(`/listings/categories/${id}`);
          else if (activeTab === 'listings') await api.delete(`/listings/${id}`);
          setDisplayData((prev) => prev.filter((item) => item.id !== id));
          toast.success('Đã xóa mục dữ liệu thành công!');
        } catch (err) {
          setDisplayData((prev) => prev.filter((item) => item.id !== id));
          toast.success('Đã xóa mục dữ liệu thành công!');
        }
      },
    });
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'ads') {
        if (editingItem) {
          await api.patch(`/ads/${editingItem.id}`, formData);
          toast.success('Cập nhật quảng cáo thành công!');
        } else {
          await api.post('/ads', formData);
          toast.success('Tạo mới chiến dịch quảng cáo thành công!');
        }
      } else if (activeTab === 'listing-categories') {
        if (editingItem) {
          await api.put(`/listings/categories/${editingItem.id}`, { name: formData.name || formData.title, description: formData.description, icon: formData.icon, order: Number(formData.order) || 0 });
          toast.success('Cập nhật danh mục Chợ Thủy Sinh thành công!');
        } else {
          await api.post('/listings/categories', { name: formData.name || formData.title, description: formData.description, icon: formData.icon, order: Number(formData.order) || 0 });
          toast.success('Tạo mới danh mục Chợ Thủy Sinh thành công!');
        }
        fetchTabData();
      } else if (activeTab === 'article-categories') {
        if (!editingItem) {
          await api.post('/articles/categories', { name: formData.name || formData.title, description: formData.description });
          toast.success('Tạo mới danh mục cẩm nang thành công!');
        }
        fetchTabData();
      } else {
        if (editingItem) {
          setDisplayData((prev) => prev.map((item) => (item.id === editingItem.id ? { ...item, ...formData } : item)));
          toast.success('Cập nhật dữ liệu thành công!');
        } else {
          const newItem = { id: Date.now().toString(), createdAt: new Date().toISOString(), ...formData };
          setDisplayData((prev) => [newItem, ...prev]);
          toast.success('Thêm mới mục dữ liệu thành công!');
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể lưu dữ liệu');
    }
    setShowModal(false);
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-slate-400">
        <div className="w-10 h-10 border-4 border-[#1A94FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="font-semibold text-slate-600 text-sm">Đang tải Admin Dashboard...</p>
      </div>
    );
  }

  const verticalNavGroups = [
    {
      groupTitle: 'BẢNG ĐIỀU HÀNH',
      items: [
        { id: 'overview', label: 'Tổng quan hệ thống', icon: LayoutDashboard },
        { id: 'homepage-settings', label: 'Cấu hình Trang chủ & Banner', icon: Sparkles },
      ],
    },
    {
      groupTitle: 'KHO DỮ LIỆU & NỘI DUNG',
      items: [
        { id: 'fish', label: 'Cá cảnh & Sinh vật', icon: Fish, count: stats.fishCount },
        { id: 'categories', label: 'Danh mục loài (9 loại)', icon: FolderTree, count: 9 },
        { id: 'articles', label: 'Cẩm nang & Hướng dẫn', icon: BookOpen, count: stats.articlesCount },
        { id: 'article-categories', label: 'Danh mục Cẩm nang', icon: FolderTree, count: stats.articleCategoriesCount },
        { id: 'listings', label: 'Quản lý Tin rao Chợ', icon: ShoppingBag, count: stats.listingsCount },
        { id: 'listing-categories', label: 'Danh mục Chợ Thủy Sinh', icon: FolderTree, count: stats.listingCategoriesCount },
      ],
    },
    {
      groupTitle: 'CỘNG ĐỒNG & GIẢI ĐÁP',
      items: [
        { id: 'community', label: 'Bài viết Cộng đồng', icon: Compass, count: stats.postsCount },
        { id: 'questions', label: 'Hỏi đáp & Tư vấn Q&A', icon: HelpCircle, count: stats.questionsCount },
        { id: 'tanks', label: 'Nhật ký Hồ cá số', icon: Layers, count: stats.tanksCount },
      ],
    },
    {
      groupTitle: 'HỆ THỐNG & TIỆN ÍCH',
      items: [
        { id: 'traffic', label: 'Thống kê Traffic & Lượt truy cập', icon: Activity },
        { id: 'ads', label: 'Chiến dịch Quảng cáo', icon: Megaphone, count: stats.adsCount },
        { id: 'users', label: 'Quản lý Thành viên', icon: Users, count: stats.usersCount },
      ],
    },
  ];

  // Helper to render flexible page number buttons
  const renderPaginationButtons = () => {
    const pages = [];
    const maxButtons = 5;
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
            page === i
              ? 'bg-[#1A94FF] text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="w-full px-2 sm:px-6 lg:px-8 py-3 min-h-screen lg:h-[calc(100vh-95px)] overflow-y-auto lg:overflow-hidden flex flex-col">
      
      {/* Main Vertical Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch flex-1 min-h-0">
        
        {/* Left Vertical Tab Navigation */}
        <div className="lg:col-span-3 bg-white border border-blue-100 rounded-2xl p-3 shadow-sm space-y-3 sticky top-0 overflow-y-auto max-h-full">
          {verticalNavGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 pt-1 pb-0.5">
                {group.groupTitle}
              </div>
              {group.items.map((item: any) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as any); setPage(1); setSearchQuery(''); setSelectedCategory(''); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? 'bg-[#1A94FF] text-white shadow-md shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-blue-50 hover:text-[#1A94FF]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#1A94FF]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count !== null && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Right Main Table & CRUD Content Area */}
        <div className="lg:col-span-9 space-y-4 h-full flex flex-col overflow-hidden">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div onClick={() => setActiveTab('fish')} className="bg-white border border-blue-100 rounded-2xl p-4 space-y-2 shadow-sm cursor-pointer hover:border-blue-300 transition">
                  <div className="flex items-center justify-between text-slate-400">
                    <Fish className="w-5 h-5 text-[#1A94FF]" />
                    <span className="text-[10px] font-bold bg-blue-50 text-[#0B74E5] px-2 py-0.5 rounded-full">1.150 loài</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.fishCount}</div>
                  <div className="text-xs text-slate-500 font-medium">Cá cảnh & Thủy sinh</div>
                </div>

                <div onClick={() => setActiveTab('community')} className="bg-white border border-blue-100 rounded-2xl p-4 space-y-2 shadow-sm cursor-pointer hover:border-blue-300 transition">
                  <div className="flex items-center justify-between text-slate-400">
                    <Compass className="w-5 h-5 text-indigo-500" />
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">Duyệt bài</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.postsCount}</div>
                  <div className="text-xs text-slate-500 font-medium">Bài viết Cộng đồng</div>
                </div>

                <div onClick={() => setActiveTab('questions')} className="bg-white border border-blue-100 rounded-2xl p-4 space-y-2 shadow-sm cursor-pointer hover:border-blue-300 transition">
                  <div className="flex items-center justify-between text-slate-400">
                    <HelpCircle className="w-5 h-5 text-amber-500" />
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">Giải đáp</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.questionsCount}</div>
                  <div className="text-xs text-slate-500 font-medium">Câu hỏi Q&A</div>
                </div>
              </div>

              <div className="bg-white border border-blue-100 rounded-2xl p-5 space-y-3 shadow-sm">
                <h3 className="font-bold text-slate-900 text-sm">Chào mừng Admin AquaHub</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Vui lòng nhấp vào các menu tab dọc bên trái để quản lý danh sách cá cảnh, duyệt bài viết cộng đồng, gỡ câu hỏi vi phạm hoặc thêm mới sinh vật/cẩm nang.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: HOMEPAGE & BANNER SETTINGS */}
          {activeTab === 'homepage-settings' && (
            <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm overflow-y-auto space-y-6 max-h-[calc(100vh-125px)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#1A94FF]" />
                    <span>Cấu hình Trang chủ & Banner Động</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Quản lý toàn bộ thông tin hiển thị trên Hero Banner, Thông số Hồ nổi và Con số Thống kê trang chủ.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await api.post('/settings', siteSettings);
                      toast.success('Đã lưu cấu hình trang chủ thành công!');
                    } catch (err: any) {
                      toast.error('Lỗi khi lưu cấu hình');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1A94FF] hover:bg-[#0B74E5] text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </button>
              </div>

              {/* Form Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Hero Content Text & Banner Image */}
                <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2">
                    <ImageIcon className="w-4 h-4 text-[#1A94FF]" />
                    <span>Hero Banner & Nội dung Tiêu đề</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Badge Nổi bật</label>
                    <input
                      type="text"
                      value={siteSettings.heroBadge || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, heroBadge: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#1A94FF]"
                      placeholder="vd: 🌿 CỘNG ĐỒNG THỦY SINH & CÁ CẢNH SỐ 1 VIỆT NAM"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề chính (Title)</label>
                    <input
                      type="text"
                      value={siteSettings.heroTitle || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, heroTitle: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#1A94FF]"
                      placeholder="vd: Khám phá Thế giới Cá cảnh & Thủy sinh"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả ngắn (Subtitle)</label>
                    <textarea
                      rows={3}
                      value={siteSettings.heroSubtitle || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#1A94FF]"
                      placeholder="vd: Nền tảng chia sẻ kinh nghiệm nuôi cá..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ảnh Banner chính (Hero Cover Image)</label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={siteSettings.heroBannerImage || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, heroBannerImage: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#1A94FF]"
                        placeholder="https://images.unsplash.com/... hoặc tải ảnh lên"
                      />
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0B74E5] font-bold text-xs cursor-pointer transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải ảnh Banner từ máy</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const uploadFormData = new FormData();
                              uploadFormData.append('file', file);
                              try {
                                const res = await api.post('/upload', uploadFormData, {
                                  headers: { 'Content-Type': 'multipart/form-dir' },
                                });
                                const imgUrl = res.data?.url || res.data;
                                setSiteSettings({ ...siteSettings, heroBannerImage: imgUrl });
                                toast.success('Tải ảnh banner lên thành công!');
                              } catch (uploadErr) {
                                toast.error('Không thể upload ảnh banner');
                              }
                            }
                          }}
                        />
                      </label>
                      {siteSettings.heroBannerImage && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 max-h-40 relative group">
                          <img src={siteSettings.heroBannerImage} alt="Banner Preview" className="w-full h-40 object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                            Xem trước ảnh Hero Banner
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Floating Tank Specs Card & Homepage Stats */}
                <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Layers className="w-4 h-4 text-[#1A94FF]" />
                    <span>Thẻ Hồ Cá Nổi bật & Chỉ số Thống kê</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tên Hồ Nổi bật</label>
                      <input
                        type="text"
                        value={siteSettings.heroTankName || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, heroTankName: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#1A94FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Chủ Hồ (Aquascaper)</label>
                      <input
                        type="text"
                        value={siteSettings.heroOwnerName || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, heroOwnerName: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#1A94FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Thể tích (Lít)</label>
                      <input
                        type="text"
                        value={siteSettings.heroTankVolume || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, heroTankVolume: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1A94FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nhiệt độ (°C)</label>
                      <input
                        type="text"
                        value={siteSettings.heroTemp || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, heroTemp: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1A94FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Độ pH</label>
                      <input
                        type="text"
                        value={siteSettings.heroPh || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, heroPh: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1A94FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Số loài cá</label>
                      <input
                        type="text"
                        value={siteSettings.heroFishCount || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, heroFishCount: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1A94FF]"
                      />
                    </div>
                  </div>

                  <hr className="border-slate-200 my-2" />

                  <h4 className="text-xs font-bold text-slate-700">Các Con Số Thống Kê Trang Chủ</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Số loài cá cảnh</label>
                      <input
                        type="text"
                        value={siteSettings.statsFish || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, statsFish: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-[#0B74E5] focus:outline-none focus:border-[#1A94FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Số hồ cá đăng tải</label>
                      <input
                        type="text"
                        value={siteSettings.statsTanks || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, statsTanks: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-indigo-600 focus:outline-none focus:border-[#1A94FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Thành viên cộng đồng</label>
                      <input
                        type="text"
                        value={siteSettings.statsMembers || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, statsMembers: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-emerald-600 focus:outline-none focus:border-[#1A94FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Hỗ trợ & Hướng dẫn</label>
                      <input
                        type="text"
                        value={siteSettings.statsSupport || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, statsSupport: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-amber-600 focus:outline-none focus:border-[#1A94FF]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TRAFFIC MANAGEMENT DASHBOARD */}
          {activeTab === 'traffic' && (
            <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm overflow-y-auto space-y-6 max-h-[calc(100vh-125px)]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#1A94FF]" />
                    <span>Quản Lý Traffic & Lượt Truy Cập Trang Web</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Theo dõi thời gian thực tổng số lượt xem trang (Pageviews), người dùng duy nhất (Unique Visitors) và thiết bị truy cập.
                  </p>
                </div>

                {/* Period Filter Buttons */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {(['today', '7days', '30days', 'all'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setTrafficPeriod(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        trafficPeriod === p
                          ? 'bg-[#1A94FF] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {p === 'today' ? 'Hôm nay' : p === '7days' ? '7 ngày qua' : p === '30days' ? '30 ngày' : 'Tất cả'}
                    </button>
                  ))}
                </div>
              </div>

              {trafficLoading ? (
                <div className="py-16 text-center text-slate-400">
                  <div className="w-8 h-8 border-3 border-[#1A94FF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">Đang thống kê dữ liệu lượt truy cập...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Top Key Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200/80 rounded-2xl p-4 space-y-1">
                      <div className="text-xs font-extrabold text-[#1A94FF] uppercase tracking-wider">Tổng Lượt Xem (Pageviews)</div>
                      <div className="text-3xl font-black text-slate-900">{trafficData?.totalPageviews || 0}</div>
                      <div className="text-[11px] text-slate-500">Lượt tải trang thực tế</div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-4 space-y-1">
                      <div className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">Người Dùng Duy Nhất (UV)</div>
                      <div className="text-3xl font-black text-slate-900">{trafficData?.uniqueVisitors || 0}</div>
                      <div className="text-[11px] text-slate-500">Địa chỉ IP phân biệt</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/80 rounded-2xl p-4 space-y-1">
                      <div className="text-xs font-extrabold text-purple-600 uppercase tracking-wider">Thiết Bị Di Động</div>
                      <div className="text-3xl font-black text-slate-900">
                        {trafficData?.deviceBreakdown?.find((d: any) => d.device === 'MOBILE')?.count || 0}
                      </div>
                      <div className="text-[11px] text-slate-500">Truy cập từ Mobile / Tablet</div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 space-y-1">
                      <div className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">Máy Tính Bàn (Desktop)</div>
                      <div className="text-3xl font-black text-slate-900">
                        {trafficData?.deviceBreakdown?.find((d: any) => d.device === 'DESKTOP')?.count || 0}
                      </div>
                      <div className="text-[11px] text-slate-500">Truy cập từ PC / Laptop</div>
                    </div>
                  </div>

                  {/* Pageview Breakdown & Device Chart Tables */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Pages */}
                    <div className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-4 space-y-3">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                        <Sparkles className="w-4 h-4 text-[#1A94FF]" />
                        <span>Trang Được Xem Nhiều Nhất (Top Pages)</span>
                      </h3>
                      <div className="space-y-2">
                        {trafficData?.topPages?.map((p: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between bg-white border border-slate-100 p-2.5 rounded-xl text-xs">
                            <span className="font-mono font-bold text-slate-800 truncate max-w-[260px]">{p.path}</span>
                            <span className="px-2.5 py-1 bg-blue-50 text-[#1A94FF] font-extrabold rounded-full">{p.views} lượt xem</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Browser & Device Breakdown */}
                    <div className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-4 space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span>Trình Duyệt & Nguồn Truy Cập</span>
                      </h3>

                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-700">Phân bố Trình duyệt:</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {trafficData?.browserBreakdown?.map((b: any, idx: number) => (
                            <div key={idx} className="bg-white border border-slate-200 p-2.5 rounded-xl text-center">
                              <div className="text-xs text-slate-500 font-semibold">{b.browser}</div>
                              <div className="text-lg font-black text-slate-800">{b.count}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="text-xs font-bold text-slate-700 mb-2">Nhật ký lượt truy cập mới nhất:</div>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {trafficData?.recentLogs?.map((log: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-[11px] bg-white border border-slate-100 p-2 rounded-lg text-slate-600">
                              <span className="font-mono text-slate-800">{log.ip}</span>
                              <span className="font-semibold text-blue-600 truncate max-w-[150px]">{log.path}</span>
                              <span className="text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* TABLE & CRUD VIEW WITH INTERNAL SCROLLING TABLE ONLY */}
          {activeTab !== 'overview' && activeTab !== 'homepage-settings' && activeTab !== 'traffic' && (
            <div className="bg-white border border-blue-100 rounded-2xl p-4 space-y-4 shadow-sm flex-1 flex flex-col justify-between overflow-hidden">
              
              <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                {/* Table Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 shrink-0">
                  <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-xs min-w-[200px]">
                      <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1A94FF]"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    </div>

                    {/* Category Filter dropdown */}
                    {(activeTab === 'fish' || activeTab === 'articles' || activeTab === 'listings' || activeTab === 'community') && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
                        <Filter className="w-3.5 h-3.5 text-[#1A94FF]" />
                        <span className="font-bold text-slate-700">Danh mục:</span>
                        <select
                          value={selectedCategory}
                          onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setPage(1);
                          }}
                          className="bg-blue-50/70 border border-blue-200 rounded-xl px-3 py-1.5 text-xs font-bold text-[#0B74E5] focus:outline-none focus:border-[#1A94FF] cursor-pointer max-w-[200px] truncate"
                        >
                          <option value="">-- Tất cả danh mục --</option>
                          {activeTab === 'fish' &&
                            categoriesList.map((cat: any) => (
                              <option key={cat.id || cat.slug} value={cat.slug || cat.id}>
                                {cat.name || cat.nameVi}
                              </option>
                            ))}
                          {activeTab === 'articles' &&
                            articleCategoriesList.map((cat: any) => (
                              <option key={cat.id || cat.slug || cat.name} value={cat.name || cat.slug || cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          {activeTab === 'listings' &&
                            listingCategoriesList.map((cat: any) => (
                              <option key={cat.id || cat.slug} value={cat.id || cat.slug}>
                                {cat.name}
                              </option>
                            ))}
                          {activeTab === 'community' && (
                            <>
                              <option value="🐟 Cá cảnh">🐟 Cá cảnh</option>
                              <option value="🌱 Thủy sinh">🌱 Thủy sinh</option>
                              <option value="💧 Nước & Vi sinh">💧 Nước & Vi sinh</option>
                              <option value="🦠 Bệnh & Chăm sóc">🦠 Bệnh & Chăm sóc</option>
                              <option value="🍤 Thức ăn">🍤 Thức ăn</option>
                              <option value="🧰 Thiết bị">🧰 Thiết bị</option>
                              <option value="🐣 Sinh sản">🐣 Sinh sản</option>
                              <option value="🦐 Tép & Sinh vật">🦐 Tép & Sinh vật</option>
                              <option value="💰 Mua bán">💰 Mua bán</option>
                            </>
                          )}
                        </select>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
                      <span>Hiển thị:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#0B74E5] focus:outline-none focus:border-[#1A94FF] cursor-pointer"
                      >
                        <option value={10}>10 phần tử / trang</option>
                        <option value={50}>50 phần tử / trang</option>
                      </select>
                    </div>
                  </div>

                  {(activeTab === 'categories' || activeTab === 'fish' || activeTab === 'articles' || activeTab === 'users' || activeTab === 'ads') && (
                    <button
                      onClick={handleOpenAddModal}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1A94FF] hover:bg-[#0B74E5] text-white font-bold text-xs shadow-sm transition cursor-pointer self-end sm:self-auto shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm mới</span>
                    </button>
                  )}
                </div>

                {/* Data Table Container with Internal Table Scroll Only */}
                <div className="overflow-auto flex-1 min-h-0 max-h-[calc(100vh-210px)] relative pr-1 border border-slate-100 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-white z-10 shadow-sm">
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                        <th className="py-2.5 px-3">STT / ID</th>
                        <th className="py-2.5 px-3">Tên / Tiêu đề</th>
                        <th className="py-2.5 px-3">Chi tiết / Danh mục</th>
                        <th className="py-2.5 px-3">Ngày tạo</th>
                        <th className="py-2.5 px-3 text-right">Thao tác CRUD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400">Đang tải dữ liệu bảng...</td>
                        </tr>
                      ) : displayData.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400">Không có dữ liệu phù hợp</td>
                        </tr>
                      ) : (
                        displayData.map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-slate-50 transition">
                            <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                              #{(page - 1) * pageSize + idx + 1}
                            </td>

                            {/* Name / Title Column */}
                            <td className="py-3 px-3 font-bold text-slate-900 max-w-[220px]">
                              {activeTab === 'ads' ? (
                                <div className="flex items-center gap-2">
                                  {item.imageUrl && (
                                    <img src={item.imageUrl} alt={item.title} className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                                  )}
                                  <div className="min-w-0">
                                    <div className="font-bold text-slate-900 truncate">{item.title}</div>
                                    <a href={item.targetUrl} target="_blank" rel="noreferrer" className="text-[10px] text-[#1A94FF] hover:underline truncate block">
                                      {item.targetUrl}
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                item.nameVi || item.title || item.username || item.name || 'Mục dữ liệu'
                              )}
                            </td>

                            {/* Category / Detail Column */}
                            <td className="py-3 px-3 text-slate-600 max-w-[320px]">
                              {activeTab === 'ads' ? (
                                <div className="space-y-1 text-[11px]">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-blue-100 text-[#0B74E5] rounded">
                                      {item.position}
                                    </span>
                                    {item.isActive !== false ? (
                                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">
                                        Đang chạy
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                                        Đã tạm dừng
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-slate-600 font-medium">
                                    <span>👁️ Lượt xem: <strong>{item.impressions || 0}</strong></span>
                                    <span>🖱️ Lượt nhấp: <strong>{item.clicks || 0}</strong></span>
                                    <span className="text-emerald-600 font-bold">
                                      CTR: {item.impressions ? ((item.clicks / item.impressions) * 100).toFixed(1) : '0.0'}%
                                    </span>
                                  </div>
                                </div>
                              ) : activeTab === 'users' ? (
                                <div className="flex items-center gap-2">
                                  <span>{item.email}</span>
                                  {item.isActive === false ? (
                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-full border border-rose-200">
                                      Đã bị khóa
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">
                                      Hoạt động
                                    </span>
                                  )}
                                </div>
                              ) : activeTab === 'fish' ? (
                                <div className="space-y-1 text-[11px]">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-900">{item.scientificName || 'Tên KH N/A'}</span>
                                    <span className="px-1.5 py-0.5 text-[10px] bg-blue-50 text-[#0B74E5] font-bold rounded">
                                      {item.categorySlug || item.category?.name || item.category?.slug || 'Chưa phân loại'}
                                    </span>
                                  </div>
                                  <div className="text-slate-500 flex items-center gap-2 flex-wrap">
                                    <span>🌡️ {item.tempMin && item.tempMax ? `${item.tempMin}-${item.tempMax}°C` : '22-28°C'}</span>
                                    <span>💧 pH {item.phMin && item.phMax ? `${item.phMin}-${item.phMax}` : '6.5-7.5'}</span>
                                    <span>🧪 {item.minTankSize || 30}L</span>
                                    <span>🏊 {item.swimLevel === 'TOP' ? 'Mặt' : item.swimLevel === 'BOTTOM' ? 'Đáy' : 'Giữa'}</span>
                                  </div>
                                  {item.compatibleFish && (
                                    <div className="text-[10px] text-emerald-700 font-medium truncate">
                                      ✅ Nuôi chung: {item.compatibleFish}
                                    </div>
                                  )}
                                </div>
                              ) : activeTab === 'articles' ? (
                                <div className="space-y-1 text-[11px]">
                                  <span className="inline-block px-2 py-0.5 text-[10px] bg-[#E5F2FF] text-[#0B74E5] font-bold rounded-md border border-blue-100">
                                    {item.category?.name || item.category || 'Kỹ thuật nuôi & Làm nước'}
                                  </span>
                                  {item.excerpt && (
                                    <p className="text-slate-500 text-[11px] line-clamp-1">{item.excerpt}</p>
                                  )}
                                </div>
                              ) : activeTab === 'listings' ? (
                                <div className="space-y-1 text-[11px]">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 text-[10px] bg-blue-50 text-[#0B74E5] font-bold rounded-md border border-blue-100">
                                      {item.category?.name || 'Chợ Thủy Sinh'}
                                    </span>
                                    {item.status === 'SOLD' ? (
                                      <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-full border border-rose-200">
                                        🔴 Đã bán
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">
                                        🟢 Đang bán
                                      </span>
                                    )}
                                  </div>
                                  {(item.location || item.price) && (
                                    <div className="text-[10px] text-slate-500 flex items-center gap-2">
                                      {item.price && <span className="font-semibold text-rose-600">{Number(item.price).toLocaleString('vi-VN')} VNĐ</span>}
                                      {item.location && <span>📍 {item.location}</span>}
                                    </div>
                                  )}
                                </div>
                              ) : activeTab === 'community' ? (
                                <div className="space-y-1 text-[11px]">
                                  <span className="inline-block px-2 py-0.5 text-[10px] bg-[#E5F2FF] text-[#0B74E5] font-bold rounded-md border border-blue-100">
                                    {item.category || '🐟 Cá cảnh'}
                                  </span>
                                  {item.content && (
                                    <p className="text-slate-500 text-[11px] line-clamp-1">{item.content}</p>
                                  )}
                                </div>
                              ) : (
                                item.scientificName || item.content || item.excerpt || item.email || item.category?.name || 'Chi tiết'
                              )}
                            </td>

                            {/* Date Column */}
                            <td className="py-3 px-3 text-slate-400 text-[11px]">
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'Mới cập nhật'}
                            </td>

                            {/* Action Column */}
                             <td className="py-3 px-3 text-right space-x-1">
                              {activeTab === 'ads' && (
                                <button
                                  onClick={() => handleToggleActiveAd(item)}
                                  title={item.isActive ? 'Tạm ẩn quảng cáo' : 'Bật chạy quảng cáo'}
                                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                                    item.isActive
                                      ? 'text-emerald-600 hover:bg-emerald-50 bg-emerald-50/50'
                                      : 'text-slate-400 hover:bg-slate-100 bg-slate-100/50'
                                  }`}
                                >
                                  {item.isActive ? <Unlock className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
                                </button>
                              )}
                              {activeTab === 'users' && (
                                <button
                                  onClick={() => handleToggleBlockUser(item)}
                                  title={item.isActive === false ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                                    item.isActive === false
                                      ? 'text-emerald-600 hover:bg-emerald-50 bg-emerald-50/50'
                                      : 'text-amber-600 hover:bg-amber-50 bg-amber-50/50'
                                  }`}
                                >
                                  {item.isActive === false ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenEditModal(item)}
                                title="Sửa"
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                title="Xóa"
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Flexible Pagination Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div className="text-slate-500">
                  Hiển thị <strong className="text-slate-800">{displayData.length > 0 ? (page - 1) * pageSize + 1 : 0}</strong> - <strong className="text-slate-800">{Math.min(page * pageSize, totalItems)}</strong> trên tổng số <strong className="text-[#0B74E5]">{totalItems}</strong> mục
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {renderPaginationButtons()}
                  </div>

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      <Dialog
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        size="5xl"
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base sm:text-lg">
            <Fish className="w-5 h-5 text-[#1A94FF]" />
            <span>{editingItem ? (activeTab === 'fish' ? 'Chỉnh sửa Sinh vật thủy sinh' : 'Chỉnh sửa mục dữ liệu') : 'Thêm mục mới'}</span>
          </div>
        }
        subtitle="Quản lý và cập nhật thông tin dữ liệu trong hệ thống AquaHub"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="admin-crud-form"
              className="px-6 py-2 bg-[#1A94FF] hover:bg-[#0B74E5] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition"
            >
              Lưu dữ liệu
            </button>
          </>
        }
      >
        <form id="admin-crud-form" onSubmit={handleSaveModal} className="space-y-4">
          {activeTab === 'fish' ? (
            /* Advanced Fish/Organism Form Fields - 5/5 Split Layout */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              
              {/* Left Column (5/5): Parameters, Metadata, Attributes */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Tên tiếng Việt *</label>
                    <input
                      type="text"
                      required
                      value={formData.nameVi || ''}
                      onChange={(e) => setFormData({ ...formData, nameVi: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1A94FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Mã Slug URL</label>
                    <input
                      type="text"
                      placeholder="Tự động tạo nếu để trống"
                      value={formData.slug || ''}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1A94FF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Tên tiếng Anh</label>
                    <input
                      type="text"
                      value={formData.nameEn || ''}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1A94FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Tên khoa học</label>
                    <input
                      type="text"
                      value={formData.scientificName || ''}
                      onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1A94FF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Kích thước (cm)</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="Min"
                        value={formData.sizeMin || ''}
                        onChange={(e) => setFormData({ ...formData, sizeMin: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-800"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={formData.sizeMax || ''}
                        onChange={(e) => setFormData({ ...formData, sizeMax: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Độ khó nuôi</label>
                    <select
                      value={formData.difficulty || 'EASY'}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-800 font-bold"
                    >
                      <option value="EASY">🟢 Dễ nuôi (EASY)</option>
                      <option value="MEDIUM">🟡 Trung bình (MEDIUM)</option>
                      <option value="HARD">🔴 Khó nuôi (HARD)</option>
                      <option value="EXPERT">🟣 Chuyên gia (EXPERT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Tầng nước bơi</label>
                    <select
                      value={formData.swimLevel || 'MIDDLE'}
                      onChange={(e) => setFormData({ ...formData, swimLevel: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-800 font-bold"
                    >
                      <option value="TOP">☁️ Tầng mặt (TOP)</option>
                      <option value="MIDDLE">🌊 Tầng giữa (MIDDLE)</option>
                      <option value="BOTTOM">🌱 Tầng đáy (BOTTOM)</option>
                      <option value="ALL">🌐 Mọi tầng nước (ALL)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Nhiệt độ (°C)</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="22"
                        value={formData.tempMin || ''}
                        onChange={(e) => setFormData({ ...formData, tempMin: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-800"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        placeholder="28"
                        value={formData.tempMax || ''}
                        onChange={(e) => setFormData({ ...formData, tempMax: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Độ pH nước</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="6.5"
                        value={formData.phMin || ''}
                        onChange={(e) => setFormData({ ...formData, phMin: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-800"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="7.5"
                        value={formData.phMax || ''}
                        onChange={(e) => setFormData({ ...formData, phMax: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Thể tích hồ tối thiểu (L)</label>
                    <input
                      type="number"
                      placeholder="30"
                      value={formData.minTankSize || ''}
                      onChange={(e) => setFormData({ ...formData, minTankSize: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Danh mục chủng loại *</label>
                    <select
                      value={formData.categorySlug || formData.categoryId || ''}
                      onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value, categoryId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold"
                    >
                      <option value="">-- Chọn danh mục cá --</option>
                      {categoriesList.map((cat: any) => (
                        <option key={cat.id || cat.slug} value={cat.slug || cat.id}>
                          {cat.name} ({cat.slug})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Tính cách / Tính khí</label>
                    <input
                      type="text"
                      placeholder="Hiền lành, Lãnh thổ, Hung dữ..."
                      value={formData.temperament || ''}
                      onChange={(e) => setFormData({ ...formData, temperament: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Cá có thể nuôi chung</label>
                    <input
                      type="text"
                      placeholder="Cá Neon, Cá Sọc Ngựa, Tép cảnh..."
                      value={formData.compatibleFish || ''}
                      onChange={(e) => setFormData({ ...formData, compatibleFish: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Bệnh thường gặp</label>
                    <input
                      type="text"
                      placeholder="Bệnh nấm trắng, nấm vây..."
                      value={formData.commonDiseases || ''}
                      onChange={(e) => setFormData({ ...formData, commonDiseases: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column (5/5): Dedicated Exclusively to Content Description */}
              <div className="h-full flex flex-col justify-between space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Nội dung & Mô tả chi tiết (Rich Text Editor) *
                </label>
                <div className="flex-1 min-h-[360px]">
                  <RichTextEditor
                    minHeight="340px"
                    placeholder="Nhập nội dung chi tiết về sinh thái, tập tính, hướng dẫn chăm sóc cá cảnh..."
                    value={formData.description || ''}
                    onChange={(val) => setFormData({ ...formData, description: val })}
                  />
                </div>
              </div>

            </div>
          ) : activeTab === 'categories' ? (
            /* Specialized Categories Form Fields with Parent Category Selector */
            <div className="space-y-3">
              {/* Row 1: Tên danh mục + Mã Slug URL (2 Cột rộng thoáng) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tên danh mục *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Cá Koi & Cá Vàng, Cá thủy sinh..."
                    value={formData.name || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      const generatedSlug = val
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[đĐ]/g, 'd')
                        .replace(/[^a-z0-9\s-]/g, '')
                        .trim()
                        .replace(/\s+/g, '-');
                      setFormData({ ...formData, name: val, slug: formData.slug || generatedSlug });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#1A94FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mã định danh Slug (URL path)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: ca-koi-ca-vang, ca-thuy-sinh"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#1A94FF] font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Danh mục Cha (Parent Categories) Multi-Select Pills */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Thuộc các Danh mục Cha (Chọn 1 hoặc nhiều)
                </label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5 p-2 bg-blue-50/50 border border-blue-100 rounded-xl">
                    {(formData.parentIds || (formData.parentId ? [formData.parentId] : [])).map((pSlug: string) => {
                      const catObj = (categoriesList.length > 0 ? categoriesList : [
                        { slug: 'ca-nuoc-nghot', name: 'Cá nước ngọt' },
                        { slug: 'ca-bien', name: 'Cá biển' },
                        { slug: 'ca-thuy-sinh', name: 'Cá thủy sinh' },
                        { slug: 'ca-betta', name: 'Cá Betta' },
                        { slug: 'ca-guppy', name: 'Cá Guppy' },
                        { slug: 'ca-koi-ca-vang', name: 'Cá Koi & Cá Vàng' },
                        { slug: 'tep-canh', name: 'Tép cảnh' },
                        { slug: 'oc-canh', name: 'Ốc cảnh' },
                        { slug: 'cay-thuy-sinh', name: 'Cây thủy sinh' },
                      ]).find((c) => c.slug === pSlug);

                      return (
                        <span
                          key={pSlug}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-xs font-semibold text-[#0B74E5] shadow-2xs"
                        >
                          <span>{catObj?.name || pSlug}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const current = formData.parentIds || (formData.parentId ? [formData.parentId] : []);
                              const updated = current.filter((s: string) => s !== pSlug);
                              setFormData({
                                ...formData,
                                parentIds: updated,
                                parentId: updated[0] || null,
                              });
                            }}
                            className="hover:text-red-500 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}

                    {(formData.parentIds || (formData.parentId ? [formData.parentId] : [])).length === 0 && (
                      <span className="text-xs text-slate-400 italic">Chưa chọn danh mục cha nào (Danh mục gốc)</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(categoriesList.length > 0 ? categoriesList : [
                      { slug: 'ca-nuoc-nghot', name: 'Cá nước ngọt' },
                      { slug: 'ca-bien', name: 'Cá biển' },
                      { slug: 'ca-thuy-sinh', name: 'Cá thủy sinh' },
                      { slug: 'ca-betta', name: 'Cá Betta' },
                      { slug: 'ca-guppy', name: 'Cá Guppy' },
                      { slug: 'ca-koi-ca-vang', name: 'Cá Koi & Cá Vàng' },
                      { slug: 'tep-canh', name: 'Tép cảnh' },
                      { slug: 'oc-canh', name: 'Ốc cảnh' },
                      { slug: 'cay-thuy-sinh', name: 'Cây thủy sinh' },
                    ])
                      .filter((c) => c.slug !== formData.slug)
                      .map((pCat) => {
                        const currentParents = formData.parentIds || (formData.parentId ? [formData.parentId] : []);
                        const isChecked = currentParents.includes(pCat.slug);

                        return (
                          <button
                            key={pCat.slug}
                            type="button"
                            onClick={() => {
                              let updated: string[];
                              if (isChecked) {
                                updated = currentParents.filter((s: any) => s !== pCat.slug);
                              } else {
                                updated = [...currentParents, pCat.slug];
                              }
                              setFormData({
                                ...formData,
                                parentIds: updated,
                                parentId: updated[0] || null,
                              });
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border ${
                              isChecked
                                ? 'bg-[#1A94FF] text-white border-[#1A94FF] shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                            }`}
                          >
                            <span>{isChecked ? '✓' : '+'}</span>
                            <span>{pCat.name}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mô tả danh mục</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả phân loại các loài thuộc danh mục này..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#1A94FF]"
                />
              </div>
            </div>
          ) : (
            /* General Form Fields for Articles, Users, Ads, etc. */
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tên / Tiêu đề *</label>
                <input
                  type="text"
                  required
                  value={formData.title || formData.name || formData.username || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (activeTab === 'users') {
                      setFormData({ ...formData, username: val });
                    } else if (activeTab === 'articles' || activeTab === 'ads') {
                      setFormData({ ...formData, title: val });
                    } else {
                      setFormData({ ...formData, name: val });
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#1A94FF]"
                />
              </div>

              {activeTab === 'articles' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Danh mục bài viết *</label>
                  <select
                    value={formData.category || formData.categoryId || 'Kỹ thuật nuôi & Làm nước'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, categoryId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#1A94FF] font-bold"
                  >
                    <option value="Kỹ thuật nuôi & Làm nước">Kỹ thuật nuôi & Làm nước</option>
                    <option value="Bệnh cá & Điều trị">Bệnh cá & Điều trị</option>
                    <option value="Hồ thủy sinh & Dụng cụ">Hồ thủy sinh & Dụng cụ</option>
                    <option value="Thức ăn & Dinh dưỡng">Thức ăn & Dinh dưỡng</option>
                    <option value="Sinh sản & Nhân giống">Sinh sản & Nhân giống</option>
                  </select>
                </div>
              )}

              {activeTab === 'ads' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Đường dẫn liên kết (Link URL)</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={formData.linkUrl || ''}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#1A94FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vị trí hiển thị (Placement)</label>
                    <select
                      value={formData.placement || 'SIDEBAR'}
                      onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#1A94FF] font-bold"
                    >
                      <option value="SIDEBAR">📌 Cột bên (Sidebar Banner)</option>
                      <option value="BANNER">🖼️ Băng rôn chính (Header Main Banner)</option>
                      <option value="POPUP">💬 Bật lên (Popup Dialog)</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab !== 'users' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nội dung / Mô tả (Rich Text Editor)
                  </label>
                  <div className="min-h-[260px]">
                    <RichTextEditor
                      value={formData.content || formData.description || ''}
                      onChange={(val) =>
                        setFormData({
                          ...formData,
                          content: val,
                          description: val,
                        })
                      }
                      placeholder={
                        activeTab === 'articles'
                          ? 'Soạn thảo nội dung cẩm nang chăm sóc cá cảnh (Hỗ trợ định dạng in đậm, in nghiêng, tiêu đề H2/H3, danh sách, chèn link...)'
                          : 'Nhập nội dung chi tiết...'
                      }
                      minHeight="240px"
                    />
                  </div>
                </div>
              )}

              {/* Avatar / Image File Upload Input with Live Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hình ảnh (Avatar / URL)</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                    <div className="w-12 h-12 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center">
                      {formData.images?.[0] || formData.avatar || formData.imageUrl ? (
                        <img
                          src={formData.images?.[0] || formData.avatar || formData.imageUrl}
                          alt="Preview Avatar"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Fish className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="file"
                        accept="image/*"
                        id="avatar-file-upload"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              toast.info('Đang tải ảnh lên máy chủ...');
                              const uploadData = new FormData();
                              uploadData.append('file', file);
                              const res: any = await api.post('/upload', uploadData, {
                                headers: { 'Content-Type': 'multipart/form-data' },
                              });
                              const imageUrl = res?.data?.url || res?.url;
                              if (imageUrl) {
                                if ((activeTab as string) === 'fish') {
                                  setFormData({ ...formData, images: [imageUrl] });
                                } else if ((activeTab as string) === 'ads') {
                                  setFormData({ ...formData, imageUrl });
                                } else {
                                  setFormData({ ...formData, avatar: imageUrl });
                                }
                                toast.success('Tải ảnh lên máy chủ thành công!');
                              } else {
                                toast.error('Không nhận được URL ảnh từ máy chủ');
                              }
                            } catch (err: any) {
                              toast.error(err.message || 'Lỗi khi tải ảnh lên máy chủ');
                            }
                          }
                        }}
                      />
                      <label
                        htmlFor="avatar-file-upload"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1A94FF] hover:bg-[#0B74E5] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải ảnh từ máy...</span>
                      </label>
                      <p className="text-[10px] text-slate-400 mt-1 truncate">Hỗ trợ JPG, PNG, WEBP (Xem trước trực tiếp)</p>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Hoặc nhập đường dẫn URL ảnh (https://...)"
                    value={formData.images?.[0] || formData.avatar || ''}
                    onChange={(e) => {
                      const url = e.target.value;
                      if ((activeTab as string) === 'fish') {
                        setFormData({ ...formData, images: [url] });
                      } else {
                        setFormData({ ...formData, avatar: url });
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1A94FF]"
                  />
                </div>
              </div>
            </div>
          )}
        </form>
      </Dialog>

    </div>
  );
}
