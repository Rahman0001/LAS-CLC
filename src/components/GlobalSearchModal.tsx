import React, { useState, useEffect, useRef } from 'react';
import { usePortal } from '../context/PortalContext';
import { Search, X, FileText, Bell, Calendar, BookOpen, ExternalLink, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, setSelectedNotification, setSelectedReport } = usePortal();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.error('Search request failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchOpen) return null;

  const handleSelect = (item: any) => {
    setIsSearchOpen(false);
    if (item.type === 'Notification') {
      navigate(`/notifications`);
    } else if (item.type === 'Report') {
      navigate(`/reports`);
    } else if (item.type === 'Activity') {
      navigate(`/activities`);
    } else if (item.type === 'Resource') {
      navigate(`/resources`);
    } else if (item.type === 'AAWAZ Blog' || item.type === 'Blog') {
      navigate(`/aawaz?id=${item.id}`);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Notification':
        return <Bell className="w-4 h-4 text-amber-600" />;
      case 'Report':
        return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'Activity':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'AAWAZ Blog':
      case 'Blog':
        return <BookOpen className="w-4 h-4 text-purple-700" />;
      default:
        return <BookOpen className="w-4 h-4 text-[#c59b43]" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24"
      onClick={() => setIsSearchOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Institutional Portal Search"
    >
      <div
        className="bg-[#fcfbf9] w-full max-w-2xl rounded-xl shadow-2xl border border-[#e2ded5] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#e2ded5] bg-white gap-3">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search notifications, previous work reports, legal resources, activities..."
            className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-sm md:text-base font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-2 flex-1 divide-y divide-gray-100">
          {isSearching && (
            <div className="py-8 text-center text-sm text-gray-500">
              Searching institutional records...
            </div>
          )}

          {!isSearching && query.trim() && results.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-500">
              <p className="font-medium text-gray-700">No records found matching "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">Try searching by keyword, e.g. "rights", "report", "camp", "recruitment", or "clinic".</p>
            </div>
          )}

          {!query.trim() && (
            <div className="py-8 text-center text-xs text-gray-400">
              <p className="font-medium text-gray-600 mb-2">Suggested Institutional Topics:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Legal Aid Clinic', 'Work Reports', 'Student Induction', 'DSLSA', 'Article 39A', 'Lok Adalat', 'Know Your Rights'].map(term => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-2.5 py-1 bg-white border border-[#e2ded5] rounded-full text-xs text-gray-700 hover:border-[#c59b43] transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              onClick={() => handleSelect(item)}
              className="pt-2 pb-2 px-3 rounded-lg hover:bg-[#f4f1eb] cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  {getTypeIcon(item.type)}
                  <span className="uppercase tracking-wider font-semibold text-gray-700">{item.type}</span>
                  {item.category && <span>• {item.category}</span>}
                </span>
                {item.date && <span>{item.date}</span>}
              </div>

              <h4 className="text-sm font-semibold text-[#0c1829] group-hover:text-[#9b7529] transition-colors font-serif">
                {item.title}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">
                {item.snippet}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Hint */}
        <div className="bg-[#f4f1eb] px-4 py-2 text-[11px] text-gray-500 border-t border-[#e2ded5] flex items-center justify-between">
          <span>Official Institutional Search Directory</span>
          <span className="text-gray-400">Press ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
};
