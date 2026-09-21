import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext';
import { FileText, Search, Download, Calendar, CheckCircle2, ChevronRight, Filter, Eye, Shield } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { data, setSelectedReport } = usePortal();
  const reports = data?.reports || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Extract unique academic years and categories
  const years = ['All', ...Array.from(new Set(reports.map(r => r.academicYear)))];
  const categories = ['All', ...Array.from(new Set(reports.map(r => r.category)))];

  const filtered = reports.filter(report => {
    const matchYear = selectedYear === 'All' || report.academicYear === selectedYear;
    const matchCategory = selectedCategory === 'All' || report.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      report.title.toLowerCase().includes(q) ||
      report.description.toLowerCase().includes(q) ||
      report.category.toLowerCase().includes(q) ||
      report.academicYear.toLowerCase().includes(q);

    return matchYear && matchCategory && matchQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="border-b border-[#e2ded5] pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#7b1d28]">
          <span>Institutional Archive</span>
          <span className="w-12 h-0.5 bg-[#c59b43]" />
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#0c1829]">
          Previous Work Reports & Compendiums
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-3xl">
          An archival repository documenting legal literacy drives, court observation records, prison legal aid initiatives, and research compilations published by the Legal Aid Society.
        </p>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#e2ded5] shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search reports by title, topic..."
              className="w-full pl-9 pr-4 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-sm focus:outline-none focus:border-[#c59b43] transition-colors"
            />
          </div>

          {/* Academic Year Filter */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="font-semibold text-gray-700 shrink-0">Academic Session:</span>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full bg-[#fcfbf9] border border-[#e2ded5] rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#c59b43]"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="font-semibold text-gray-700 shrink-0">Initiative Category:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full bg-[#fcfbf9] border border-[#e2ded5] rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#c59b43]"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-[#e2ded5] p-8 space-y-2">
          <FileText className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-gray-800">
            Previous work reports will appear here.
          </h3>
          <p className="text-xs text-gray-500">
            No work reports match your selected filters. Try broadening your search or selecting "All" categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(report => (
            <div
              key={report.id}
              className="bg-white rounded-xl border border-[#e2ded5] hover:border-[#c59b43] transition-all shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6 space-y-4">
                {/* Year and Category Badges */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#9b7529] bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                    {report.academicYear}
                  </span>
                  <span className="text-gray-500 font-medium">
                    {report.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif text-lg font-bold text-[#0c1829] leading-snug">
                  {report.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed font-sans">
                  {report.description}
                </p>

                {/* Highlights List */}
                {report.highlights && report.highlights.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-gray-100">
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                      Archived Highlights:
                    </span>
                    <ul className="space-y-1">
                      {report.highlights.slice(0, 2).map((h, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5 line-clamp-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#9b7529] shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 bg-[#fcfbf9] border-t border-[#e2ded5] flex items-center justify-between">
                <button
                  onClick={() => setSelectedReport(report)}
                  className="text-xs font-bold text-[#0c1829] hover:text-[#9b7529] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Summary</span>
                </button>

                <button
                  onClick={() => setSelectedReport(report)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0c1829] hover:bg-[#162740] text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#c59b43]" />
                  <span>PDF Document</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
