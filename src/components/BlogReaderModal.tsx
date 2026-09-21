import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortal } from '../context/PortalContext';
import { useBlogSEO } from '../utils/seo';
import {
  X,
  Calendar,
  Clock,
  User,
  Share2,
  Bookmark,
  Check,
  Tag,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Type,
  ExternalLink,
  Copy,
  Globe
} from 'lucide-react';
import { useToast } from './Toast';
import { calculateReadingTime } from '../utils/readingTime';

export const BlogReaderModal: React.FC = () => {
  const { selectedBlog, setSelectedBlog } = usePortal();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [citationCopied, setCitationCopied] = useState(false);
  const [readerFontSize, setReaderFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Dynamic SEO meta tag & JSON-LD hook
  useBlogSEO(selectedBlog);

  // Calculate estimated minutes to read and word count from article content
  const readingInfo = useMemo(() => {
    return calculateReadingTime(selectedBlog?.content, selectedBlog?.readTime);
  }, [selectedBlog?.content, selectedBlog?.readTime]);

  if (!selectedBlog) return null;

  const handleClose = () => {
    setSelectedBlog(null);
    if (window.location.pathname.startsWith('/aawaz/') || window.location.pathname.startsWith('/blogs/')) {
      navigate('/aawaz', { replace: true });
    } else if (window.location.search.includes('id=')) {
      navigate(window.location.pathname, { replace: true });
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/aawaz/${selectedBlog.slug || selectedBlog.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      showToast('Article link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCopyCitation = () => {
    const pubYear = selectedBlog.date ? selectedBlog.date.split('-')[0] : '2025';
    const citation = `${selectedBlog.author}, '${selectedBlog.title}' (${pubYear}) AAWAZ: The Socio-Legal Blog, Legal Aid Society, Campus Law Centre, Faculty of Law, University of Delhi <${window.location.origin}/aawaz/${selectedBlog.slug || selectedBlog.id}>.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(citation);
      setCitationCopied(true);
      showToast('Institutional citation copied (Bluebook / Standard Legal format)!', 'success');
      setTimeout(() => setCitationCopied(false), 3000);
    }
  };

  // Convert markdown-style content to styled blocks
  const renderFormattedContent = (content: string) => {
    const paragraphs = content.split('\n\n');
    return paragraphs.map((para, idx) => {
      const trimmed = para.trim();
      if (!trimmed) return null;

      // Heading 3
      if (trimmed.startsWith('### ')) {
        return (
          <h3
            key={idx}
            className="font-serif text-xl sm:text-2xl font-bold text-[#0c1829] mt-8 mb-3 pb-2 border-b border-[#e2ded5]"
          >
            {trimmed.replace('### ', '')}
          </h3>
        );
      }

      // Heading 2
      if (trimmed.startsWith('## ')) {
        return (
          <h2
            key={idx}
            className="font-serif text-2xl sm:text-3xl font-bold text-[#0c1829] mt-10 mb-4 pb-2 border-b border-[#c59b43]/30"
          >
            {trimmed.replace('## ', '')}
          </h2>
        );
      }

      // Unordered list block
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const listItems = trimmed.split('\n').map(l => l.replace(/^[-*]\s+/, ''));
        return (
          <ul key={idx} className="my-4 space-y-2 list-disc list-inside text-gray-800">
            {listItems.map((item, itemIdx) => (
              <li key={itemIdx} className="leading-relaxed pl-2">
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
              </li>
            ))}
          </ul>
        );
      }

      // Ordered list block
      if (/^\d+\.\s+/.test(trimmed)) {
        const listItems = trimmed.split('\n').map(l => l.replace(/^\d+\.\s+/, ''));
        return (
          <ol key={idx} className="my-4 space-y-2 list-decimal list-inside text-gray-800">
            {listItems.map((item, itemIdx) => (
              <li key={itemIdx} className="leading-relaxed pl-2">
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
              </li>
            ))}
          </ol>
        );
      }

      // Standard paragraph
      return (
        <p
          key={idx}
          className="my-4 leading-relaxed text-gray-800"
          dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }}
        />
      );
    });
  };

  // Helper for bold and italics
  const formatInlineMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-[#0c1829]">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>');
  };

  const getFontSizeClass = () => {
    switch (readerFontSize) {
      case 'large':
        return 'text-lg leading-loose';
      case 'xlarge':
        return 'text-xl leading-loose';
      default:
        return 'text-base leading-relaxed';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={selectedBlog.title}
    >
      <div
        className="bg-[#fcfbf9] w-full max-w-4xl rounded-2xl shadow-2xl border border-[#e2ded5] overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Floating Control Bar */}
        <div className="bg-[#0c1829] text-white px-6 py-4 flex items-center justify-between gap-4 border-b border-[#c59b43]/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm tracking-wider text-[#c59b43] uppercase">
                AAWAZ
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-xs text-gray-300 hidden sm:inline">The Official Blog</span>
            </div>
            <span className="text-xs bg-[#c59b43]/20 text-[#e6c887] border border-[#c59b43]/40 px-2.5 py-0.5 rounded-full font-medium">
              {selectedBlog.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Font Size Adjuster */}
            <div className="flex items-center bg-white/10 rounded-md p-0.5 text-xs text-gray-300">
              <button
                onClick={() => setReaderFontSize('normal')}
                className={`px-2 py-1 rounded transition-colors ${
                  readerFontSize === 'normal' ? 'bg-[#c59b43] text-black font-bold' : 'hover:text-white'
                }`}
                title="Normal font size"
              >
                A
              </button>
              <button
                onClick={() => setReaderFontSize('large')}
                className={`px-2 py-1 rounded transition-colors ${
                  readerFontSize === 'large' ? 'bg-[#c59b43] text-black font-bold' : 'hover:text-white'
                }`}
                title="Large font size"
              >
                A+
              </button>
              <button
                onClick={() => setReaderFontSize('xlarge')}
                className={`px-2 py-1 rounded transition-colors ${
                  readerFontSize === 'xlarge' ? 'bg-[#c59b43] text-black font-bold' : 'hover:text-white'
                }`}
                title="Extra large font size"
              >
                A++
              </button>
            </div>

            {/* Reading Time Indicator */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-200 bg-white/10 rounded-md border border-white/10"
              title={`Estimated ${readingInfo.minutesToReadText} (~200 WPM based on ${readingInfo.words.toLocaleString()} words)`}
            >
              <Clock className="w-3.5 h-3.5 text-[#c59b43]" />
              <span>{readingInfo.text}</span>
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-200 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
              title="Share article link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
              aria-label="Close reader"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Article Body */}
        <div className="overflow-y-auto px-6 sm:px-12 py-8 bg-[#fcfbf9]">
          {/* Article Header & Meta */}
          <div className="space-y-4 max-w-3xl mx-auto pb-6 border-b border-[#e2ded5]">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#0c1829] leading-tight">
              {selectedBlog.title}
            </h1>

            {selectedBlog.subtitle && (
              <p className="text-base sm:text-lg text-gray-600 font-serif italic leading-relaxed">
                {selectedBlog.subtitle}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-gray-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0c1829] text-[#c59b43] flex items-center justify-center font-serif font-bold text-sm">
                  {selectedBlog.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{selectedBlog.author}</p>
                  <p className="text-gray-500 text-xs">{selectedBlog.authorRole}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
                <span className="flex items-center gap-1.5 bg-[#f4f1eb] px-2.5 py-1 rounded-md border border-[#e2ded5]">
                  <Calendar className="w-3.5 h-3.5 text-[#c59b43]" />
                  <span>{selectedBlog.date}</span>
                </span>
                <span
                  className="flex items-center gap-1.5 bg-[#f4f1eb] px-2.5 py-1 rounded-md border border-[#e2ded5] font-medium text-[#0c1829]"
                  title={`Estimated ${readingInfo.minutesToReadText} (~200 words/min based on ${readingInfo.words.toLocaleString()} words)`}
                >
                  <Clock className="w-3.5 h-3.5 text-[#c59b43]" />
                  <span>{readingInfo.text}</span>
                  <span className="text-gray-400 font-normal">({readingInfo.words.toLocaleString()} words)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Cover Photo */}
          {selectedBlog.coverImage && (
            <div className="max-w-3xl mx-auto my-6">
              <div className="rounded-xl overflow-hidden border border-[#e2ded5] shadow-xs max-h-[380px]">
                <img
                  src={selectedBlog.coverImage}
                  alt={selectedBlog.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={e => {
                    // Gracefully hide broken image
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Executive Summary / Excerpt Callout */}
          {selectedBlog.excerpt && (
            <div className="max-w-3xl mx-auto my-6 p-5 bg-[#f4f1eb] border-l-4 border-[#c59b43] rounded-r-xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9b7529] block mb-1">
                Executive Excerpt
              </span>
              <p className="font-serif italic text-gray-700 text-sm sm:text-base leading-relaxed">
                "{selectedBlog.excerpt}"
              </p>
            </div>
          )}

          {/* Main Article Content */}
          <div className={`max-w-3xl mx-auto font-sans ${getFontSizeClass()}`}>
            {renderFormattedContent(selectedBlog.content)}
          </div>

          {/* Tags & Footer Section */}
          <div className="max-w-3xl mx-auto mt-10 pt-6 border-t border-[#e2ded5] space-y-6">
            {selectedBlog.tags && selectedBlog.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-600 mr-1">Topics:</span>
                {selectedBlog.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author Credit Box */}
            <div className="p-5 bg-white rounded-xl border border-[#e2ded5] shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#0c1829] text-[#c59b43] flex items-center justify-center font-serif font-bold text-lg shrink-0">
                {selectedBlog.author.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-serif font-bold text-[#0c1829] text-sm sm:text-base">
                    {selectedBlog.author}
                  </h4>
                  <span className="text-[11px] text-[#7b1d28] font-semibold bg-rose-50 px-2 py-0.5 rounded">
                    AAWAZ Contributor
                  </span>
                </div>
                <p className="text-xs text-gray-600 font-sans">
                  {selectedBlog.authorRole} • Legal Aid Society, Campus Law Centre, Faculty of Law, University of Delhi.
                </p>
                <p className="text-[11px] text-gray-500 italic">
                  Opinions expressed in AAWAZ reflect the academic research and clinical reflections of the contributing student volunteers and faculty mentors.
                </p>
              </div>
            </div>

            {/* Institutional SEO & Citation Box */}
            <div className="p-4 sm:p-5 bg-[#fcfbf9] rounded-xl border border-[#c59b43]/40 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0c1829]">
                  <Globe className="w-4 h-4 text-[#c59b43]" />
                  <span>Institutional Reference & Scholarly Citation</span>
                </div>
                <span className="text-[11px] bg-[#c59b43]/15 text-[#9b7529] px-2.5 py-0.5 rounded-full font-medium">
                  Verified Schema.org Metadata
                </span>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-[#e2ded5] text-xs font-mono text-gray-700 break-all select-all">
                {selectedBlog.author}, '{selectedBlog.title}' ({selectedBlog.date ? selectedBlog.date.split('-')[0] : '2025'}) AAWAZ: The Socio-Legal Blog, Legal Aid Society, Campus Law Centre &lt;{window.location.origin}/aawaz/{selectedBlog.slug || selectedBlog.id}&gt;.
              </div>

              <div className="flex items-center justify-between gap-3 pt-1 text-xs flex-wrap">
                <div className="text-[11px] text-gray-500 flex items-center gap-2 flex-wrap">
                  <span>Canonical URL: <code className="text-[#0c1829]">/aawaz/{selectedBlog.slug || selectedBlog.id}</code></span>
                  <span>•</span>
                  <span>Estimated: <strong className="text-gray-700">{readingInfo.text}</strong> ({readingInfo.words.toLocaleString()} words)</span>
                </div>
                <button
                  onClick={handleCopyCitation}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0c1829] hover:bg-[#162740] text-white font-medium rounded-md transition-colors text-xs shrink-0"
                >
                  {citationCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Citation Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#c59b43]" />
                      <span>Copy Citation</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Institutional Disclaimer */}
            <div className="text-[11px] text-gray-400 text-center italic">
              Published under AAWAZ: The Socio-Legal Blog Initiative of Legal Aid Society, Campus Law Centre • ISSN / Academic Dissemination Series
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="bg-[#f4f1eb] px-6 py-3 border-t border-[#e2ded5] flex items-center justify-between shrink-0 text-xs">
          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Blogs
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-1.5 bg-[#0c1829] hover:bg-[#162740] text-white font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-[#c59b43]" />
            Share Article
          </button>
        </div>
      </div>
    </div>
  );
};
