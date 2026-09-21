import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext';
import {
  BookOpen,
  ShieldAlert,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  HelpCircle,
  FileCheck,
  Scale,
  Search
} from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const { data } = usePortal();
  const resources = data?.resources || [];
  const settings = data?.settings;

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Know Your Rights', 'Legal Literacy Guides', 'Statutory Resources', 'FAQs'];

  const filtered = resources.filter(res => {
    const matchCategory = activeCategory === 'All' || res.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      res.title.toLowerCase().includes(q) ||
      res.summary.toLowerCase().includes(q) ||
      res.keyPoints.some(k => k.toLowerCase().includes(q));

    return matchCategory && matchQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="border-b border-[#e2ded5] pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#7b1d28]">
          <span>Citizen Knowledge & Literacy</span>
          <span className="w-12 h-0.5 bg-[#c59b43]" />
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#0c1829]">
          Legal Awareness & Public Resources
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-3xl">
          Educational primers, statutory rights guidelines, and institutional guidance prepared by the Legal Aid Society to enhance citizen legal empowerment.
        </p>
      </div>

      {/* Mandatory Official Institutional Legal Disclaimer */}
      <div className="bg-[#fff9eb] border-2 border-[#c59b43] rounded-xl p-5 sm:p-6 text-gray-900 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-[#7b1d28] font-bold text-sm sm:text-base font-serif">
          <ShieldAlert className="w-5 h-5 text-[#9b7529] shrink-0" />
          <span>Official Public Legal Disclaimer</span>
        </div>
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
          {settings?.legalDisclaimer || '[Official Legal Disclaimer: The educational materials and information presented on this portal are published exclusively for academic dissemination and public legal literacy. They do not constitute formal legal counsel or create an advocate-client relationship. Citizens requiring individualized legal representation or filing assistance should approach accredited Legal Services Authorities (NALSA / DSLSA) or consult the Campus Law Centre Legal Aid Clinic during notified working hours.]'}
        </p>
      </div>

      {/* Search and Category Filter */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#e2ded5] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search legal literacy guides, rights, topics..."
              className="w-full pl-9 pr-4 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-sm focus:outline-none focus:border-[#c59b43] transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === c
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

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(res => (
          <div
            key={res.id}
            className="bg-white rounded-xl border border-[#e2ded5] p-6 shadow-xs hover:border-[#c59b43] transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9b7529] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {res.category}
                </span>
                <span className="text-gray-400 text-[11px]">CLC Legal Aid Literacy Primers</span>
              </div>

              <h3 className="font-serif text-lg font-bold text-[#0c1829] leading-snug">
                {res.title}
              </h3>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans">
                {res.summary}
              </p>

              {res.keyPoints && res.keyPoints.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                    Key Legal Principles & Statutory Provisions:
                  </span>
                  <ul className="space-y-1.5">
                    {res.keyPoints.map((point, idx) => (
                      <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#9b7529] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {res.officialLink && (
              <div className="pt-3 border-t border-[#e2ded5]">
                <a
                  href={res.officialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0c1829] hover:text-[#9b7529] transition-colors group"
                >
                  <span>Access Official Government/Statutory Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Statutory Legal Aid Helplines Section */}
      <section className="bg-[#f4f1eb] p-8 rounded-xl border border-[#e2ded5] space-y-6">
        <h2 className="font-serif text-xl font-bold text-[#0c1829] flex items-center gap-2">
          <Scale className="w-5 h-5 text-[#9b7529]" />
          Statutory Legal Aid Helplines & Authorities
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-gray-700">
          <div className="bg-white p-4 rounded-lg border border-[#e2ded5] space-y-1">
            <span className="font-bold text-[#0c1829] block">NALSA National Toll-Free Helpline</span>
            <span className="text-lg font-serif font-bold text-[#9b7529] block">15100</span>
            <p className="text-[11px] text-gray-500">24x7 Legal Services Assistance across all Indian states.</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-[#e2ded5] space-y-1">
            <span className="font-bold text-[#0c1829] block">Delhi State Legal Services Authority (DSLSA)</span>
            <span className="text-lg font-serif font-bold text-[#9b7529] block">1516</span>
            <p className="text-[11px] text-gray-500">Dedicated legal aid helpline for the National Capital Territory of Delhi.</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-[#e2ded5] space-y-1">
            <span className="font-bold text-[#0c1829] block">National Commission for Women Helpline</span>
            <span className="text-lg font-serif font-bold text-[#9b7529] block">7827170170</span>
            <p className="text-[11px] text-gray-500">Support for women in distress and victims of violence.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
