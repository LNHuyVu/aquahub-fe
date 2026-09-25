'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { useSocket } from '@/contexts/socket-context';
import { Conversation, Message } from '@/types';
import { useToast } from '@/components/ui/toast-provider';
import DetailPageHeader from '@/components/ui/detail-page-header';
import {
  MessageSquare,
  Send,
  Search,
  ArrowLeft,
  ShoppingBag,
  User as UserIcon,
  CheckCheck,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Paperclip,
  Video,
  Smile,
  FileText,
  Download,
  X,
} from 'lucide-react';

const EMOJI_LIST = ['🐟', '🐠', '🦐', '🌿', '💧', '🛒', '👍', '❤️', '😊', '🔥', '🎉', '💬', '📦', '⭐', '💯', '🙏', '🚩', '💡', '✅', '🤝', '💵', '🚚'];

function MessageContentRenderer({ content, isMe }: { content: string; isMe: boolean }) {
  // 1. Image tag: [image:URL]
  const imgMatch = content.match(/\[image:(.*?)\]/);
  if (imgMatch) {
    const url = imgMatch[1];
    const textAfter = content.replace(/\[image:.*?\]/, '').trim();
    return (
      <div className="space-y-1.5 my-0.5">
        <img
          src={url}
          alt="Ảnh đính kèm"
          className="max-w-[260px] max-h-[220px] rounded-2xl object-cover border border-slate-200/80 shadow-2xs cursor-pointer hover:opacity-90 transition"
          onClick={() => window.open(url, '_blank')}
        />
        {textAfter && <p className="leading-relaxed whitespace-pre-wrap">{textAfter}</p>}
      </div>
    );
  }

  // 2. Video tag: [video:URL]
  const vidMatch = content.match(/\[video:(.*?)\]/);
  if (vidMatch) {
    const url = vidMatch[1];
    const textAfter = content.replace(/\[video:.*?\]/, '').trim();
    return (
      <div className="space-y-1.5 my-0.5">
        <video src={url} controls className="max-w-[280px] max-h-[220px] rounded-2xl border border-slate-200 bg-black shadow-2xs" />
        {textAfter && <p className="leading-relaxed whitespace-pre-wrap">{textAfter}</p>}
      </div>
    );
  }

  // 3. File tag: [file:URL|NAME]
  const fileMatch = content.match(/\[file:(.*?)\|(.*?)\]/);
  if (fileMatch) {
    const url = fileMatch[1];
    const fileName = fileMatch[2];
    const textAfter = content.replace(/\[file:.*?\|.*?\]/, '').trim();
    return (
      <div className="space-y-1.5 my-0.5">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
            isMe
              ? 'bg-blue-600/40 text-white border-blue-400/40 hover:bg-blue-600/60'
              : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-4 h-4 text-[#1A94FF] shrink-0" />
          <span className="truncate max-w-[180px]">{fileName}</span>
          <Download className="w-4 h-4 shrink-0 opacity-70" />
        </a>
        {textAfter && <p className="leading-relaxed whitespace-pre-wrap">{textAfter}</p>}
      </div>
    );
  }

  // Raw Image URL
  if (/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(content.trim())) {
    return (
      <img
        src={content.trim()}
        alt="Ảnh đính kèm"
        className="max-w-[260px] max-h-[220px] rounded-2xl object-cover border border-slate-200/80 shadow-2xs cursor-pointer hover:opacity-90 transition"
        onClick={() => window.open(content.trim(), '_blank')}
      />
    );
  }

  // Raw Video URL
  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(content.trim())) {
    return <video src={content.trim()} controls className="max-w-[280px] max-h-[220px] rounded-2xl border border-slate-200 bg-black shadow-2xs" />;
  }

  return <p className="leading-relaxed whitespace-pre-wrap">{content}</p>;
}

