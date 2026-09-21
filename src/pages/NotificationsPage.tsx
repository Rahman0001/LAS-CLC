import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext';
import type { NotificationCategory } from '../types';
import { Bell, Search, Calendar, Pin, FileText, ChevronRight, Filter, Download } from 'lucide-react';

const CATEGORIES: Array<'All' | NotificationCategory> = [
  'All',
  'General',
  'Events',
  'Workshops',
  'Recruitment',
  'Legal Awareness',
  'Reports',
  'Announcements'
];

export const NotificationsPage: React.FC = () => {
  const { data, setSelectedNotification } = usePortal();
  const notifications = data?.notifications || [];
  const [selectedCategory, setSelectedCategory] = useState<'All' | NotificationCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const filtered = notifications
    .filter(n => {
      const matchCat = selectedCategory === 'All' || n.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.shortDescription.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q);

      return matchCat && matchQuery;
    })
    .sort((a, b) => {
      // Pinned always on top
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="border-b border-[#e2ded5] pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#7b1d28]">
          <span>Official Circulars & Announcements</span>
          <span className="w-12 h-0.5 bg-[#c59b43]" />
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#0c1829]">
          Notifications & Gazette
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-3xl">
          Official circulars, recruitment notices, legal camp schedules, and clinical updates issued by the Legal Aid Society, Campus Law Centre.
        </p>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#e2ded5] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search circulars by keyword, topic or date..."
              className="w-full pl-9 pr-4 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-sm focus:outline-none focus:border-[#c59b43] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600 self-end sm:self-auto">
            <Filter className="w-4 h-4 text-[#9b7529]" />
            <span>Sort by Date:</span>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as any)}
              className="bg-[#fcfbf9] border border-[#e2ded5] rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-[#c59b43]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#e2ded5]">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#0c1829] text-white font-bold'
                  : 'bg-[#f4f1eb] text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-[#e2ded5] p-8 space-y-2">
          <Bell className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-gray-800">
            No notifications have been published yet.
          </h3>
          <p className="text-xs text-gray-500">
            No circulars match your current filter parameters. Check back shortly for official updates.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(item => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border p-5 sm:p-6 transition-all hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                item.isPinned
                  ? 'border-[#c59b43] bg-gradient-to-r from-white to-amber-50/20'
                  : 'border-[#e2ded5] hover:border-[#c59b43]'
              }`}
            >
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#f4f1eb] text-[#7b1d28] px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  {item.isPinned && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                  <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#9b7529]" />
                    {item.date}
                  </span>
                </div>

                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0c1829]">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
                  {item.shortDescription || item.content}
                </p>

                {item.attachmentTitle && (
                  <div className="pt-1 flex items-center gap-2 text-[11px] text-gray-500">
                    <FileText className="w-3.5 h-3.5 text-[#9b7529]" />
                    <span className="font-medium text-gray-700">{item.attachmentTitle}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <button
                  onClick={() => setSelectedNotification(item)}
                  className="px-4 py-2 bg-[#0c1829] hover:bg-[#162740] text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>Read Notice</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#c59b43]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
