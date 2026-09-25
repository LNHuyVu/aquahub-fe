'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { useSocket } from '@/contexts/socket-context';
import { Conversation, Message } from '@/types';
import { useToast } from '@/components/ui/toast-provider';
import {
  MessageSquare,
  Send,
  X,
  Minus,
  Maximize2,
  Search,
  ShoppingBag,
  ChevronLeft,
  Loader2,
  Sparkles,
  Paperclip,
  Image as ImageIcon,
  Video,
  Smile,
  FileText,
  Download,
  Trash2,
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
          className="max-w-[200px] max-h-[180px] rounded-xl object-cover border border-slate-200/80 shadow-2xs cursor-pointer hover:opacity-90 transition"
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
        <video src={url} controls className="max-w-[220px] max-h-[180px] rounded-xl border border-slate-200 bg-black shadow-2xs" />
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
          className={`inline-flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition ${
            isMe
              ? 'bg-blue-600/40 text-white border-blue-400/40 hover:bg-blue-600/60'
              : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-4 h-4 text-[#1A94FF] shrink-0" />
          <span className="truncate max-w-[140px]">{fileName}</span>
          <Download className="w-3.5 h-3.5 shrink-0 opacity-70" />
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
        className="max-w-[200px] max-h-[180px] rounded-xl object-cover border border-slate-200/80 shadow-2xs cursor-pointer hover:opacity-90 transition"
        onClick={() => window.open(content.trim(), '_blank')}
      />
    );
  }

  // Raw Video URL
  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(content.trim())) {
    return <video src={content.trim()} controls className="max-w-[220px] max-h-[180px] rounded-xl border border-slate-200 bg-black shadow-2xs" />;
  }

  return <p className="leading-relaxed whitespace-pre-wrap">{content}</p>;
}

export default function FloatingChatWidget() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);

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

  // Fetch conversations when widget opens or user logs in
  useEffect(() => {
    async function loadConversations() {
      if (!user) return;
      setLoadingConvs(true);
      try {
        const res: any = await api.get('/messages/conversations');
        const data: Conversation[] = res.data || res || [];
        setConversations(data);

        // Calculate total unread count
        const total = data.reduce((sum, conv) => {
          const count = conv.buyerId === user.id ? conv.unreadBuyerCount : conv.unreadSellerCount;
          return sum + (count || 0);
        }, 0);
        setUnreadTotal(total);
      } catch (err) {
        console.error('Error fetching chat conversations:', err);
      } finally {
        setLoadingConvs(false);
      }
    }

    if (user && isOpen) {
      loadConversations();
    }
  }, [user, isOpen]);

  // Listen for custom trigger event
  useEffect(() => {
    const handleOpenChatEvent = (e: any) => {
      setIsOpen(true);
      setIsMinimized(false);
      if (e.detail?.conversation) {
        setActiveConversation(e.detail.conversation);
      }
    };

    window.addEventListener('open_chat_widget', handleOpenChatEvent);
    return () => {
      window.removeEventListener('open_chat_widget', handleOpenChatEvent);
    };
  }, []);

  // Fetch messages when active conversation changes
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

    if (activeConversation) {
      loadMessages();
    }
  }, [activeConversation, socket]);

  // Socket listener for new real-time messages
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

  // Handle File Uploads (Image, Video, Document File)
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

  // Send message
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
      toast.error('Không thể gửi tin nhắn');
    }
  };

  if (!user || pathname?.startsWith('/admin')) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[9980] flex flex-col items-end">
      {/* 1. FLOATING CHAT BUTTON */}
      {(!isOpen || isMinimized) && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="relative p-3 bg-[#1A94FF] hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center cursor-pointer border-2 border-white"
          title="Chat AquaHub"
        >
          <MessageSquare className="w-5 h-5 text-white" />
          {unreadTotal > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white font-black text-[10px] rounded-full border border-white flex items-center justify-center animate-pulse">
              {unreadTotal > 99 ? '99+' : unreadTotal}
            </span>
          )}
        </button>
      )}

      {/* 2. CHATBOX POPUP WINDOW */}
      {isOpen && !isMinimized && (
        <div className="w-[365px] h-[510px] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* TOP CONTROL BAR */}
          <div className="p-3 bg-gradient-to-r from-[#1A94FF] to-blue-600 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              {activeConversation ? (
                <button
                  onClick={() => setActiveConversation(null)}
                  className="p-1 hover:bg-white/20 rounded-lg transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              ) : (
                <MessageSquare className="w-4.5 h-4.5" />
              )}
              <span className="font-bold text-xs truncate max-w-[200px]">
                {activeConversation
                  ? (activeConversation.buyerId === user.id
                      ? activeConversation.seller?.displayName || activeConversation.seller?.username
                      : activeConversation.buyer?.displayName || activeConversation.buyer?.username) || 'Chat'
                  : 'Chat AquaHub'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href={activeConversation ? `/tin-nhan?conv=${activeConversation.id}` : '/tin-nhan'}
                className="p-1 hover:bg-white/20 rounded-lg transition text-white"
                title="Mở toàn màn hình"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 hover:bg-white/20 rounded-lg transition text-white"
                title="Thu nhỏ"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition text-white"
                title="Đóng chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CHATBOX BODY VIEW */}
          {!activeConversation ? (
            /* VIEW A: CONVERSATION LIST */
            <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto divide-y divide-slate-100">
              {loadingConvs ? (
                <div className="p-8 text-center text-slate-400 my-auto">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1A94FF]" />
                  <p className="text-xs">Đang tải cuộc trò chuyện...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 my-auto space-y-2">
                  <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold text-slate-700">Chưa có tin nhắn nào</p>
                  <p className="text-[11px]">Bấm "Nhắn tin người bán" trên tin rao bất kỳ để bắt đầu chat!</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const partner = conv.buyerId === user.id ? conv.seller : conv.buyer;
                  const unread = conv.buyerId === user.id ? conv.unreadBuyerCount : conv.unreadSellerCount;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConversation(conv)}
                      className="w-full p-3 text-left bg-white hover:bg-blue-50/50 flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#1A94FF] text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {partner?.displayName?.substring(0, 2).toUpperCase() || 'U'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-xs truncate">
                            {partner?.displayName || partner?.username || 'Người dùng'}
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
                          <div className="text-[10px] font-semibold text-[#1A94FF] truncate">
                            📦 {conv.listing.title}
                          </div>
                        )}

                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {conv.lastMessage || 'Bắt đầu cuộc trò chuyện...'}
                        </p>
                      </div>

                      {unread > 0 && (
                        <span className="px-1.5 py-0.5 bg-red-600 text-white font-bold text-[10px] rounded-full">
                          {unread}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            /* VIEW B: ACTIVE CHAT WINDOW */
            <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
              {/* Context Product Banner */}
              {activeConversation.listing && (
                <div className="p-2 bg-blue-50/70 border-b border-blue-100 flex items-center gap-2 text-xs shrink-0">
                  <ShoppingBag className="w-4 h-4 text-[#1A94FF] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-slate-900 truncate block">
                      {activeConversation.listing.title}
                    </span>
                    <span className="text-[11px] font-semibold text-red-600">
                      {Number(activeConversation.listing.price).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>
              )}

              {/* Messages Stream */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-50/30">
                {loadingMsgs ? (
                  <div className="p-6 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#1A94FF]" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 space-y-1">
                    <Sparkles className="w-6 h-6 text-[#1A94FF] mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">Chào hỏi người bán ngay!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user.id;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`max-w-[82%] px-3 py-2 rounded-2xl text-xs ${
                            isMe
                              ? 'bg-[#1A94FF] text-white rounded-br-xs'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs'
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
                <div className="px-3 py-1.5 bg-blue-50 border-t border-blue-100 flex items-center justify-between text-xs text-[#0B74E5] font-semibold shrink-0">
                  <div className="flex items-center gap-1.5 truncate">
                    {attachment.type === 'image' && <ImageIcon className="w-3.5 h-3.5" />}
                    {attachment.type === 'video' && <Video className="w-3.5 h-3.5" />}
                    {attachment.type === 'file' && <FileText className="w-3.5 h-3.5" />}
                    <span className="truncate">Đính kèm {attachment.type === 'image' ? 'ảnh' : attachment.type === 'video' ? 'video' : attachment.fileName}</span>
                  </div>
                  <button onClick={() => setAttachment(null)} className="p-1 text-slate-400 hover:text-red-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Emoji Picker Popover */}
              {showEmojiPicker && (
                <div className="absolute bottom-14 left-2 right-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 z-20 grid grid-cols-7 gap-1 text-base text-center">
                  {EMOJI_LIST.map((emo, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setMessageInput((prev) => prev + emo);
                        setShowEmojiPicker(false);
                      }}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-200 bg-white shrink-0 space-y-1.5">
                {/* File input controls */}
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

                <div className="flex items-center gap-1">
                  {/* Action Toolbar Buttons */}
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingAttachment}
                    className="p-1.5 text-slate-500 hover:text-[#1A94FF] hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    title="Đính kèm Ảnh"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={uploadingAttachment}
                    className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    title="Đính kèm Video"
                  >
                    <Video className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAttachment}
                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    title="Đính kèm Tệp / Tài liệu"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1.5 text-slate-500 hover:text-amber-500 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    title="Biểu tượng cảm xúc"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1A94FF]"
                  />

                  <button
                    type="submit"
                    disabled={uploadingAttachment || (!messageInput.trim() && !attachment)}
                    className="p-2 bg-[#1A94FF] hover:bg-blue-600 text-white rounded-xl transition disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {uploadingAttachment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
