import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePortal } from '../context/PortalContext';
import {
  Scale,
  BookOpen,
  Users,
  Shield,
  Calendar,
  FileText,
  ArrowRight,
  Download,
  Bell,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  MapPin,
  Mail,
  Clock,
  Phone,
  HelpCircle,
  Pin,
  Sparkles,
  Info,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { calculateReadingTime } from '../utils/readingTime';

export const HomePage: React.FC = () => {
  const { data, isLoading, setSelectedNotification, setSelectedReport, setSelectedBlog } = usePortal();
  const settings = data?.settings;
  const navigate = useNavigate();

  const latestNotifications = data?.notifications?.slice(0, 4) || [];
  const featuredReports = data?.reports?.slice(0, 3) || [];
  const teamPreview = data?.team?.slice(0, 4) || [];
  const featuredBlogs = data?.blogs?.slice(0, 3) || [];

  const clinicalPillars = [
    {
      icon: <Scale className="w-6 h-6 text-[#9b7529]" />,
      title: 'Free Legal Aid & Guidance Clinic',
      desc: 'Operational under Section 12 of the Legal Services Authorities Act, 1987, providing pro-bono consultation, drafting aid, and procedural navigation for indigent litigants.'
    },
    {
      icon: <BookOpen className="w-6 h-6 text-[#9b7529]" />,
      title: 'Grassroots Legal Literacy Drives',
      desc: 'Targeted awareness campaigns across Delhi NCR educating citizens on fundamental constitutional rights, labor protections, domestic violence remedies, and statutory schemes.'
    },
    {
      icon: <Shield className="w-6 h-6 text-[#9b7529]" />,
      title: 'Prison & Undertrial Rights Observation',
      desc: 'Supervised clinical visits, undertrial rights education, bail entitlement primers, and judicial observation conducted in synergy with DSLSA and prison authorities.'
    },
    {
      icon: <FileText className="w-6 h-6 text-[#9b7529]" />,
      title: 'AAWAZ Research & Policy Compendiums',
      desc: 'Scholarly socio-legal critique, empirical field studies, right-to-information (RTI) documentation, and archival compilation of annual legal aid proceedings.'
    }
  ];

  const handleOpenBlog = (blog: any) => {
    setSelectedBlog(blog);
    navigate(`/aawaz/${blog.slug || blog.id}`);
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. EDITORIAL INSTITUTIONAL HERO SECTION */}
      <section className="relative overflow-hidden bg-[#0c1829] text-white border-b-2 border-[#c59b43]/50 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle geometric background watermark */}
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
          <Scale className="w-[850px] h-[850px] text-white" strokeWidth={0.5} />
        </div>

        {/* Ambient subtle light accent */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#c59b43]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto space-y-10">
          {/* Institutional Crest and Heritage Badging */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-[#c59b43]/40 text-xs sm:text-sm font-semibold tracking-wider text-[#e6c887] uppercase font-sans">
              <span>Campus Law Centre</span>
              <span className="text-[#c59b43] font-bold">•</span>
              <span>Faculty of Law</span>
              <span className="text-[#c59b43] font-bold">•</span>
              <span>University of Delhi</span>
            </div>

            <div className="space-y-3 max-w-4xl">
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
                Legal Aid Society
              </h1>
              <p className="font-crest text-xs sm:text-base text-[#c59b43] tracking-widest uppercase font-semibold">
                Access to Justice • Constitutional Duties • Clinical Legal Excellence
              </p>
            </div>

            {/* Statutory Article 39A Mission Block */}
            <div className="max-w-3xl mx-auto p-5 sm:p-6 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs text-sm sm:text-base text-gray-200 leading-relaxed font-sans shadow-lg">
              <p className="italic text-gray-300">
                "{settings?.missionPlaceholder || 'Dedicated to operationalizing the constitutional directive of Article 39A, ensuring that opportunities for securing justice are not denied to any citizen by reason of economic, social, or geographical disability.'}"
              </p>
            </div>

            {/* Direct Action Hub */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <Link
                to="/resources"
                className="px-6 py-3 rounded-md bg-[#c59b43] hover:bg-[#e6c887] text-[#0c1829] font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Scale className="w-4 h-4 text-[#0c1829]" />
                <span>Seek Legal Guidance</span>
              </Link>

              <Link
                to="/aawaz"
                className="px-6 py-3 rounded-md bg-[#7b1d28] hover:bg-[#922432] text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2 border border-rose-900/50"
              >
                <BookOpen className="w-4 h-4 text-[#e6c887]" />
                <span>Explore AAWAZ Blogs</span>
              </Link>

              <Link
                to="/reports"
                className="px-6 py-3 rounded-md bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all border border-white/20 flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-[#c59b43]" />
                <span>Work Reports Archive</span>
              </Link>

              <Link
                to="/notifications"
                className="px-6 py-3 rounded-md bg-transparent hover:bg-white/10 text-gray-300 hover:text-white font-medium text-sm transition-all border border-white/15 flex items-center gap-2"
              >
                <Bell className="w-4 h-4 text-[#c59b43]" />
                <span>Official Notices</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DEDICATED CITIZEN LEGAL AID & CLINIC INTAKE DESK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#fffdfa] rounded-2xl border-2 border-[#c59b43] p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#e2ded5] pb-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7b1d28]">
                <Scale className="w-4 h-4" />
                <span>Citizen Assistance Desk • Article 39A</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0c1829]">
                Legal Aid Clinic & Consultation Services
              </h2>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
                The Campus Law Centre Legal Aid Clinic provides free primary consultations, legal literacy guidance, and referral pathways to statutory bodies such as the Delhi State Legal Services Authority (DSLSA).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link
                to="/clinic"
                className="px-5 py-2.5 bg-[#7b1d28] hover:bg-[#962534] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5 text-[#e6c887]" />
                <span>Schedule Consultation</span>
              </Link>
              <Link
                to="/clinic"
                className="px-4 py-2.5 bg-[#0c1829] hover:bg-[#162740] text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>Track Request Token</span>
              </Link>
              <Link
                to="/resources"
                className="px-4 py-2.5 bg-[#f4f1eb] hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-lg transition-colors text-center border border-[#e2ded5]"
              >
                Citizen Legal Guides
              </Link>
            </div>
          </div>

          {/* Quick Informational Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-700">
            {/* Box 1: Eligibility */}
            <div className="bg-[#fcfbf9] p-4 rounded-xl border border-[#e2ded5] space-y-2">
              <div className="font-bold text-[#0c1829] flex items-center gap-2 text-sm font-serif">
                <CheckCircle2 className="w-4 h-4 text-[#9b7529]" />
                <span>Who Qualifies for Free Aid?</span>
              </div>
              <p className="leading-relaxed text-gray-600">
                Pursuant to Section 12 of the Legal Services Authorities Act, 1987: Women, children, SC/ST citizens, industrial workmen, undertrials, persons with disabilities, and indigent litigants qualify for statutory legal representation.
              </p>
            </div>

            {/* Box 2: Clinic Location & Hours */}
            <div className="bg-[#fcfbf9] p-4 rounded-xl border border-[#e2ded5] space-y-2">
              <div className="font-bold text-[#0c1829] flex items-center gap-2 text-sm font-serif">
                <Clock className="w-4 h-4 text-[#9b7529]" />
                <span>Working Hours & Location</span>
              </div>
              <p className="leading-relaxed text-gray-600">
                <strong>Hours:</strong> {settings?.officeHours || 'Monday to Friday: 10:00 AM – 5:00 PM IST'}<br />
                <strong>Location:</strong> {settings?.address || 'Campus Law Centre, Chhatra Marg, North Campus, Delhi - 110007'}
              </p>
            </div>

            {/* Box 3: Nature of Assistance */}
            <div className="bg-[#fcfbf9] p-4 rounded-xl border border-[#e2ded5] space-y-2">
              <div className="font-bold text-[#0c1829] flex items-center gap-2 text-sm font-serif">
                <ShieldCheck className="w-4 h-4 text-[#9b7529]" />
                <span>Scope of Clinical Service</span>
              </div>
              <p className="leading-relaxed text-gray-600">
                Initial grievance assessment, counseling, pre-litigation mediation counseling, drafting statutory representations, and direct linking to DLSA/DSLSA panel advocates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INSTITUTIONAL OVERVIEW & PHILOSOPHY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#7b1d28]">
              <span>Institutional Overview</span>
              <span className="w-12 h-0.5 bg-[#c59b43]" />
            </div>

            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#0c1829] leading-snug">
              Clinical Legal Education Rooted in Public Duty & Constitutional Justice
            </h2>

            <div className="text-gray-700 text-sm sm:text-base leading-relaxed space-y-4 font-sans">
              <p>
                {settings?.descriptionPlaceholder || 'The Legal Aid Society at Campus Law Centre, Faculty of Law, University of Delhi, serves as a premier student-clinical body dedicated to democratizing legal knowledge, championing grassroots human rights, and rendering pro-bono assistance to underserved communities.'}
              </p>
              <p className="text-sm text-gray-600">
                Operating under the mentorship of senior faculty members and in active coordination with the Delhi State Legal Services Authority (DSLSA), the Society prepares student advocates to bridge substantive jurisprudence with institutional compassion and procedural justice.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#0c1829] hover:text-[#9b7529] transition-colors group"
              >
                <span>Read Full Institutional History & Objectives</span>
                <ChevronRight className="w-4 h-4 text-[#c59b43] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#f4f1eb] p-6 sm:p-8 rounded-2xl border border-[#e2ded5] shadow-xs space-y-5">
            <h3 className="font-serif text-lg font-bold text-[#0c1829] border-b border-[#e2ded5] pb-3">
              Core Institutional Tenets
            </h3>
            <div className="space-y-4 text-xs sm:text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#0c1829] text-[#c59b43] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <span className="font-bold text-gray-900 block">Constitutional Directive (Art. 39A)</span>
                  <span>Guaranteeing equal justice and free statutory aid so economic handicap never obstructs court remedies.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#0c1829] text-[#c59b43] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <span className="font-bold text-gray-900 block">Clinical Ethics & Student Mentorship</span>
                  <span>Inculcating counseling ethics, client privacy, and non-commercial dedication in law students.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#0c1829] text-[#c59b43] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <span className="font-bold text-gray-900 block">Synergy with NALSA & DSLSA</span>
                  <span>Collaborating on National Lok Adalats, jail inspection visits, and Para-Legal Volunteer (PLV) deployment.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOUR CLINICAL PILLARS */}
      <section className="bg-[#f4f1eb]/70 py-16 px-4 sm:px-6 lg:px-8 border-y border-[#e2ded5]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7b1d28]">
              Clinical Domains
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#0c1829]">
              Four Pillars of Our Clinical Practice
            </h2>
            <p className="text-sm text-gray-600">
              Structured initiatives through which student volunteers and faculty mentors advance constitutional rights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {clinicalPillars.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-[#e2ded5] shadow-xs hover:border-[#c59b43] transition-all hover:shadow-md flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  <div className="w-12 h-12 rounded-lg bg-[#fcfbf9] border border-[#e2ded5] flex items-center justify-center group-hover:bg-[#0c1829] group-hover:text-white transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#0c1829]">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. AAWAZ SCHOLARSHIP SPOTLIGHT (EDITORIAL FEATURE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e2ded5] pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#7b1d28]">
              <BookOpen className="w-4 h-4 text-[#7b1d28]" />
              <span>Academic Scholarship</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0c1829] mt-1">
              AAWAZ — The Socio-Legal Research Blog
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              Empirical field inquiries, constitutional analysis, and access-to-justice commentary authored by student clinicians and scholars.
            </p>
          </div>
          <Link
            to="/aawaz"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#7b1d28] hover:text-[#0c1829] transition-colors shrink-0"
          >
            <span>Explore All AAWAZ Articles</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredBlogs.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-[#e2ded5] text-center space-y-2">
            <BookOpen className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm text-gray-600 font-serif">Articles are published periodically in the AAWAZ repository.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredBlogs.map(blog => {
              const readTime = calculateReadingTime(blog.content, blog.readTime);
              return (
                <article
                  key={blog.id}
                  onClick={() => handleOpenBlog(blog)}
                  className="bg-white rounded-xl border border-[#e2ded5] overflow-hidden shadow-xs hover:border-[#c59b43] transition-all hover:shadow-md cursor-pointer flex flex-col justify-between group"
                >
                  <div className="p-6 space-y-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#7b1d28] bg-rose-50 px-2.5 py-0.5 rounded text-[11px] uppercase tracking-wider">
                        {blog.category}
                      </span>
                      <span className="text-gray-500 flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-[#9b7529]" />
                        <span>{readTime.text}</span>
                      </span>
                    </div>

                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#0c1829] group-hover:text-[#7b1d28] transition-colors leading-snug">
                      {blog.title}
                    </h3>

                    {blog.subtitle && (
                      <p className="text-xs font-serif italic text-gray-600 line-clamp-1">
                        {blog.subtitle}
                      </p>
                    )}

                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed font-sans">
                      {blog.excerpt}
                    </p>
                  </div>

                  <div className="p-4 bg-[#fcfbf9] border-t border-[#e2ded5] flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-1.5 font-medium text-gray-800">
                      <span>{blog.author}</span>
                    </div>
                    <span className="font-bold text-[#0c1829] group-hover:text-[#7b1d28] transition-colors flex items-center gap-1">
                      <span>Read Article</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. OFFICIAL GAZETTE & LATEST NOTIFICATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e2ded5] pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#7b1d28]">
              Official Circulars
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0c1829]">
              Latest Notifications & Society Notices
            </h2>
          </div>
          <Link
            to="/notifications"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0c1829] hover:text-[#9b7529] transition-colors"
          >
            <span>View All Official Circulars</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {latestNotifications.map(item => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-xl border border-[#e2ded5] hover:border-[#c59b43] transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#f4f1eb] text-gray-800 font-semibold rounded uppercase tracking-wider text-[10px]">
                      {item.category}
                    </span>
                    {item.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">
                        <Pin className="w-2.5 h-2.5" /> Pinned
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-[#9b7529]" />
                    {item.date}
                  </span>
                </div>

                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0c1829] line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed">
                  {item.shortDescription || item.content}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#e2ded5] flex items-center justify-between">
                <button
                  onClick={() => setSelectedNotification(item)}
                  className="text-xs font-bold text-[#0c1829] hover:text-[#9b7529] transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Read Full Circular</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                {item.attachmentTitle && (
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-[#9b7529]" />
                    Attachment Available
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. INSTITUTIONAL WORK ARCHIVE & COMPENDIUMS */}
      <section className="bg-[#f4f1eb]/70 py-16 px-4 sm:px-6 lg:px-8 border-y border-[#e2ded5]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e2ded5] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#7b1d28]">
                Institutional Archive
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0c1829]">
                Previous Work Reports & Annual Compendiums
              </h2>
            </div>
            <Link
              to="/reports"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0c1829] hover:text-[#9b7529] transition-colors"
            >
              <span>Browse Full Archival Repository</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredReports.map(report => (
              <div
                key={report.id}
                className="bg-white rounded-xl border border-[#e2ded5] overflow-hidden shadow-xs hover:border-[#c59b43] transition-all flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#9b7529] bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                      Session {report.academicYear}
                    </span>
                    <span className="text-gray-500 font-medium">{report.category}</span>
                  </div>

                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#0c1829]">
                    {report.title}
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {report.description}
                  </p>
                </div>

                <div className="p-4 bg-[#fcfbf9] border-t border-[#e2ded5] flex items-center justify-between">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="text-xs font-bold text-[#0c1829] hover:text-[#9b7529] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Highlights</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-[11px] text-gray-500 flex items-center gap-1 font-mono">
                    <Download className="w-3.5 h-3.5 text-[#9b7529]" />
                    PDF Document
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. GOVERNANCE & MENTORSHIP SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e2ded5] pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#7b1d28]">
              Governance & Leadership
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0c1829]">
              Faculty Mentorship & Executive Volunteers
            </h2>
          </div>
          <Link
            to="/team"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0c1829] hover:text-[#9b7529] transition-colors"
          >
            <span>View Full Team Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamPreview.map(member => (
            <div
              key={member.id}
              className="bg-white p-5 rounded-xl border border-[#e2ded5] shadow-xs text-center space-y-3"
            >
              {/* Photo representation */}
              <div className="w-20 h-20 mx-auto rounded-full bg-[#f4f1eb] border-2 border-[#c59b43] flex items-center justify-center text-[#9b7529]">
                <Users className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#7b1d28] bg-rose-50 px-2 py-0.5 rounded">
                  {member.category}
                </span>
                <h3 className="font-serif text-sm sm:text-base font-bold text-[#0c1829] mt-1">
                  {member.name}
                </h3>
                <p className="text-xs text-gray-500 font-medium">{member.designation}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{member.session}</p>
              </div>

              <p className="text-xs text-gray-600 line-clamp-2 italic font-serif">
                "{member.bio}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 9. STATUTORY CONCLUDING CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#0c1829] to-[#162740] rounded-2xl p-8 sm:p-12 text-white border-2 border-[#c59b43]/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-2xl">
            <span className="text-xs uppercase font-bold tracking-widest text-[#c59b43]">
              Public Service & Clinical Engagement
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Connect With the Legal Aid Society
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
              Whether you are an aspiring student volunteer, an institutional legal researcher, or a citizen requiring guidance on free legal aid mechanisms, our secretariat is at your service.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/resources"
              className="px-5 py-3 bg-[#c59b43] hover:bg-[#e6c887] text-[#0c1829] font-bold text-xs sm:text-sm rounded-md transition-all shadow-md flex items-center gap-2"
            >
              <Scale className="w-4 h-4 text-[#0c1829]" />
              <span>Access Legal Literacy Guides</span>
            </Link>
            <Link
              to="/about"
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm rounded-md transition-all border border-white/20"
            >
              About the Society
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