function MessagesDashboardContent() {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const initialConvId = searchParams.get('conv');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Attachment & Emoji States
  const [attachment, setAttachment] = useState<{
    type: 'image' | 'video' | 'file';
    url: string;
    fileName?: string;
  } | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch User Conversations
  useEffect(() => {
    async function loadConversations() {
      setLoadingConvs(true);
      try {
        const res: any = await api.get('/messages/conversations');
        const data: Conversation[] = res.data || res || [];
        setConversations(data);

        if (initialConvId) {
          const found = data.find((c) => c.id === initialConvId);
          if (found) setActiveConversation(found);
        } else if (data.length > 0) {
          setActiveConversation(data[0]);
        }
      } catch (err) {
        console.error('Error loading conversations:', err);
      } finally {
        setLoadingConvs(false);
      }
    }
    if (user) {
      loadConversations();
    }
  }, [user, initialConvId]);

  // 2. Fetch Messages for active conversation & join socket room
  useEffect(() => {
    async function loadMessages() {
      if (!activeConversation) return;
      setLoadingMsgs(true);
      try {
        const res: any = await api.get(`/messages/conversations/${activeConversation.id}/messages`);
        const msgs: Message[] = res.data || res || [];
        setMessages(msgs);

        if (socket) {
          socket.emit('join_conversation', { conversationId: activeConversation.id });
        }
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        setLoadingMsgs(false);
        setTimeout(scrollToBottom, 100);
      }
    }

    loadMessages();
  }, [activeConversation, socket]);

  // 3. Socket event listener for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg: Message) => {
      if (activeConversation && newMsg.conversationId === activeConversation.id) {
        setMessages((prev) => [...prev, newMsg]);
        setTimeout(scrollToBottom, 100);
      }

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === newMsg.conversationId) {
            return {
              ...conv,
              lastMessage: newMsg.content,
              lastMessageAt: newMsg.createdAt,
            };
          }
          return conv;
        }),
      );
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, activeConversation]);

  // Handle Attachment Uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'file') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadingAttachment(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      let endpoint = '/upload';
      if (type === 'video') endpoint = '/upload/video';
      if (type === 'file') endpoint = '/upload/file';

      const res: any = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = res.data?.url || res.url;
      setAttachment({
        type,
        url: uploadedUrl,
        fileName: file.name,
      });

      toast.success(`Đã đính kèm ${type === 'image' ? 'ảnh' : type === 'video' ? 'video' : 'tệp'} thành công!`);
    } catch (err: any) {
      console.error(err);
      toast.error('Lỗi khi tải file đính kèm!');
    } finally {
      setUploadingAttachment(false);
      e.target.value = '';
    }
  };

  // Send Message Handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation) return;

    let content = messageInput.trim();
    if (attachment) {
      if (attachment.type === 'image') {
        content = `[image:${attachment.url}] ${content}`.trim();
      } else if (attachment.type === 'video') {
        content = `[video:${attachment.url}] ${content}`.trim();
      } else if (attachment.type === 'file') {
        content = `[file:${attachment.url}|${attachment.fileName || 'File'}] ${content}`.trim();
      }
    }

    if (!content) return;

    setMessageInput('');
    setAttachment(null);
    setShowEmojiPicker(false);

    try {
      if (socket && isConnected) {
        socket.emit('send_message', {
          conversationId: activeConversation.id,
          content,
        });
      } else {
        const res: any = await api.post(`/messages/conversations/${activeConversation.id}/send`, {
          content,
        });
        const saved: Message = res.data || res;
        setMessages((prev) => [...prev, saved]);
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      toast.error('Lỗi khi gửi tin nhắn. Vui lòng thử lại!');
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const partner = conv.buyerId === user?.id ? conv.seller : conv.buyer;
    const title = conv.listing?.title || '';
    const partnerName = partner?.displayName || partner?.username || '';
    const query = searchQuery.toLowerCase();
    return partnerName.toLowerCase().includes(query) || title.toLowerCase().includes(query);
  });

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-3 sm:px-6">
      <div className="container mx-auto max-w-6xl space-y-4">
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <DetailPageHeader
              breadcrumbs={[]}
              currentTitle="Tin Nhắn Mua Bán"
              showShare={false}
              showBack={true}
            />
          </div>
        </div>

        {/* MESSAGING INTERFACE */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px]">
          {/* CONVERSATIONS SIDEBAR */}
          <div className="md:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
            {/* Search Box */}
            <div className="p-3.5 border-b border-slate-200 bg-white">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên người bán hoặc tin..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A94FF]"
                />
              </div>
            </div>

            {/* Conversation Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {loadingConvs ? (
                <div className="p-8 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1A94FF]" />
                  <p className="text-xs">Đang tải cuộc trò chuyện...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-medium">Chưa có cuộc trò chuyện nào</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const partner = conv.buyerId === user?.id ? conv.seller : conv.buyer;
                  const isActive = activeConversation?.id === conv.id;
                  const unreadCount =
                    conv.buyerId === user?.id ? conv.unreadBuyerCount : conv.unreadSellerCount;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConversation(conv)}
                      className={`w-full p-3.5 text-left flex items-start gap-3 transition-all hover:bg-blue-50/50 ${
                        isActive ? 'bg-blue-50/80 border-l-4 border-[#1A94FF]' : 'bg-white'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1A94FF] to-blue-400 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {partner?.displayName?.substring(0, 2).toUpperCase() ||
                          partner?.username?.substring(0, 2).toUpperCase() ||
                          'U'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="font-bold text-slate-900 text-xs truncate">
                            {partner?.displayName || partner?.username || 'Người dùng AquaHub'}
                          </h4>
                          {conv.lastMessageAt && (
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {new Date(conv.lastMessageAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>

                        {conv.listing && (
                          <div className="text-[11px] font-semibold text-[#1A94FF] truncate mb-1">
                            📦 {conv.listing.title}
                          </div>
                        )}

                        <p className="text-xs text-slate-500 truncate">
                          {conv.lastMessage || 'Bắt đầu cuộc trò chuyện...'}
                        </p>
                      </div>

                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-red-500 text-white font-bold text-[10px] rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ACTIVE CHAT WINDOW */}
          <div className="md:col-span-8 flex flex-col bg-white relative">
            {activeConversation ? (
              <>
                {/* Chat Top Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1A94FF] to-blue-400 text-white font-bold text-sm flex items-center justify-center">
                      {(activeConversation.buyerId === user?.id
                        ? activeConversation.seller?.displayName
                        : activeConversation.buyer?.displayName
                      )
                        ?.substring(0, 2)
                        .toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {activeConversation.buyerId === user?.id
                          ? activeConversation.seller?.displayName || activeConversation.seller?.username
                          : activeConversation.buyer?.displayName || activeConversation.buyer?.username}
                      </h3>
                      {activeConversation.listing && (
                        <Link
                          href={`/san-mua-ban/${activeConversation.listing.slug}`}
                          className="text-xs font-medium text-[#1A94FF] hover:underline flex items-center gap-1"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> {activeConversation.listing.title} (
                          {Number(activeConversation.listing.price).toLocaleString('vi-VN')} đ)
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
                  {loadingMsgs ? (
                    <div className="p-8 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1A94FF]" />
                      <p className="text-xs">Đang tải tin nhắn...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-2">
                      <Sparkles className="w-8 h-8 text-[#1A94FF] mx-auto" />
                      <p className="text-xs font-semibold text-slate-700">
                        Gửi lời chào để bắt đầu giao dịch an toàn!
                      </p>
                      <p className="text-[11px]">
                        Hãy hỏi về tình trạng cá, phí ship, hoặc thương lượng giá cả.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === user?.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-xs ${
                              isMe
                                ? 'bg-[#1A94FF] text-white rounded-br-xs'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                            }`}
                          >
                            <MessageContentRenderer content={msg.content} isMe={isMe} />
                            <span
                              className={`text-[9px] block text-right mt-1 ${
                                isMe ? 'text-blue-100' : 'text-slate-400'
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Attachment Preview Banner */}
                {attachment && (
                  <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex items-center justify-between text-xs text-[#0B74E5] font-semibold shrink-0">
                    <div className="flex items-center gap-1.5 truncate">
                      {attachment.type === 'image' && <ImageIcon className="w-4 h-4" />}
                      {attachment.type === 'video' && <Video className="w-4 h-4" />}
                      {attachment.type === 'file' && <FileText className="w-4 h-4" />}
                      <span className="truncate">Đính kèm {attachment.type === 'image' ? 'ảnh' : attachment.type === 'video' ? 'video' : attachment.fileName}</span>
                    </div>
                    <button onClick={() => setAttachment(null)} className="p-1 text-slate-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Emoji Picker Popover */}
                {showEmojiPicker && (
                  <div className="absolute bottom-16 left-4 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-20 grid grid-cols-8 gap-1 text-lg text-center max-w-sm">
                    {EMOJI_LIST.map((emo, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setMessageInput((prev) => prev + emo);
                          setShowEmojiPicker(false);
                        }}
                        className="p-1.5 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input Bar */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white shrink-0 space-y-2">
                  <input
                    type="file"
                    ref={imageInputRef}
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={videoInputRef}
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, 'video')}
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="*/*"
                    onChange={(e) => handleFileUpload(e, 'file')}
                    className="hidden"
                  />

                  <div className="flex items-center gap-1.5">
                    {/* Action Buttons */}
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploadingAttachment}
                      className="p-2 text-slate-500 hover:text-[#1A94FF] hover:bg-slate-100 rounded-xl transition cursor-pointer"
                      title="Gửi Ảnh"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      disabled={uploadingAttachment}
                      className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                      title="Gửi Video quay cá"
                    >
                      <Video className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAttachment}
                      className="p-2 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                      title="Gửi Tệp / Tài liệu"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 text-slate-500 hover:text-amber-500 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                      title="Biểu tượng cảm xúc"
                    >
                      <Smile className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1A94FF]"
                    />

                    <button
                      type="submit"
                      disabled={uploadingAttachment || (!messageInput.trim() && !attachment)}
                      className="p-3 bg-[#1A94FF] hover:bg-blue-600 text-white rounded-2xl transition disabled:opacity-50 shadow-md cursor-pointer"
                    >
                      {uploadingAttachment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 space-y-3">
                <MessageSquare className="w-12 h-12 text-slate-300" />
                <p className="text-sm font-semibold">Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagesDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1A94FF]"></div>
        </div>
      }
    >
      <MessagesDashboardContent />
    </Suspense>
  );
}
