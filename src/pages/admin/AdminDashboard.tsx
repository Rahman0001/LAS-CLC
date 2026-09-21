import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { useToast } from '../../components/Toast';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bell,
  FileText,
  Users,
  Calendar,
  Image as ImageIcon,
  Settings,
  Mail,
  ShieldCheck,
  Key,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Pin,
  RefreshCw,
  Search,
  Upload,
  Clock,
  MapPin,
  Phone,
  BookOpen,
  Scale
} from 'lucide-react';
import type {
  NotificationItem,
  ReportItem,
  TeamMember,
  ActivityItem,
  GalleryItem,
  ContactSubmission,
  AuditLogEntry,
  BlogPost,
  ClinicAppointment,
  AawazSubmission
} from '../../types';
import { AdminBlogsTab } from './AdminBlogsTab';
import { AdminClinicTab } from './AdminClinicTab';
import { AdminSubmissionsTab } from './AdminSubmissionsTab';

export const AdminDashboard: React.FC = () => {
  const { authFetch, logout } = useAuth();
  const { data: portalData, refreshContent } = usePortal();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'notifications' | 'reports' | 'blogs' | 'team' | 'activities' | 'gallery' | 'settings' | 'inquiries' | 'audit' | 'security' | 'clinic' | 'submissions'
  >('overview');

  // Local state for inquiries, audit logs, AAWAZ blogs, clinic intakes & submissions
  const [inquiries, setInquiries] = useState<ContactSubmission[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [adminBlogs, setAdminBlogs] = useState<BlogPost[]>([]);
  const [clinicAppointments, setClinicAppointments] = useState<ClinicAppointment[]>([]);
  const [aawazSubmissions, setAawazSubmissions] = useState<AawazSubmission[]>([]);
  const [isLoadingProtected, setIsLoadingProtected] = useState(false);

  // Form states for modals/editing
  const [editingNotification, setEditingNotification] = useState<Partial<NotificationItem> | null>(null);
  const [editingReport, setEditingReport] = useState<Partial<ReportItem> | null>(null);
  const [editingTeamMember, setEditingTeamMember] = useState<Partial<TeamMember> | null>(null);
  const [editingActivity, setEditingActivity] = useState<Partial<ActivityItem> | null>(null);
  const [editingGallery, setEditingGallery] = useState<Partial<GalleryItem> | null>(null);
  const [settingsForm, setSettingsForm] = useState(portalData?.settings || null);

  // Security password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Fetch protected inquiries and audit logs
  const fetchProtectedData = async () => {
    setIsLoadingProtected(true);
    try {
      // First attempt: /api/admin/data which packages all administrative data
      const allRes = await authFetch('/api/admin/data');
      if (allRes.ok) {
        const ct = allRes.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const allData = await allRes.json();
          if (Array.isArray(allData.contactSubmissions)) {
            setInquiries(allData.contactSubmissions);
          }
          if (Array.isArray(allData.auditLogs)) {
            setAuditLogs(allData.auditLogs);
          }
          if (Array.isArray(allData.blogs)) {
            setAdminBlogs(allData.blogs);
          }
          if (Array.isArray(allData.clinicAppointments)) {
            setClinicAppointments(allData.clinicAppointments);
          }
          if (Array.isArray(allData.aawazSubmissions)) {
            setAawazSubmissions(allData.aawazSubmissions);
          }
          return;
        }
      }

      // Fallback to separate endpoints
      const [inqRes, auditRes, blogsRes, clinicRes, subRes] = await Promise.all([
        authFetch('/api/admin/inquiries'),
        authFetch('/api/admin/audit'),
        authFetch('/api/admin/blogs'),
        authFetch('/api/admin/clinic-appointments'),
        authFetch('/api/admin/aawaz-submissions')
      ]);

      if (inqRes.ok && inqRes.headers.get('content-type')?.includes('application/json')) {
        const inqData = await inqRes.json();
        setInquiries(inqData.inquiries || []);
      }
      if (auditRes.ok && auditRes.headers.get('content-type')?.includes('application/json')) {
        const auditData = await auditRes.json();
        setAuditLogs(auditData.logs || []);
      }
      if (blogsRes.ok && blogsRes.headers.get('content-type')?.includes('application/json')) {
        const blogData = await blogsRes.json();
        setAdminBlogs(blogData.blogs || []);
      }
      if (clinicRes.ok && clinicRes.headers.get('content-type')?.includes('application/json')) {
        const cData = await clinicRes.json();
        setClinicAppointments(cData.appointments || []);
      }
      if (subRes.ok && subRes.headers.get('content-type')?.includes('application/json')) {
        const sData = await subRes.json();
        setAawazSubmissions(sData.submissions || []);
      }
    } catch (err) {
      console.error('Failed to load protected admin data:', err);
    } finally {
      setIsLoadingProtected(false);
    }
  };

  useEffect(() => {
    fetchProtectedData();
  }, []);

  useEffect(() => {
    if (portalData?.settings) {
      setSettingsForm(portalData.settings);
    }
  }, [portalData]);

  // ==================== NOTIFICATION HANDLERS ====================
  const handleSaveNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotification) return;

    try {
      const isNew = !editingNotification.id;
      const url = isNew ? '/api/admin/notifications' : `/api/admin/notifications/${editingNotification.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(editingNotification)
      });

      if (!res.ok) throw new Error('Failed to save notification');
      addToast('success', isNew ? 'Notification circular published.' : 'Notification updated.');
      setEditingNotification(null);
      await refreshContent();
      fetchProtectedData();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!window.confirm('Delete this official notification?')) return;
    try {
      const res = await authFetch(`/api/admin/notifications/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete notification');
      addToast('success', 'Notification removed.');
      await refreshContent();
      fetchProtectedData();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  // ==================== REPORT HANDLERS ====================
  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;

    try {
      const isNew = !editingReport.id;
      const url = isNew ? '/api/admin/reports' : `/api/admin/reports/${editingReport.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(editingReport)
      });

      if (!res.ok) throw new Error('Failed to save report');
      addToast('success', isNew ? 'Work report archived.' : 'Report updated.');
      setEditingReport(null);
      await refreshContent();
      fetchProtectedData();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!window.confirm('Delete this report record?')) return;
    try {
      const res = await authFetch(`/api/admin/reports/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete report');
      addToast('success', 'Report removed.');
      await refreshContent();
      fetchProtectedData();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  // ==================== TEAM HANDLERS ====================
  const handleSaveTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeamMember) return;

    try {
      const isNew = !editingTeamMember.id;
      const url = isNew ? '/api/admin/team' : `/api/admin/team/${editingTeamMember.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(editingTeamMember)
      });

      if (!res.ok) throw new Error('Failed to save team member');
      addToast('success', isNew ? 'Team member added.' : 'Profile updated.');
      setEditingTeamMember(null);
      await refreshContent();
      fetchProtectedData();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleDeleteTeamMember = async (id: string) => {
    if (!window.confirm('Delete this team member profile?')) return;
    try {
      const res = await authFetch(`/api/admin/team/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete profile');
      addToast('success', 'Profile removed.');
      await refreshContent();
      fetchProtectedData();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  // ==================== ACTIVITIES HANDLERS ====================
  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;

    try {
      const isNew = !editingActivity.id;
      const url = isNew ? '/api/admin/activities' : `/api/admin/activities/${editingActivity.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(editingActivity)
      });

      if (!res.ok) throw new Error('Failed to save activity');
      addToast('success', isNew ? 'Activity record added.' : 'Activity updated.');
      setEditingActivity(null);
      await refreshContent();
      fetchProtectedData();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!window.confirm('Delete this activity record?')) return;
    try {
      const res = await authFetch(`/api/admin/activities/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete activity');
      addToast('success', 'Activity removed.');
      await refreshContent();
      fetchProtectedData();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  // ==================== GALLERY HANDLERS ====================
  const handleSaveGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGallery) return;

    try {
      const isNew = !editingGallery.id;
      const url = isNew ? '/api/admin/gallery' : `/api/admin/gallery/${editingGallery.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(editingGallery)
      });

      if (!res.ok) throw new Error('Failed to save gallery item');
      addToast('success', isNew ? 'Photo added to album.' : 'Photo details updated.');
      setEditingGallery(null);
      await refreshContent();
      fetchProtectedData();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!window.confirm('Delete this gallery photo?')) return;
    try {
      const res = await authFetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete photo');
      addToast('success', 'Photo removed.');
      await refreshContent();
      fetchProtectedData();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  // ==================== SETTINGS HANDLERS ====================
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;

    try {
      const res = await authFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settingsForm)
      });

      if (!res.ok) throw new Error('Failed to update institutional settings');
      addToast('success', 'Institutional settings updated.');
      await refreshContent();
      fetchProtectedData();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  // ==================== INQUIRIES HANDLERS ====================
  const handleToggleInquiryStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Reviewed' ? 'New' : 'Reviewed';
    try {
      const res = await authFetch(`/api/admin/inquiries/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update inquiry status');
      addToast('success', `Marked as ${newStatus}.`);
      fetchProtectedData();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!window.confirm('Delete this inquiry record?')) return;
    try {
      const res = await authFetch(`/api/admin/inquiries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete inquiry');
      addToast('success', 'Inquiry deleted.');
      fetchProtectedData();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  // ==================== PASSWORD CHANGE ====================
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      addToast('error', 'New password must be at least 8 characters long.');
      return;
    }

    try {
      const res = await authFetch('/api/admin/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      addToast('success', 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f1eb] flex flex-col">
      {/* Top Admin Navbar */}
      <header className="bg-[#0c1829] text-white border-b-2 border-[#c59b43]/40 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#c59b43]" />
            <div>
              <h1 className="font-serif font-bold text-sm sm:text-base leading-tight">
                Legal Aid Society • Administrative Secretariat
              </h1>
              <span className="text-[11px] text-[#e6c887] font-sans">
                Campus Law Centre, Faculty of Law, University of Delhi
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              <span>View Public Portal</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={() => {
                logout();
                navigate('/admin');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-rose-300 hover:text-white px-3 py-1.5 rounded bg-rose-950/40 hover:bg-rose-900 transition-colors border border-rose-800/40"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <nav className="w-full md:w-64 shrink-0 bg-white rounded-xl border border-[#e2ded5] p-3 shadow-xs space-y-1 h-fit">
          <div className="p-2 border-b border-[#e2ded5] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Management Modules
            </span>
          </div>

          {[
            { id: 'overview', name: 'Overview & Metrics', icon: LayoutDashboard },
            { id: 'clinic', name: 'Clinic Appointments', icon: Scale, badge: clinicAppointments.length },
            { id: 'submissions', name: 'AAWAZ Submissions', icon: BookOpen, badge: aawazSubmissions.length },
            { id: 'notifications', name: 'Notifications & Gazette', icon: Bell, badge: portalData?.notifications.length },
            { id: 'reports', name: 'Work Reports Archive', icon: FileText, badge: portalData?.reports.length },
            { id: 'blogs', name: 'AAWAZ Blogs', icon: BookOpen, badge: (adminBlogs.length > 0 ? adminBlogs.length : portalData?.blogs?.length) || 0 },
            { id: 'team', name: 'Team & Leadership', icon: Users, badge: portalData?.team.length },
            { id: 'activities', name: 'Activities & Camps', icon: Calendar, badge: portalData?.activities.length },
            { id: 'gallery', name: 'Photo Gallery', icon: ImageIcon, badge: portalData?.gallery.length },
            { id: 'settings', name: 'Institutional Settings', icon: Settings },
            { id: 'inquiries', name: 'Public Inquiries', icon: Mail, badge: inquiries.length },
            { id: 'audit', name: 'Security Audit Trail', icon: ShieldCheck },
            { id: 'security', name: 'Admin Passphrase', icon: Key }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                  active
                    ? 'bg-[#0c1829] text-white font-bold shadow-xs'
                    : 'text-gray-700 hover:bg-[#f4f1eb]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-[#c59b43]' : 'text-gray-500'}`} />
                  <span>{tab.name}</span>
                </span>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Content Pane */}
        <main className="flex-1 bg-white rounded-xl border border-[#e2ded5] p-6 sm:p-8 shadow-xs overflow-x-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="border-b border-[#e2ded5] pb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0c1829]">
                    Institutional Administration Overview
                  </h2>
                  <p className="text-xs text-gray-500">
                    Active data records for Legal Aid Society, Campus Law Centre.
                  </p>
                </div>
                <button
                  onClick={() => {
                    refreshContent();
                    fetchProtectedData();
                    addToast('info', 'Content refreshed from server.');
                  }}
                  className="px-3 py-1.5 bg-[#f4f1eb] hover:bg-gray-200 text-gray-700 text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('clinic')}
                  className="p-4 bg-[#fcfbf9] hover:bg-[#f4f1eb] border border-[#e2ded5] rounded-xl space-y-1 text-left transition-colors cursor-pointer group"
                >
                  <span className="text-xs text-[#7b1d28] font-semibold group-hover:underline flex items-center justify-between">
                    <span>Clinic Intakes</span>
                    <Scale className="w-3.5 h-3.5 text-[#c59b43]" />
                  </span>
                  <div className="text-2xl font-serif font-bold text-[#0c1829]">
                    {clinicAppointments.length}
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('submissions')}
                  className="p-4 bg-[#fcfbf9] hover:bg-[#f4f1eb] border border-[#e2ded5] rounded-xl space-y-1 text-left transition-colors cursor-pointer group"
                >
                  <span className="text-xs text-[#162740] font-semibold group-hover:underline flex items-center justify-between">
                    <span>Manuscript Submissions</span>
                    <BookOpen className="w-3.5 h-3.5 text-[#c59b43]" />
                  </span>
                  <div className="text-2xl font-serif font-bold text-[#0c1829]">
                    {aawazSubmissions.length}
                  </div>
                </button>

                <div className="p-4 bg-[#fcfbf9] border border-[#e2ded5] rounded-xl space-y-1">
                  <span className="text-xs text-gray-500 font-medium">Notifications</span>
                  <div className="text-2xl font-serif font-bold text-[#0c1829]">
                    {portalData?.notifications.length || 0}
                  </div>
                </div>

                <div className="p-4 bg-[#fcfbf9] border border-[#e2ded5] rounded-xl space-y-1">
                  <span className="text-xs text-gray-500 font-medium">Work Reports</span>
                  <div className="text-2xl font-serif font-bold text-[#0c1829]">
                    {portalData?.reports.length || 0}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('blogs')}
                  className="p-4 bg-[#fcfbf9] hover:bg-[#f4f1eb] border border-[#e2ded5] rounded-xl space-y-1 text-left transition-colors cursor-pointer group"
                >
                  <span className="text-xs text-[#9b7529] font-medium group-hover:underline flex items-center justify-between">
                    <span>AAWAZ Blogs</span>
                    <BookOpen className="w-3.5 h-3.5" />
                  </span>
                  <div className="text-2xl font-serif font-bold text-[#0c1829]">
                    {(adminBlogs.length > 0 ? adminBlogs.length : portalData?.blogs?.length) || 0}
                  </div>
                </button>

                <div className="p-4 bg-[#fcfbf9] border border-[#e2ded5] rounded-xl space-y-1">
                  <span className="text-xs text-gray-500 font-medium">Team Profiles</span>
                  <div className="text-2xl font-serif font-bold text-[#0c1829]">
                    {portalData?.team.length || 0}
                  </div>
                </div>

                <div className="p-4 bg-[#fcfbf9] border border-[#e2ded5] rounded-xl space-y-1">
                  <span className="text-xs text-gray-500 font-medium">Public Inquiries</span>
                  <div className="text-2xl font-serif font-bold text-[#9b7529]">
                    {inquiries.length}
                  </div>
                </div>
              </div>

              {/* Architecture & Institutional Readiness Note */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs text-gray-800">
                <div className="font-bold text-[#0c1829] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#9b7529]" />
                  <span>Institutional Content Management Policy</span>
                </div>
                <p className="leading-relaxed">
                  This administrative panel allows authorised office bearers to insert authentic institutional circulars, previous work reports, team details, photographs, and contact info without altering application source code. All changes are version-logged in the security audit trail.
                </p>
              </div>

              {/* Recent Inquiries Quick Glance */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-[#0c1829]">
                    Recent Contact Inquiries
                  </h3>
                  <button
                    onClick={() => setActiveTab('inquiries')}
                    className="text-xs text-[#9b7529] hover:underline font-medium"
                  >
                    View All ({inquiries.length})
                  </button>
                </div>

                {inquiries.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500 bg-[#fcfbf9] rounded-lg border border-[#e2ded5]">
                    No inquiries received yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {inquiries.slice(0, 3).map(inq => (
                      <div
                        key={inq.id}
                        className="p-3 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-gray-900 mr-2">{inq.name}</span>
                          <span className="text-gray-500">({inq.email})</span>
                          <p className="text-gray-700 mt-0.5 line-clamp-1"><strong>{inq.subject}:</strong> {inq.message}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inq.status === 'New' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {inq.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: NOTIFICATIONS MANAGER */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#e2ded5] pb-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#0c1829]">
                    Notifications & Circulars Manager
                  </h2>
                  <p className="text-xs text-gray-500">
                    Publish official notices, event schedules, and recruitment circulars.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setEditingNotification({
                      title: '',
                      category: 'General',
                      date: new Date().toISOString().split('T')[0],
                      shortDescription: '',
                      content: '',
                      isPinned: false,
                      attachmentTitle: '[Official Circular Document (PDF)]',
                      attachmentUrl: '#'
                    })
                  }
                  className="px-3 py-2 bg-[#0c1829] hover:bg-[#162740] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4 text-[#c59b43]" />
                  <span>New Circular</span>
                </button>
              </div>

              {/* Notifications Table */}
              <div className="divide-y divide-gray-200">
                {portalData?.notifications.map(item => (
                  <div key={item.id} className="py-4 flex items-start justify-between gap-4">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                          {item.category}
                        </span>
                        {item.isPinned && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Pin className="w-3 h-3" /> Pinned
                          </span>
                        )}
                        <span className="text-xs text-gray-500">{item.date}</span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-[#0c1829]">{item.title}</h4>
                      <p className="text-xs text-gray-600 line-clamp-1">{item.shortDescription || item.content}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingNotification(item)}
                        className="p-1.5 text-gray-600 hover:text-[#0c1829] hover:bg-gray-100 rounded"
                        title="Edit notification"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNotification(item.id)}
                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit / Create Notification Modal */}
              {editingNotification && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-xl shadow-2xl border border-[#e2ded5] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="bg-[#0c1829] text-white p-4 flex items-center justify-between">
                      <h3 className="font-serif font-bold text-base">
                        {editingNotification.id ? 'Edit Notification Circular' : 'Publish New Circular'}
                      </h3>
                      <button
                        onClick={() => setEditingNotification(null)}
                        className="text-gray-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSaveNotification} className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Title</label>
                        <input
                          type="text"
                          required
                          value={editingNotification.title || ''}
                          onChange={e => setEditingNotification({ ...editingNotification, title: e.target.value })}
                          className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">Category</label>
                          <select
                            value={editingNotification.category || 'General'}
                            onChange={e => setEditingNotification({ ...editingNotification, category: e.target.value as any })}
                            className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                          >
                            {['General', 'Events', 'Workshops', 'Recruitment', 'Legal Awareness', 'Reports', 'Announcements'].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">Date</label>
                          <input
                            type="date"
                            required
                            value={editingNotification.date || ''}
                            onChange={e => setEditingNotification({ ...editingNotification, date: e.target.value })}
                            className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="isPinned"
                          checked={editingNotification.isPinned || false}
                          onChange={e => setEditingNotification({ ...editingNotification, isPinned: e.target.checked })}
                          className="rounded border-gray-300 text-[#0c1829] focus:ring-[#c59b43]"
                        />
                        <label htmlFor="isPinned" className="font-semibold text-gray-700">
                          Pin to top of notifications list
                        </label>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Short Description / Abstract</label>
                        <input
                          type="text"
                          value={editingNotification.shortDescription || ''}
                          onChange={e => setEditingNotification({ ...editingNotification, shortDescription: e.target.value })}
                          className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Full Circular Content</label>
                        <textarea
                          rows={6}
                          required
                          value={editingNotification.content || ''}
                          onChange={e => setEditingNotification({ ...editingNotification, content: e.target.value })}
                          className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">Attachment Title (Optional)</label>
                          <input
                            type="text"
                            value={editingNotification.attachmentTitle || ''}
                            onChange={e => setEditingNotification({ ...editingNotification, attachmentTitle: e.target.value })}
                            className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                            placeholder="e.g. Schedule Circular (PDF)"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">Attachment URL or Document Path</label>
                          <input
                            type="text"
                            value={editingNotification.attachmentUrl || ''}
                            onChange={e => setEditingNotification({ ...editingNotification, attachmentUrl: e.target.value })}
                            className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                            placeholder="#"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#e2ded5] flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingNotification(null)}
                          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-[#0c1829] hover:bg-[#162740] text-white font-bold rounded"
                        >
                          Save Circular
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REPORTS MANAGER */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#e2ded5] pb-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#0c1829]">
                    Work Reports & Compendiums Manager
                  </h2>
                  <p className="text-xs text-gray-500">
                    Upload and manage previous annual work reports, clinical statistics, and research documents.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setEditingReport({
                      title: '',
                      academicYear: '2025–2026',
                      calendarYear: '2026',
                      category: 'Annual Society Report',
                      description: '',
                      highlights: ['[Highlight 1 Placeholder]', '[Highlight 2 Placeholder]'],
                      pdfUrl: '[Previous Work Report PDF]'
                    })
                  }
                  className="px-3 py-2 bg-[#0c1829] hover:bg-[#162740] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4 text-[#c59b43]" />
                  <span>New Report</span>
                </button>
              </div>

              <div className="divide-y divide-gray-200">
                {portalData?.reports.map(report => (
                  <div key={report.id} className="py-4 flex items-start justify-between gap-4">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#9b7529] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {report.academicYear}
                        </span>
                        <span className="text-xs text-gray-500">{report.category}</span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-[#0c1829]">{report.title}</h4>
                      <p className="text-xs text-gray-600 line-clamp-1">{report.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingReport(report)}
                        className="p-1.5 text-gray-600 hover:text-[#0c1829] hover:bg-gray-100 rounded"
                        title="Edit report"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded"
                        title="Delete report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit Report Modal */}
              {editingReport && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-xl shadow-2xl border border-[#e2ded5] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="bg-[#0c1829] text-white p-4 flex items-center justify-between">
                      <h3 className="font-serif font-bold text-base">
                        {editingReport.id ? 'Edit Work Report' : 'Create New Report Record'}
                      </h3>
                      <button onClick={() => setEditingReport(null)} className="text-gray-400 hover:text-white">✕</button>
                    </div>

                    <form onSubmit={handleSaveReport} className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Report Title</label>
                        <input
                          type="text"
                          required
                          value={editingReport.title || ''}
                          onChange={e => setEditingReport({ ...editingReport, title: e.target.value })}
                          className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">Academic Year</label>
                          <input
                            type="text"
                            required
                            value={editingReport.academicYear || ''}
                            onChange={e => setEditingReport({ ...editingReport, academicYear: e.target.value })}
                            className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                            placeholder="2025–2026"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">Calendar Year</label>
                          <input
                            type="text"
                            required
                            value={editingReport.calendarYear || ''}
                            onChange={e => setEditingReport({ ...editingReport, calendarYear: e.target.value })}
                            className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                            placeholder="2026"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">Category</label>
                          <input
                            type="text"
                            required
                            value={editingReport.category || ''}
                            onChange={e => setEditingReport({ ...editingReport, category: e.target.value })}
                            className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Executive Summary / Description</label>
                        <textarea
                          rows={4}
                          required
                          value={editingReport.description || ''}
                          onChange={e => setEditingReport({ ...editingReport, description: e.target.value })}
                          className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none font-sans"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Highlights (Comma or newline separated)</label>
                        <textarea
                          rows={3}
                          value={(editingReport.highlights || []).join('\n')}
                          onChange={e => setEditingReport({
                            ...editingReport,
                            highlights: e.target.value.split('\n').filter(Boolean)
                          })}
                          className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none font-sans"
                          placeholder="Highlight 1&#10;Highlight 2"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">PDF Download Placeholder / Link</label>
                        <input
                          type="text"
                          value={editingReport.pdfUrl || ''}
                          onChange={e => setEditingReport({ ...editingReport, pdfUrl: e.target.value })}
                          className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                          placeholder="[Previous Work Report PDF]"
                        />
                      </div>

                      <div className="pt-4 border-t border-[#e2ded5] flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingReport(null)}
                          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-[#0c1829] hover:bg-[#162740] text-white font-bold rounded"
                        >
                          Save Report
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: AAWAZ BLOGS MANAGER */}
          {activeTab === 'blogs' && (
            <AdminBlogsTab
              blogs={adminBlogs.length > 0 ? adminBlogs : (portalData?.blogs || [])}
              onRefresh={async () => {
                await refreshContent();
                await fetchProtectedData();
              }}
            />
          )}

          {/* TAB: CLINIC APPOINTMENTS INTAKE */}
          {activeTab === 'clinic' && (
            <AdminClinicTab
              appointments={clinicAppointments}
              onRefresh={async () => {
                await fetchProtectedData();
              }}
            />
          )}

          {/* TAB: AAWAZ MANUSCRIPT SUBMISSIONS */}
          {activeTab === 'submissions' && (
            <AdminSubmissionsTab
              submissions={aawazSubmissions}
              onRefresh={async () => {
                await fetchProtectedData();
              }}
            />
          )}

          {/* TAB 4: TEAM MANAGER */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#e2ded5] pb-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#0c1829]">
                    Team & Leadership Profiles
                  </h2>
                  <p className="text-xs text-gray-500">
                    Manage faculty coordinator, office bearers, executive members, and student volunteer directories.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setEditingTeamMember({
                      name: '[Student Name]',
                      category: 'Office Bearers',
                      designation: '[Designation]',
                      session: '[2025–2026]',
                      bio: '[Official Biography Placeholder]',
                      areasOfResponsibility: ['[Responsibility Placeholder]']
                    })
                  }
                  className="px-3 py-2 bg-[#0c1829] hover:bg-[#162740] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4 text-[#c59b43]" />
                  <span>Add Member</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portalData?.team.map(member => (
                  <div key={member.id} className="p-4 border border-[#e2ded5] rounded-xl flex items-start justify-between gap-3 bg-[#fcfbf9]">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#7b1d28] bg-rose-50 px-2 py-0.5 rounded">
                        {member.category}
                      </span>
                      <h4 className="font-serif font-bold text-sm text-[#0c1829]">{member.name}</h4>
                      <p className="text-xs text-gray-600 font-medium">{member.designation} • {member.session}</p>
                      <p className="text-xs text-gray-500 italic line-clamp-1">{member.bio}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setEditingTeamMember(member)}
                        className="p-1.5 text-gray-600 hover:text-[#0c1829] hover:bg-gray-200 rounded"
                        title="Edit profile"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeamMember(member.id)}
                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded"
                        title="Delete profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit Team Member Modal */}
              {editingTeamMember && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-xl shadow-2xl border border-[#e2ded5] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="bg-[#0c1829] text-white p-4 flex items-center justify-between">
                      <h3 className="font-serif font-bold text-base">
                        {editingTeamMember.id ? 'Edit Team Member Profile' : 'Add Team Member'}
                      </h3>
                      <button onClick={() => setEditingTeamMember(null)} className="text-gray-400 hover:text-white">✕</button>
                    </div>

                    <form onSubmit={handleSaveTeamMember} className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={editingTeamMember.name || ''}
                          onChange={e => setEditingTeamMember({ ...editingTeamMember, name: e.target.value })}
                          className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">Category</label>
                          <select
                            value={editingTeamMember.category || 'Office Bearers'}
                            onChange={e => setEditingTeamMember({ ...editingTeamMember, category: e.target.value as any })}
                            className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                          >
                            {['Faculty Coordinator', 'Faculty Members', 'Office Bearers', 'Executive Members', 'Student Volunteers', 'Advisory Members'].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">Designation</label>
                          <input
                            type="text"
                            required
                            value={editingTeamMember.designation || ''}
                            onChange={e => setEditingTeamMember({ ...editingTeamMember, designation: e.target.value })}
                            className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Academic Session</label>
                        <input
                          type="text"
                          required
                          value={editingTeamMember.session || ''}
                          onChange={e => setEditingTeamMember({ ...editingTeamMember, session: e.target.value })}
                          className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                          placeholder="[2025–2026]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Official Biography Placeholder</label>
                        <textarea
                          rows={3}
                          value={editingTeamMember.bio || ''}
                          onChange={e => setEditingTeamMember({ ...editingTeamMember, bio: e.target.value })}
                          className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none font-sans"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Areas of Responsibility (Newline separated)</label>
                        <textarea
                          rows={3}
                          value={(editingTeamMember.areasOfResponsibility || []).join('\n')}
                          onChange={e => setEditingTeamMember({
                            ...editingTeamMember,
                            areasOfResponsibility: e.target.value.split('\n').filter(Boolean)
                          })}
                          className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none font-sans"
                        />
                      </div>

                      <div className="pt-4 border-t border-[#e2ded5] flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingTeamMember(null)}
                          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-[#0c1829] hover:bg-[#162740] text-white font-bold rounded"
                        >
                          Save Profile
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ACTIVITIES MANAGER */}
          {activeTab === 'activities' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#e2ded5] pb-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#0c1829]">
                    Activities & Field Initiatives
                  </h2>
                  <p className="text-xs text-gray-500">
                    Record camps, judicial colloquia, jail visits, and legal awareness campaigns.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setEditingActivity({
                      title: '',
                      category: 'Legal Awareness Camp',
                      date: new Date().toISOString().split('T')[0],
                      location: 'Campus Law Centre / NCT of Delhi',
                      description: '',
                      keyOutcomes: ['[Outcome 1 Placeholder]']
                    })
                  }
                  className="px-3 py-2 bg-[#0c1829] hover:bg-[#162740] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4 text-[#c59b43]" />
                  <span>Add Activity</span>
                </button>
              </div>

              <div className="divide-y divide-gray-200">
                {portalData?.activities.map(act => (
                  <div key={act.id} className="py-4 flex items-start justify-between gap-4">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7b1d28] bg-rose-50 px-2 py-0.5 rounded">
                          {act.category}
                        </span>
                        <span className="text-xs text-gray-500">{act.date} • {act.location}</span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-[#0c1829]">{act.title}</h4>
                      <p className="text-xs text-gray-600 line-clamp-1">{act.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingActivity(act)}
                        className="p-1.5 text-gray-600 hover:text-[#0c1829] hover:bg-gray-100 rounded"
                        title="Edit activity"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteActivity(act.id)}
                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded"
                        title="Delete activity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit Activity Modal */}
              {editingActivity && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-xl shadow-2xl border border-[#e2ded5] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="bg-[#0c1829] text-white p-4 flex items-center justify-between">
                      <h3 className="font-serif font-bold text-base">
                        {editingActivity.id ? 'Edit Activity Record' : 'Add Activity Record'}
                      </h3>
                      <button onClick={() => setEditingActivity(null)} className="text-gray-400 hover:text-white">✕</button>
                    </div>

                    <form onSubmit={handleSaveActivity} className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Title</label>
                        <input
                          type="text"
                          required
                          value={editingActivity.title || ''}
                          onChange={e => setEditingActivity({ ...editingActivity, title: e.target.value })}
                          className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">Category</label>
                          <input
                            type="text"
                            required
                            value={editingActivity.category || ''}
                            onChange={e => setEditingActivity({ ...editingActivity, category: e.target.value })}
                            className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">Date</label>
                          <input
                            type="date"
                            required
                            value={editingActivity.date || ''}
                            onChange={e => setEditingActivity({ ...editingActivity, date: e.target.value })}
                            className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Location</label>
                        <input
                          type="text"
                          required
                          value={editingActivity.location || ''}
                          onChange={e => setEditingActivity({ ...editingActivity, location: e.target.value })}
                          className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Description</label>
                        <textarea
                          rows={4}
                          required
                          value={editingActivity.description || ''}
                          onChange={e => setEditingActivity({ ...editingActivity, description: e.target.value })}
                          className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none font-sans"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Key Outcomes (Newline separated)</label>
                        <textarea
                          rows={3}
                          value={(editingActivity.keyOutcomes || []).join('\n')}
                          onChange={e => setEditingActivity({
                            ...editingActivity,
                            keyOutcomes: e.target.value.split('\n').filter(Boolean)
                          })}
                          className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none font-sans"
                        />
                      </div>

                      <div className="pt-4 border-t border-[#e2ded5] flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingActivity(null)}
                          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-[#0c1829] hover:bg-[#162740] text-white font-bold rounded"
                        >
                          Save Activity
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: GALLERY MANAGER */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#e2ded5] pb-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#0c1829]">
                    Photo Gallery & Event Archive
                  </h2>
                  <p className="text-xs text-gray-500">
                    Curate event albums, photos, and institutional archival imagery.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setEditingGallery({
                      title: '',
                      album: 'Outreach & Field Camps',
                      year: '2026',
                      caption: '[Official Event Caption Placeholder]',
                      imageUrl: ''
                    })
                  }
                  className="px-3 py-2 bg-[#0c1829] hover:bg-[#162740] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4 text-[#c59b43]" />
                  <span>Add Photo</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {portalData?.gallery.map(item => (
                  <div key={item.id} className="border border-[#e2ded5] rounded-xl p-4 bg-[#fcfbf9] space-y-2">
                    <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-gray-400 text-xs">
                          <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                          <span>[Photo Placeholder]</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span className="font-semibold text-[#9b7529]">{item.album}</span>
                      <span>{item.year}</span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-[#0c1829] line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-gray-600 line-clamp-2 italic">{item.caption}</p>

                    <div className="pt-2 border-t border-[#e2ded5] flex justify-end gap-2">
                      <button
                        onClick={() => setEditingGallery(item)}
                        className="p-1 text-gray-600 hover:text-[#0c1829]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGalleryItem(item.id)}
                        className="p-1 text-rose-600 hover:text-rose-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit Gallery Modal */}
              {editingGallery && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-xl shadow-2xl border border-[#e2ded5] w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="bg-[#0c1829] text-white p-4 flex items-center justify-between">
                      <h3 className="font-serif font-bold text-base">
                        {editingGallery.id ? 'Edit Photo Record' : 'Add Photo to Album'}
                      </h3>
                      <button onClick={() => setEditingGallery(null)} className="text-gray-400 hover:text-white">✕</button>
                    </div>

                    <form onSubmit={handleSaveGalleryItem} className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Title</label>
                        <input
                          type="text"
                          required
                          value={editingGallery.title || ''}
                          onChange={e => setEditingGallery({ ...editingGallery, title: e.target.value })}
                          className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">Album</label>
                          <input
                            type="text"
                            required
                            value={editingGallery.album || ''}
                            onChange={e => setEditingGallery({ ...editingGallery, album: e.target.value })}
                            className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                            placeholder="Outreach & Field Camps"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">Year</label>
                          <input
                            type="text"
                            required
                            value={editingGallery.year || ''}
                            onChange={e => setEditingGallery({ ...editingGallery, year: e.target.value })}
                            className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                            placeholder="2026"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Image URL (or leave blank for institutional placeholder)</label>
                        <input
                          type="text"
                          value={editingGallery.imageUrl || ''}
                          onChange={e => setEditingGallery({ ...editingGallery, imageUrl: e.target.value })}
                          className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                          placeholder="https://... or /uploads/..."
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Event Caption</label>
                        <textarea
                          rows={3}
                          value={editingGallery.caption || ''}
                          onChange={e => setEditingGallery({ ...editingGallery, caption: e.target.value })}
                          className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none font-sans"
                        />
                      </div>

                      <div className="pt-4 border-t border-[#e2ded5] flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingGallery(null)}
                          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-[#0c1829] hover:bg-[#162740] text-white font-bold rounded"
                        >
                          Save Photo
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: INSTITUTIONAL SETTINGS */}
          {activeTab === 'settings' && settingsForm && (
            <div className="space-y-6">
              <div className="border-b border-[#e2ded5] pb-4">
                <h2 className="font-serif text-xl font-bold text-[#0c1829]">
                  Institutional Identity & Secretariat Settings
                </h2>
                <p className="text-xs text-gray-500">
                  Configure official contact coordinates, office hours, mission statement, and statistics placeholders.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6 text-xs font-sans">
                {/* Contact Coordinates */}
                <div className="p-4 bg-[#fcfbf9] rounded-xl border border-[#e2ded5] space-y-4">
                  <h3 className="font-serif font-bold text-sm text-[#0c1829]">
                    Official Secretariat Coordinates
                  </h3>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Official Address</label>
                    <input
                      type="text"
                      value={settingsForm.address || ''}
                      onChange={e => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Official Email Address</label>
                      <input
                        type="email"
                        value={settingsForm.email || ''}
                        onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Official Telephone / Helpline</label>
                      <input
                        type="text"
                        value={settingsForm.phone || ''}
                        onChange={e => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Office Hours & Consultation Timings</label>
                    <input
                      type="text"
                      value={settingsForm.officeHours || ''}
                      onChange={e => setSettingsForm({ ...settingsForm, officeHours: e.target.value })}
                      className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Mission & Description */}
                <div className="p-4 bg-[#fcfbf9] rounded-xl border border-[#e2ded5] space-y-4">
                  <h3 className="font-serif font-bold text-sm text-[#0c1829]">
                    Institutional Mission & Descriptions
                  </h3>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Mission Statement Placeholder</label>
                    <textarea
                      rows={3}
                      value={settingsForm.missionPlaceholder || ''}
                      onChange={e => setSettingsForm({ ...settingsForm, missionPlaceholder: e.target.value })}
                      className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Official Legal Disclaimer</label>
                    <textarea
                      rows={3}
                      value={settingsForm.legalDisclaimer || ''}
                      onChange={e => setSettingsForm({ ...settingsForm, legalDisclaimer: e.target.value })}
                      className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Archival Impact Stats */}
                <div className="p-4 bg-[#fcfbf9] rounded-xl border border-[#e2ded5] space-y-4">
                  <h3 className="font-serif font-bold text-sm text-[#0c1829]">
                    Institutional Impact Statistics (Placeholders)
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Programmes</label>
                      <input
                        type="text"
                        value={settingsForm.stats?.programmes || ''}
                        onChange={e => setSettingsForm({
                          ...settingsForm,
                          stats: { ...settingsForm.stats, programmes: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 border border-[#e2ded5] rounded text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Outreach</label>
                      <input
                        type="text"
                        value={settingsForm.stats?.outreach || ''}
                        onChange={e => setSettingsForm({
                          ...settingsForm,
                          stats: { ...settingsForm.stats, outreach: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 border border-[#e2ded5] rounded text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Beneficiaries</label>
                      <input
                        type="text"
                        value={settingsForm.stats?.beneficiaries || ''}
                        onChange={e => setSettingsForm({
                          ...settingsForm,
                          stats: { ...settingsForm.stats, beneficiaries: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 border border-[#e2ded5] rounded text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Workshops</label>
                      <input
                        type="text"
                        value={settingsForm.stats?.workshops || ''}
                        onChange={e => setSettingsForm({
                          ...settingsForm,
                          stats: { ...settingsForm.stats, workshops: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 border border-[#e2ded5] rounded text-sm"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0c1829] hover:bg-[#162740] text-white font-bold rounded-lg shadow-md transition-colors"
                >
                  Save Institutional Settings
                </button>
              </form>
            </div>
          )}

          {/* TAB 8: PUBLIC INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#e2ded5] pb-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#0c1829]">
                    Citizen & Student Inquiries Repository
                  </h2>
                  <p className="text-xs text-gray-500">
                    Review and action messages submitted via the public contact portal.
                  </p>
                </div>
                <button
                  onClick={fetchProtectedData}
                  className="px-3 py-1.5 bg-[#f4f1eb] hover:bg-gray-200 text-gray-700 text-xs rounded flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reload</span>
                </button>
              </div>

              {inquiries.length === 0 ? (
                <div className="p-12 text-center text-xs text-gray-500 bg-[#fcfbf9] rounded-xl border border-[#e2ded5]">
                  No public inquiries received.
                </div>
              ) : (
                <div className="space-y-4">
                  {inquiries.map(inq => (
                    <div
                      key={inq.id}
                      className={`p-5 rounded-xl border transition-all ${
                        inq.status === 'New'
                          ? 'border-[#c59b43] bg-amber-50/30'
                          : 'border-[#e2ded5] bg-white'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/60 pb-3 mb-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0c1829] text-sm">{inq.name}</span>
                          <span className="text-gray-500">• {inq.email}</span>
                          {inq.phone && <span className="text-gray-500">• {inq.phone}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-[11px]">{new Date(inq.createdAt).toLocaleString()}</span>
                          <button
                            onClick={() => handleToggleInquiryStatus(inq.id, inq.status)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inq.status === 'New'
                                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                                : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                            }`}
                          >
                            Status: {inq.status} (Click to toggle)
                          </button>
                          <button
                            onClick={() => handleDeleteInquiry(inq.id)}
                            className="text-rose-600 hover:text-rose-800 p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-bold text-gray-700 mr-2 uppercase tracking-wider text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">
                            {inq.category}
                          </span>
                          <span className="font-bold text-gray-900 text-sm">{inq.subject}</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed font-sans bg-white p-3 rounded border border-gray-100">
                          {inq.message}
                        </p>
                        {inq.specialRequirements && (
                          <div className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded">
                            <strong>Special / Accessibility Needs:</strong> {inq.specialRequirements}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 9: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div className="border-b border-[#e2ded5] pb-4">
                <h2 className="font-serif text-xl font-bold text-[#0c1829]">
                  Institutional Security & Content Audit Trail
                </h2>
                <p className="text-xs text-gray-500">
                  Immutable record of administrative actions, content updates, and authentication events.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-gray-700">
                  <thead className="bg-[#f4f1eb] text-gray-800 uppercase tracking-wider font-semibold border-b border-[#e2ded5]">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Entity</th>
                      <th className="py-2.5 px-3">Details</th>
                      <th className="py-2.5 px-3">Actor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="py-2 px-3 whitespace-nowrap text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2 px-3 font-semibold text-[#0c1829]">{log.action}</td>
                        <td className="py-2 px-3 font-mono text-gray-600">{log.resource}</td>
                        <td className="py-2 px-3 text-gray-600">{log.details}</td>
                        <td className="py-2 px-3 font-medium text-[#9b7529]">{log.adminEmail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 10: PASSKEY & SECURITY */}
          {activeTab === 'security' && (
            <div className="max-w-md space-y-6">
              <div className="border-b border-[#e2ded5] pb-4">
                <h2 className="font-serif text-xl font-bold text-[#0c1829]">
                  Admin Passphrase Security
                </h2>
                <p className="text-xs text-gray-500">
                  Update the administrative password for this portal.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">New Password (Min 8 chars)</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e2ded5] rounded text-sm focus:border-[#c59b43] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0c1829] hover:bg-[#162740] text-white font-bold rounded-lg shadow-xs"
                >
                  Update Passphrase
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
