'use client';

import { useState, useRef } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/toast-provider';
import { ListingImageData, ListingVideoData } from '@/types';
import {
  Upload,
  Video,
  X,
  Image as ImageIcon,
  Star,
  Film,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface MediaUploaderProps {
  imageData: ListingImageData[];
  setImageData: (data: ListingImageData[]) => void;
  videosData: ListingVideoData[];
  setVideosData: (data: ListingVideoData[]) => void;
  legacyImages: string[];
  setLegacyImages: (urls: string[]) => void;
  legacyVideoUrl: string;
  setLegacyVideoUrl: (url: string) => void;
  className?: string;
}

export default function MediaUploader({
  imageData,
  setImageData,
  videosData,
  setVideosData,
  legacyImages,
  setLegacyImages,
  legacyVideoUrl,
  setLegacyVideoUrl,
  className = 'bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6',
}: MediaUploaderProps) {
  const { toast } = useToast();
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Helper to combine legacy & new image list
  const currentImagesCount = Math.max(imageData.length, legacyImages.length);
  const currentVideosCount = Math.max(videosData.length, legacyVideoUrl ? 1 : 0);

  // Handle Multi Image Upload
  const handleImageUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    if (currentImagesCount + files.length > 10) {
      toast.error('Tối đa 10 hình ảnh cho mỗi tin đăng');
      return;
    }

    setUploadingImages(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const res: any = await api.post('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploaded: ListingImageData[] = Array.isArray(res.data) ? res.data : (res as any);
      if (uploaded && uploaded.length > 0) {
        const updatedNew = [...imageData, ...uploaded];
        setImageData(updatedNew);

        // Also sync simple string array for backward compatibility
        const updatedUrls = [...legacyImages, ...uploaded.map((img) => img.url)];
        setLegacyImages(updatedUrls);

        toast.success(`Đã tải & nén tối ưu ${uploaded.length} hình ảnh!`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại!');
    } finally {
      setUploadingImages(false);
    }
  };

  // Handle Video Upload (up to 3 videos)
  const handleVideoUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    if (currentVideosCount + files.length > 3) {
      toast.error('Tối đa 3 video cho mỗi tin đăng');
      return;
    }

    setUploadingVideos(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const res: any = await api.post('/upload/videos/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploaded: ListingVideoData[] = Array.isArray(res.data) ? res.data : (res as any);
      if (uploaded && uploaded.length > 0) {
        const updatedVideos = [...videosData, ...uploaded];
        setVideosData(updatedVideos);

        if (!legacyVideoUrl && uploaded[0]?.url) {
          setLegacyVideoUrl(uploaded[0].url);
        }
        toast.success(`Đã tải ${uploaded.length} video thành công!`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Lỗi tải video. Tối đa 50MB cho mỗi video!');
    } finally {
      setUploadingVideos(false);
    }
  };

  // Drag and Drop reordering for images
  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const items = [...(imageData.length > 0 ? imageData : legacyImages.map(u => ({ url: u })))];
    const draggedItemContent = items[dragItem.current];
    items.splice(dragItem.current, 1);
    items.splice(dragOverItem.current, 0, draggedItemContent);

    dragItem.current = null;
    dragOverItem.current = null;

    setImageData(items as ListingImageData[]);
    setLegacyImages(items.map((it) => it.url));
  };

  // Remove single image
  const removeImage = (idx: number) => {
    if (imageData.length > 0) {
      const updated = imageData.filter((_, i) => i !== idx);
      setImageData(updated);
      setLegacyImages(updated.map((i) => i.url));
    } else {
      const updatedLegacy = legacyImages.filter((_, i) => i !== idx);
      setLegacyImages(updatedLegacy);
    }
  };

  // Set cover (primary) image by moving it to index 0
  const setAsCover = (idx: number) => {
    if (idx === 0) return;
    const items = imageData.length > 0 ? [...imageData] : legacyImages.map((u) => ({ url: u }));
    const selected = items[idx];
    items.splice(idx, 1);
    items.unshift(selected);

    setImageData(items as ListingImageData[]);
    setLegacyImages(items.map((i) => i.url));
    toast.success('Đã chọn làm ảnh đại diện tin đăng');
  };

  // Remove single video
  const removeVideo = (idx: number) => {
    const updated = videosData.filter((_, i) => i !== idx);
    setVideosData(updated);
    setLegacyVideoUrl(updated[0]?.url || '');
  };

  // Drag events for dropzone
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter((f) => f.type.startsWith('image/'));
      const videoFiles = files.filter((f) => f.type.startsWith('video/'));

      if (imageFiles.length > 0) handleImageUpload(imageFiles);
      if (videoFiles.length > 0) handleVideoUpload(videoFiles);
    }
  };

  const displayImages = imageData.length > 0 ? imageData : legacyImages.map((url) => ({ url, thumbnailUrl: url }));

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#1A94FF]" /> Hình ảnh & Video sản phẩm
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hệ thống tự động nén WebP siêu nhẹ & tối ưu hiển thị sắc nét cho cá / thủy sinh.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-[#1A94FF] border border-blue-100 rounded-full">
          {displayImages.length}/10 Ảnh • {videosData.length}/3 Video
        </span>
      </div>

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
          dragActive
            ? 'border-[#1A94FF] bg-blue-50/70 scale-[1.01]'
            : 'border-slate-300 hover:border-[#1A94FF] hover:bg-slate-50/50'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1A94FF] flex items-center justify-center shadow-xs">
            {uploadingImages || uploadingVideos ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#1A94FF]" />
            ) : (
              <Upload className="w-6 h-6 text-[#1A94FF]" />
            )}
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800">
              Kéo thả hình ảnh & video vào đây, hoặc click để chọn từ thiết bị
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Hỗ trợ JPG, PNG, WEBP (Tối đa 10 ảnh) và MP4, MOV (Tối đa 3 video, 50MB/video)
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A94FF] hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all">
              <ImageIcon className="w-4 h-4" />
              {uploadingImages ? 'Đang nén & tải ảnh...' : 'Chọn Hình Ảnh'}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                disabled={uploadingImages || currentImagesCount >= 10}
                className="hidden"
              />
            </label>

            <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all">
              <Video className="w-4 h-4 text-emerald-400" />
              {uploadingVideos ? 'Đang tải video...' : 'Thêm Video Quay Cá'}
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => e.target.files && handleVideoUpload(e.target.files)}
                disabled={uploadingVideos || currentVideosCount >= 3}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Image Preview & Reorder List */}
      {displayImages.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Danh sách hình ảnh (Kéo để kéo thả sắp xếp • Ảnh đầu tiên là Ảnh đại diện)</span>
            <span className="text-amber-600 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" /> Ảnh đầu = Ảnh đại diện
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {displayImages.map((img, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={() => (dragItem.current = idx)}
                onDragEnter={() => (dragOverItem.current = idx)}
                onDragEnd={handleSort}
                onDragOver={(e) => e.preventDefault()}
                className={`relative aspect-square rounded-2xl overflow-hidden group border-2 transition-all cursor-grab active:cursor-grabbing ${
                  idx === 0
                    ? 'border-[#1A94FF] ring-2 ring-blue-400/30 shadow-md'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <img
                  src={img.thumbnailUrl || img.url}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badge Overlay */}
                {idx === 0 && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#1A94FF] text-white text-[10px] font-bold rounded-full shadow flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" /> Ảnh bìa
                  </span>
                )}

                {/* Hover Quick Action Buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={() => setAsCover(idx)}
                      title="Đặt làm ảnh bìa"
                      className="p-1.5 bg-amber-500 text-white rounded-xl hover:scale-110 transition-transform shadow"
                    >
                      <Star className="w-4 h-4 fill-white" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    title="Xóa ảnh"
                    className="p-1.5 bg-red-600 text-white rounded-xl hover:scale-110 transition-transform shadow"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos List */}
      {videosData.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Film className="w-4 h-4 text-emerald-500" /> Video sản phẩm ({videosData.length}/3)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {videosData.map((vid, idx) => (
              <div key={idx} className="relative rounded-2xl overflow-hidden bg-black border border-slate-200">
                <video src={vid.url} controls className="w-full h-36 object-contain" />
                <button
                  type="button"
                  onClick={() => removeVideo(idx)}
                  className="absolute top-2 right-2 p-1.5 bg-red-600/90 text-white rounded-full shadow hover:bg-red-700 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="p-2 bg-slate-900/90 text-white text-[11px] font-medium flex items-center justify-between">
                  <span className="truncate max-w-[150px]">Video #{idx + 1}</span>
                  <span className="text-emerald-400 font-bold">HD</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
