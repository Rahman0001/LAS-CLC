import React from 'react';
import { usePortal } from '../context/PortalContext';
import { X, Calendar, Tag, FileText, Download, ExternalLink, Pin, ShieldCheck } from 'lucide-react';
import { useToast } from './Toast';

export const NotificationModal: React.FC = () => {
  const { selectedNotification, setSelectedNotification } = usePortal();
  const { showToast } = useToast();

  if (!selectedNotification) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={() => setSelectedNotification(null)}
      role="dialog"
      aria-modal="true"
      aria-label={selectedNotification.title}
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
                {selectedNotification.category}
              </span>
              {selectedNotification.isPinned && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-900/50 text-amber-200 border border-amber-600/40 px-2 py-0.5 rounded">
                  <Pin className="w-3 h-3" /> Pinned Notification
                </span>
              )}
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#c59b43]" />
                {selectedNotification.date}
              </span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-snug">
              {selectedNotification.title}
            </h3>
          </div>

          <button
            onClick={() => setSelectedNotification(null)}
            className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Close notification details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-gray-800 leading-relaxed font-sans">
          {/* Institutional authenticity disclaimer note */}
          <div className="p-3.5 bg-[#f4f1eb] border-l-3 border-[#c59b43] rounded-r text-xs text-gray-700">
            <div className="font-semibold text-[#0c1829] flex items-center gap-1.5 mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#9b7529]" />
              Official Circular Record • Legal Aid Society, Campus Law Centre
            </div>
            <span>Published under the authority of the Student Executive Committee and Faculty Mentorship.</span>
          </div>

          {/* Short summary */}
          {selectedNotification.shortDescription && (
            <p className="font-medium text-gray-900 bg-amber-50/50 p-3 rounded border border-amber-100/60">
              {selectedNotification.shortDescription}
            </p>
          )}

          {/* Detailed content */}
          <div className="whitespace-pre-line text-gray-800">
            {selectedNotification.content}
          </div>

          {/* Attached Document placeholder */}
          {selectedNotification.attachmentTitle && (
            <div className="mt-6 pt-4 border-t border-[#e2ded5]">
              <h4 className="text-xs font-semibold text-[#0c1829] uppercase tracking-wider mb-2">
                Official Attachment
              </h4>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white border border-[#e2ded5] rounded-lg gap-3">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-[#9b7529] shrink-0" />
                  <div>
                    <span className="font-medium text-gray-900 text-xs sm:text-sm block">
                      {selectedNotification.attachmentTitle}
                    </span>
                    <span className="text-[11px] text-gray-500">Official Institutional Circular Document (PDF)</span>
                  </div>
                </div>

                <a
                  href={selectedNotification.attachmentUrl || '#'}
                  onClick={e => {
                    if (!selectedNotification.attachmentUrl || selectedNotification.attachmentUrl === '#') {
                      e.preventDefault();
                      showToast('Official Circular Document: Authentic notice attachments can be linked via the Admin Panel under "Notifications Manager".', 'info');
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#0c1829] hover:bg-[#162740] text-white text-xs font-medium rounded transition-colors shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#c59b43]" />
                  <span>Download Document</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#f4f1eb] px-6 py-3 border-t border-[#e2ded5] flex items-center justify-between text-xs text-gray-500">
          <span>Campus Law Centre, University of Delhi</span>
          <button
            onClick={() => setSelectedNotification(null)}
            className="px-3 py-1.5 bg-white border border-[#e2ded5] hover:bg-gray-50 text-gray-700 rounded transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
