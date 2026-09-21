import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext';
import { Image as ImageIcon, X, Calendar, Filter, ZoomIn, Shield, Users } from 'lucide-react';
import type { GalleryItem } from '../types';

export const GalleryPage: React.FC = () => {
  const { data } = usePortal();
  const gallery = data?.gallery || [];
  const [selectedAlbum, setSelectedAlbum] = useState<string>('All');
  const [activeLightboxItem, setActiveLightboxItem] = useState<GalleryItem | null>(null);

  const albums = ['All', ...Array.from(new Set(gallery.map(g => g.album)))];

  const filtered = gallery.filter(item => {
    return selectedAlbum === 'All' || item.album === selectedAlbum;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="border-b border-[#e2ded5] pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#7b1d28]">
          <span>Institutional Memory</span>
          <span className="w-12 h-0.5 bg-[#c59b43]" />
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#0c1829]">
          Photo Gallery & Event Archives
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-3xl">
          Visual documentation of clinical outreach drives, national seminars, student volunteer inductions, and field camp activities.
        </p>
      </div>

      {/* Album Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#e2ded5] shadow-xs flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-gray-500 mr-2 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#9b7529]" />
          Filter by Album:
        </span>
        {albums.map(alb => (
          <button
            key={alb}
            onClick={() => setSelectedAlbum(alb)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedAlbum === alb
                ? 'bg-[#0c1829] text-white font-bold'
                : 'bg-[#f4f1eb] text-gray-700 hover:bg-gray-200'
            }`}
          >
            {alb}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-[#e2ded5] p-8 space-y-2">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-gray-800">No images in this album</h3>
          <p className="text-xs text-gray-500">Official event photographs can be curated and uploaded in the Admin Panel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveLightboxItem(item)}
              className="group cursor-pointer bg-white rounded-xl border border-[#e2ded5] overflow-hidden shadow-xs hover:border-[#c59b43] transition-all hover:shadow-md flex flex-col"
            >
              {/* Image / Placeholder visual box */}
              <div className="h-52 bg-gradient-to-br from-[#0c1829] to-[#162740] relative flex items-center justify-center p-6 text-center overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="space-y-2 text-[#e6c887]/80">
                    <div className="w-12 h-12 mx-auto rounded-full bg-white/10 border border-[#c59b43]/40 flex items-center justify-center text-[#c59b43]">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-serif block text-white/90">
                      [Official Photograph Placeholder]
                    </span>
                    <span className="text-[10px] text-gray-400 block uppercase tracking-wider">
                      {item.album}
                    </span>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-xs text-xs font-medium flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>View Photo</span>
                  </div>
                </div>
              </div>

              {/* Caption & Metadata */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                    <span className="font-medium text-[#9b7529] uppercase tracking-wide">{item.album}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.year}
                    </span>
                  </div>
                  <h3 className="font-serif text-sm sm:text-base font-bold text-[#0c1829] leading-snug">
                    {item.title}
                  </h3>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2 italic font-sans">
                  {item.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeLightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveLightboxItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-[#0c1829] text-white w-full max-w-3xl rounded-xl border border-[#c59b43]/50 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-widest text-[#c59b43] font-bold">
                  {activeLightboxItem.album} • {activeLightboxItem.year}
                </span>
                <h3 className="font-serif text-lg font-bold text-white">
                  {activeLightboxItem.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveLightboxItem(null)}
                className="text-gray-400 hover:text-white p-1 rounded-md"
                aria-label="Close photo preview"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 flex-1 flex items-center justify-center bg-black/50 min-h-[300px]">
              {activeLightboxItem.imageUrl ? (
                <img
                  src={activeLightboxItem.imageUrl}
                  alt={activeLightboxItem.title}
                  referrerPolicy="no-referrer"
                  className="max-h-[60vh] max-w-full object-contain rounded-md"
                />
              ) : (
                <div className="text-center space-y-3 p-8">
                  <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-[#c59b43] mx-auto flex items-center justify-center text-[#c59b43]">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif text-lg text-white">
                    [Official Archival Photograph Placeholder]
                  </h4>
                  <p className="text-xs text-gray-300 max-w-md mx-auto">
                    Institutional photographs from society archives can be uploaded directly into this album via the administrative portal.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#08111e] border-t border-gray-800 text-xs text-gray-300">
              <p className="leading-relaxed italic">
                {activeLightboxItem.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
