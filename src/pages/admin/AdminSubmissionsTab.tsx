import React, { useState, useMemo } from 'react';
import type { AawazSubmission, AawazSubmissionStatus } from '../../types';
import {
  BookOpen,
  Search,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  Users,
  Download,
  Filter,
  Eye,
  ExternalLink,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';

interface AdminSubmissionsTabProps {
  submissions: AawazSubmission[];
  onRefresh: () => Promise<void>;
}

export const AdminSubmissionsTab: React.FC<AdminSubmissionsTabProps> = ({ submissions, onRefresh }) => {
  const { authFetch } = useAuth();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Selected submission for edit/review
  const [selectedSub, setSelectedSub] = useState<AawazSubmission | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit fields
  const [status, setStatus] = useState<AawazSubmissionStatus>('Submitted');
  const [reviewNotes, setReviewNotes] = useState('');
  const [editorFeedback, setEditorFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Filtered list
  const filteredSubmissions = useMemo(() => {
    return (submissions || []).filter(item => {
      const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
      const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.trackingToken.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.authorName.toLowerCase().includes(q) ||
        item.authorEmail.toLowerCase().includes(q) ||
        item.authorInstitution.toLowerCase().includes(q);

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [submissions, filterStatus, filterCategory, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = submissions.length;
    const pending = submissions.filter(s => s.status === 'Submitted' || s.status === 'Under Editorial Review').length;
    const revisions = submissions.filter(s => s.status === 'Revision Requested').length;
    const accepted = submissions.filter(s => s.status === 'Accepted for Publication').length;
    const declined = submissions.filter(s => s.status === 'Declined').length;
    return { total, pending, revisions, accepted, declined };
  }, [submissions]);

  const openEditModal = (sub: AawazSubmission) => {
    setSelectedSub(sub);
    setStatus(sub.status);
    setReviewNotes(sub.reviewNotes || '');
    setEditorFeedback(sub.editorFeedback || '');
    setIsEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedSub) return;
    setIsSaving(true);
    try {
      const res = await authFetch(`/api/admin/aawaz-submissions/${selectedSub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewNotes: reviewNotes || undefined,
          editorFeedback: editorFeedback || undefined
        })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to update submission');
      }

      showToast('Manuscript review updated successfully.', 'success');
      setIsEditModalOpen(false);
      await onRefresh();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error updating submission', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, token: string) => {
    if (!window.confirm(`Are you sure you want to delete manuscript submission ${token}?`)) {
      return;
    }

    try {
      const res = await authFetch(`/api/admin/aawaz-submissions/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to delete manuscript submission');
      }

      showToast(`Manuscript ${token} deleted.`, 'success');
      await onRefresh();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error deleting manuscript', 'error');
    }
  };

  const getStatusBadge = (st: AawazSubmissionStatus) => {
    switch (st) {
      case 'Accepted for Publication':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Accepted</span>;
      case 'Under Editorial Review':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">In Peer Review</span>;
      case 'Revision Requested':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">Revision Req</span>;
      case 'Declined':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-800">Declined</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">Submitted</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-xl font-bold font-serif text-[#0c1829] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#c59b43]" />
            <span>AAWAZ Editorial Submissions Desk</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage peer-review workflows, manuscript refereeing, revision cycles, and acceptance for publication.
          </p>
        </div>

        <button
          onClick={() => onRefresh()}
          className="px-3.5 py-2 text-xs font-semibold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          Refresh Submissions
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] text-gray-500 font-semibold block uppercase">Total Manuscripts</span>
          <span className="text-2xl font-bold font-mono text-[#0c1829]">{stats.total}</span>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-2xs">
          <span className="text-[11px] text-amber-800 font-semibold block uppercase">In Review</span>
          <span className="text-2xl font-bold font-mono text-amber-900">{stats.pending}</span>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-2xs">
          <span className="text-[11px] text-blue-800 font-semibold block uppercase">Revisions</span>
          <span className="text-2xl font-bold font-mono text-blue-900">{stats.revisions}</span>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-2xs">
          <span className="text-[11px] text-emerald-800 font-semibold block uppercase">Accepted</span>
          <span className="text-2xl font-bold font-mono text-emerald-900">{stats.accepted}</span>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] text-gray-600 font-semibold block uppercase">Declined</span>
          <span className="text-2xl font-bold font-mono text-gray-700">{stats.declined}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by manuscript title, token, author name, or institution..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none cursor-pointer"
            >
              <option value="All">All Review Stages</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Editorial Review">Under Editorial Review</option>
              <option value="Revision Requested">Revision Requested</option>
              <option value="Accepted for Publication">Accepted for Publication</option>
              <option value="Declined">Declined</option>
            </select>
          </div>
        </div>
      </div>

      {/* Manuscripts Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Token & Date</th>
                <th className="py-3 px-4">Title & Theme</th>
                <th className="py-3 px-4">Author & Institution</th>
                <th className="py-3 px-4">Length</th>
                <th className="py-3 px-4">Review Stage</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No manuscript submissions match the current filters.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-[#0c1829] block text-xs">{sub.trackingToken}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(sub.submittedAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-gray-900 line-clamp-1 font-serif">{sub.title}</div>
                      <div className="text-[11px] text-[#7b1d28] mt-0.5">{sub.category} • {sub.themeOrCFP}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900">{sub.authorName}</div>
                      <div className="text-[11px] text-gray-500">{sub.authorInstitution}</div>
                      {sub.hasCoAuthor && (
                        <span className="text-[10px] text-gray-400 block mt-0.5">+ Co-Author: {sub.coAuthorName}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-600 whitespace-nowrap">
                      ~{sub.wordCount} w
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(sub.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {sub.fileUrl && (
                          <a
                            href={sub.fileUrl}
                            download
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                            title="Download Manuscript File"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => openEditModal(sub)}
                          className="p-1.5 text-gray-600 hover:text-[#0c1829] hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                          title="Peer Review & Feedback"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id, sub.trackingToken)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Delete Manuscript"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT / PEER REVIEW MODAL */}
      {isEditModalOpen && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs font-mono font-bold text-[#c59b43] uppercase tracking-wider block">
                  Manuscript: {selectedSub.trackingToken}
                </span>
                <h3 className="font-serif font-bold text-lg text-[#0c1829]">
                  Editorial Scrutiny & Blind Peer Review
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs">
              {/* Title & Author Info */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-base text-[#0c1829] leading-snug">
                  {selectedSub.title}
                </h4>
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 grid grid-cols-2 gap-2 text-gray-700">
                  <div>
                    <span className="text-gray-400 block">Lead Author:</span>
                    <span className="font-semibold text-gray-900">{selectedSub.authorName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Author Email:</span>
                    <span className="font-mono text-gray-900">{selectedSub.authorEmail}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Affiliation:</span>
                    <span className="text-gray-900">{selectedSub.authorInstitution}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Designation:</span>
                    <span className="text-gray-900">{selectedSub.authorDesignation || 'Student Scholar'}</span>
                  </div>
                  {selectedSub.hasCoAuthor && (
                    <div className="col-span-2 pt-2 border-t border-gray-200">
                      <span className="text-gray-400 block">Co-Author:</span>
                      <span className="font-semibold text-gray-900">
                        {selectedSub.coAuthorName} ({selectedSub.coAuthorEmail}) — {selectedSub.coAuthorInstitution}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Abstract */}
              <div className="space-y-1.5">
                <span className="font-bold text-gray-800 uppercase tracking-wider block">Manuscript Abstract:</span>
                <p className="bg-[#fcfbf9] p-3 rounded-lg border border-gray-200 text-gray-800 leading-relaxed font-sans">
                  {selectedSub.abstract}
                </p>
              </div>

              {/* Manuscript File Download */}
              {selectedSub.fileUrl && (
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-900">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold">Attached File: {selectedSub.fileName || 'Manuscript Document'}</span>
                  </div>
                  <a
                    href={selectedSub.fileUrl}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              )}

              {/* Editorial Updates Section */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <span className="font-serif font-bold text-sm text-[#7b1d28] uppercase tracking-wider block">
                  Peer Review & Decision
                </span>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Editorial Review Stage
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as AawazSubmissionStatus)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#c59b43] focus:outline-none cursor-pointer"
                  >
                    <option value="Submitted">Submitted (Acknowledged)</option>
                    <option value="Under Editorial Review">Under Editorial Review (Double-Blind)</option>
                    <option value="Revision Requested">Revision Requested</option>
                    <option value="Accepted for Publication">Accepted for Publication</option>
                    <option value="Declined">Declined (Out of Scope / Plagiarism / Low Rigor)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Internal Editorial / Referee Notes
                  </label>
                  <textarea
                    rows={2}
                    value={reviewNotes}
                    onChange={e => setReviewNotes(e.target.value)}
                    placeholder="Notes for student editors & faculty conveners (e.g. Plagiarism check score 3.2%, Bluebook citations verified)..."
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#c59b43] focus:outline-none resize-y"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Author Feedback & Referee Comments (Communicated to Author)
                  </label>
                  <textarea
                    rows={3}
                    value={editorFeedback}
                    onChange={e => setEditorFeedback(e.target.value)}
                    placeholder="Specific suggestions for author revisions, citations to strengthen, or acceptance note..."
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#c59b43] focus:outline-none resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="px-5 py-2 bg-[#0c1829] hover:bg-[#162740] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Editorial Decision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
