import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import { usePortal } from '../context/PortalContext';
import type { BlogPost, BlogCategory } from '../types';
import { applySEO, resetToDefaultSEO } from '../utils/seo';
import {
  BookOpen,
  Search,
  Tag,
  Calendar,
  Clock,
  User,
  ArrowRight,
  TrendingUp,
  Share2,
  Sparkles,
  Shield,
  Send,
  FileText,
  Filter,
  Check,
  Globe
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { calculateReadingTime } from '../utils/readingTime';

export const AawazBlogPage: React.FC = () => {
  const { data, selectedBlog, setSelectedBlog } = usePortal();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const blogs: BlogPost[] = useMemo(() => {
    return data?.blogs || [];
  }, [data?.blogs]);

  // Check if URL has route param (/aawaz/:id) or query param (?id=...) and open the reader
  useEffect(() => {
    const articleIdentifier = routeId || searchParams.get('id');
    if (articleIdentifier && blogs.length > 0) {
      const clean = articleIdentifier.trim().toLowerCase();
      const found = blogs.find(
        b => b.id.toLowerCase() === clean || (b.slug && b.slug.toLowerCase() === clean)
      );
      if (found) {
        setSelectedBlog(found);
      }
    }
  }, [routeId, searchParams, blogs, setSelectedBlog]);

  // Apply default page SEO when no individual blog reader is active
  useEffect(() => {
    if (!selectedBlog && !routeId && !searchParams.get('id')) {
      applySEO({
        title: 'AAWAZ — The Socio-Legal Blog | Legal Aid Society, Campus Law Centre',
        description:
          'Official scholarly socio-legal blog and research repository of the Legal Aid Society, Campus Law Centre, Faculty of Law, University of Delhi. Featuring empirical field reflections, prison reforms, and access-to-justice commentary.',
        ogTitle: 'AAWAZ — The Socio-Legal Blog | CLC Legal Aid Society',
        ogDescription:
          'Empirical reflections, constitutional inquiries, and clinical legal aid scholarship from Campus Law Centre, Faculty of Law, University of Delhi.',
        ogType: 'website',
        canonicalUrl: `${window.location.origin}/aawaz`
      });
    }
  }, [selectedBlog, routeId, searchParams]);

  const openArticle = (blog: BlogPost) => {
    setSelectedBlog(blog);
    navigate(`/aawaz/${blog.slug || blog.id}`, { replace: false });
  };

  const categories: string[] = [
    'All',
    'Constitutional Law',
    'Access to Justice',
    'Prison Reforms',
    'Field Insights',
    'Human Rights',
    'Case Commentary'
  ];

  // Filtered blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => {
      const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        blog.title.toLowerCase().includes(q) ||
        (blog.subtitle && blog.subtitle.toLowerCase().includes(q)) ||
        blog.excerpt.toLowerCase().includes(q) ||
        blog.author.toLowerCase().includes(q) ||
        (blog.tags && blog.tags.some(t => t.toLowerCase().includes(q)));

      return matchesCategory && matchesSearch;
    });
  }, [blogs, selectedCategory, searchQuery]);

  // Featured blog (first featured or latest)
  const featuredBlog = useMemo(() => {
    return blogs.find(b => b.featured) || blogs[0];
  }, [blogs]);

  // Calculate estimated minutes to read for featured article
  const featuredReadTime = useMemo(() => {
    return calculateReadingTime(featuredBlog?.content, featuredBlog?.readTime);
  }, [featuredBlog?.content, featuredBlog?.readTime]);

  const regularBlogs = useMemo(() => {
    if (selectedCategory !== 'All' || searchQuery) {
      return filteredBlogs;
    }
    // Exclude featured hero if on default view to prevent duplication
    return filteredBlogs.filter(b => b.id !== featuredBlog?.id);
  }, [filteredBlogs, featuredBlog, selectedCategory, searchQuery]);

  const handleShare = (e: React.MouseEvent, blog: BlogPost) => {
    e.stopPropagation();
    const url = `${window.location.origin}/aawaz/${blog.slug || blog.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(blog.id);
      showToast('Article link copied to clipboard!', 'success');
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-[#2d3748] pb-16">
      {/* 1. EDITORIAL MASTHEAD */}
      <section className="bg-[#0c1829] text-[#e2ded5] border-b-4 border-[#c59b43] relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#c59b43_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c59b43]/20 border border-[#c59b43]/40 text-xs font-semibold uppercase tracking-widest text-[#e6c887]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Official Editorial Initiative</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              AAWAZ — <span className="text-[#c59b43] font-normal italic">The Socio-Legal Voice</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 font-sans leading-relaxed">
              The flagship socio-legal journal and blog initiative of the{' '}
              <strong className="text-white font-semibold">Legal Aid Society, Campus Law Centre, Faculty of Law, University of Delhi</strong>.
              Documenting empirical field reflections, constitutional inquiries, remand observations, and transformative access-to-justice scholarship.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[#c59b43]">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Non-Commercial Academic Series
              </span>
              <span>•</span>
              <span>Article 39A Research Vertical</span>
              <span>•</span>
              <span>Peer-Reviewed Student & Faculty Reflections</span>
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link
                to="/submissions"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c59b43] hover:bg-[#d8ae57] text-[#0c1829] text-xs font-bold transition-colors shadow-xs"
              >
                <FileText className="w-4 h-4" />
                <span>Submit Manuscript / Call for Papers</span>
              </Link>
              <Link
                to="/submissions"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors border border-white/20"
              >
                <span>Track Manuscript Status</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & CATEGORY FILTER BAR */}
      <section className="sticky top-20 z-30 bg-[#fcfbf9]/95 backdrop-blur-md border-b border-[#e2ded5] shadow-xs py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#0c1829] text-white shadow-xs font-semibold'
                    : 'bg-white text-gray-600 hover:bg-[#f4f1eb] hover:text-[#0c1829] border border-[#e2ded5]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by topic, author, title..."
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-[#e2ded5] rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-[#c59b43] text-gray-800 placeholder-gray-400 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* If filtering or search is active, indicate current view */}
        {(selectedCategory !== 'All' || searchQuery) && (
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#e2ded5]">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Filter className="w-4 h-4 text-[#9b7529]" />
              <span>
                Showing results for{' '}
                {selectedCategory !== 'All' && <strong className="text-[#0c1829]">"{selectedCategory}"</strong>}
                {selectedCategory !== 'All' && searchQuery && ' and '}
                {searchQuery && <strong className="text-[#0c1829]">"{searchQuery}"</strong>}
                {' '}({filteredBlogs.length} articles found)
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="text-xs text-[#7b1d28] hover:underline font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* 4. FEATURED HERO ARTICLE (Shown on default "All" view with no active search) */}
        {selectedCategory === 'All' && !searchQuery && featuredBlog && (
          <section className="bg-white rounded-2xl border border-[#e2ded5] shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Cover Image */}
              <div className="lg:col-span-6 h-64 sm:h-80 lg:h-full relative overflow-hidden bg-[#0c1829]">
                <img
                  src={
                    featuredBlog.coverImage ||
                    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200'
                  }
                  alt={featuredBlog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#c59b43] text-[#0c1829] shadow-md">
                    <Sparkles className="w-3.5 h-3.5" /> Featured Editorial
                  </span>
                </div>
              </div>

              {/* Editorial Info */}
              <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-semibold text-[#7b1d28] bg-rose-50 px-2.5 py-0.5 rounded uppercase tracking-wider">
                      {featuredBlog.category}
                    </span>
                    <span>•</span>
                    <span
                      className="flex items-center gap-1 font-medium text-gray-700"
                      title={`Estimated ${featuredReadTime.minutesToReadText} (~200 WPM based on ${featuredReadTime.words.toLocaleString()} words)`}
                    >
                      <Clock className="w-3.5 h-3.5 text-[#c59b43]" />
                      <span>{featuredReadTime.text}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#c59b43]" />
                      {featuredBlog.date}
                    </span>
                  </div>

                  <h2
                    onClick={() => openArticle(featuredBlog)}
                    className="font-serif text-2xl sm:text-3xl font-bold text-[#0c1829] hover:text-[#7b1d28] cursor-pointer transition-colors leading-snug"
                  >
                    {featuredBlog.title}
                  </h2>

                  {featuredBlog.subtitle && (
                    <p className="font-serif italic text-sm sm:text-base text-gray-600">
                      {featuredBlog.subtitle}
                    </p>
                  )}

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans line-clamp-3">
                    {featuredBlog.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#e2ded5] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#0c1829] text-[#c59b43] flex items-center justify-center font-serif font-bold text-sm">
                      {featuredBlog.author.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{featuredBlog.author}</h4>
                      <p className="text-[11px] text-gray-500">{featuredBlog.authorRole}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => handleShare(e, featuredBlog)}
                      className="p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                      title="Share link"
                      aria-label="Share article"
                    >
                      {copiedId === featuredBlog.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => openArticle(featuredBlog)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0c1829] hover:bg-[#162740] text-white font-semibold text-xs rounded-md shadow-xs transition-colors cursor-pointer"
                    >
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#c59b43]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 5. ARTICLES GRID */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#e2ded5] pb-3">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0c1829] flex items-center gap-2">
              <span>Articles & Commentaries</span>
              <span className="text-xs font-sans font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {regularBlogs.length}
              </span>
            </h3>
            <span className="text-xs text-gray-500 hidden sm:inline">
              Campus Law Centre • Student & Faculty Publications
            </span>
          </div>

          {regularBlogs.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-[#e2ded5] space-y-3">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
              <h4 className="font-serif text-lg font-bold text-gray-800">No Articles Found</h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                No articles matched your selected category or query. Please clear your search or select "All".
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-[#0c1829] text-white text-xs font-semibold rounded-md hover:bg-[#162740] transition-colors"
              >
                Show All Articles
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularBlogs.map(blog => {
                const readTime = calculateReadingTime(blog.content, blog.readTime);
                return (
                  <article
                    key={blog.id}
                    onClick={() => openArticle(blog)}
                    className="bg-white rounded-xl border border-[#e2ded5] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden cursor-pointer group hover:border-[#c59b43]/50"
                  >
                    {/* Article Card Top Cover / Header */}
                    <div>
                      {blog.coverImage ? (
                        <div className="h-44 w-full overflow-hidden bg-gray-100 relative">
                          <img
                            src={blog.coverImage}
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                            onError={e => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute top-3 left-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0c1829]/90 text-[#c59b43] px-2.5 py-0.5 rounded backdrop-blur-xs">
                              {blog.category}
                            </span>
                          </div>
                          <div className="absolute top-3 right-3">
                            <span
                              className="text-[10px] font-medium bg-[#0c1829]/80 text-white px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1 border border-white/10"
                              title={`Estimated ${readTime.minutesToReadText} (~200 WPM)`}
                            >
                              <Clock className="w-3 h-3 text-[#c59b43]" /> {readTime.text}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-[#f4f1eb] border-b border-[#e2ded5] flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0c1829] text-[#c59b43] px-2.5 py-0.5 rounded">
                            {blog.category}
                          </span>
                          <span
                            className="text-[11px] text-gray-600 font-medium flex items-center gap-1"
                            title={`Estimated ${readTime.minutesToReadText}`}
                          >
                            <Clock className="w-3 h-3 text-[#c59b43]" /> {readTime.text}
                          </span>
                        </div>
                      )}

                      {/* Body Info */}
                      <div className="p-5 space-y-2.5">
                        <div className="flex items-center gap-2 text-[11px] text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#c59b43]" />
                            <span>{blog.date}</span>
                          </span>
                          <span>•</span>
                          <span
                            className="flex items-center gap-1 text-gray-600 font-medium"
                            title={`Estimated reading duration: ${readTime.minutesToReadText} (${readTime.words.toLocaleString()} words)`}
                          >
                            <Clock className="w-3 h-3 text-[#c59b43]" />
                            <span>{readTime.text}</span>
                          </span>
                        </div>

                        <h3 className="font-serif text-lg font-bold text-[#0c1829] group-hover:text-[#7b1d28] transition-colors leading-snug line-clamp-2">
                          {blog.title}
                        </h3>

                        <p className="text-xs text-gray-600 font-sans leading-relaxed line-clamp-3">
                          {blog.excerpt}
                        </p>

                        {/* Tags */}
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {blog.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-200"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-5 pt-0 border-t border-[#e2ded5] mt-4 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#0c1829] text-[#c59b43] flex items-center justify-center font-serif font-bold text-xs">
                          {blog.author.charAt(0)}
                        </div>
                        <div className="truncate max-w-[140px]">
                          <p className="font-semibold text-gray-900 truncate">{blog.author}</p>
                          <p className="text-[10px] text-gray-500 truncate">{blog.authorRole}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={e => handleShare(e, blog)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          title="Copy article link"
                        >
                          {copiedId === blog.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className="text-[#7b1d28] font-bold text-xs group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                          Read <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* 6. SUBMISSIONS & EDITORIAL GUIDELINES CALLOUT */}
        <section className="bg-gradient-to-r from-[#f4f1eb] to-[#ece7dc] rounded-2xl p-6 sm:p-10 border border-[#e2ded5] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <span className="text-xs uppercase tracking-widest font-bold text-[#7b1d28] bg-rose-50 px-2.5 py-0.5 rounded">
                Call for Submissions • Rolling Basis
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0c1829]">
                Contribute to AAWAZ — The Socio-Legal Voice
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
                The Editorial Board invites insightful, empirical, and analytical essays from students, clinical volunteers, legal academics, and practitioners. Topics include Access to Justice, Prison & Remand Reforms, Lok Adalat jurisprudence, Legal Literacy in Informal Settlements, and Socio-Economic Rights.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-1">
                <span>• Word Count: 1,200 – 2,500 words</span>
                <span>• Citation Format: Standard Academic / Bluebook</span>
                <span>• Co-authorship: Up to two authors permitted</span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <div className="p-4 bg-white rounded-xl border border-[#e2ded5] text-xs text-center space-y-1">
                <span className="text-gray-500 block">Editorial Desk Email:</span>
                <span className="font-semibold text-[#0c1829] select-all block text-sm">
                  {data?.settings?.email || 'aawaz.las@clc.du.ac.in'}
                </span>
                <span className="text-[10px] text-gray-400 block">
                  Manuscripts reviewed within 10 working days
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
