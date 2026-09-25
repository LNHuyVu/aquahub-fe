'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { User, Post, Listing } from '@/types';
import ListingCard from '@/components/ui/listing-card';
import {
  User as UserIcon,
  MessageSquare,
  ShoppingBag,
  Calendar,
  Sparkles,
  Heart,
  Eye,
  CheckCircle2,
  MapPin,
  ArrowLeft,
  Loader2,
  FileText,
  Edit3,
  EyeOff,
  Trash2,
  CheckCircle,
  X,
  Pencil,
  Settings,
  Upload,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/toast-provider';
import DetailPageHeader from '@/components/ui/detail-page-header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Dialog from '@/components/ui/dialog';

function UserProfileContent() {
  const params = useParams();
  const username = params?.username as string;

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'listings'>('posts');
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingListings, setLoadingListings] = useState(false);

  const { user: currentUser, updateUser } = useAuth();
  const { toast } = useToast();

  const isOwnerOrAdmin = currentUser && profileUser && (currentUser.id === profileUser.id || currentUser.role === 'ADMIN');
  const isSelf = currentUser && profileUser && currentUser.id === profileUser.id;

  // Edit Profile Dialog State
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Edit Post Modal State
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Open Edit Profile Dialog
  const handleOpenEditProfile = () => {
    if (!profileUser) return;
    setEditDisplayName(profileUser.displayName || '');
    setEditBio(profileUser.bio || '');
    setEditAvatar(profileUser.avatar || '');
    setShowEditProfileDialog(true);
  };

  // Avatar Upload Handler
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res: any = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.url || res.url || res;
      setEditAvatar(url);
      toast.success('Đã tải ảnh đại diện lên thành công!');
    } catch (err) {
      toast.error('Có lỗi xảy ra khi tải ảnh đại diện');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Save Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res: any = await api.patch('/users/me', {
        displayName: editDisplayName.trim(),
        bio: editBio.trim(),
        avatar: editAvatar,
      });
      const updatedUser = res.data || res;
      setProfileUser(updatedUser);
      if (isSelf) {
        updateUser(updatedUser);
      }
      toast.success('Đã cập nhật thông tin cá nhân thành công!');
      setShowEditProfileDialog(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật thông tin cá nhân');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handlers for Posts
  const handleTogglePostStatus = async (postId: string) => {
    try {
      const res: any = await api.put(`/posts/${postId}/toggle-status`);
      const isPublished = res.data?.isPublished;
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isPublished } : p))
      );
      toast.success(res.data?.message || 'Đã cập nhật trạng thái bài viết');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi đổi trạng thái bài viết');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success('Đã xóa bài viết thành công');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa bài viết');
    }
  };

  const handleOpenEditPost = (post: Post) => {
    setEditingPost(post);
    setEditTitle(post.title || '');
    setEditContent(post.content || '');
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    setSavingEdit(true);
    try {
      const res: any = await api.put(`/posts/${editingPost.id}`, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });
      setPosts((prev) => prev.map((p) => (p.id === editingPost.id ? { ...p, title: editTitle.trim(), content: editContent.trim() } : p)));
      toast.success('Đã cập nhật bài viết thành công!');
      setEditingPost(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật bài viết');
    } finally {
      setSavingEdit(false);
    }
  };

  // Handlers for Listings
  const handleToggleListingStatus = async (listingId: string) => {
    try {
      const res: any = await api.put(`/listings/${listingId}/toggle-status`);
      setListings((prev) =>
        prev.map((item) =>
          item.id === listingId
            ? { ...item, status: res.data?.status || (item.status === 'ACTIVE' ? 'SOLD' : 'ACTIVE') }
            : item
        )
      );
      toast.success('Đã cập nhật trạng thái tin rao bán');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi đổi trạng thái tin');
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tin rao bán này không?')) return;
    try {
      await api.delete(`/listings/${listingId}`);
      setListings((prev) => prev.filter((item) => item.id !== listingId));
      toast.success('Đã xóa tin rao bán');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa tin');
    }
  };

  // Fetch User Info
  useEffect(() => {
    async function loadProfile() {
      if (!username) return;
      setLoading(true);
      try {
        const res: any = await api.get(`/users/profile/${username}`);
        const data = res.data || res;
        setProfileUser(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [username]);

  // Fetch User Community Posts
  useEffect(() => {
    async function loadUserPosts() {
      if (!profileUser?.id) return;
      setLoadingPosts(true);
      try {
        const res: any = await api.get(`/posts?authorId=${profileUser.id}&limit=20`);
        const items = res.data?.items || res.data || res || [];
        setPosts(items);
      } catch (err) {
        console.error('Error fetching user posts:', err);
      } finally {
        setLoadingPosts(false);
      }
    }
    if (profileUser) loadUserPosts();
  }, [profileUser]);

  // Fetch User Marketplace Listings
  useEffect(() => {
    async function loadUserListings() {
      if (!profileUser?.id) return;
      setLoadingListings(true);
      try {
        const res: any = await api.get(`/listings?userId=${profileUser.id}&limit=20`);
        const items = res.data?.data || res.data || res || [];
        setListings(items);
      } catch (err) {
        console.error('Error fetching user listings:', err);
      } finally {
        setLoadingListings(false);
      }
    }
    if (profileUser) loadUserListings();
  }, [profileUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1A94FF]"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 text-center space-y-4">
        <UserIcon className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy tài khoản người dùng</h2>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#1A94FF] bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#1A94FF]" /> Quay lại Trang Chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-3 sm:px-6">
      <div className="container mx-auto max-w-5xl space-y-6">
        <DetailPageHeader
          breadcrumbs={[{ label: 'Cộng đồng', href: '/cong-dong' }]}
          currentTitle={profileUser.displayName || profileUser.username}
          showShare={false}
        />

        {/* PROFILE HEADER CARD */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/60 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-[#1A94FF] to-blue-400 text-white font-black text-3xl sm:text-4xl flex items-center justify-center shadow-lg border-4 border-white shrink-0 relative group">
              {profileUser.avatar ? (
                <img
                  src={profileUser.avatar}
                  alt={profileUser.displayName || profileUser.username}
                  className="w-full h-full object-cover rounded-3xl"
                />
              ) : (
                (profileUser.displayName || profileUser.username).substring(0, 2).toUpperCase()
              )}

              {isSelf && (
                <button
                  type="button"
                  onClick={handleOpenEditProfile}
                  className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1 cursor-pointer"
                  title="Chỉnh sửa ảnh đại diện"
                >
                  <Pencil className="w-5 h-5 text-white" />
                  <span>Đổi ảnh</span>
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {profileUser.displayName || profileUser.username}
                  </h1>
                  <span className="px-3 py-1 bg-blue-50 text-[#1A94FF] border border-blue-100 text-xs font-bold rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1A94FF]" /> Thành viên AquaHub
                  </span>
                </div>

                {/* Edit Profile Button for Owner / Admin */}
                {isSelf && (
                  <button
                    type="button"
                    onClick={handleOpenEditProfile}
                    className="inline-flex items-center gap-2 bg-[#1A94FF] hover:bg-[#0D5CB6] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Chỉnh sửa hồ sơ</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-400">@{profileUser.username}</p>

              {profileUser.bio ? (
                <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 max-w-2xl leading-relaxed">
                  💬 {profileUser.bio}
                </p>
              ) : isSelf ? (
                <button
                  type="button"
                  onClick={handleOpenEditProfile}
                  className="text-xs text-slate-400 hover:text-[#1A94FF] italic border border-dashed border-slate-200 rounded-xl p-2.5 max-w-2xl text-left block w-full hover:bg-blue-50/50 transition cursor-pointer"
                >
                  + Thêm tiểu sử bản thân (ví dụ: Chuyên nuôi cá rồng, dòng dĩa, thủy sinh Bố Bố...)
                </button>
              ) : null}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#1A94FF]" /> Tham gia từ:{' '}
                  {new Date(profileUser.createdAt).toLocaleDateString('vi-VN')}
                </span>
                <span className="flex items-center gap-1.5 font-bold text-slate-800">
                  <MessageSquare className="w-4 h-4 text-blue-500" /> {posts.length} Bài viết
                </span>
                <span className="flex items-center gap-1.5 font-bold text-slate-800">
                  <ShoppingBag className="w-4 h-4 text-emerald-500" /> {listings.length} Tin rao bán
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SHADCN-UI STYLE TABS: BÀI VIẾT CỘNG ĐỒNG vs SẢN PHẨM RAO BÁN */}
        <Tabs defaultValue="posts" value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
          <TabsList className="w-full grid grid-cols-2 h-auto p-1.5 bg-slate-200/70 border border-slate-200 rounded-2xl">
            <TabsTrigger value="posts" className="py-3 text-xs sm:text-sm font-bold gap-2">
              <MessageSquare className="w-4 h-4 text-[#1A94FF]" />
              <span>Bài Viết Cộng Đồng ({posts.length})</span>
            </TabsTrigger>
            <TabsTrigger value="listings" className="py-3 text-xs sm:text-sm font-bold gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-500" />
              <span>Sản Phẩm Rao Bán ({listings.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: COMMUNITY POSTS */}
          <TabsContent value="posts">
            <div className="space-y-4">
              {loadingPosts ? (
                <div className="py-12 text-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1A94FF] mx-auto mb-2" />
                  <p className="text-xs">Đang tải bài viết...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">Chưa có bài viết cộng đồng nào</h3>
                  <p className="text-xs text-slate-400">Thành viên này chưa đăng bài viết thảo luận nào.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {post.category && (
                            <span className="px-3 py-1 bg-blue-50 text-[#1A94FF] text-xs font-bold rounded-lg border border-blue-100">
                              {post.category.name || 'Cộng đồng'}
                            </span>
                          )}
                          {post.isPublished === false && (
                            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-md flex items-center gap-1 border border-amber-200">
                              <EyeOff className="w-3 h-3" /> Đã ẩn
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      <Link href={`/cong-dong/${post.slug || post.id}`}>
                        <h3 className="font-bold text-slate-900 text-base hover:text-[#1A94FF] transition leading-snug">
                          {post.title || post.content.slice(0, 80)}
                        </h3>
                      </Link>

                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {post.content}
                      </p>

                      {/* Post Images Preview */}
                      {post.images && post.images.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto py-1">
                          {post.images.slice(0, 4).map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt="post preview"
                              className="w-20 h-20 object-cover rounded-xl border border-slate-200 shrink-0"
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1 font-semibold text-rose-500">
                            <Heart className="w-3.5 h-3.5 fill-current" /> {post.likesCount || 0}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-slate-600">
                            <MessageSquare className="w-3.5 h-3.5 text-blue-500" /> {post.commentsCount || 0} Bình luận
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isOwnerOrAdmin && (
                            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                              <button
                                type="button"
                                onClick={() => handleOpenEditPost(post)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                                title="Chỉnh sửa bài viết"
                              >
                                <Pencil className="w-3.5 h-3.5" /> Sửa
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTogglePostStatus(post.id)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                                  post.isPublished === false
                                    ? 'text-emerald-700 hover:bg-emerald-100'
                                    : 'text-amber-700 hover:bg-amber-100'
                                }`}
                                title={post.isPublished === false ? 'Hiện bài viết' : 'Ẩn bài viết'}
                              >
                                <EyeOff className="w-3.5 h-3.5" /> {post.isPublished === false ? 'Hiện' : 'Ẩn'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePost(post.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                                title="Xóa bài viết"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Xóa
                              </button>
                            </div>
                          )}

                          <Link
                            href={`/cong-dong/${post.slug || post.id}`}
                            className="text-xs font-bold text-[#1A94FF] hover:underline px-2 py-1"
                          >
                            Xem chi tiết ↗
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 2: MARKETPLACE LISTINGS */}
          <TabsContent value="listings">
            <div className="space-y-4">
              {loadingListings ? (
                <div className="py-12 text-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs">Đang tải sản phẩm rao bán...</p>
                </div>
              ) : listings.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">Chưa có sản phẩm rao bán nào</h3>
                  <p className="text-xs text-slate-400">Thành viên này chưa đăng tin bán cá hoặc thiết bị nào.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {listings.map((item) => (
                    <div key={item.id} className="relative group">
                      <ListingCard listing={item} />
                      {isOwnerOrAdmin && (
                        <div className="mt-2 flex items-center justify-between gap-1.5 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
                          <button
                            type="button"
                            onClick={() => handleToggleListingStatus(item.id)}
                            className={`flex-1 py-1 px-2 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                              item.status === 'SOLD'
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                            }`}
                          >
                            <EyeOff className="w-3 h-3" />
                            <span>{item.status === 'SOLD' ? 'Mở lại tin' : 'Đánh dấu Bán'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteListing(item.id)}
                            className="py-1 px-2.5 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition border border-rose-200 flex items-center gap-1 cursor-pointer"
                            title="Xóa tin rao bán"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* EDIT POST MODAL */}
        {editingPost && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-[#1A94FF]" />
                  Chỉnh sửa bài viết cộng đồng
                </h3>
                <button
                  onClick={() => setEditingPost(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePost} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tiêu đề bài viết</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Nhập tiêu đề bài viết..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-[#1A94FF] focus:bg-white transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nội dung bài viết</label>
                  <textarea
                    rows={5}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Nhập nội dung chia sẻ..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 leading-relaxed focus:outline-none focus:border-[#1A94FF] focus:bg-white transition resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingPost(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit || !editTitle.trim() || !editContent.trim()}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#1A94FF] hover:bg-[#0D5CB6] rounded-xl transition shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    <span>{savingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT PROFILE DIALOG (SHADCN-UI STYLE DIALOG) */}
        <Dialog
          isOpen={showEditProfileDialog}
          onClose={() => setShowEditProfileDialog(false)}
          title="Chỉnh sửa thông tin cá nhân"
          subtitle="Cập nhật tên hiển thị, tiểu sử và hình đại diện của bạn"
          size="lg"
        >
          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Avatar Upload Preview */}
            <div className="flex flex-col items-center justify-center space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#1A94FF] to-blue-400 text-white font-black text-3xl flex items-center justify-center shadow-md border-2 border-white overflow-hidden relative group">
                {editAvatar ? (
                  <img src={editAvatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  (editDisplayName || username).substring(0, 2).toUpperCase()
                )}

                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>

              <label className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 hover:border-blue-300 text-slate-700 text-xs font-bold rounded-xl shadow-xs hover:text-[#1A94FF] cursor-pointer transition">
                <Upload className="w-3.5 h-3.5 text-[#1A94FF]" />
                <span>{uploadingAvatar ? 'Đang tải ảnh...' : 'Tải ảnh đại diện mới'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>
            </div>

            {/* Display Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Tên hiển thị</label>
              <input
                type="text"
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                placeholder="Nhập tên hiển thị (Ví dụ: Nguyễn Văn A)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-[#1A94FF] focus:bg-white transition"
              />
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Tiểu sử (Bio)</label>
              <textarea
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Giới thiệu bản thân, dòng cá đam mê hoặc sở thích thủy sinh..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 leading-relaxed focus:outline-none focus:border-[#1A94FF] focus:bg-white transition resize-none"
              />
            </div>

            {/* Submit buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEditProfileDialog(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={savingProfile || uploadingAvatar}
                className="px-5 py-2 text-xs font-bold text-white bg-[#1A94FF] hover:bg-[#0D5CB6] rounded-xl transition shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                <span>{savingProfile ? 'Đang lưu...' : 'Lưu thông tin'}</span>
              </button>
            </div>
          </form>
        </Dialog>
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1A94FF]"></div>
        </div>
      }
    >
      <UserProfileContent />
    </Suspense>
  );
}
