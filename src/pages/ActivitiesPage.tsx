import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext';
import { Calendar, MapPin, Tag, CheckCircle2, FileText, ChevronRight, Award, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ActivitiesPage: React.FC = () => {
  const { data } = usePortal();
  const activities = data?.activities || [];
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', ...Array.from(new Set(activities.map(a => a.category)))];

  const filtered = activities.filter(act => {
    const matchCat = selectedCategory === 'All' || act.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      act.title.toLowerCase().includes(q) ||
      act.description.toLowerCase().includes(q) ||
      act.location.toLowerCase().includes(q);

    return matchCat && matchQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="border-b border-[#e2ded5] pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#7b1d28]">
          <span>Initiatives & Field Operations</span>
          <span className="w-12 h-0.5 bg-[#c59b43]" />
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#0c1829]">
          Activities & Community Initiatives
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-3xl">
          Comprehensive field programs, clinical training sessions, rights awareness camps, and academic conferences spearheaded by the Legal Aid Society.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#e2ded5] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search activities by title, location, topic..."
              className="w-full pl-9 pr-4 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-sm focus:outline-none focus:border-[#c59b43] transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === c
                    ? 'bg-[#0c1829] text-white font-bold'
                    : 'bg-[#f4f1eb] text-gray-700 hover:bg-gray-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-[#e2ded5] p-8 space-y-2">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-gray-800">
            No activities recorded in this category.
          </h3>
          <p className="text-xs text-gray-500">
            Please check back soon or select "All" to view all institutional initiatives.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(act => (
            <div
              key={act.id}
              className="bg-white rounded-xl border border-[#e2ded5] hover:border-[#c59b43] transition-all shadow-xs hover:shadow-md flex flex-col justify-between p-6 space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[#7b1d28] bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                    {act.category}
                  </span>
                  <span className="flex items-center gap-1 text-gray-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#9b7529]" />
                    {act.date}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-[#0c1829] leading-snug">
                  {act.title}
                </h3>

                <div className="flex items-start gap-1.5 text-xs text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-[#9b7529] shrink-0 mt-0.5" />
                  <span>{act.location}</span>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans">
                  {act.description}
                </p>

                {act.keyOutcomes && act.keyOutcomes.length > 0 && (
                  <div className="space-y-1.5 pt-3 border-t border-gray-100">
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                      Program Outcomes & Highlights:
                    </span>
                    <ul className="space-y-1">
                      {act.keyOutcomes.map((k, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#9b7529] shrink-0 mt-0.5" />
                          <span>{k}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#e2ded5] flex items-center justify-between text-xs">
                <Link
                  to="/reports"
                  className="text-xs font-bold text-[#0c1829] hover:text-[#9b7529] transition-colors flex items-center gap-1"
                >
                  <span>Related Documentation</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[11px] text-gray-400 font-medium">
                  Status: Published
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
