import React from 'react';
import { usePortal } from '../context/PortalContext';
import { X, Calendar, FileText, Download, CheckCircle2, Shield, Eye, Bookmark } from 'lucide-react';
import { useToast } from './Toast';

export const ReportModal: React.FC = () => {
  const { selectedReport, setSelectedReport } = usePortal();
  const { showToast } = useToast();

  if (!selectedReport) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={() => setSelectedReport(null)}
      role="dialog"
      aria-modal="true"
      aria-label={selectedReport.title}
    >
      <div
        className="bg-[#fcfbf9] w-full max-w-2xl rounded-xl shadow-2xl border border-[#e2ded5] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0c1829] text-white p-5 border-b border-[#c59b43]/30 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider bg-[#c59b43] text-black px-2 py-0.5 rounded">
                {selectedReport.academicYear}
              </span>
              <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded">
                {selectedReport.category}
              </span>
              <span className="text-xs text-gray-400">
                Session Year: {selectedReport.calendarYear}
              </span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-snug">
              {selectedReport.title}
            </h3>
          </div>

          <button
            onClick={() => setSelectedReport(null)}
            className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Close report details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-gray-800 leading-relaxed font-sans">
          {/* Institutional authenticity note */}
          <div className="p-3.5 bg-[#f4f1eb] border-l-3 border-[#c59b43] rounded-r text-xs text-gray-700">
            <div className="font-semibold text-[#0c1829] flex items-center gap-1.5 mb-0.5">
              <Shield className="w-3.5 h-3.5 text-[#9b7529]" />
              Archival Record • Campus Law Centre Legal Aid Society
            </div>
            <span>Published as part of the Society's institutional repository of clinical work, legal literacy camps, and public interest documentation.</span>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-[#0c1829] uppercase tracking-wider mb-1.5">
              Executive Summary
            </h4>
            <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg border border-[#e2ded5]">
              {selectedReport.description}
            </p>
          </div>

          {/* Key Highlights */}
          {selectedReport.highlights && selectedReport.highlights.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-[#0c1829] uppercase tracking-wider mb-2">
                Key Initiatives & Documented Outcomes
              </h4>
              <ul className="space-y-2">
                {selectedReport.highlights.map((point, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-[#9b7529] shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* PDF Download Placeholder Box */}
          <div className="mt-6 pt-4 border-t border-[#e2ded5]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-amber-50/50 border border-amber-200/80 rounded-lg gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-7 h-7 text-[#9b7529] shrink-0" />
                <div>
                  <span className="font-bold text-[#0c1829] text-sm block">
                    {selectedReport.pdfUrl || '[Previous Work Report PDF]'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Institutional Work Archive Document • {selectedReport.fileSize || '[File Size: 3.5 MB]'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  showToast('Archival PDF Document: Authentic compiled report files can be linked via the administrative panel under "Reports Manager".', 'info');
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0c1829] hover:bg-[#162740] text-white text-xs sm:text-sm font-semibold rounded-md transition-colors shadow-xs shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#c59b43]" />
                <span>Download Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f4f1eb] px-6 py-3 border-t border-[#e2ded5] flex items-center justify-between text-xs text-gray-500">
          <span>Campus Law Centre, University of Delhi</span>
          <button
            onClick={() => setSelectedReport(null)}
            className="px-3 py-1.5 bg-white border border-[#e2ded5] hover:bg-gray-50 text-gray-700 rounded transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
