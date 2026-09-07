'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eraser,
  Code2,
  Eye,
  Minus,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Nhập nội dung cẩm nang/bài viết...',
  minHeight = '220px',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isCodeView, setIsCodeView] = useState(false);
  const [htmlContent, setHtmlContent] = useState(value || '');

  // Keep editor content in sync when value prop changes externally
  useEffect(() => {
    if (editorRef.current && !isCodeView) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setHtmlContent(value || '');
  }, [value, isCodeView]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setHtmlContent(html);
      onChange(html);
    }
  };

  const execCommand = (command: string, valueArg: string = '') => {
    if (isCodeView) return;
    document.execCommand(command, false, valueArg);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const handleInsertLink = () => {
    if (isCodeView) return;
    const url = prompt('Nhập địa chỉ URL đường dẫn:', 'https://');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const handleInsertHeading = (tag: 'h2' | 'h3') => {
    if (isCodeView) return;
    execCommand('formatBlock', `<${tag}>`);
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs focus-within:border-[#1A94FF] focus-within:ring-2 focus-within:ring-blue-500/10 transition">
      {/* Editor Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap items-center justify-between gap-1 select-none">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Styling */}
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => execCommand('bold')}
              title="In đậm (Ctrl+B)"
              className="p-1.5 hover:bg-slate-100 rounded-md text-slate-700 hover:text-[#1A94FF] transition"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('italic')}
              title="In nghiêng (Ctrl+I)"
              className="p-1.5 hover:bg-slate-100 rounded-md text-slate-700 hover:text-[#1A94FF] transition"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('underline')}
              title="Gạch chân (Ctrl+U)"
              className="p-1.5 hover:bg-slate-100 rounded-md text-slate-700 hover:text-[#1A94FF] transition"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('strikeThrough')}
              title="Gạch ngang"
              className="p-1.5 hover:bg-slate-100 rounded-md text-slate-700 hover:text-[#1A94FF] transition"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Headings */}
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => handleInsertHeading('h2')}
              title="Tiêu đề H2"
              className="p-1.5 hover:bg-slate-100 rounded-md text-slate-700 hover:text-[#1A94FF] font-bold text-xs transition"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleInsertHeading('h3')}
              title="Tiêu đề H3"
              className="p-1.5 hover:bg-slate-100 rounded-md text-slate-700 hover:text-[#1A94FF] font-bold text-xs transition"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Lists & Blocks */}
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => execCommand('insertUnorderedList')}
              title="Danh sách dấu chấm"
              className="p-1.5 hover:bg-slate-100 rounded-md text-slate-700 hover:text-[#1A94FF] transition"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('insertOrderedList')}
              title="Danh sách số"
              className="p-1.5 hover:bg-slate-100 rounded-md text-slate-700 hover:text-[#1A94FF] transition"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('formatBlock', 'blockquote')}
              title="Trích dẫn"
              className="p-1.5 hover:bg-slate-100 rounded-md text-slate-700 hover:text-[#1A94FF] transition"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('formatBlock', 'pre')}
              title="Khối mã code"
              className="p-1.5 hover:bg-slate-100 rounded-md text-slate-700 hover:text-[#1A94FF] transition"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('insertHorizontalRule')}
              title="Đường phân cách ngang"
              className="p-1.5 hover:bg-slate-100 rounded-md text-slate-700 hover:text-[#1A94FF] transition"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => execCommand('justifyLeft')}
              title="Căn trái"
              className="p-1.5 hover:bg-slate-100 rounded-md text-slate-700 hover:text-[#1A94FF] transition"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('justifyCenter')}
              title="Căn giữa"
              className="p-1.5 hover:bg-slate-100 rounded-md text-slate-700 hover:text-[#1A94FF] transition"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('justifyRight')}
              title="Căn phải"
              className="p-1.5 hover:bg-slate-100 rounded-md text-slate-700 hover:text-[#1A94FF] transition"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Insert Link & Clear */}
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={handleInsertLink}
              title="Chèn đường dẫn (URL)"
              className="p-1.5 hover:bg-slate-100 rounded-md text-slate-700 hover:text-[#1A94FF] transition"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('removeFormat')}
              title="Xóa định dạng"
              className="p-1.5 hover:bg-slate-100 rounded-md text-slate-700 hover:text-rose-600 transition"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* View mode toggle */}
        <button
          type="button"
          onClick={() => setIsCodeView(!isCodeView)}
          title={isCodeView ? 'Chuyển sang chế độ soạn thảo trực quan' : 'Xem mã HTML'}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
            isCodeView
              ? 'bg-[#1A94FF] text-white border-[#1A94FF]'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          {isCodeView ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Chế độ Soạn thảo</span>
            </>
          ) : (
            <>
              <Code2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Mã HTML</span>
            </>
          )}
        </button>
      </div>

      {/* Editor Content Body */}
      {isCodeView ? (
        <textarea
          value={htmlContent}
          onChange={(e) => {
            setHtmlContent(e.target.value);
            onChange(e.target.value);
          }}
          className="w-full p-4 font-mono text-xs text-slate-800 bg-slate-900 text-slate-100 focus:outline-none resize-y"
          style={{ minHeight }}
          placeholder="<h1>Nhập mã HTML tại đây...</h1>"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          className="p-4 text-sm text-slate-800 focus:outline-none leading-relaxed overflow-y-auto prose max-w-none [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-[#1A94FF] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_pre]:bg-slate-100 [&_pre]:p-2 [&_pre]:rounded-lg [&_a]:text-[#1A94FF] [&_a]:underline"
          style={{ minHeight }}
          data-placeholder={placeholder}
        />
      )}
    </div>
  );
}
