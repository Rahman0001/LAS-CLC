import React, { useState, useMemo } from 'react';
import type { ClinicAppointment, ClinicAppointmentStatus } from '../../types';
import {
  Scale,
  Search,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  UserCheck,
  Building,
  Filter,
  Eye,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';

interface AdminClinicTabProps {
  appointments: ClinicAppointment[];
  onRefresh: () => Promise<void>;
}

export const AdminClinicTab: React.FC<AdminClinicTabProps> = ({ appointments, onRefresh }) => {
  const { authFetch } = useAuth();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterDomain, setFilterDomain] = useState<string>('All');

  // Selected appointment for detail / edit modal
  const [selectedAppt, setSelectedAppt] = useState<ClinicAppointment | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit fields
  const [status, setStatus] = useState<ClinicAppointmentStatus>('Received');
  const [scheduledDate, setScheduledDate] = useState('');
  const [assignedVolunteers, setAssignedVolunteers] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Filtered list
  const filteredAppointments = useMemo(() => {
    return (appointments || []).filter(item => {
      const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
      const matchesDomain = filterDomain === 'All' || item.legalDomain === filterDomain;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.trackingToken.toLowerCase().includes(q) ||
        item.fullName.toLowerCase().includes(q) ||
        item.phone.includes(q) ||
        item.district.toLowerCase().includes(q) ||
        item.caseDescription.toLowerCase().includes(q);

      return matchesStatus && matchesDomain && matchesSearch;
    });
  }, [appointments, filterStatus, filterDomain, searchQuery]);

  // Status statistics
  const stats = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter(a => a.status === 'Received' || a.status === 'In Review').length;
    const scheduled = appointments.filter(a => a.status === 'Scheduled').length;
    const completed = appointments.filter(a => a.status === 'Completed').length;
    const dslsa = appointments.filter(a => a.status === 'Referred to DSLSA').length;
    return { total, pending, scheduled, completed, dslsa };
  }, [appointments]);

  const openEditModal = (appt: ClinicAppointment) => {
    setSelectedAppt(appt);
    setStatus(appt.status);
    setScheduledDate(appt.scheduledDate || '');
    setAssignedVolunteers(appt.assignedVolunteers || '');
    setInternalNotes(appt.internalNotes || '');
    setIsEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedAppt) return;
    setIsSaving(true);
    try {
      const res = await authFetch(`/api/admin/clinic-appointments/${selectedAppt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          scheduledDate: scheduledDate || undefined,
          assignedVolunteers: assignedVolunteers || undefined,
          internalNotes: internalNotes || undefined
        })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to update consultation');
      }

      showToast('Consultation record updated successfully.', 'success');
      setIsEditModalOpen(false);
      await onRefresh();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error updating consultation', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, token: string) => {
    if (!window.confirm(`Are you sure you want to delete consultation record ${token}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await authFetch(`/api/admin/clinic-appointments/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to delete consultation record');
      }

      showToast(`Consultation record ${token} deleted.`, 'success');
      await onRefresh();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error deleting record', 'error');
    }
  };

  const getStatusBadge = (st: ClinicAppointmentStatus) => {
    switch (st) {
      case 'Scheduled':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Scheduled</span>;
      case 'In Review':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">In Review</span>;
      case 'Documents Required':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">Docs Needed</span>;
      case 'Completed':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">Completed</span>;
      case 'Referred to DSLSA':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">DSLSA Panel</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-800">Received</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-xl font-bold font-serif text-[#0c1829] flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#c59b43]" />
            <span>Legal Aid Clinic Intake Registry</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage citizen consultation intake requests, clinical scrutiny, bench assignments, and DSLSA referrals.
          </p>
        </div>

        <button
          onClick={() => onRefresh()}
          className="px-3.5 py-2 text-xs font-semibold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          Refresh Registry
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] text-gray-500 font-semibold block uppercase">Total Intakes</span>
          <span className="text-2xl font-bold font-mono text-[#0c1829]">{stats.total}</span>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-2xs">
          <span className="text-[11px] text-amber-800 font-semibold block uppercase">Pending Review</span>
          <span className="text-2xl font-bold font-mono text-amber-900">{stats.pending}</span>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-2xs">
          <span className="text-[11px] text-emerald-800 font-semibold block uppercase">Scheduled</span>
          <span className="text-2xl font-bold font-mono text-emerald-900">{stats.scheduled}</span>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-2xs">
          <span className="text-[11px] text-blue-800 font-semibold block uppercase">Completed</span>
          <span className="text-2xl font-bold font-mono text-blue-900">{stats.completed}</span>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] text-purple-800 font-semibold block uppercase">DSLSA Referrals</span>
          <span className="text-2xl font-bold font-mono text-purple-900">{stats.dslsa}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by token, litigant name, phone, or grievance keyword..."
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
              <option value="All">All Statuses</option>
              <option value="Received">Received</option>
              <option value="In Review">In Review</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Documents Required">Documents Required</option>
              <option value="Completed">Completed</option>
              <option value="Referred to DSLSA">Referred to DSLSA</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Token & Date</th>
                <th className="py-3 px-4">Litigant & Contact</th>
                <th className="py-3 px-4">Legal Grievance</th>
                <th className="py-3 px-4">Mode & Schedule</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No consultation requests match the current filters.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map(appt => (
                  <tr key={appt.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-[#0c1829] block text-xs">{appt.trackingToken}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(appt.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900">{appt.fullName}</div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono">{appt.phone}</span>
                        <span>•</span>
                        <span>{appt.district}</span>
                      </div>
                      {appt.isRepresentative && (
                        <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                          Rep: {appt.representativeName} ({appt.relationshipToLitigant})
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="font-semibold text-[#7b1d28] block truncate">{appt.legalDomain}</span>
                      <span className="text-[11px] text-gray-500 block line-clamp-1 mt-0.5">{appt.caseDescription}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-gray-800 font-medium block">{appt.consultationMode}</span>
                      <span className="text-[10px] text-gray-500">{appt.preferredDate} ({appt.preferredTimeSlot})</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(appt.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(appt)}
                          className="p-1.5 text-gray-600 hover:text-[#0c1829] hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                          title="View & Edit Case"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(appt.id, appt.trackingToken)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Delete Record"
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

      {/* EDIT / DETAILS MODAL */}
      {isEditModalOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs font-mono font-bold text-[#c59b43] uppercase tracking-wider block">
                  Token: {selectedAppt.trackingToken}
                </span>
                <h3 className="font-serif font-bold text-lg text-[#0c1829]">
                  Consultation Case Scrutiny & Assignment
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
              {/* Applicant Particulars Card */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <span className="font-bold text-[#0c1829] text-sm block border-b border-gray-200 pb-1">
                  Intake Data Summary
                </span>
                <div className="grid grid-cols-2 gap-3 text-gray-700">
                  <div>
                    <span className="text-gray-400 block">Litigant Name:</span>
                    <span className="font-bold text-gray-900">{selectedAppt.fullName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Contact Phone:</span>
                    <span className="font-mono font-bold text-gray-900">{selectedAppt.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Email Address:</span>
                    <span className="text-gray-900">{selectedAppt.email || 'None Provided'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">District:</span>
                    <span className="text-gray-900">{selectedAppt.district}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 block">Residential Address:</span>
                    <span className="text-gray-900">{selectedAppt.address}</span>
                  </div>
                  {selectedAppt.isRepresentative && (
                    <div className="col-span-2 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900">
                      <span className="font-bold block">Representative Information:</span>
                      <span>Filed by {selectedAppt.representativeName} ({selectedAppt.relationshipToLitigant})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Grievance Narrative */}
              <div className="space-y-2">
                <span className="font-bold text-gray-800 block text-xs uppercase tracking-wider">
                  Dispute Narrative & Facts:
                </span>
                <p className="bg-[#fcfbf9] p-3 rounded-lg border border-gray-200 text-gray-800 leading-relaxed font-sans">
                  {selectedAppt.caseDescription}
                </p>
                {selectedAppt.hasExistingCourtCase && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
                    <strong>Existing Court/Police Matter:</strong> {selectedAppt.courtCaseDetails}
                  </div>
                )}
              </div>

              {/* Statutory Aid Eligibility */}
              <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 space-y-1 text-indigo-950">
                <span className="font-bold block">Statutory Section 12 Criterion:</span>
                <span>{selectedAppt.section12Category}</span>
                {selectedAppt.documentsSummary && (
                  <span className="block text-gray-600 mt-1">Available Documents: {selectedAppt.documentsSummary}</span>
                )}
              </div>

              {/* Administrative Updates Section */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <span className="font-serif font-bold text-sm text-[#7b1d28] uppercase tracking-wider block">
                  Clinical Action & Case Management
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Case Status
                    </label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as ClinicAppointmentStatus)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#c59b43] focus:outline-none cursor-pointer"
                    >
                      <option value="Received">Received (Pending Review)</option>
                      <option value="In Review">In Review (Under PLV Scrutiny)</option>
                      <option value="Scheduled">Scheduled (Consultation Assigned)</option>
                      <option value="Documents Required">Documents Required</option>
                      <option value="Completed">Completed</option>
                      <option value="Referred to DSLSA">Referred to DSLSA Panel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Confirmed Appointment Schedule
                    </label>
                    <input
                      type="text"
                      value={scheduledDate}
                      onChange={e => setScheduledDate(e.target.value)}
                      placeholder="e.g. 24 March 2026 at 11:30 AM (Room 102)"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#c59b43] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Assigned PLV Team / Supervising Advocate
                  </label>
                  <input
                    type="text"
                    value={assignedVolunteers}
                    onChange={e => setAssignedVolunteers(e.target.value)}
                    placeholder="e.g. Student PLV Bench A (Aarav & Meera), under Convener Dr. Sharma"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#c59b43] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Internal Clinical Scrutiny Notes & Advice Given
                  </label>
                  <textarea
                    rows={3}
                    value={internalNotes}
                    onChange={e => setInternalNotes(e.target.value)}
                    placeholder="Record preliminary legal advice, documents requested from litigant, or referral steps..."
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
                {isSaving ? 'Saving...' : 'Save Case Updates'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
