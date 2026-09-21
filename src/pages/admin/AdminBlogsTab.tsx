import React, { useState, useMemo } from 'react';
import type { BlogPost, BlogCategory } from '../../types';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  Clock,
  User,
  Upload,
  Sparkles,
  ExternalLink,
  Tag,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { calculateReadingTime } from '../../utils/readingTime';

interface AdminBlogsTabProps {
  blogs: BlogPost[];
  onRefresh: () => Promise<void>;
}

const CATEGORIES: BlogCategory[] = [
  'Constitutional Law',
  'Access to Justice',
  'Prison Reforms',
  'Field Insights',
  'Human Rights',
  'Case Commentary',
  'General Legal Aid'
];

export const AdminBlogsTab: React.FC<AdminBlogsTabProps> = ({ blogs, onRefresh }) => {
  const { authFetch } = useAuth();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Published' | 'Draft'>('All');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost> | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Filtered blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => {
      const matchesCategory = filterCategory === 'All' || blog.category === filterCategory;
      const matchesStatus = filterStatus === 'All' || blog.status === filterStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        blog.title.toLowerCase().includes(q) ||
        blog.author.toLowerCase().includes(q) ||
        blog.excerpt.toLowerCase().includes(q);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [blogs, filterCategory, filterStatus, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = blogs.length;
    const published = blogs.filter(b => b.status === 'Published').length;
    const drafts = blogs.filter(b => b.status === 'Draft').length;
    const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0);
    return { total, published, drafts, totalViews };
  }, [blogs]);

  // Open New Blog Form
  const handleOpenNew = () => {
    setEditingBlog({
      title: '',
      subtitle: '',
      slug: '',
      category: 'Access to Justice',
      author: 'Editorial Board, LAS',
      authorRole: 'Student Editor, Batch of 2026',
      readTime: '5 min read',
      date: new Date().toISOString().split('T')[0],
      coverImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200',
      excerpt: '',
      content: '',
      tags: ['Legal Aid', 'Access to Justice'],
      status: 'Published',
      featured: false
    });
    setIsPreviewMode(false);
    setIsModalOpen(true);
  };

  // Open Edit Blog Form
  const handleOpenEdit = (blog: BlogPost) => {
    setEditingBlog({ ...blog });
    setIsPreviewMode(false);
    setIsModalOpen(true);
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploadingImage(true);
    try {
      const res = await authFetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error('Image upload failed');
      }

      const data = await res.json();
      setEditingBlog(prev => ({
        ...prev,
        coverImage: data.url
      }));
      addToast('success', 'Cover image uploaded successfully.');
    } catch (err: any) {
      addToast('error', err.message || 'Failed to upload image.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Save Blog (Create or Update)
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;

    if (!editingBlog.title?.trim()) {
      addToast('error', 'Blog title is required.');
      return;
    }
    if (!editingBlog.excerpt?.trim()) {
      addToast('error', 'Please provide a short excerpt / summary.');
      return;
    }
    if (!editingBlog.content?.trim()) {
      addToast('error', 'Please enter the blog article content.');
      return;
    }

    setIsSaving(true);
    try {
      const isNew = !editingBlog.id;
      const url = isNew ? '/api/admin/blogs' : `/api/admin/blogs/${editingBlog.id}`;
      const method = isNew ? 'POST' : 'PUT';

      // Auto-compute readTime if empty or missing
      const calculatedRead = calculateReadingTime(editingBlog.content, editingBlog.readTime);
      const payload = {
        ...editingBlog,
        readTime: editingBlog.readTime?.trim() ? editingBlog.readTime.trim() : calculatedRead.text
      };

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save blog post');
      }

      addToast('success', isNew ? 'Blog post published to AAWAZ.' : 'Blog post successfully updated.');
      setIsModalOpen(false);
      setEditingBlog(null);
      await onRefresh();
    } catch (err: any) {
      addToast('error', err.message || 'Error saving blog post');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Publish / Draft
  const handleToggleStatus = async (blog: BlogPost) => {
    const newStatus = blog.status === 'Published' ? 'Draft' : 'Published';
    try {
      const res = await authFetch(`/api/admin/blogs/${blog.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...blog, status: newStatus })
      });
      if (!res.ok) throw new Error('Status update failed');
      addToast('success', `Article marked as ${newStatus}.`);
      await onRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  // Delete Blog
  const handleDeleteBlog = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }

    try {
      const res = await authFetch(`/api/admin/blogs/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete blog article');
      addToast('success', 'Blog article deleted from AAWAZ archives.');
      await onRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Metrics Bar */}
      <div className="bg-white p-6 rounded-xl border border-[#e2ded5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-lg sm:text-xl text-[#0c1829]">
              AAWAZ — The Socio-Legal Blog Editorial Desk
            </span>
            <span className="text-xs bg-[#c59b43]/20 text-[#9b7529] font-bold px-2 py-0.5 rounded">
              Official Journal
            </span>
          </div>
          <p className="text-xs text-gray-500 font-sans mt-1">
            Publish, curate, edit, and archive analytical commentaries, empirical field reflections, and legal research articles.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0c1829] hover:bg-[#162740] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 text-[#c59b43]" />
          <span>Upload / Write New Blog</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#e2ded5] shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-gray-500 block">Total Articles</span>
          <span className="font-serif text-2xl font-bold text-[#0c1829]">{metrics.total}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#e2ded5] shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-emerald-600 block">Published</span>
          <span className="font-serif text-2xl font-bold text-emerald-700">{metrics.published}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#e2ded5] shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-amber-600 block">Drafts</span>
          <span className="font-serif text-2xl font-bold text-amber-700">{metrics.drafts}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#e2ded5] shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-[#9b7529] block">Total Reader Views</span>
          <span className="font-serif text-2xl font-bold text-[#0c1829]">{metrics.totalViews}</span>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-[#e2ded5] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, or keywords..."
            className="w-full pl-9 pr-4 py-1.5 bg-[#fcfbf9] border border-[#e2ded5] rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#c59b43]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 bg-[#fcfbf9] border border-[#e2ded5] rounded-md text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#c59b43]"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="px-3 py-1.5 bg-[#fcfbf9] border border-[#e2ded5] rounded-md text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#c59b43]"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* 3. Blogs Table / List */}
      <div className="bg-white rounded-xl border border-[#e2ded5] shadow-xs overflow-hidden">
        {filteredBlogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="font-serif text-base font-bold text-gray-800">No blog articles match your filters</h3>
            <p className="text-xs text-gray-500">
              Try adjusting your search criteria or click below to compose a new blog post.
            </p>
            <button
              onClick={handleOpenNew}
              className="px-4 py-2 bg-[#0c1829] text-white text-xs font-semibold rounded-md hover:bg-[#162740] transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-[#c59b43]" />
              <span>Compose Blog</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f4f1eb] text-gray-600 font-semibold border-b border-[#e2ded5]">
                <tr>
                  <th className="py-3 px-4">Article & Author</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date & Read Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Views</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2ded5]">
                {filteredBlogs.map(blog => (
                  <tr key={blog.id} className="hover:bg-[#fcfbf9] transition-colors">
                    {/* Article & Author */}
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-3">
                        {blog.coverImage ? (
                          <img
                            src={blog.coverImage}
                            alt=""
                            className="w-12 h-12 object-cover rounded-md border border-[#e2ded5] shrink-0"
                            referrerPolicy="no-referrer"
                            onError={e => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-[#0c1829] text-[#c59b43] flex items-center justify-center font-serif font-bold text-sm shrink-0">
                            {blog.title.charAt(0)}
                          </div>
                        )}
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-serif font-bold text-sm text-[#0c1829] hover:underline">
                              {blog.title}
                            </span>
                            {blog.featured && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                <Sparkles className="w-2.5 h-2.5 text-amber-500" /> Featured
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 font-sans">
                            By <strong className="text-gray-700">{blog.author}</strong> ({blog.authorRole})
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {blog.category}
                      </span>
                    </td>

                    {/* Date & Read Time */}
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      <div>{blog.date}</div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#c59b43]" />
                        <span>{calculateReadingTime(blog.content, blog.readTime).text}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(blog)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                          blog.status === 'Published'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                        }`}
                        title="Click to toggle publish status"
                      >
                        {blog.status === 'Published' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Published
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-amber-600" /> Draft
                          </>
                        )}
                      </button>
                    </td>

                    {/* Views */}
                    <td className="py-3 px-4 text-gray-600 font-mono text-xs">
                      {blog.views || 0}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/aawaz?id=${blog.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-500 hover:text-[#0c1829] hover:bg-gray-100 rounded transition-colors"
                          title="View on public site"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleOpenEdit(blog)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit article"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(blog.id, blog.title)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Compose / Edit Modal */}
      {isModalOpen && editingBlog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-[#e2ded5] overflow-hidden flex flex-col my-auto max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-[#0c1829] text-white px-6 py-4 flex items-center justify-between border-b border-[#c59b43]/30">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-[#c59b43]" />
                <h3 className="font-serif font-bold text-base sm:text-lg">
                  {editingBlog.id ? 'Edit AAWAZ Blog Article' : 'Upload / Write New AAWAZ Blog'}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className="px-3 py-1 text-xs rounded bg-white/10 hover:bg-white/20 text-gray-200 transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-[#c59b43]" />
                  <span>{isPreviewMode ? 'Edit Mode' : 'Preview Article'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-white rounded transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
              {isPreviewMode ? (
                /* Live Preview Mode */
                <div className="space-y-6 bg-[#fcfbf9] p-6 rounded-xl border border-[#e2ded5]">
                  <div className="border-b border-[#e2ded5] pb-4 space-y-2">
                    <span className="text-xs uppercase font-bold text-[#9b7529] tracking-wider">
                      {editingBlog.category} • {editingBlog.readTime}
                    </span>
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0c1829]">
                      {editingBlog.title || 'Untitled Article'}
                    </h1>
                    {editingBlog.subtitle && (
                      <p className="font-serif italic text-gray-600 text-sm">{editingBlog.subtitle}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      By {editingBlog.author} ({editingBlog.authorRole}) • {editingBlog.date}
                    </p>
                  </div>

                  {editingBlog.coverImage && (
                    <img
                      src={editingBlog.coverImage}
                      alt=""
                      className="max-h-72 w-full object-cover rounded-lg border"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {editingBlog.excerpt && (
                    <div className="p-4 bg-[#f4f1eb] border-l-4 border-[#c59b43] text-xs text-gray-700 italic">
                      "{editingBlog.excerpt}"
                    </div>
                  )}

                  <div className="text-sm font-sans leading-relaxed text-gray-800 whitespace-pre-line">
                    {editingBlog.content || 'No content written yet.'}
                  </div>
                </div>
              ) : (
                /* Edit Form */
                <form id="blog-form" onSubmit={handleSaveBlog} className="space-y-5">
                  {/* Title & Subtitle */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">
                      Article Title <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingBlog.title || ''}
                      onChange={e => {
                        const title = e.target.value;
                        setEditingBlog(prev => ({
                          ...prev,
                          title,
                          slug: prev?.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                        }));
                      }}
                      placeholder="e.g. Legal Aid at the Remand Stage: A Critical Empirical Study"
                      className="w-full px-3.5 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-md text-xs sm:text-sm font-serif font-bold text-gray-900 focus:ring-1 focus:ring-[#c59b43] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Subtitle */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Subtitle / Tagline</label>
                      <input
                        type="text"
                        value={editingBlog.subtitle || ''}
                        onChange={e => setEditingBlog(prev => ({ ...prev, subtitle: e.target.value }))}
                        placeholder="e.g. Reflections from Delhi trial courts on Section 436A CrPC compliance"
                        className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-md text-xs text-gray-900 focus:ring-1 focus:ring-[#c59b43] focus:outline-none"
                      />
                    </div>

                    {/* Slug */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">URL Slug / Identifier</label>
                      <input
                        type="text"
                        value={editingBlog.slug || ''}
                        onChange={e => setEditingBlog(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="legal-aid-remand-stage-delhi"
                        className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-md text-xs text-gray-600 font-mono focus:ring-1 focus:ring-[#c59b43] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Category, Read Time, Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Category</label>
                      <select
                        value={editingBlog.category || 'Access to Justice'}
                        onChange={e => setEditingBlog(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-md text-xs text-gray-900 focus:ring-1 focus:ring-[#c59b43] focus:outline-none"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-700">Estimated Read Time</label>
                        {editingBlog.content && (
                          <button
                            type="button"
                            onClick={() => {
                              const calculated = calculateReadingTime(editingBlog.content);
                              setEditingBlog(prev => ({ ...prev, readTime: calculated.text }));
                              addToast('success', `Calculated: ${calculated.text} (${calculated.words.toLocaleString()} words)`);
                            }}
                            className="text-[11px] text-[#7b1d28] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                            title="Auto-calculate read time based on word count"
                          >
                            <Sparkles className="w-3 h-3 text-[#c59b43]" />
                            Auto-calc ({calculateReadingTime(editingBlog.content).text})
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={editingBlog.readTime || ''}
                        onChange={e => setEditingBlog(prev => ({ ...prev, readTime: e.target.value }))}
                        placeholder={editingBlog.content ? calculateReadingTime(editingBlog.content).text : "e.g. 5 min read"}
                        className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-md text-xs text-gray-900 focus:ring-1 focus:ring-[#c59b43] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Publication Date</label>
                      <input
                        type="date"
                        value={editingBlog.date || new Date().toISOString().split('T')[0]}
                        onChange={e => setEditingBlog(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-md text-xs text-gray-900 focus:ring-1 focus:ring-[#c59b43] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Author Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">
                        Author Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingBlog.author || ''}
                        onChange={e => setEditingBlog(prev => ({ ...prev, author: e.target.value }))}
                        placeholder="e.g. Priyanshu Sharma & Ananya Sen"
                        className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-md text-xs text-gray-900 focus:ring-1 focus:ring-[#c59b43] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Author Designation / Role</label>
                      <input
                        type="text"
                        value={editingBlog.authorRole || ''}
                        onChange={e => setEditingBlog(prev => ({ ...prev, authorRole: e.target.value }))}
                        placeholder="e.g. LL.B. Final Year • Student Convener, Prison Outreach"
                        className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-md text-xs text-gray-900 focus:ring-1 focus:ring-[#c59b43] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Cover Image URL + File Upload */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                      <span>Cover Image URL / Photo</span>
                      {isUploadingImage && (
                        <span className="text-[11px] text-amber-600 font-normal">Uploading file...</span>
                      )}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingBlog.coverImage || ''}
                        onChange={e => setEditingBlog(prev => ({ ...prev, coverImage: e.target.value }))}
                        placeholder="https://images.unsplash.com/... or upload a local file"
                        className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-md text-xs text-gray-900 focus:ring-1 focus:ring-[#c59b43] focus:outline-none"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#f4f1eb] hover:bg-[#e2ded5] text-gray-800 text-xs font-medium rounded-md cursor-pointer shrink-0 border border-[#e2ded5] transition-colors">
                        <Upload className="w-3.5 h-3.5 text-[#9b7529]" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploadingImage}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">
                      Excerpt / Abstract Summary <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={editingBlog.excerpt || ''}
                      onChange={e => setEditingBlog(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Brief 2-3 sentence overview that appears on article cards and search results..."
                      className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-md text-xs text-gray-900 focus:ring-1 focus:ring-[#c59b43] focus:outline-none"
                    />
                  </div>

                  {/* Main Content */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-700">
                        Full Article Content (Markdown supported) <span className="text-rose-600">*</span>
                      </label>
                      <div className="flex items-center gap-3 text-[10px]">
                        {editingBlog.content && (
                          <span className="font-semibold text-[#0c1829] bg-[#f4f1eb] px-2 py-0.5 rounded border border-[#e2ded5] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#c59b43]" />
                            {calculateReadingTime(editingBlog.content).text} ({calculateReadingTime(editingBlog.content).words.toLocaleString()} words)
                          </span>
                        )}
                        <span className="hidden sm:inline text-gray-400">
                          Supports ## Headers, - Bullets, Bluebook citations
                        </span>
                      </div>
                    </div>
                    <textarea
                      required
                      rows={12}
                      value={editingBlog.content || ''}
                      onChange={e => setEditingBlog(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Write the full scholarly article or paste research paper here..."
                      className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-md text-xs font-mono text-gray-900 focus:ring-1 focus:ring-[#c59b43] focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Topics / Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={Array.isArray(editingBlog.tags) ? editingBlog.tags.join(', ') : ''}
                      onChange={e =>
                        setEditingBlog(prev => ({
                          ...prev,
                          tags: e.target.value
                            .split(',')
                            .map(t => t.trim())
                            .filter(Boolean)
                        }))
                      }
                      placeholder="e.g. Constitutional Law, Article 39A, Legal Aid Clinics, Supreme Court"
                      className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-md text-xs text-gray-900 focus:ring-1 focus:ring-[#c59b43] focus:outline-none"
                    />
                  </div>

                  {/* Status & Featured Checkboxes */}
                  <div className="p-4 bg-[#f4f1eb] rounded-xl border border-[#e2ded5] flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
                        <input
                          type="checkbox"
                          checked={editingBlog.status === 'Published'}
                          onChange={e =>
                            setEditingBlog(prev => ({
                              ...prev,
                              status: e.target.checked ? 'Published' : 'Draft'
                            }))
                          }
                          className="w-4 h-4 text-[#0c1829] rounded border-gray-300 focus:ring-[#c59b43]"
                        />
                        <span>Publish Immediately (Visible to Public)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#7b1d28]">
                        <input
                          type="checkbox"
                          checked={Boolean(editingBlog.featured)}
                          onChange={e =>
                            setEditingBlog(prev => ({
                              ...prev,
                              featured: e.target.checked
                            }))
                          }
                          className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                        />
                        <span>Feature on AAWAZ Masthead Hero</span>
                      </label>
                    </div>

                    <div className="text-[11px] text-gray-500 italic">
                      All published articles are automatically indexed in Global Search (⌘K).
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#f4f1eb] px-6 py-4 border-t border-[#e2ded5] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="blog-form"
                disabled={isSaving}
                className="px-5 py-2.5 bg-[#0c1829] hover:bg-[#162740] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? (
                  <span>Saving Article...</span>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4 text-[#c59b43]" />
                    <span>{editingBlog.id ? 'Update Article' : 'Publish to AAWAZ'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
