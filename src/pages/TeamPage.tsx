import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext';
import type { TeamCategory } from '../types';
import { Users, Search, Mail, Shield, CheckCircle2, Award, Briefcase } from 'lucide-react';

const CATEGORIES: Array<'All' | TeamCategory> = [
  'All',
  'Faculty Coordinator',
  'Faculty Members',
  'Office Bearers',
  'Executive Members',
  'Student Volunteers',
  'Advisory Members'
];

export const TeamPage: React.FC = () => {
  const { data } = usePortal();
  const team = data?.team || [];
  const [selectedCategory, setSelectedCategory] = useState<'All' | TeamCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = team.filter(member => {
    const matchesCategory = selectedCategory === 'All' || member.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      member.name.toLowerCase().includes(q) ||
      member.designation.toLowerCase().includes(q) ||
      member.bio.toLowerCase().includes(q) ||
      member.areasOfResponsibility.some(r => r.toLowerCase().includes(q));

    return matchesCategory && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="border-b border-[#e2ded5] pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#7b1d28]">
          <span>Institutional Directory</span>
          <span className="w-12 h-0.5 bg-[#c59b43]" />
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#0c1829]">
          Society Leadership & Volunteers
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-3xl">
          The Legal Aid Society operates under the distinguished mentorship of Campus Law Centre faculty members and is led by student office bearers and committed student para-legal volunteers.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#e2ded5] shadow-xs space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, designation, or responsibility..."
            className="w-full pl-9 pr-4 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-sm focus:outline-none focus:border-[#c59b43] transition-colors"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#e2ded5]">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#0c1829] text-white font-bold shadow-xs'
                  : 'bg-[#f4f1eb] text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      {filteredMembers.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-[#e2ded5] p-8 space-y-2">
          <Users className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-gray-800">No team profiles found</h3>
          <p className="text-xs text-gray-500">
            No profiles match your search criteria. You can clear the search filter or select another category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map(member => (
            <div
              key={member.id}
              className="bg-white rounded-xl border border-[#e2ded5] p-6 shadow-xs hover:border-[#c59b43] transition-all hover:shadow-md flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                {/* Photo Placeholder / Emblem */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#f4f1eb] border-2 border-[#c59b43] flex items-center justify-center text-[#9b7529] shrink-0">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#f4f1eb] text-[#7b1d28] inline-block mb-1">
                      {member.category}
                    </span>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#0c1829] leading-snug">
                      {member.name}
                    </h3>
                    <p className="text-xs text-[#9b7529] font-medium leading-tight mt-0.5">
                      {member.designation}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{member.session}</p>
                  </div>
                </div>

                {/* Biography */}
                <p className="text-xs text-gray-600 leading-relaxed font-sans italic bg-[#fcfbf9] p-3 rounded border border-gray-100">
                  {member.bio}
                </p>

                {/* Responsibilities */}
                {member.areasOfResponsibility && member.areasOfResponsibility.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                      Assigned Verticals / Responsibilities:
                    </span>
                    <ul className="space-y-1">
                      {member.areasOfResponsibility.map((res, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#9b7529] shrink-0 mt-0.5" />
                          <span>{res}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer details */}
              <div className="pt-3 border-t border-[#e2ded5] flex items-center justify-between text-[11px] text-gray-500">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#9b7529]" />
                  Campus Law Centre
                </span>
                {member.email && (
                  <span className="text-gray-400">{member.email}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
