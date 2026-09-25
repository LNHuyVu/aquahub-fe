'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { getVietnameseFieldLabel, formatVietnameseFieldValue, TAB_LABELS_VI } from '@/hooks/use-vietnamese-fields';
import {
  AlertCircle,
  Shield,
  Users,
  Fish,
  HelpCircle,
  Layers,
  FileText,
  Trash2,
  Edit,
  Copy,
  Plus,
  Search,
  ArrowUpRight,
  Compass,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
  Maximize2,
  Minimize2,
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
  Wrench,
  Mail,
} from 'lucide-react';

import { useToast } from '@/components/ui/toast-provider';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { Dialog } from '@/components/ui/dialog';

function AdminDashboardContent() {
  const { user, loading: authLoading } = useAuth();
  const { toast, confirm } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabFromUrl = searchParams.get('tab');
  const pageFromUrl = Number(searchParams.get('page')) || 1;
  const limitFromUrl = Number(searchParams.get('limit')) || 10;

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
    | 'menu-settings'
    | 'traffic'
  >((tabFromUrl as any) || 'overview');

  // Flexible Pagination & Page Size states synced with URL
  const [page, setPage] = useState(pageFromUrl);
  const [pageSize, setPageSize] = useState(limitFromUrl); // Customizable per-page limit (10, 20, 50, 100)

  // Sync state when URL search params change (e.g. browser back/forward or F5)
  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl as any);
    }
    if (pageFromUrl !== page) {
      setPage(pageFromUrl);
    }
    if (limitFromUrl !== pageSize) {
      setPageSize(limitFromUrl);
    }
  }, [tabFromUrl, pageFromUrl, limitFromUrl]);

  // Helper to sync page/limit changes to URL
  const updateUrlParams = (newTab: string, newPage: number, newLimit: number) => {
    const params = new URLSearchParams();
    params.set('tab', newTab);
    if (newPage > 1) params.set('page', String(newPage));
    if (newLimit !== 10) params.set('limit', String(newLimit));
    router.replace(`/admin?${params.toString()}`, { scroll: false });
  };

  const changePage = (newPage: number) => {
    setPage(newPage);
    updateUrlParams(activeTab, newPage, pageSize);
  };

  const changePageSize = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
    updateUrlParams(activeTab, 1, newSize);
  };

  // Lock document body vertical scrollbar on Admin page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Helper to change activeTab and update URL router
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab as any);
    setPage(1);
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSelectedSwimLevel('');
    updateUrlParams(newTab, 1, pageSize);
  };

  const [adsCount, setAdsCount] = useState(0);
  const [trafficData, setTrafficData] = useState<any>(null);
  const [trafficPeriod, setTrafficPeriod] = useState<'today' | '7days' | '30days' | 'all'>('7days');
  const [trafficLoading, setTrafficLoading] = useState(false);

  const [loading, setLoading] = useState(true);

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedSwimLevel, setSelectedSwimLevel] = useState<string>('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryDropdownRef = React.useRef<HTMLDivElement>(null);
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Data lists
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [categoryFilterSearch, setCategoryFilterSearch] = useState<string>('');
  const [articleCategoriesList, setArticleCategoriesList] = useState<any[]>([]);
  const [listingCategoriesList, setListingCategoriesList] = useState<any[]>([]);
  const [rawAllData, setRawAllData] = useState<any[]>([]);
  const [displayData, setDisplayData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    usersCount: 0,
    fishCount: 0,
    fishCategoriesCount: 0,
    postsCount: 0,
    questionsCount: 0,
    tanksCount: 0,
    articlesCount: 0,
    articleCategoriesCount: 0,
    listingsCount: 0,
    listingCategoriesCount: 0,
    adsCount: 0,
  });

  const fetchAdminStats = async () => {
    try {
      const res: any = await api.get('/settings/admin-stats');
      const data = res.data || res;
      if (data && typeof data === 'object') {
        setStats((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  // Modal states for CRUD
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewingDetailItem, setViewingDetailItem] = useState<any>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewImageTitle, setPreviewImageTitle] = useState<string>('');
  const [isDetailMaximized, setIsDetailMaximized] = useState(false);
  const [formData, setFormData] = useState<any>({});


  // Boost Likes Modal State
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [boostPostId, setBoostPostId] = useState<string | null>(null);
  const [boostCount, setBoostCount] = useState(10);

  const handleBoostLikes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boostPostId || boostCount <= 0) return;
    try {
      const res: any = await api.post(`/posts/${boostPostId}/boost-likes`, { count: boostCount });
      toast.success(res.data?.message || `Đã tăng thành công ${boostCount} lượt thích!`);
      setShowBoostModal(false);
      fetchTabData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi tăng lượt thả tim');
    }
  };

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAllPages, setSelectAllPages] = useState(false);

  // Bulk Category Update Modal State
  const [showBulkCategoryModal, setShowBulkCategoryModal] = useState(false);
  const [bulkSelectedCatIds, setBulkSelectedCatIds] = useState<string[]>([]);
  const [bulkSelectedCatSlugs, setBulkSelectedCatSlugs] = useState<string[]>([]);
  const [bulkCategoryFilterSearch, setBulkCategoryFilterSearch] = useState('');
  const [updatingBulkCategory, setUpdatingBulkCategory] = useState(false);

  const handleSaveBulkCategories = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    if (bulkSelectedCatIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 danh mục để cập nhật');
      return;
    }

    setUpdatingBulkCategory(true);
    try {
      const primaryCat = bulkSelectedCatIds[0];
      const primarySlug = bulkSelectedCatSlugs[0];

      if (activeTab === 'fish') {
        await api.patch('/fish/bulk-categories', {
          ids: selectedIds,
          categoryId: primaryCat,
          categoryIds: bulkSelectedCatIds,
          categorySlugs: bulkSelectedCatSlugs,
        });
      } else {
        await Promise.allSettled(
          selectedIds.map((id) => {
            if (activeTab === 'articles') return api.patch(`/articles/${id}`, { categoryId: primaryCat, category: primarySlug });
            if (activeTab === 'listings') return api.patch(`/listings/admin/${id}`, { categoryId: primaryCat });
            return Promise.resolve();
          })
        );
      }

      toast.success(`Đã cập nhật danh mục cho ${selectedIds.length} mục được chọn thành công!`);
      setShowBulkCategoryModal(false);
      setSelectedIds([]);
      fetchTabData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi cập nhật danh mục hàng loạt');
    } finally {
      setUpdatingBulkCategory(false);
    }
  };

  // Import Data Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importTarget, setImportTarget] = useState<'articles' | 'article-categories' | 'fish' | 'fish-categories'>('articles');
  const [importMode, setImportMode] = useState<'preset' | 'json'>('preset');
  const [importJsonText, setImportJsonText] = useState('');
  const [importing, setImporting] = useState(false);

  const getSampleJsonForTarget = (target: 'articles' | 'article-categories' | 'fish' | 'fish-categories') => {
    switch (target) {
      case 'fish':
        return [
          {
            nameVi: "Cá Neon Xanh",
            nameEn: "Neon Tetra",
            scientificName: "Paracheirodon innesi",
            categoryName: "Cá thủy sinh",
            categories: ["Cá thủy sinh", "Cá nước ngọt"],
            images: ["https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800"],
            sizeMin: 2,
            sizeMax: 4,
            lifespan: "3–5 năm",
            difficulty: "EASY",
            tempMin: 21,
            tempMax: 27,
            phMin: 6.0,
            phMax: 7.0,
            minTankSize: 40,
            swimLevel: "MIDDLE",
            temperament: "Hiền lành, bơi theo đàn",
            diet: "Cám hạt nhỏ, trùn chỉ",
            compatibleFish: "Cá Bảy màu, cá Sọc ngựa",
            incompatibleFish: "Cá lớn săn mồi",
            commonDiseases: "Bệnh nấm trắng",
            description: "Cá Neon Xanh nổi bật với dải dạ quang phát sáng quyến rũ dưới ánh đèn hồ cá."
          },
          {
            nameVi: "Cá Betta Halfmoon",
            nameEn: "Siamese Fighting Fish",
            scientificName: "Betta splendens",
            categoryName: "Cá Betta",
            categories: ["Cá Betta", "Cá nước ngọt"],
            images: ["https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=800"],
            sizeMin: 5,
            sizeMax: 7,
            lifespan: "2–3 năm",
            difficulty: "EASY",
            tempMin: 24,
            tempMax: 30,
            phMin: 6.5,
            phMax: 7.5,
            minTankSize: 10,
            swimLevel: "TOP",
            temperament: "Hung dữ với đực cùng loài",
            diet: "Cám Betta, lăng quăng",
            compatibleFish: "Cá lau kính nhỏ",
            incompatibleFish: "Cá Betta đực khác",
            commonDiseases: "Thối vây, nấm gòn",
            description: "Cá Betta Halfmoon sở hữu bộ đuôi xòe rộng 180 độ tuyệt đẹp."
          }
        ];
      case 'fish-categories':
        return [
          {
            name: "Cá thủy sinh",
            description: "Các loài cá kích thước nhỏ, hiền lành thích hợp nuôi hồ thủy sinh",
            order: 1
          },
          {
            name: "Cá Betta",
            description: "Cá chọi Betta với bộ vây rực rỡ và tính cách độc lập",
            order: 2
          },
          {
            name: "Tép cảnh & Ốc",
            description: "Các loại tép màu, tép Sulawesi và ốc dọn rêu hại",
            order: 3
          }
        ];
      case 'article-categories':
        return [
          {
            name: "Kỹ thuật nuôi & Làm nước",
            description: "Hướng dẫn chu trình vi sinh, lọc nước và xử lý nước bể cá"
          },
          {
            name: "Bệnh cá & Điều trị",
            description: "Triệu chứng nấm cá, thối vây, sình bụng và các bài thuốc trị hiệu quả"
          },
          {
            name: "Dinh dưỡng & Thức ăn",
            description: "Chế độ ăn phù hợp cho từng loại cá cảnh và sinh vật"
          }
        ];
      case 'articles':
      default:
        return [
          {
            title: "Bí quyết nuôi cá Guppy 7 màu vây xòe rực rỡ",
            excerpt: "Hướng dẫn chọn cá giống, chuẩn bị bể và chế độ ăn giúp cá 7 màu đẻ sai và giữ dáng đẹp.",
            category: "Kỹ thuật nuôi & Làm nước",
            tags: ["Cá Guppy", "Cẩm nang"],
            coverImage: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800",
            content: "<h2>1. Chuẩn bị bể nuôi</h2><p>Nên chọn bể tối thiểu 20L nước có vi sinh ổn định...</p>"
          },
          {
            title: "Kỹ thuật Cycle bể cá mới tạo hệ vi sinh chuẩn sau 7 ngày",
            excerpt: "Quy trình thiết lập chu trình Nitơ xử lý khí độc NH3/NO2 an toàn cho cá cảnh.",
            category: "Kỹ thuật nuôi & Làm nước",
            tags: ["Cycle bể", "Vi sinh"],
            coverImage: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800",
            content: "<h2>1. Nguyên lý chu trình Nitơ</h2><p>Châm men vi sinh tươi và duy trì sủi oxy 24/7...</p>"
          }
        ];
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImporting(true);
    try {
      if (importTarget === 'articles' && importMode === 'preset') {
        toast.info('Đang nạp dữ liệu cẩm nang hệ thống...');
        const res: any = await api.post('/articles/import', { usePresetSystem: true });
        toast.success(res.data?.message || res.message || 'Import bài viết cẩm nang thành công!');
      } else {
        if (!importJsonText.trim()) {
          toast.error('Vui lòng dán dữ liệu JSON hoặc chọn file .json');
          setImporting(false);
          return;
        }
        let itemsList: any[] = [];
        try {
          const parsed = JSON.parse(importJsonText);
          itemsList = Array.isArray(parsed) ? parsed : (parsed.items || parsed.articles || parsed.categories || parsed.fish || [parsed]);
        } catch (err) {
          toast.error('Cú pháp JSON không hợp lệ. Vui lòng kiểm tra lại!');
          setImporting(false);
          return;
        }

        if (itemsList.length === 0) {
          toast.error('Dữ liệu JSON không chứa phần tử hợp lệ');
          setImporting(false);
          return;
        }

        const CHUNK_SIZE = 50;
        let totalInserted = 0;
        let totalUpdated = 0;
        let endpoint = '/articles/import';
        let payloadKey = 'articles';

        if (importTarget === 'fish') {
          endpoint = '/fish/import';
          payloadKey = 'items';
        } else if (importTarget === 'fish-categories') {
          endpoint = '/fish/categories/import';
          payloadKey = 'categories';
        } else if (importTarget === 'article-categories') {
          endpoint = '/articles/categories/import';
          payloadKey = 'categories';
        }

        for (let i = 0; i < itemsList.length; i += CHUNK_SIZE) {
          const chunk = itemsList.slice(i, i + CHUNK_SIZE);
          toast.info(`Đang import ${i + 1} đến ${Math.min(i + CHUNK_SIZE, itemsList.length)} trên tổng số ${itemsList.length}...`);
          const res: any = await api.post(endpoint, { [payloadKey]: chunk, usePresetSystem: false });
          totalInserted += res.data?.inserted || 0;
          totalUpdated += res.data?.updated || 0;
        }

        toast.success(`Đã xử lý ${itemsList.length} phần tử! (Thêm mới: ${totalInserted}, Cập nhật: ${totalUpdated})`);
      }

      setShowImportModal(false);
      setImportJsonText('');
      fetchTabData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi thực hiện import');
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
      toast.error('Vui lòng chọn file có định dạng .json');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const count = Array.isArray(parsed) ? parsed.length : (parsed.articles?.length || parsed.items?.length || parsed.categories?.length || 1);
        setImportJsonText(content);
        toast.success(`Đã đọc thành công file "${file.name}" (${count} phần tử)!`);
      } catch (err) {
        toast.error('File JSON không hợp lệ hoặc sai cú pháp.');
      }
    };
    reader.onerror = () => {
      toast.error('Không thể đọc file JSON này');
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleJson = () => {
    const sample = getSampleJsonForTarget(importTarget);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sample, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `aquahub_${importTarget}_sample.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Đã tải xuống file JSON mẫu thành công!");
  };

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
      fetchAdminStats();
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
  }, [user, authLoading, activeTab, page, pageSize, searchQuery, selectedCategory, selectedDifficulty, selectedSwimLevel]);

  const fetchTabData = async () => {
    const savedScrollTop = tableContainerRef.current?.scrollTop || 0;
    setLoading(true);
    fetchAdminStats();
    try {
      if (activeTab === 'overview') {
        const fishRes = await api.get('/fish', { params: { limit: 1 } });
        setStats(prev => ({ ...prev, fishCount: fishRes.data?.meta?.totalItems || 0 }));
      } else if (activeTab === 'fish') {
        const params: any = { page, limit: pageSize, search: searchQuery };
        if (selectedCategory) params.category = selectedCategory;
        if (selectedDifficulty) params.difficulty = selectedDifficulty;
        if (selectedSwimLevel) params.swimLevel = selectedSwimLevel;
        const res: any = await api.get('/fish', { params });
        let items = res.data.items || [];
        setStats(prev => ({ ...prev, fishCount: res.data?.meta?.total || res.data?.meta?.totalItems || 0 }));
        setDisplayData(items);
        setTotalPages(res.data.meta?.totalPages || 1);
        setTotalItems(res.data.meta?.total ?? res.data.meta?.totalItems ?? items.length);
      } else {
        // Client-side flexible pagination for other tabs
        let items: any[] = [];
        if (activeTab === 'categories') {
          const res: any = await api.get('/fish/categories');
          items = res.data || [];
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
          const res: any = await api.get('/questions', { params: { search: searchQuery, limit: 1000 } });
          const payload = res.data?.data || res.data || {};
          items = Array.isArray(payload) ? payload : (payload.items || payload.data || []);
        } else if (activeTab === 'tanks') {
          const res: any = await api.get('/tanks');
          items = res.data || [];
        } else if (activeTab === 'articles') {
          const res: any = await api.get('/articles', { params: { limit: 1000 } });
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
          setStats(prev => ({ ...prev, articlesCount: res.data?.meta?.total || res.data?.meta?.totalItems || items.length }));
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
          setTotalItems(payload.meta?.total ?? payload.meta?.totalItems ?? items.length);
          setStats(prev => ({ ...prev, listingsCount: payload.meta?.total || payload.meta?.totalItems || items.length }));
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
          setTotalItems(payload.meta?.total ?? payload.meta?.totalItems ?? 0);
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
      // Restore scroll position after DOM re-renders
      requestAnimationFrame(() => {
        if (tableContainerRef.current) {
          tableContainerRef.current.scrollTop = savedScrollTop;
        }
      });
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
    else if (activeTab === 'listings') setFormData({
      title: '', description: '', price: 0, priceType: 'FIXED', condition: 'LIKE_NEW',
      status: 'ACTIVE', images: [], contactName: '', contactPhone: '', contactZalo: '',
      province: 'Hà Nội', district: '', ward: '', streetAddress: '',
      shippingAvailable: false, shippingNote: '', categoryId: '',
      shopeeProductUrl: '', shopeeProductName: '', shopeePrice: 0, shopeeImageUrl: '', shopeeCommissionRate: '',
    });
    else setFormData({});
    setShowModal(true);
  };

  const handleOpenEditModal = (item: any) => {
    setEditingItem(item);

    // Initial categoryIds / categorySlugs array construction
    let initialCatIds: string[] = item.categoryIds || [];
    let initialCatSlugs: string[] = item.categorySlugs || [];
    if (initialCatIds.length === 0 && (item.categoryId || item.categorySlug || item.category)) {
      const primary = item.categoryId || item.categorySlug || (typeof item.category === 'object' ? item.category?.id || item.category?.slug : item.category);
      if (primary) initialCatIds = [primary];
    }

    setFormData({
      ...item,
      categoryIds: initialCatIds,
      categorySlugs: initialCatSlugs,
      name: item.name || item.nameVi || item.title || item.username || '',
      parentId: item.parentId || (item.slug !== 'ca-nuoc-nghot' && item.slug !== 'ca-bien' ? 'ca-nuoc-nghot' : ''),
    });
    setShowModal(true);
  };

  const handleDuplicateItem = (item: any) => {
    setEditingItem(null); // Set null so it creates a NEW entity in DB
    const duplicatedData = { ...item };
    delete duplicatedData.id;
    delete duplicatedData.createdAt;
    delete duplicatedData.updatedAt;
    delete duplicatedData.slug;

    if (duplicatedData.nameVi) duplicatedData.nameVi = `${duplicatedData.nameVi} (Bản sao)`;
    if (duplicatedData.name) duplicatedData.name = `${duplicatedData.name} (Bản sao)`;
    if (duplicatedData.title) duplicatedData.title = `${duplicatedData.title} (Bản sao)`;
    if (duplicatedData.username) duplicatedData.username = `${duplicatedData.username}_copy_${Math.floor(1000 + Math.random() * 9000)}`;

    setFormData(duplicatedData);
    setShowModal(true);
    toast.info('Đã nhân bản dữ liệu mẫu! Bấm "Lưu dữ liệu" để tạo mới bản sao vào CSDL.');
  };

  const handleDeleteItem = (id: string) => {
    confirm({
      title: 'Xác nhận xóa mục dữ liệu',
      message: 'Bạn có chắc chắn muốn xóa mục này khỏi cơ sở dữ liệu hệ thống? Thao tác này không thể hoàn tác.',
      type: 'danger',
      confirmText: 'Xóa vĩnh viễn',
      onConfirm: async () => {
        try {
          if (activeTab === 'fish') await api.delete(`/fish/${id}`);
          else if (activeTab === 'categories') await api.delete(`/fish/categories/${id}`);
          else if (activeTab === 'articles') await api.delete(`/articles/${id}`);
          else if (activeTab === 'community') await api.delete(`/posts/${id}`);
          else if (activeTab === 'questions') await api.delete(`/questions/${id}`);
          else if (activeTab === 'tanks') await api.delete(`/tanks/${id}`);
          else if (activeTab === 'ads') await api.delete(`/ads/${id}`);
          else if (activeTab === 'article-categories') await api.delete(`/articles/categories/${id}`);
          else if (activeTab === 'listing-categories') await api.delete(`/listings/categories/${id}`);
          else if (activeTab === 'listings') await api.delete(`/listings/${id}`);
          else if (activeTab === 'users') await api.delete(`/users/${id}`);

          toast.success('Đã xóa mục dữ liệu thành công!');
          fetchTabData();
        } catch (err: any) {
          console.error(err);
          toast.error(err.response?.data?.message || 'Không thể xóa mục dữ liệu này!');
          fetchTabData();
        }
      },
    });
  };

  // Delete All Password Verification Modal State
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  const handleDeleteBulk = (deleteAll = false) => {
    const targets = deleteAll ? (rawAllData.length > 0 ? rawAllData.map((i) => i.id) : displayData.map((i) => i.id)).filter(Boolean) : selectedIds;

    if (deleteAll) {
      setConfirmPassword('');
      setShowDeleteAllModal(true);
      return;
    }

    const title = `Xác nhận xóa ${targets.length} mục đã chọn`;
    const message = `Bạn có chắc chắn muốn xóa ${targets.length} mục dữ liệu này không? Thao tác này không thể hoàn tác.`;

    confirm({
      title,
      message,
      type: 'danger',
      confirmText: `Xóa ${targets.length} mục`,
      onConfirm: async () => {
        try {
          const allTargetIds = selectedIds;
          await Promise.allSettled(
            allTargetIds.map((id) => {
              if (activeTab === 'fish') return api.delete(`/fish/${id}`);
              if (activeTab === 'categories') return api.delete(`/fish/categories/${id}`);
              if (activeTab === 'articles') return api.delete(`/articles/${id}`);
              if (activeTab === 'article-categories') return api.delete(`/articles/categories/${id}`);
              if (activeTab === 'community') return api.delete(`/posts/${id}`);
              if (activeTab === 'questions') return api.delete(`/questions/${id}`);
              if (activeTab === 'ads') return api.delete(`/ads/${id}`);
              if (activeTab === 'listing-categories') return api.delete(`/listings/categories/${id}`);
              if (activeTab === 'listings') return api.delete(`/listings/${id}`);
              if (activeTab === 'tanks') return api.delete(`/tanks/${id}`);
              if (activeTab === 'users') return api.delete(`/users/${id}`);
              return Promise.resolve();
            })
          );
          toast.success(`Đã xóa thành công ${targets.length} mục!`);
          setSelectedIds([]);
          fetchTabData();
        } catch (err: any) {
          toast.error(err.response?.data?.message || err.message || 'Lỗi khi thực hiện xóa hàng loạt');
          fetchTabData();
        }
      },
    });
  };

  const handleConfirmDeleteAllWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmPassword.trim()) {
      toast.error('Vui lòng nhập mật khẩu xác nhận bảo mật!');
      return;
    }

    try {
      setVerifyingPassword(true);
      // Verify admin password with backend
      const res: any = await api.post('/auth/verify-password', { password: confirmPassword });
      if (!res.data?.valid && res.data?.valid !== true && res.valid !== true) {
        toast.error('Mật khẩu xác nhận không chính xác! Thao tác xóa toàn bộ đã bị hủy.');
        setVerifyingPassword(false);
        return;
      }

      // Password verified — proceed with bulk delete
      const targets = (rawAllData.length > 0 ? rawAllData.map((i) => i.id) : displayData.map((i) => i.id)).filter(Boolean);

      if (activeTab === 'fish') {
        await api.delete('/fish/bulk', { data: { ids: targets, deleteAll: true } });
      } else if (activeTab === 'categories') {
        await api.delete('/fish/categories/bulk', { data: { ids: targets, deleteAll: true } });
      } else if (activeTab === 'articles') {
        await api.delete('/articles/bulk', { data: { ids: targets, deleteAll: true } });
      } else if (activeTab === 'article-categories') {
        await api.delete('/articles/categories/bulk', { data: { ids: targets, deleteAll: true } });
      } else {
        const allTargetIds = targets;
        await Promise.allSettled(
          allTargetIds.map((id) => {
            if (activeTab === 'community') return api.delete(`/posts/${id}`);
            if (activeTab === 'questions') return api.delete(`/questions/${id}`);
            if (activeTab === 'ads') return api.delete(`/ads/${id}`);
            if (activeTab === 'listing-categories') return api.delete(`/listings/categories/${id}`);
            if (activeTab === 'listings') return api.delete(`/listings/${id}`);
            if (activeTab === 'tanks') return api.delete(`/tanks/${id}`);
            if (activeTab === 'users') return api.delete(`/users/${id}`);
            return Promise.resolve();
          })
        );
      }

      toast.success('Xác nhận thành công! Đã xóa toàn bộ dữ liệu CSDL thành công!');
      setShowDeleteAllModal(false);
      setConfirmPassword('');
      setSelectedIds([]);
      fetchTabData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Mật khẩu xác nhận không đúng hoặc có lỗi xảy ra');
    } finally {
      setVerifyingPassword(false);
    }
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
      } else if (activeTab === 'listings') {
        const payload = {
          title: formData.title,
          description: formData.description || 'Admin đăng tin',
          price: Number(formData.price) || 0,
          priceType: formData.priceType || 'FIXED',
          condition: formData.condition || 'LIKE_NEW',
          status: formData.status || 'ACTIVE',
          images: formData.images || [],
          contactName: formData.contactName || 'AquaHub Admin',
          contactPhone: formData.contactPhone || '0000000000',
          contactZalo: formData.contactZalo || '',
          province: formData.province || 'Hà Nội',
          district: formData.district || 'Hoàn Kiếm',
          ward: formData.ward || '',
          streetAddress: formData.streetAddress || '',
          shippingAvailable: formData.shippingAvailable || false,
          shippingNote: formData.shippingNote || '',
          categoryId: formData.categoryId || undefined,
          shopeeProductUrl: formData.shopeeProductUrl || undefined,
          shopeeProductName: formData.shopeeProductName || undefined,
          shopeePrice: formData.shopeePrice ? Number(formData.shopeePrice) : undefined,
          shopeeImageUrl: formData.shopeeImageUrl || undefined,
          shopeeCommissionRate: formData.shopeeCommissionRate || undefined,
        };
        if (editingItem) {
          await api.patch(`/listings/admin/${editingItem.id}`, payload);
          toast.success('Cập nhật tin rao Sàn Mua Bán thành công!');
        } else {
          await api.post('/listings/admin/create', payload);
          toast.success('Đăng tin Sàn Mua Bán thành công!');
        }
        fetchTabData();
      } else if (activeTab === 'listing-categories') {
        if (editingItem) {
          await api.put(`/listings/categories/${editingItem.id}`, { name: formData.name || formData.title, description: formData.description, icon: formData.icon, order: Number(formData.order) || 0 });
          toast.success('Cập nhật danh mục Sàn Mua Bán thành công!');
        } else {
          await api.post('/listings/categories', { name: formData.name || formData.title, description: formData.description, icon: formData.icon, order: Number(formData.order) || 0 });
          toast.success('Tạo mới danh mục Sàn Mua Bán thành công!');
        }
        fetchTabData();
      } else if (activeTab === 'fish') {
        if (editingItem) {
          await api.patch(`/fish/${editingItem.id}`, formData);
          toast.success('Cập nhật loài cá / sinh vật thành công!');
        } else {
          await api.post('/fish', formData);
          toast.success('Thêm mới loài cá / sinh vật thành công!');
        }
        fetchTabData();
      } else if (activeTab === 'categories') {
        if (editingItem) {
          await api.patch(`/fish/categories/${editingItem.id}`, formData);
          toast.success('Cập nhật danh mục thành công!');
        } else {
          await api.post('/fish/categories', formData);
          toast.success('Tạo danh mục mới thành công!');
        }
        fetchTabData();
      } else if (activeTab === 'articles') {
        if (editingItem) {
          await api.patch(`/articles/${editingItem.id}`, formData);
          toast.success('Cập nhật bài viết cẩm nang thành công!');
        } else {
          await api.post('/articles', formData);
          toast.success('Thêm mới bài viết cẩm nang thành công!');
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

  const handleExportData = async () => {
    try {
      toast.info('Đang chuẩn bị dữ liệu xuất...');
      let rawExportItems: any[] = [];
      let filenamePrefix = 'aquahub_export';

      if (activeTab === 'fish') {
        filenamePrefix = 'aquahub_fish';
        const res: any = await api.get('/fish', { params: { limit: 5000 } });
        rawExportItems = res.data?.items || res.data || [];
      } else if (activeTab === 'categories') {
        filenamePrefix = 'aquahub_fish_categories';
        const res: any = await api.get('/fish/categories');
        rawExportItems = res.data || [];
      } else if (activeTab === 'articles') {
        filenamePrefix = 'aquahub_articles';
        const res: any = await api.get('/articles', { params: { limit: 5000 } });
        rawExportItems = res.data?.items || res.data || [];
      } else if (activeTab === 'article-categories') {
        filenamePrefix = 'aquahub_article_categories';
        const res: any = await api.get('/articles/categories');
        rawExportItems = res.data || [];
      }

      if (selectedIds.length > 0) {
        rawExportItems = rawExportItems.filter((i) => selectedIds.includes(i.id));
      }

      if (rawExportItems.length === 0) {
        toast.error('Không có dữ liệu nào để xuất!');
        return;
      }

      // Format items to match clean import schema
      const formattedItems = rawExportItems.map((item) => {
        if (activeTab === 'fish') {
          return {
            nameVi: item.nameVi,
            nameEn: item.nameEn || '',
            scientificName: item.scientificName || '',
            categoryName: item.category?.name || item.categorySlug || 'Cá thủy sinh',
            images: item.images || [],
            sizeMin: item.sizeMin,
            sizeMax: item.sizeMax,
            lifespan: item.lifespan || '',
            difficulty: item.difficulty || 'EASY',
            tempMin: item.tempMin,
            tempMax: item.tempMax,
            phMin: item.phMin,
            phMax: item.phMax,
            minTankSize: item.minTankSize,
            swimLevel: item.swimLevel || 'MIDDLE',
            temperament: item.temperament || '',
            diet: item.diet || '',
            compatibleFish: item.compatibleFish || '',
            incompatibleFish: item.incompatibleFish || '',
            commonDiseases: item.commonDiseases || '',
            description: item.description || '',
          };
        } else if (activeTab === 'categories') {
          return {
            name: item.name,
            description: item.description || '',
            order: item.order || 1,
          };
        } else if (activeTab === 'articles') {
          return {
            title: item.title,
            excerpt: item.excerpt || '',
            content: item.content || '',
            category: item.category?.name || item.category || 'Cẩm nang chung',
            coverImage: item.coverImage || '',
            tags: item.tags || [],
          };
        } else if (activeTab === 'article-categories') {
          return {
            name: item.name,
            description: item.description || '',
          };
        }
        return item;
      });

      const todayStr = new Date().toISOString().split('T')[0];
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formattedItems, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `${filenamePrefix}_${todayStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast.success(`Đã xuất thành công ${formattedItems.length} mục dữ liệu JSON!`);
    } catch (err: any) {
      toast.error('Lỗi khi xuất dữ liệu!');
    }
  };

  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroupCollapse = (key: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (authLoading) {
    return (
      <div suppressHydrationWarning className="container mx-auto px-4 py-16 text-center text-slate-400">
        <div suppressHydrationWarning className="w-10 h-10 border-4 border-[#1A94FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="font-semibold text-slate-600 text-sm">Đang tải Admin Dashboard...</p>
      </div>
    );
  }

  const verticalNavGroups = [
    {
      groupKey: 'dashboard',
      groupTitle: 'BẢNG ĐIỀU HÀNH & THỐNG KÊ',
      badgeColor: 'bg-blue-100 text-[#0B74E5]',
      items: [
        { id: 'overview', label: 'Tổng quan hệ thống', icon: LayoutDashboard },
        { id: 'traffic', label: 'Thống kê Traffic & Truy cập', icon: Activity },
      ],
    },
    {
      groupKey: 'species',
      groupTitle: 'KHO SINH VẬT & THỦY SINH',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      items: [
        { id: 'fish', label: 'Quản lý Loài & Sinh vật', icon: Fish, count: stats.fishCount },
        { id: 'categories', label: 'Danh mục Sinh thái & Nhóm', icon: FolderTree, count: stats.fishCategoriesCount },
      ],
    },
    {
      groupKey: 'knowledge',
      groupTitle: 'CẨM NANG & KIẾN THỨC',
      badgeColor: 'bg-amber-100 text-amber-800',
      items: [
        { id: 'articles', label: 'Cẩm nang & Hướng dẫn', icon: BookOpen, count: stats.articlesCount },
        { id: 'article-categories', label: 'Danh mục Bài viết Cẩm nang', icon: FolderTree, count: stats.articleCategoriesCount },
      ],
    },
    {
      groupKey: 'marketplace',
      groupTitle: 'SÀN MUA BÁN & QUẢNG CÁO',
      badgeColor: 'bg-purple-100 text-purple-800',
      items: [
        { id: 'listings', label: 'Tin rao Sàn Mua Bán', icon: ShoppingBag, count: stats.listingsCount },
        { id: 'listing-categories', label: 'Danh mục Sàn Mua Bán', icon: FolderTree, count: stats.listingCategoriesCount },
        { id: 'ads', label: 'Chiến dịch Quảng cáo Banner', icon: Megaphone, count: stats.adsCount },
      ],
    },
    {
      groupKey: 'community',
      groupTitle: 'DIỄN ĐÀN & CỘNG ĐỒNG',
      badgeColor: 'bg-rose-100 text-rose-800',
      items: [
        { id: 'community', label: 'Bài viết Diễn đàn & Thảo luận', icon: Compass, count: stats.postsCount },
        { id: 'questions', label: 'Hỏi đáp Q&A & Tư vấn', icon: HelpCircle, count: stats.questionsCount },
        { id: 'tanks', label: 'Nhật ký Hồ cá thành viên', icon: Layers, count: stats.tanksCount },
      ],
    },
    {
      groupKey: 'system',
      groupTitle: 'QUẢN TRỊ HỆ THỐNG & CẤU HÌNH',
      badgeColor: 'bg-cyan-100 text-cyan-800',
      items: [
        { id: 'users', label: 'Quản lý Thành viên & Quyền', icon: Users, count: stats.usersCount },
        { id: 'homepage-settings', label: 'Cấu hình Trang chủ & Banner', icon: Sparkles },
        { id: 'menu-settings', label: 'Quản lý Menu Nav (Ẩn/Hiện)', icon: Layers },
      ],
    },
  ];

  const filteredNavGroups = verticalNavGroups
    .map((group) => {
      const filteredItems = group.items.filter(
        (item) =>
          item.label.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
          group.groupTitle.toLowerCase().includes(menuSearchQuery.toLowerCase())
      );
      return { ...group, items: filteredItems };
    })
    .filter((group) => group.items.length > 0);

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
          onClick={() => changePage(i)}
          className={`w-7 h-7 rounded-lg text-xs font-bold transition ${page === i
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
    <div className="w-full px-2 sm:px-6 lg:px-8 py-2 h-[calc(100vh-140px)] overflow-hidden flex flex-col min-h-0">

      {/* Main Vertical Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch flex-1 min-h-0">

        {/* Left Vertical Tab Navigation */}
        <div className="lg:col-span-3 bg-white border border-blue-100 rounded-2xl p-3 shadow-sm space-y-3 overflow-y-auto max-h-full flex flex-col">

          {/* Quick Menu Search Bar */}
          <div className="relative mb-0.5 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm nhanh menu..."
              value={menuSearchQuery}
              onChange={(e) => setMenuSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#1A94FF] transition"
            />
            {menuSearchQuery && (
              <button
                onClick={() => setMenuSearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
            {filteredNavGroups.map((group) => {
              const isCollapsed = collapsedGroups[group.groupKey];
              const hasActiveItem = group.items.some((i) => i.id === activeTab);

              return (
                <div key={group.groupKey} className="space-y-1">
                  {/* Group Header with Accordion Toggle & Badge */}
                  <button
                    onClick={() => toggleGroupCollapse(group.groupKey)}
                    className="w-full flex items-center justify-between px-2 pt-1 pb-1 rounded-lg hover:bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 transition cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{group.groupTitle}</span>
                      {hasActiveItem && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1A94FF] animate-pulse" />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold ${group.badgeColor}`}>
                        {group.items.length}
                      </span>
                      {isCollapsed ? (
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Group Items */}
                  {!isCollapsed && (
                    <div className="space-y-0.5 pl-0.5">
                      {group.items.map((item: any) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${isActive
                              ? 'bg-[#1A94FF] text-white shadow-md shadow-blue-500/20 font-extrabold'
                              : 'text-slate-600 hover:bg-blue-50 hover:text-[#1A94FF]'
                              }`}
                          >
                            <div className="flex items-center gap-2.5 truncate pr-1">
                              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#1A94FF]'}`} />
                              <span className="truncate">{item.label}</span>
                            </div>
                            {item.count !== undefined && item.count !== null && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                {item.count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Main Table & CRUD Content Area */}
        <div className="lg:col-span-9 space-y-4 h-full flex flex-col overflow-hidden">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div onClick={() => handleTabChange('fish')} className="bg-white border border-blue-100 rounded-2xl p-4 space-y-2 shadow-sm cursor-pointer hover:border-blue-300 transition">
                  <div className="flex items-center justify-between text-slate-400">
                    <Fish className="w-5 h-5 text-[#1A94FF]" />
                    <span className="text-[10px] font-bold bg-blue-50 text-[#0B74E5] px-2 py-0.5 rounded-full">{stats.fishCount} loài</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.fishCount}</div>
                  <div className="text-xs text-slate-500 font-medium">Cá cảnh & Thủy sinh</div>
                </div>

                <div onClick={() => handleTabChange('community')} className="bg-white border border-blue-100 rounded-2xl p-4 space-y-2 shadow-sm cursor-pointer hover:border-blue-300 transition">
                  <div className="flex items-center justify-between text-slate-400">
                    <Compass className="w-5 h-5 text-indigo-500" />
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">Duyệt bài</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.postsCount}</div>
                  <div className="text-xs text-slate-500 font-medium">Bài viết Cộng đồng</div>
                </div>

                <div onClick={() => handleTabChange('questions')} className="bg-white border border-blue-100 rounded-2xl p-4 space-y-2 shadow-sm cursor-pointer hover:border-blue-300 transition">
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${trafficPeriod === p
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

          {/* TAB: MENU SETTINGS (NAVIGATION MANAGEMENT - SHOW/HIDE) */}
          {activeTab === 'menu-settings' && (
            <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm overflow-y-auto space-y-6 max-h-[calc(100vh-125px)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#1A94FF]" />
                    <span>Quản Lý Thẻ Menu Navigation (Ẩn / Hiện)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Bật hoặc tắt các mục Menu hiển thị trên thanh Header chính và Menu di động của website AquaHub.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await api.post('/settings', siteSettings);
                      toast.success('Đã lưu cấu hình Menu thành công!');
                    } catch (err: any) {
                      toast.error('Lỗi khi lưu cấu hình Menu');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1A94FF] hover:bg-[#0B74E5] text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu cấu hình Menu</span>
                </button>
              </div>

              {/* Menu Items Toggle List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'menu_ca_canh', label: 'Tra cứu cá cảnh', href: '/ca-canh', icon: Fish, desc: 'Trang cơ sở dữ liệu tra cứu thông số & đặc tính loài cá' },
                  { key: 'menu_san_mua_ban', label: 'Sàn Mua Bán', href: '/san-mua-ban', icon: ShoppingBag, desc: 'Sàn giao dịch thiết bị, cá cảnh & sản phẩm Shopee Affiliate' },
                  { key: 'menu_cam_nang', label: 'Cẩm nang & Hướng dẫn', href: '/cam-nang', icon: BookOpen, desc: 'Bài viết chia sẻ kinh nghiệm nuôi & điều trị bệnh cho cá' },
                  { key: 'menu_cong_dong', label: 'Bài viết Cộng đồng', href: '/cong-dong', icon: Compass, desc: 'Nơi người dùng khoe bể, trao đổi kinh nghiệm & hỏi đáp' },
                  { key: 'menu_hoi_dap', label: 'Hỏi đáp & Tư vấn Q&A', href: '/hoi-dap', icon: HelpCircle, desc: 'Chuyên mục đặt câu hỏi xin tư vấn từ cộng đồng' },
                  { key: 'menu_ho_ca', label: 'Hồ cá kỹ thuật số', href: '/ho-ca', icon: Layers, desc: 'Trang quản lý danh sách bể cá cá nhân của người dùng' },
                  { key: 'menu_cong_cu', label: 'Bộ Công cụ thủy sinh', href: '/cong-cu', icon: Wrench, desc: 'Máy tính dung tích, CO2, lượng phân bón & điện năng' },
                  { key: 'menu_lien_he', label: 'Liên hệ', href: '/lien-he', icon: Mail, desc: 'Trang thông tin liên hệ và gửi góp ý cho Admin' },
                ].map((item) => {
                  const isHidden = siteSettings[item.key] === 'hidden';
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.key}
                      className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 ${isHidden
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-blue-100 shadow-xs hover:border-blue-300'
                        }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`p-2.5 rounded-xl ${isHidden ? 'bg-slate-200 text-slate-500' : 'bg-blue-50 text-[#1A94FF]'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-sm">{item.label}</h3>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                              {item.href}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                      </div>

                      {/* Toggle Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setSiteSettings({
                            ...siteSettings,
                            [item.key]: isHidden ? 'visible' : 'hidden',
                          });
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${isHidden
                          ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          : 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
                          }`}
                      >
                        {isHidden ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Đang ẩn</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Hiển thị</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TABLE & CRUD VIEW WITH INTERNAL SCROLLING TABLE ONLY */}
          {activeTab !== 'overview' && activeTab !== 'homepage-settings' && activeTab !== 'menu-settings' && activeTab !== 'traffic' && (
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

                    {/* Searchable Category Popover Dropdown */}
                    {(activeTab === 'fish' || activeTab === 'articles' || activeTab === 'listings' || activeTab === 'community') && (
                      <div ref={categoryDropdownRef} className="relative inline-block text-xs shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-700 flex items-center gap-1">
                            <Filter className="w-3.5 h-3.5 text-[#1A94FF]" />
                            <span>Danh mục:</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => setShowCategoryDropdown((prev) => !prev)}
                            className="bg-blue-50/80 hover:bg-blue-100 border border-blue-200/90 rounded-xl px-3 py-1.5 text-xs font-bold text-[#0B74E5] flex items-center justify-between gap-2 cursor-pointer transition min-w-[160px] max-w-[240px] truncate shadow-2xs"
                          >
                            <span className="truncate">
                              {(() => {
                                if (!selectedCategory) {
                                  return activeTab === 'fish'
                                    ? `Tất cả danh mục (${stats.fishCount || totalItems || 0} loài)`
                                    : 'Tất cả danh mục';
                                }
                                if (activeTab === 'fish') {
                                  const found = categoriesList.find((c: any) => c.slug === selectedCategory || c.id === selectedCategory);
                                  if (found) {
                                    const count = found.fishCount !== undefined ? found.fishCount : (found.count ?? 0);
                                    return `${found.name || found.nameVi} (${count} loài)`;
                                  }
                                }
                                if (activeTab === 'articles') {
                                  const found = articleCategoriesList.find((c: any) => c.name === selectedCategory || c.slug === selectedCategory || c.id === selectedCategory);
                                  if (found) return found.name;
                                }
                                if (activeTab === 'listings') {
                                  const found = listingCategoriesList.find((c: any) => c.id === selectedCategory || c.slug === selectedCategory);
                                  if (found) return found.name;
                                }
                                return selectedCategory;
                              })()}
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 text-[#1A94FF] transition-transform duration-200 shrink-0 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                          </button>
                        </div>

                        {/* Search & Scroll Popover Box */}
                        {showCategoryDropdown && (
                          <div className="absolute top-full left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-2 animate-fadeIn">
                            {/* Search input on top */}
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                              <input
                                type="text"
                                autoFocus
                                placeholder="Tìm danh mục..."
                                value={categoryFilterSearch}
                                onChange={(e) => setCategoryFilterSearch(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1A94FF]"
                              />
                              {categoryFilterSearch && (
                                <button
                                  type="button"
                                  onClick={() => setCategoryFilterSearch('')}
                                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                                >
                                  ✕
                                </button>
                              )}
                            </div>

                            {/* Scrollable list below */}
                            <div className="max-h-56 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                              {/* All Categories item */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCategory('');
                                  setPage(1);
                                  setShowCategoryDropdown(false);
                                  setCategoryFilterSearch('');
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${!selectedCategory ? 'bg-[#1A94FF] text-white' : 'hover:bg-slate-100 text-slate-700'
                                  }`}
                              >
                                <span>Tất cả danh mục</span>
                                {activeTab === 'fish' && (
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${!selectedCategory ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#0B74E5]'}`}>
                                    {stats.fishCount || totalItems || 0} loài
                                  </span>
                                )}
                              </button>

                              {/* Tab-specific category items */}
                              {activeTab === 'fish' &&
                                categoriesList
                                  .filter((cat: any) =>
                                    !categoryFilterSearch ||
                                    (cat.name || cat.nameVi || '').toLowerCase().includes(categoryFilterSearch.toLowerCase())
                                  )
                                  .map((cat: any) => {
                                    const isSelected = selectedCategory === cat.slug || selectedCategory === cat.id;
                                    const count = cat.fishCount !== undefined ? cat.fishCount : (cat.count ?? 0);
                                    return (
                                      <button
                                        key={cat.id || cat.slug}
                                        type="button"
                                        onClick={() => {
                                          setSelectedCategory(cat.slug || cat.id);
                                          setPage(1);
                                          setShowCategoryDropdown(false);
                                          setCategoryFilterSearch('');
                                        }}
                                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${isSelected ? 'bg-[#1A94FF] text-white' : 'hover:bg-slate-100 text-slate-700'
                                          }`}
                                      >
                                        <span className="truncate max-w-[150px]">{cat.name || cat.nameVi}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#0B74E5]'}`}>
                                          {count} loài
                                        </span>
                                      </button>
                                    );
                                  })}

                              {activeTab === 'articles' &&
                                articleCategoriesList
                                  .filter((cat: any) =>
                                    !categoryFilterSearch ||
                                    (cat.name || '').toLowerCase().includes(categoryFilterSearch.toLowerCase())
                                  )
                                  .map((cat: any) => {
                                    const catVal = cat.name || cat.slug || cat.id;
                                    const isSelected = selectedCategory === catVal;
                                    return (
                                      <button
                                        key={cat.id || cat.slug || cat.name}
                                        type="button"
                                        onClick={() => {
                                          setSelectedCategory(catVal);
                                          setPage(1);
                                          setShowCategoryDropdown(false);
                                          setCategoryFilterSearch('');
                                        }}
                                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${isSelected ? 'bg-[#1A94FF] text-white' : 'hover:bg-slate-100 text-slate-700'
                                          }`}
                                      >
                                        <span className="truncate">{cat.name}</span>
                                      </button>
                                    );
                                  })}

                              {activeTab === 'listings' &&
                                listingCategoriesList
                                  .filter((cat: any) =>
                                    !categoryFilterSearch ||
                                    (cat.name || '').toLowerCase().includes(categoryFilterSearch.toLowerCase())
                                  )
                                  .map((cat: any) => {
                                    const catVal = cat.id || cat.slug;
                                    const isSelected = selectedCategory === catVal;
                                    return (
                                      <button
                                        key={cat.id || cat.slug}
                                        type="button"
                                        onClick={() => {
                                          setSelectedCategory(catVal);
                                          setPage(1);
                                          setShowCategoryDropdown(false);
                                          setCategoryFilterSearch('');
                                        }}
                                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${isSelected ? 'bg-[#1A94FF] text-white' : 'hover:bg-slate-100 text-slate-700'
                                          }`}
                                      >
                                        <span className="truncate">{cat.name}</span>
                                      </button>
                                    );
                                  })}

                              {activeTab === 'community' &&
                                [
                                  '🐟 Cá cảnh',
                                  '🌱 Thủy sinh',
                                  '💧 Nước & Vi sinh',
                                  '🦠 Bệnh & Chăm sóc',
                                  '🍤 Thức ăn',
                                  '🧰 Thiết bị',
                                  '🐣 Sinh sản',
                                  '🦐 Tép & Sinh vật',
                                  '💰 Mua bán',
                                ]
                                  .filter((name) => !categoryFilterSearch || name.toLowerCase().includes(categoryFilterSearch.toLowerCase()))
                                  .map((name) => {
                                    const isSelected = selectedCategory === name;
                                    return (
                                      <button
                                        key={name}
                                        type="button"
                                        onClick={() => {
                                          setSelectedCategory(name);
                                          setPage(1);
                                          setShowCategoryDropdown(false);
                                          setCategoryFilterSearch('');
                                        }}
                                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${isSelected ? 'bg-[#1A94FF] text-white' : 'hover:bg-slate-100 text-slate-700'
                                          }`}
                                      >
                                        <span>{name}</span>
                                      </button>
                                    );
                                  })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Advanced Filters for Species Tab */}
                    {activeTab === 'fish' && (
                      <>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
                          <span className="font-bold text-slate-700">Độ khó:</span>
                          <select
                            value={selectedDifficulty}
                            onChange={(e) => {
                              setSelectedDifficulty(e.target.value);
                              setPage(1);
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#1A94FF] cursor-pointer"
                          >
                            <option value="">Tất cả mức độ</option>
                            <option value="EASY">🟢 Dễ nuôi (EASY)</option>
                            <option value="MEDIUM">🟡 Trung bình (MEDIUM)</option>
                            <option value="HARD">🟠 Khó nuôi (HARD)</option>
                            <option value="EXPERT">🔴 Chuyên gia (EXPERT)</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
                          <span className="font-bold text-slate-700">Tầng sống:</span>
                          <select
                            value={selectedSwimLevel}
                            onChange={(e) => {
                              setSelectedSwimLevel(e.target.value);
                              setPage(1);
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#1A94FF] cursor-pointer"
                          >
                            <option value="">Tất cả tầng sống</option>
                            <option value="TOP">☁️ Tầng mặt (TOP)</option>
                            <option value="MIDDLE">🌊 Tầng giữa (MIDDLE)</option>
                            <option value="BOTTOM">🪨 Tầng đáy (BOTTOM)</option>
                            <option value="ALL">🌐 Mọi tầng (ALL)</option>
                          </select>
                        </div>

                        {(selectedCategory || selectedDifficulty || selectedSwimLevel || searchQuery) && (
                          <button
                            onClick={() => {
                              setSelectedCategory('');
                              setSelectedDifficulty('');
                              setSelectedSwimLevel('');
                              setSearchQuery('');
                              setPage(1);
                            }}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 underline shrink-0 cursor-pointer"
                          >
                            Xóa bộ lọc
                          </button>
                        )}
                      </>
                    )}

                    {/* Per-page Select (Hidden on Species tab as requested) */}
                    {activeTab !== 'fish' && (
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
                    )}
                  </div>

                  {(activeTab === 'categories' || activeTab === 'fish' || activeTab === 'articles' || activeTab === 'article-categories' || activeTab === 'users' || activeTab === 'ads' || activeTab === 'listings') && (
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {(activeTab === 'fish' || activeTab === 'categories' || activeTab === 'articles' || activeTab === 'article-categories') && (
                        <button
                          onClick={handleExportData}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Export</span>
                        </button>
                      )}
                      {activeTab === 'articles' && (
                        <button
                          onClick={() => {
                            setImportTarget('articles');
                            setImportMode('preset');
                            setImportJsonText('');
                            setShowImportModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Import</span>
                        </button>
                      )}
                      {activeTab === 'article-categories' && (
                        <button
                          onClick={() => {
                            setImportTarget('article-categories');
                            setImportMode('json');
                            setImportJsonText('');
                            setShowImportModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Import</span>
                        </button>
                      )}
                      {activeTab === 'fish' && (
                        <button
                          onClick={() => {
                            setImportTarget('fish');
                            setImportMode('json');
                            setImportJsonText('');
                            setShowImportModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Import</span>
                        </button>
                      )}
                      {activeTab === 'categories' && (
                        <button
                          onClick={() => {
                            setImportTarget('fish-categories');
                            setImportMode('json');
                            setImportJsonText('');
                            setShowImportModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Import</span>
                        </button>
                      )}
                      {selectedIds.length > 0 && (
                        <button
                          onClick={() => handleDeleteBulk(false)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Xóa ({selectedIds.length})</span>
                        </button>
                      )}
                      <button
                        onClick={handleOpenAddModal}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1A94FF] hover:bg-[#0B74E5] text-white font-bold text-xs shadow-sm transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Thêm</span>
                      </button>
                    </div>
                  )}
                </div>



                {/* Selected Items Floating Action Bar */}
                {selectedIds.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 text-xs text-rose-700 animate-fadeIn shrink-0 gap-2">
                    <div className="flex items-center gap-2 font-bold">
                      <span>✅ Đã chọn <strong>{selectedIds.length}</strong> / {displayData.length} mục trên trang</span>
                      {totalItems > displayData.length && (
                        <span className="text-[11px] text-slate-500 font-medium">
                          (Tổng CSDL: <strong>{totalItems}</strong> mục)
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedIds([])}
                        className="text-slate-500 hover:text-slate-800 underline text-[11px] cursor-pointer ml-1"
                      >
                        (Bỏ chọn)
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {(activeTab === 'fish' || activeTab === 'articles' || activeTab === 'listings') && (
                        <button
                          type="button"
                          onClick={() => {
                            setBulkSelectedCatIds([]);
                            setBulkSelectedCatSlugs([]);
                            setBulkCategoryFilterSearch('');
                            setShowBulkCategoryModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A94FF] hover:bg-[#0B74E5] text-white font-bold shadow-xs transition cursor-pointer"
                        >
                          <FolderTree className="w-3.5 h-3.5" />
                          <span>Cập nhật danh mục hàng loạt ({selectedIds.length})</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteBulk(false)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa {selectedIds.length} mục đã chọn</span>
                      </button>

                      {displayData.length > 0 && displayData.every((item) => selectedIds.includes(item.id)) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteBulk(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-800 hover:bg-red-900 text-white font-extrabold shadow-sm border border-red-900 transition cursor-pointer"
                          title="Xóa toàn bộ dữ liệu mục này trong cơ sở dữ liệu"
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                          <span>🔥 Xóa TẤT CẢ {totalItems || displayData.length} mục CSDL</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Data Table Container with Internal Table Scroll Only */}
                <div ref={tableContainerRef} className="overflow-auto flex-1 min-h-0 relative pr-1 border border-slate-100 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-white z-10 shadow-sm">
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                        <th className="py-2.5 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={displayData.length > 0 && displayData.every((item) => selectedIds.includes(item.id))}
                            onChange={() => {
                              const currentPageIds = displayData.map((item) => item.id).filter(Boolean);
                              const allSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id));
                              if (allSelected) {
                                setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
                              } else {
                                setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
                              }
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-[#1A94FF] focus:ring-[#1A94FF] cursor-pointer accent-[#1A94FF]"
                          />
                        </th>
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
                          <td colSpan={6} className="py-12 text-center text-slate-400">Đang tải dữ liệu bảng...</td>
                        </tr>
                      ) : displayData.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">Không có dữ liệu phù hợp</td>
                        </tr>
                      ) : (
                        displayData.map((item, idx) => (
                          <tr key={item.id || idx} className={`transition ${selectedIds.includes(item.id) ? 'bg-blue-50/60' : 'hover:bg-slate-50'}`}>
                            <td className="py-3 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(item.id)}
                                onChange={() => {
                                  setSelectedIds((prev) =>
                                    prev.includes(item.id) ? prev.filter((i) => i !== item.id) : [...prev, item.id]
                                  );
                                }}
                                className="w-4 h-4 rounded border-slate-300 text-[#1A94FF] focus:ring-[#1A94FF] cursor-pointer accent-[#1A94FF]"
                              />
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                              #{(page - 1) * pageSize + idx + 1}
                            </td>

                            {/* Name / Title Column */}
                            <td className="py-3 px-3 font-bold text-slate-900 max-w-[240px]">
                              {activeTab === 'fish' ? (
                                <div className="flex items-center gap-2.5">
                                  {/* Avatar Image Preview & Quick Change */}
                                  <div className="relative group shrink-0">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      id={`quick-avatar-${item.id}`}
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          try {
                                            toast.info(`Đang tải ảnh mới cho "${item.nameVi}"...`);
                                            const uploadData = new FormData();
                                            uploadData.append('file', file);
                                            const res: any = await api.post('/upload', uploadData, {
                                              headers: { 'Content-Type': 'multipart/form-data' },
                                            });
                                            const imageUrl = res?.data?.url || res?.url;
                                            if (imageUrl) {
                                              await api.patch(`/fish/${item.id}`, { images: [imageUrl] });
                                              toast.success(`Cập nhật ảnh cho "${item.nameVi}" thành công!`);
                                              fetchTabData();
                                            } else {
                                              toast.error('Không nhận được URL ảnh từ máy chủ');
                                            }
                                          } catch (err: any) {
                                            toast.error(err.message || 'Không thể cập nhật ảnh loài cá');
                                          }
                                        }
                                      }}
                                    />
                                    <div
                                      onClick={() => {
                                        if (item.images?.[0]) {
                                          setPreviewImageUrl(item.images[0]);
                                          setPreviewImageTitle(item.nameVi);
                                        }
                                      }}
                                      className="block relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer shadow-2xs group-hover:border-[#1A94FF] transition"
                                      title="Bấm vào để xem phóng to hình ảnh"
                                    >
                                      {item.images?.[0] ? (
                                        <img src={item.images[0]} alt={item.nameVi} className="w-full h-full object-cover" />
                                      ) : (
                                        <Fish className="w-5 h-5 text-slate-400 absolute inset-0 m-auto" />
                                      )}
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                                        <Eye className="w-4 h-4" />
                                      </div>
                                    </div>
                                    <label
                                      htmlFor={`quick-avatar-${item.id}`}
                                      className="absolute -bottom-1 -right-1 bg-white border border-slate-200 p-0.5 rounded-full text-slate-600 hover:text-[#1A94FF] shadow-xs cursor-pointer opacity-0 group-hover:opacity-100 transition z-10"
                                      title="Tải ảnh mới từ máy"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Upload className="w-2.5 h-2.5" />
                                    </label>
                                  </div>


                                  <div className="min-w-0">
                                    <div className="line-clamp-2 leading-snug">{item.nameVi}</div>
                                    {item.nameEn && <div className="text-[10px] text-slate-400 font-normal truncate">{item.nameEn}</div>}
                                  </div>
                                </div>
                              ) : activeTab === 'ads' ? (
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
                                <div className="line-clamp-2 leading-snug">
                                  {item.title ||
                                    item.nameVi ||
                                    item.name ||
                                    item.username ||
                                    item.displayName ||
                                    (item.author?.displayName ? `Bài viết của ${item.author.displayName}` : '') ||
                                    (item.content ? item.content.replace(/<[^>]*>?/gm, '').slice(0, 50) : '') ||
                                    `Mục #${item.id?.slice(0, 6) || 'dữ liệu'}`}
                                </div>
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
                              ) : activeTab === 'questions' ? (
                                <div className="space-y-1 text-[11px]">
                                  <div className="flex items-center gap-2">
                                    {item.isSolved ? (
                                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                                        ✓ Đã giải đáp
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                                        ⏳ Đang chờ
                                      </span>
                                    )}
                                    <span className="text-slate-500 font-semibold">
                                      💬 {item.answersCount || item.answers?.length || 0} phản hồi
                                    </span>
                                    <span className="text-slate-400">
                                      👁️ {item.viewsCount || 0} lượt xem
                                    </span>
                                  </div>
                                  {item.author && (
                                    <div className="text-slate-500 text-[10px]">
                                      Tác giả: <strong>{item.author.displayName || item.author.username}</strong>
                                    </div>
                                  )}
                                  {item.content && (
                                    <p className="text-slate-500 text-[11px] line-clamp-1">{item.content.replace(/<[^>]*>?/gm, '')}</p>
                                  )}
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
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-semibold text-slate-900 mr-1">{item.scientificName || 'Tên KH N/A'}</span>
                                    {Array.isArray(item.categoryIds) && item.categoryIds.length > 0 ? (
                                      categoriesList
                                        .filter((cat: any) => item.categoryIds.includes(cat.id) || item.categoryIds.includes(cat.slug))
                                        .map((cat: any) => (
                                          <span key={cat.id || cat.slug} className="px-1.5 py-0.5 text-[10px] bg-blue-50 text-[#0B74E5] font-bold rounded border border-blue-100">
                                            {cat.name}
                                          </span>
                                        ))
                                    ) : (
                                      <span className="px-1.5 py-0.5 text-[10px] bg-blue-50 text-[#0B74E5] font-bold rounded">
                                        {typeof item.category === 'object' && item.category ? (item.category.name || item.category.slug) : (typeof item.category === 'string' ? item.category : 'Chưa phân loại')}
                                      </span>
                                    )}
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
                                    {typeof item.category === 'object' && item.category ? (item.category.name || item.category.slug) : (typeof item.category === 'string' ? item.category : 'Kỹ thuật nuôi & Làm nước')}
                                  </span>
                                  {item.excerpt && (
                                    <p className="text-slate-500 text-[11px] line-clamp-1">{item.excerpt}</p>
                                  )}
                                </div>
                              ) : activeTab === 'listings' ? (
                                <div className="space-y-1 text-[11px]">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 text-[10px] bg-blue-50 text-[#0B74E5] font-bold rounded-md border border-blue-100">
                                      {typeof item.category === 'object' && item.category ? (item.category.name || item.category.slug) : (typeof item.category === 'string' ? item.category : 'Sàn Mua Bán')}
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
                                item.scientificName || item.content || item.excerpt || item.email || (typeof item.category === 'object' && item.category ? (item.category.name || item.category.slug) : (typeof item.category === 'string' ? item.category : 'Chi tiết'))
                              )}
                            </td>

                            {/* Date Column */}
                            <td className="py-3 px-3 text-slate-400 text-[11px]">
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'Mới cập nhật'}
                            </td>

                            {/* Action Column */}
                            <td className="py-3 px-3 text-right space-x-1">
                              {activeTab === 'listings' && (
                                <button
                                  onClick={async () => {
                                    try {
                                      await api.put(`/listings/${item.id}/toggle-pin`);
                                      toast.success(item.isPinned ? `Đã ghim nổi bật tin "${item.title}"` : `Đã bỏ ghim nổi bật tin "${item.title}"`);
                                      fetchTabData();
                                    } catch (err) {
                                      toast.error('Lỗi khi đổi trạng thái ghim nổi bật');
                                    }
                                  }}
                                  title={item.isPinned ? 'Ghim tin nổi bật' : 'Bỏ ghim tin'}
                                  className={`p-1.5 rounded-lg transition cursor-pointer ${item.isPinned ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'text-slate-400 hover:bg-slate-100'
                                    }`}
                                >
                                  📌
                                </button>
                              )}
                              {activeTab === 'community' && (

                                <button
                                  onClick={() => {
                                    setBoostPostId(item.id);
                                    setBoostCount(10);
                                    setShowBoostModal(true);
                                  }}
                                  title="Tăng lượt thả tim (Boost Likes)"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition cursor-pointer"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Tăng Like ({item.likesCount || 0})</span>
                                </button>
                              )}
                              {activeTab === 'ads' && (
                                <button
                                  onClick={() => handleToggleActiveAd(item)}
                                  title={item.isActive ? 'Tạm ẩn quảng cáo' : 'Bật chạy quảng cáo'}
                                  className={`p-1.5 rounded-lg transition cursor-pointer ${item.isActive
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
                                  className={`p-1.5 rounded-lg transition cursor-pointer ${item.isActive === false
                                    ? 'text-emerald-600 hover:bg-emerald-50 bg-emerald-50/50'
                                    : 'text-amber-600 hover:bg-amber-50 bg-amber-50/50'
                                    }`}
                                >
                                  {item.isActive === false ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                </button>
                              )}
                              <button
                                onClick={() => setViewingDetailItem(item)}
                                title="Xem chi tiết"
                                className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-lg transition cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(item)}
                                title="Sửa"
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDuplicateItem(item)}
                                title="Nhân bản (Duplicate)"
                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
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
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="text-slate-500">
                    Hiển thị{' '}
                    <strong className="text-slate-800">
                      {displayData.length > 0 ? (page - 1) * pageSize + 1 : 0}
                    </strong>{' '}
                    -{' '}
                    <strong className="text-slate-800">
                      {displayData.length > 0 ? Math.min(page * pageSize, totalItems || displayData.length) : 0}
                    </strong>{' '}
                    trên tổng số <strong className="text-[#0B74E5]">{totalItems}</strong> mục
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                    <span className="text-slate-500 font-medium">Hiển thị:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        const newSize = Number(e.target.value);
                        changePageSize(newSize);
                      }}
                      className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#1A94FF] cursor-pointer"
                    >
                      <option value={10}>10 mục/trang</option>
                      <option value={20}>20 mục/trang</option>
                      <option value={50}>50 mục/trang</option>
                      <option value={100}>100 mục/trang</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={page === 1}
                    onClick={() => changePage(page - 1)}
                    className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {renderPaginationButtons()}
                  </div>

                  <button
                    disabled={page === totalPages}
                    onClick={() => changePage(page + 1)}
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
                <div className="grid grid-cols-1 gap-3">
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

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase">
                        Danh mục chủng loại (Có thể chọn nhiều danh mục) *
                      </label>
                      <span className="text-[10px] text-[#0B74E5] font-semibold">
                        Đã chọn: {Array.isArray(formData.categoryIds) ? formData.categoryIds.length : 0} danh mục
                      </span>
                    </div>

                    {/* Quick Search Input for Categories */}
                    <div className="relative mb-2">
                      <input
                        type="text"
                        placeholder="🔍 Nhập từ khóa tìm nhanh danh mục..."
                        value={categoryFilterSearch}
                        onChange={(e) => setCategoryFilterSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1A94FF] focus:bg-white transition"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      {categoryFilterSearch && (
                        <button
                          type="button"
                          onClick={() => setCategoryFilterSearch('')}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 max-h-40 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {categoriesList
                        .filter((cat: any) => {
                          if (!categoryFilterSearch.trim()) return true;
                          const q = categoryFilterSearch.toLowerCase();
                          return (
                            (cat.name && cat.name.toLowerCase().includes(q)) ||
                            (cat.slug && cat.slug.toLowerCase().includes(q))
                          );
                        })
                        .map((cat: any) => {
                          const catVal = cat.id || cat.slug;
                          const catSlugVal = cat.slug || cat.id;
                          const currentCatIds: string[] = Array.isArray(formData.categoryIds) ? formData.categoryIds : [];
                          const currentCatSlugs: string[] = Array.isArray(formData.categorySlugs) ? formData.categorySlugs : [];
                          const isChecked = currentCatIds.includes(catVal) || currentCatIds.includes(catSlugVal) || formData.categoryId === catVal || formData.categorySlug === catSlugVal;

                          return (
                            <label
                              key={cat.id || cat.slug}
                              className={`flex items-center gap-2 p-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition select-none ${isChecked
                                ? 'bg-blue-50 border-[#1A94FF] text-[#0B74E5] shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  let updatedIds = [...currentCatIds];
                                  let updatedSlugs = [...currentCatSlugs];

                                  if (e.target.checked) {
                                    if (!updatedIds.includes(catVal)) updatedIds.push(catVal);
                                    if (!updatedSlugs.includes(catSlugVal)) updatedSlugs.push(catSlugVal);
                                  } else {
                                    updatedIds = updatedIds.filter((id) => id !== catVal && id !== catSlugVal);
                                    updatedSlugs = updatedSlugs.filter((s) => s !== catSlugVal && s !== catVal);
                                  }

                                  const primaryCat = updatedIds[0] || '';
                                  const primarySlug = updatedSlugs[0] || '';

                                  setFormData({
                                    ...formData,
                                    categoryIds: updatedIds,
                                    categorySlugs: updatedSlugs,
                                    categoryId: primaryCat,
                                    categorySlug: primarySlug,
                                  });
                                }}
                                className="w-3.5 h-3.5 rounded border-slate-300 text-[#1A94FF] focus:ring-[#1A94FF] accent-[#1A94FF]"
                              />
                              <span className="truncate" title={cat.name}>{cat.name}</span>
                            </label>
                          );
                        })}
                      {categoriesList.filter((cat: any) => {
                        if (!categoryFilterSearch.trim()) return true;
                        const q = categoryFilterSearch.toLowerCase();
                        return (
                          (cat.name && cat.name.toLowerCase().includes(q)) ||
                          (cat.slug && cat.slug.toLowerCase().includes(q))
                        );
                      }).length === 0 && (
                          <div className="col-span-full py-4 text-center text-xs text-slate-400 italic">
                            Không tìm thấy danh mục phù hợp với "{categoryFilterSearch}"
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                {/* Upload / URL Image Input with Live Preview */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Hình ảnh sinh vật (URL / Upload file) *</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-xl">
                      <div className="w-12 h-12 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center">
                        {formData.images?.[0] || formData.avatar || formData.imageUrl ? (
                          <img
                            src={formData.images?.[0] || formData.avatar || formData.imageUrl}
                            alt="Preview Fish"
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
                          id="fish-file-upload"
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
                                  setFormData({ ...formData, images: [imageUrl] });
                                  toast.success('Tải ảnh sinh vật lên máy chủ thành công!');
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
                          htmlFor="fish-file-upload"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1A94FF] hover:bg-[#0B74E5] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Tải ảnh từ máy...</span>
                        </label>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Hoặc dán URL đường dẫn ảnh (https://...)"
                      value={formData.images?.[0] || ''}
                      onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
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
          ) : activeTab === 'listings' ? (
            /* Specialized Listings Form Fields (Sàn Mua Bán + Shopee Affiliate) */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tiêu đề bài đăng *</label>
                  <input
                    type="text"
                    required
                    placeholder="Tên bài đăng / sản phẩm"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Giá (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Khu vực (Tỉnh/Thành)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: TP. Hồ Chí Minh"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Loại tin đăng</label>
                  <select
                    value={formData.type || 'SELL'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 text-sm outline-none"
                  >
                    <option value="SELL">Cần bán (Sell)</option>
                    <option value="BUY">Cần mua (Buy)</option>
                    <option value="PASS">Nhượng lại / Cho tặng (Pass)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mô tả bài đăng</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả chi tiết về mặt hàng hoặc yêu cầu..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 text-sm outline-none"
                />
              </div>

              {/* Shopee Affiliate Section */}
              <div className="border border-orange-200 bg-orange-50/50 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-orange-600 font-bold text-sm">
                  <span>🛍️</span> Thông tin Shopee Affiliate (Tùy chọn dành cho Admin)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Link Shopee Affiliate</label>
                    <input
                      type="url"
                      placeholder="https://shope.ee/..."
                      value={formData.shopeeProductUrl || ''}
                      onChange={(e) => setFormData({ ...formData, shopeeProductUrl: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-md text-sm outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tên sản phẩm Shopee</label>
                    <input
                      type="text"
                      placeholder="Tên sản phẩm gợi ý trên Shopee"
                      value={formData.shopeeProductName || ''}
                      onChange={(e) => setFormData({ ...formData, shopeeProductName: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-md text-sm outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Giá Shopee (VNĐ)</label>
                    <input
                      type="number"
                      placeholder="Giá tham khảo trên Shopee"
                      value={formData.shopeePrice || ''}
                      onChange={(e) => setFormData({ ...formData, shopeePrice: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-1.5 border rounded-md text-sm outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tỷ lệ hoa hồng (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="VD: 5.5"
                      value={formData.shopeeCommissionRate || ''}
                      onChange={(e) => setFormData({ ...formData, shopeeCommissionRate: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-1.5 border rounded-md text-sm outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">URL ảnh sản phẩm Shopee</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.shopeeImageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, shopeeImageUrl: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-md text-sm outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  />
                </div>
              </div>
            </div>
          ) : activeTab === 'categories' ? (
            /* Specialized Categories Form Fields with Parent Category Selector */
            <div className="space-y-3">
              {/* Row 1: Tên danh mục */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tên danh mục *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Cá Koi & Cá Vàng, Cá thủy sinh..."
                    value={formData.name || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#1A94FF]"
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
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border ${isChecked
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

      {/* Boost Likes Modal */}
      <Dialog
        isOpen={showBoostModal}
        onClose={() => setShowBoostModal(false)}
        title="Tăng Lượt Thả Tim Bài Viết (Admin Boost Likes)"
      >
        <form onSubmit={handleBoostLikes} className="space-y-4 pt-2">
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-800 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-600" />
              <span>Cơ chế tăng lượt thích từ tài khoản Admin & System Bot</span>
            </p>
            <p className="text-slate-600">
              Hệ thống sẽ chọn ngẫu nhiên các tài khoản bot hệ thống (`isSystemManaged = true`) chưa thả tim bài viết này để tự động thả tim.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Số lượt thả tim muốn tăng thêm (Lượt)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={boostCount}
              onChange={(e) => setBoostCount(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-rose-500"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">Khuyên dùng tăng từ 5 đến 50 lượt mỗi lần.</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowBoostModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Xác nhận Tăng Like</span>
            </button>
          </div>
        </form>
      </Dialog>

      {/* Import Data Modal */}
      <Dialog
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        size="2xl"
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base sm:text-lg">
            {importTarget === 'fish' ? (
              <Fish className="w-5 h-5 text-emerald-600" />
            ) : importTarget === 'articles' ? (
              <BookOpen className="w-5 h-5 text-emerald-600" />
            ) : (
              <FolderTree className="w-5 h-5 text-emerald-600" />
            )}
            <span>
              {importTarget === 'fish'
                ? 'Import Sinh Vật / Loài Cá Tra Cứu'
                : importTarget === 'fish-categories'
                  ? 'Import Danh Mục Tra Cứu'
                  : importTarget === 'article-categories'
                    ? 'Import Danh Mục Cẩm Nang'
                    : 'Import Bài Viết Cẩm Nang'}
            </span>
          </div>
        }
        subtitle={
          importTarget === 'fish'
            ? 'Nạp hàng loạt thông tin loài cá & sinh vật vào cơ sở dữ liệu tra cứu'
            : importTarget === 'fish-categories'
              ? 'Nạp hàng loạt danh mục sinh vật & cá cảnh'
              : importTarget === 'article-categories'
                ? 'Nạp hàng loạt danh mục bài viết cẩm nang'
                : 'Nạp hàng loạt bài viết cẩm nang thủy sinh & chăm sóc cá vào hệ thống'
        }
      >
        <form onSubmit={handleImportSubmit} className="space-y-4 pt-2">
          {/* Mode Selector (only for articles) */}
          {importTarget === 'articles' && (
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setImportMode('preset')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${importMode === 'preset'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Nạp Kho Bài Hệ Thống (200 Bài)</span>
              </button>
              <button
                type="button"
                onClick={() => setImportMode('json')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${importMode === 'json'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <FileText className="w-4 h-4" />
                <span>Import File / Chuỗi JSON</span>
              </button>
            </div>
          )}

          {importTarget === 'articles' && importMode === 'preset' ? (
            <div className="bg-emerald-50 border border-emerald-200/70 rounded-xl p-4 text-xs text-emerald-900 space-y-2">
              <div className="font-bold text-sm flex items-center gap-2 text-emerald-700">
                <Sparkles className="w-4 h-4" />
                <span>Nạp 200 bài viết cẩm nang thủy sinh chuẩn thực tế</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Hệ thống sẽ nạp hoặc cập nhật (upsert) kho 200 bài viết cẩm nang chất lượng bao gồm: Kỹ thuật nuôi cá Betta, Guppy, Cá Đĩa, Cá Koi, kỹ thuật trị nấm, chu trình vi sinh, pH/NH3, đất nền & phong cách thủy sinh Iwagumi...
              </p>
              <div className="text-[11px] text-emerald-700 font-semibold bg-white p-2 rounded-lg border border-emerald-100">
                ✅ Nếu bài viết chưa có sẽ tạo mới, nếu đã có sẽ cập nhật lại nội dung mới nhất.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* File Dropzone Box */}
              <div className="border-2 border-dashed border-emerald-200 hover:border-emerald-500 rounded-xl p-4 bg-emerald-50/50 hover:bg-emerald-50 text-center transition cursor-pointer relative group">
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                  <Upload className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-800">
                    Bấm để chọn File <code className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[11px]">.json</code> từ máy tính của bạn
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Hệ thống sẽ tự động đọc nội dung file JSON và trích xuất dữ liệu hàng loạt
                  </span>
                </div>
              </div>

              {/* Action Links Row */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Dữ liệu JSON (Xem / Sửa trực tiếp):</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadSampleJson}
                    className="text-[11px] text-emerald-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    📥 Tải file JSON mẫu
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const sample = getSampleJsonForTarget(importTarget);
                      setImportJsonText(JSON.stringify(sample, null, 2));
                      toast.success('Đã dán dữ liệu mẫu thành công!');
                    }}
                    className="text-[11px] text-[#1A94FF] hover:underline font-bold cursor-pointer"
                  >
                    + Nạp JSON mẫu
                  </button>
                </div>
              </div>

              <textarea
                rows={9}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='Nhập hoặc dán mảng JSON ở đây...'
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowImportModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={importing}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              {importing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang Import...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Bắt đầu Import</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog
        isOpen={!!viewingDetailItem}
        onClose={() => setViewingDetailItem(null)}
        size={isDetailMaximized ? 'full' : '5xl'}
        headerActions={
          <button
            type="button"
            onClick={() => setIsDetailMaximized(!isDetailMaximized)}
            className="p-2 text-slate-400 hover:text-[#0B74E5] hover:bg-slate-100 rounded-full transition cursor-pointer shrink-0"
            title={isDetailMaximized ? 'Thu nhỏ cửa sổ' : 'Phóng to toàn màn hình'}
          >
            {isDetailMaximized ? <Minimize2 className="w-5 h-5 text-[#0B74E5]" /> : <Maximize2 className="w-5 h-5 text-[#0B74E5]" />}
          </button>
        }
        title={
          <div className="flex items-center gap-2 text-[#0B74E5] font-black text-base sm:text-lg">
            <Eye className="w-5 h-5 text-[#0B74E5]" />
            <span>Chi tiết bản ghi — {viewingDetailItem ? (({
              fish: 'Sinh vật thủy sinh',
              categories: 'Danh mục cá & thủy sinh',
              community: 'Bài viết cộng đồng',
              questions: 'Thảo luận & Hỏi đáp',
              tanks: 'Mẫu Bể cá & Thiết lập',
              articles: 'Bài viết & Cẩm nang',
              market: 'Tin rao Chợ mua bán',
              ads: 'Quảng cáo Banner',
              users: 'Tài khoản người dùng',
            } as Record<string, string>)[activeTab] || activeTab.toUpperCase()) : ''}</span>
          </div>
        }
        subtitle={
          viewingDetailItem ? (
            viewingDetailItem.name ||
            viewingDetailItem.title ||
            viewingDetailItem.fullName ||
            viewingDetailItem.label ||
            viewingDetailItem.headline ||
            viewingDetailItem.subject ||
            viewingDetailItem.question ||
            viewingDetailItem.scientificName ||
            viewingDetailItem.email ||
            (viewingDetailItem.id ? `Mã bản ghi: ${viewingDetailItem.id}` : 'Thông tin chi tiết')
          ) : 'Chi tiết bản ghi'
        }
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => {
                const itemToEdit = viewingDetailItem;
                setViewingDetailItem(null);
                handleOpenEditModal(itemToEdit);
              }}
              className="px-4 py-2 bg-[#0B74E5] hover:bg-[#085ab3] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Chỉnh sửa thông tin này</span>
            </button>
            <button
              type="button"
              onClick={() => setViewingDetailItem(null)}
              className="px-5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition"
            >
              Đóng cửa sổ
            </button>
          </div>
        }
      >
        {viewingDetailItem && (() => {
          const itemName =
            viewingDetailItem.name ||
            viewingDetailItem.title ||
            viewingDetailItem.fullName ||
            viewingDetailItem.label ||
            viewingDetailItem.headline ||
            viewingDetailItem.subject ||
            viewingDetailItem.question ||
            viewingDetailItem.scientificName ||
            viewingDetailItem.commonName ||
            viewingDetailItem.vietnameseName ||
            viewingDetailItem.email ||
            viewingDetailItem.authorName ||
            viewingDetailItem.user?.name ||
            viewingDetailItem.user?.email ||
            viewingDetailItem.category?.name ||
            (viewingDetailItem.id ? `Bản ghi ID: ${viewingDetailItem.id}` : 'Thông tin bản ghi');

          const isImageKey = (k: string) => ['image', 'images', 'avatar', 'thumbnail', 'photo', 'cover'].includes(k.toLowerCase());
          const isContentKey = (k: string) => ['content', 'description', 'details', 'summary', 'body', 'excerpt'].includes(k.toLowerCase());
          const isObjectKey = (k: string, v: any) => typeof v === 'object' && v !== null;

          const activeImages: string[] = [];
          if (viewingDetailItem.image) activeImages.push(viewingDetailItem.image);
          if (viewingDetailItem.avatar) activeImages.push(viewingDetailItem.avatar);
          if (viewingDetailItem.thumbnail) activeImages.push(viewingDetailItem.thumbnail);
          if (Array.isArray(viewingDetailItem.images)) {
            viewingDetailItem.images.forEach((img: any) => {
              if (typeof img === 'string' && !activeImages.includes(img)) activeImages.push(img);
              else if (img?.url && !activeImages.includes(img.url)) activeImages.push(img.url);
            });
          }

          const mainContent = viewingDetailItem.content || viewingDetailItem.description || viewingDetailItem.details || viewingDetailItem.summary || viewingDetailItem.excerpt;

          const excludedKeys = [
            'id', 'name', 'title', 'fullName', 'scientificName', 'slug', 'price', 'views', 'likesCount',
            'isActive', 'createdAt', 'updatedAt', 'image', 'images', 'avatar', 'thumbnail', 'content',
            'description', 'details', 'summary', 'body', 'question', 'excerpt'
          ];

          const entries = Object.entries(viewingDetailItem).filter(([k, v]) =>
            !excludedKeys.includes(k) &&
            !isImageKey(k) &&
            !isContentKey(k) &&
            !isObjectKey(k, v) &&
            v !== null &&
            v !== undefined &&
            v !== ''
          );

          const containerHeightClass = isDetailMaximized ? 'h-[55vh]' : 'h-[320px]';

          return (
            <div className="space-y-4 text-xs text-slate-700 flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Top Section: Full-width Hero Header Card */}
              <div className="bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50/60 p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col sm:flex-row items-start justify-between gap-4 shrink-0 overflow-hidden">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Compact Thumbnail Avatar(s) */}
                  {activeImages.length > 0 && (
                    <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                      <div
                        onClick={() => {
                          setPreviewImageUrl(activeImages[0]);
                          setPreviewImageTitle(itemName);
                        }}
                        className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border border-slate-200/80 bg-white shadow-sm shrink-0 relative group cursor-pointer"
                        title="Bấm để xem phóng to hình ảnh"
                      >
                        <img src={activeImages[0]} alt="Hero Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>
                      {activeImages.length > 1 && (
                        <div className="flex flex-col gap-1">
                          {activeImages.slice(1, 3).map((imgUrl, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setPreviewImageUrl(imgUrl);
                                setPreviewImageTitle(`${itemName} (Ảnh ${idx + 2})`);
                              }}
                              className="w-7 h-7 rounded-lg overflow-hidden border border-slate-200 bg-white shadow-xs shrink-0 cursor-pointer relative group"
                              title="Bấm để xem phóng to"
                            >
                              <img src={imgUrl} alt={`Sub image ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {activeImages.length > 3 && (
                            <div className="w-7 h-4 rounded-md bg-slate-200 text-slate-600 text-[9px] font-black flex items-center justify-center">
                              +{activeImages.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}


                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-blue-100 text-[#0B74E5] border border-blue-200">
                        {activeTab}
                      </span>
                      {viewingDetailItem.isActive !== undefined && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${viewingDetailItem.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                          {viewingDetailItem.isActive ? '✓ Đang bật' : '✕ Tạm ẩn'}
                        </span>
                      )}
                    </div>

                    <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug break-words">
                      {itemName}
                    </h2>

                    {viewingDetailItem.scientificName && (
                      <p className="text-xs text-indigo-700 italic font-medium break-words">Tên khoa học: {viewingDetailItem.scientificName}</p>
                    )}

                    {viewingDetailItem.slug && (
                      <p className="text-[11px] text-slate-500 font-mono break-all">Slug: /{viewingDetailItem.slug}</p>
                    )}
                  </div>
                </div>

                {/* Price & Stats Bar */}
                {(viewingDetailItem.price !== undefined || viewingDetailItem.createdAt || viewingDetailItem.views !== undefined) && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-right space-y-1 min-w-[140px] shrink-0 self-stretch sm:self-auto flex flex-col justify-center">
                    {viewingDetailItem.price !== undefined && (
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Giá niêm yết</span>
                        <strong className="text-sm font-black text-emerald-600">
                          {Number(viewingDetailItem.price) > 0 ? `${Number(viewingDetailItem.price).toLocaleString('vi-VN')} đ` : 'Liên hệ'}
                        </strong>
                      </div>
                    )}
                    {viewingDetailItem.views !== undefined && (
                      <div className="text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                        👁 <strong>{viewingDetailItem.views}</strong> | ❤️ <strong>{viewingDetailItem.likesCount || 0}</strong>
                      </div>
                    )}
                    {viewingDetailItem.createdAt && (
                      <div className="text-[10px] text-slate-400">
                        Ngày tạo: <strong>{new Date(viewingDetailItem.createdAt).toLocaleDateString('vi-VN')}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Section: Perfectly Symmetrical 2 Columns Filling Remaining Height */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch text-xs text-slate-700 flex-1 min-h-[300px] min-w-0">
                {/* Column 1: Datasheet Table */}
                <div className="space-y-1.5 flex flex-col h-full min-h-0 min-w-0">
                  <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-[#0B74E5]" /> Bảng thông số chi tiết
                  </h3>
                  <div className="bg-white rounded-xl border border-slate-200 overflow-y-auto overflow-x-hidden shadow-sm flex-1 min-h-0">
                    {entries.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {entries.map(([key, val], idx) => {
                          const label = getVietnameseFieldLabel(key);
                          const displayVal = formatVietnameseFieldValue(key, val);

                          return (
                            <div
                              key={key}
                              className={`flex items-center justify-between px-3.5 py-2.5 text-xs transition gap-2 ${idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'
                                }`}
                            >
                              <span className="font-semibold text-slate-500 text-[11px] w-5/12 truncate shrink-0" title={label}>
                                {label}
                              </span>
                              <span className="font-bold text-slate-900 w-7/12 text-right break-words overflow-wrap-anywhere">
                                {displayVal}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-slate-400 italic font-medium flex items-center justify-center h-full">
                        Không có thuộc tính mở rộng.
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Rich Content / Description */}
                <div className="space-y-1.5 flex flex-col h-full min-h-0 min-w-0">
                  <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 shrink-0">
                    <FileText className="w-3.5 h-3.5 text-[#0B74E5]" /> Mô tả & Nội dung chi tiết
                  </h3>
                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 overflow-y-auto overflow-x-hidden prose prose-sm max-w-none text-slate-800 leading-relaxed shadow-inner font-normal flex-1 min-h-0">
                    {mainContent ? (
                      typeof mainContent === 'string' && (mainContent.includes('<') && mainContent.includes('>')) ? (
                        <div className="break-words overflow-wrap-anywhere" dangerouslySetInnerHTML={{ __html: mainContent }} />
                      ) : (
                        <p className="whitespace-pre-line text-slate-700 font-medium break-words overflow-wrap-anywhere">{String(mainContent)}</p>
                      )
                    ) : (
                      <p className="text-slate-400 italic text-center pt-8 font-medium">Chưa có thông tin mô tả chi tiết cho bản ghi này.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </Dialog>

      {/* Security Password Confirmation Modal for Delete All Database */}
      <Dialog
        isOpen={showDeleteAllModal}
        onClose={() => {
          if (!verifyingPassword) {
            setShowDeleteAllModal(false);
            setConfirmPassword('');
          }
        }}
        size="md"
        title={
          <div className="flex items-center gap-2 text-red-600 font-black text-base">
            <AlertCircle className="w-5 h-5 text-red-600 animate-pulse" />
            <span>⚠️ XÁC NHẬN BẢO MẬT: XÓA TOÀN BỘ DỮ LIỆU</span>
          </div>
        }
        subtitle="Hành động này cực kỳ nguy hiểm và không thể phục hồi!"
        footer={
          <>
            <button
              type="button"
              disabled={verifyingPassword}
              onClick={() => {
                setShowDeleteAllModal(false);
                setConfirmPassword('');
              }}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              form="delete-all-password-form"
              disabled={verifyingPassword || !confirmPassword.trim()}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md shadow-red-500/20 cursor-pointer transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {verifyingPassword ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang xác nhận mật khẩu...</span>
                </>
              ) : (
                <span>🔥 XÁC NHẬN XÓA TOÀN BỘ</span>
              )}
            </button>
          </>
        }
      >
        <form id="delete-all-password-form" onSubmit={handleConfirmDeleteAllWithPassword} className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
            <p className="font-extrabold flex items-center gap-1">
              <span>⛔ CẢNH BÁO NGUY HẠI TỐI CAO:</span>
            </p>
            <p className="leading-relaxed">
              Bạn đang thực hiện lệnh xóa <strong>TẤT CẢ</strong> mục dữ liệu trong mục <strong>{activeTab.toUpperCase()}</strong> từ cơ sở dữ liệu. Để ngăn ngừa sơ suất, vui lòng nhập mật khẩu tài khoản Admin của bạn để tiếp tục.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
              Nhập mật khẩu Admin để xác nhận *
            </label>
            <input
              type="password"
              required
              autoFocus
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold outline-none transition"
            />
          </div>
        </form>
      </Dialog>

      {/* Bulk Category Update Modal */}
      <Dialog
        isOpen={showBulkCategoryModal}
        onClose={() => {
          if (!updatingBulkCategory) {
            setShowBulkCategoryModal(false);
          }
        }}
        size="2xl"
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base sm:text-lg">
            <FolderTree className="w-5 h-5 text-[#1A94FF]" />
            <span>Cập nhật Danh mục Hàng loạt ({selectedIds.length} mục)</span>
          </div>
        }
        subtitle="Chọn các danh mục cần gán đồng thời cho tất cả các phần tử đã tích chọn"
        footer={
          <>
            <button
              type="button"
              disabled={updatingBulkCategory}
              onClick={() => setShowBulkCategoryModal(false)}
              className="px-5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="bulk-category-form"
              disabled={updatingBulkCategory || bulkSelectedCatIds.length === 0}
              className="px-6 py-2 bg-[#1A94FF] hover:bg-[#0B74E5] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {updatingBulkCategory ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang cập nhật CSDL...</span>
                </>
              ) : (
                <span>Cập nhật {selectedIds.length} mục</span>
              )}
            </button>
          </>
        }
      >
        <form id="bulk-category-form" onSubmit={handleSaveBulkCategories} className="space-y-4">
          <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-[#0B74E5] font-semibold flex items-center justify-between">
            <span>
              💡 Bạn đang đổi danh mục cho <strong>{selectedIds.length}</strong> phần tử. Tất cả phần tử được chọn sẽ nhận danh mục dưới đây.
            </span>
            <span className="font-bold shrink-0 ml-2">
              Đã chọn: {bulkSelectedCatIds.length} danh mục
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
              Chọn danh mục gán hàng loạt (Có hỗ trợ tìm kiếm) *
            </label>

            {/* Quick Search Input */}
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="🔍 Nhập từ khóa tìm nhanh danh mục..."
                value={bulkCategoryFilterSearch}
                onChange={(e) => setBulkCategoryFilterSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1A94FF] focus:bg-white transition"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              {bulkCategoryFilterSearch && (
                <button
                  type="button"
                  onClick={() => setBulkCategoryFilterSearch('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-60 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(activeTab === 'fish' ? categoriesList : activeTab === 'articles' ? articleCategoriesList : listingCategoriesList)
                .filter((cat: any) => {
                  if (!bulkCategoryFilterSearch.trim()) return true;
                  const q = bulkCategoryFilterSearch.toLowerCase();
                  return (
                    (cat.name && cat.name.toLowerCase().includes(q)) ||
                    (cat.slug && cat.slug.toLowerCase().includes(q))
                  );
                })
                .map((cat: any) => {
                  const catVal = cat.id || cat.slug;
                  const catSlugVal = cat.slug || cat.id;
                  const isChecked = bulkSelectedCatIds.includes(catVal) || bulkSelectedCatIds.includes(catSlugVal);

                  return (
                    <label
                      key={cat.id || cat.slug}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold cursor-pointer transition select-none ${isChecked
                        ? 'bg-blue-50 border-[#1A94FF] text-[#0B74E5] shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          let updatedIds = [...bulkSelectedCatIds];
                          let updatedSlugs = [...bulkSelectedCatSlugs];

                          if (e.target.checked) {
                            if (!updatedIds.includes(catVal)) updatedIds.push(catVal);
                            if (!updatedSlugs.includes(catSlugVal)) updatedSlugs.push(catSlugVal);
                          } else {
                            updatedIds = updatedIds.filter((id) => id !== catVal && id !== catSlugVal);
                            updatedSlugs = updatedSlugs.filter((s) => s !== catSlugVal && s !== catVal);
                          }

                          setBulkSelectedCatIds(updatedIds);
                          setBulkSelectedCatSlugs(updatedSlugs);
                        }}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-[#1A94FF] focus:ring-[#1A94FF] accent-[#1A94FF]"
                      />
                      <span className="truncate" title={cat.name}>{cat.name}</span>
                    </label>
                  );
                })}
            </div>
          </div>
        </form>
      </Dialog>

      {/* Image Zoom Preview Modal */}
      <Dialog
        isOpen={!!previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
        size="4xl"
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base sm:text-lg">
            <ImageIcon className="w-5 h-5 text-[#1A94FF]" />
            <span>{previewImageTitle || 'Xem chi tiết hình ảnh'}</span>
          </div>
        }
        subtitle="Hình ảnh chất lượng cao lưu trong hệ thống AquaHub"
        footer={
          <div className="flex items-center justify-between w-full">
            <a
              href={previewImageUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-50 text-[#0B74E5] hover:bg-blue-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Mở ảnh gốc trong tab mới</span>
            </a>
            <button
              type="button"
              onClick={() => setPreviewImageUrl(null)}
              className="px-5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition"
            >
              Đóng
            </button>
          </div>
        }
      >
        {previewImageUrl && (
          <div className="flex items-center justify-center p-2 bg-slate-900/90 rounded-2xl overflow-hidden min-h-[300px] max-h-[70vh]">
            <img
              src={previewImageUrl}
              alt={previewImageTitle || 'Preview Image'}
              className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        )}
      </Dialog>

    </div>

  );
}

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div suppressHydrationWarning className="container mx-auto px-4 py-16 text-center text-slate-400">
        <div suppressHydrationWarning className="w-10 h-10 border-4 border-[#1A94FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="font-semibold text-slate-600 text-sm">Đang tải Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div suppressHydrationWarning className="container mx-auto px-4 py-16 text-center text-slate-400">
          <div suppressHydrationWarning className="w-10 h-10 border-4 border-[#1A94FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-semibold text-slate-600 text-sm">Đang tải Admin Dashboard...</p>
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
