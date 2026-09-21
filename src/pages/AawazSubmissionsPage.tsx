import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  Search,
  Calendar,
  Clock,
  Award,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Info,
  Users,
  Send,
  HelpCircle,
  Scale
} from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../components/Toast';
import type { AawazSubmission, AawazSubmissionStatus } from '../types';

export const AawazSubmissionsPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'cfp' | 'guidelines' | 'submit' | 'track'>('cfp');

  // Submission Form State
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorPhone, setAuthorPhone] = useState('');
  const [authorInstitution, setAuthorInstitution] = useState('');
  const [authorDesignation, setAuthorDesignation] = useState('Law Student (LL.B. / B.A. LL.B.)');
  const [authorBio, setAuthorBio] = useState('');

  const [hasCoAuthor, setHasCoAuthor] = useState(false);
  const [coAuthorName, setCoAuthorName] = useState('');
  const [coAuthorEmail, setCoAuthorEmail] = useState('');
  const [coAuthorInstitution, setCoAuthorInstitution] = useState('');
  const [coAuthorDesignation, setCoAuthorDesignation] = useState('');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Access to Justice');
  const [themeOrCFP, setThemeOrCFP] = useState('Special Issue: Technology, Bail Jurisprudence & Underprivileged Litigants');
  const [abstract, setAbstract] = useState('');
  const [wordCount, setWordCount] = useState<number>(2800);
  const [file, setFile] = useState<File | null>(null);
  const [originalityDeclaration, setOriginalityDeclaration] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedManuscript, setSubmittedManuscript] = useState<AawazSubmission | null>(null);
  const [copied, setCopied] = useState(false);

  // Tracking State
  const [trackToken, setTrackToken] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackedManuscript, setTrackedManuscript] = useState<any | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validExtensions = ['.docx', '.doc', '.pdf'];
      const fileExt = selected.name.substring(selected.name.lastIndexOf('.')).toLowerCase();

      if (!validExtensions.includes(fileExt)) {
        showToast('Please upload a Microsoft Word (.docx) or PDF document.', 'error');
        return;
      }

      if (selected.size > 15 * 1024 * 1024) {
        showToast('File size exceeds 15MB limit.', 'error');
        return;
      }

      setFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authorName.trim() || !authorEmail.trim() || !authorInstitution.trim() || !title.trim() || !abstract.trim()) {
      showToast('Please fill all mandatory fields.', 'error');
      return;
    }

    if (!originalityDeclaration) {
      showToast('You must confirm the Declaration of Originality and Academic Integrity.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('authorName', authorName);
      formData.append('authorEmail', authorEmail);
      formData.append('authorPhone', authorPhone);
      formData.append('authorInstitution', authorInstitution);
      formData.append('authorDesignation', authorDesignation);
      formData.append('authorBio', authorBio);
      formData.append('hasCoAuthor', String(hasCoAuthor));

      if (hasCoAuthor) {
        formData.append('coAuthorName', coAuthorName);
        formData.append('coAuthorEmail', coAuthorEmail);
        formData.append('coAuthorInstitution', coAuthorInstitution);
        formData.append('coAuthorDesignation', coAuthorDesignation);
      }

      formData.append('title', title);
      formData.append('category', category);
      formData.append('themeOrCFP', themeOrCFP);
      formData.append('abstract', abstract);
      formData.append('wordCount', String(wordCount));
      formData.append('originalityDeclaration', 'true');

      if (file) {
        formData.append('manuscript', file);
      }

      const res = await fetch('/api/aawaz/submissions', {
        method: 'POST',
        body: formData
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to submit manuscript');
      }

      setSubmittedManuscript(json.submission);
      showToast('Manuscript successfully submitted to the AAWAZ Editorial Board!', 'success');
      window.scrollTo({ top: 300, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error submitting manuscript', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackToken.trim()) {
      showToast('Please enter your manuscript tracking token or registered author email.', 'error');
      return;
    }

    setIsTracking(true);
    setTrackingError(null);
    setTrackedManuscript(null);

    try {
      const clean = encodeURIComponent(trackToken.trim());
      const res = await fetch(`/api/aawaz/submissions/track/${clean}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'No manuscript record found');
      }

      setTrackedManuscript(json);
      showToast('Manuscript record retrieved successfully.', 'success');
    } catch (err: any) {
      setTrackingError(err.message || 'Unable to locate manuscript record');
      showToast(err.message || 'Record not found', 'error');
    } finally {
      setIsTracking(false);
    }
  };

  const copyToken = (tok: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(tok);
      setCopied(true);
      showToast('Tracking token copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const resetForm = () => {
    setSubmittedManuscript(null);
    setTitle('');
    setAbstract('');
    setFile(null);
    setOriginalityDeclaration(false);
  };

  const getStatusBadge = (status: AawazSubmissionStatus) => {
    switch (status) {
      case 'Accepted for Publication':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Accepted for Publication
          </span>
        );
      case 'Under Editorial Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Blind Peer Review in Progress
          </span>
        );
      case 'Revision Requested':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold border border-blue-300">
            <AlertCircle className="w-3.5 h-3.5 text-blue-600" /> Author Revision Requested
          </span>
        );
      case 'Declined':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold border border-gray-300">
            Declined (Does not fit scope)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold border border-indigo-300">
            <FileText className="w-3.5 h-3.5 text-indigo-600" /> Manuscript Submitted & Acknowledged
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-[#2d3748] pb-16">
      {/* 1. EDITORIAL MASTHEAD */}
      <section className="bg-[#0c1829] text-white border-b-4 border-[#c59b43] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#c59b43_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c59b43]/20 border border-[#c59b43]/40 text-[#e6ca85] text-xs font-semibold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-[#c59b43]" />
                <span>AAWAZ: Voice of Legal Aid • Academic Submissions</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                Submissions Portal & Peer-Review Guidelines
              </h1>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-sans">
                The flagship publication of the Legal Aid Society, Campus Law Centre, Faculty of Law, University of Delhi. Inviting original legal research, judicial critiques, and clinical socio-legal reflections.
              </p>
            </div>

            {/* Quick Links / Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link
                to="/aawaz"
                className="px-5 py-2.5 bg-[#162740] hover:bg-[#1f3454] text-gray-200 font-semibold text-xs rounded-lg transition-colors border border-white/10 flex items-center justify-center gap-2"
              >
                <span>Browse Published Articles</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#c59b43]" />
              </Link>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-3 mt-10 border-b border-white/10 overflow-x-auto">
            <button
              onClick={() => setActiveTab('cfp')}
              className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border-b-2 ${
                activeTab === 'cfp'
                  ? 'border-[#c59b43] text-[#c59b43]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Call for Papers & Calendar</span>
            </button>
            <button
              onClick={() => setActiveTab('guidelines')}
              className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border-b-2 ${
                activeTab === 'guidelines'
                  ? 'border-[#c59b43] text-[#c59b43]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Submission Guidelines & Citation</span>
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border-b-2 ${
                activeTab === 'submit'
                  ? 'border-[#c59b43] text-[#c59b43]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Submit Manuscript</span>
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border-b-2 ${
                activeTab === 'track'
                  ? 'border-[#c59b43] text-[#c59b43]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Track Submission Status</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. MAIN BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB 1: CALL FOR PAPERS (CFP) & EDITORIAL CALENDAR */}
        {activeTab === 'cfp' && (
          <div className="space-y-10">
            {/* Thematic CFP Spotlight Card */}
            <div className="bg-gradient-to-br from-[#0c1829] to-[#162740] text-white rounded-2xl p-6 sm:p-10 border-2 border-[#c59b43] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Scale className="w-48 h-48 text-[#c59b43]" />
              </div>

              <div className="max-w-3xl space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c59b43]/20 border border-[#c59b43]/40 text-[#e6ca85] text-xs font-bold uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5 text-[#c59b43]" />
                  <span>Call for Papers • Vol. IV, Issue 2</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
                  Special Thematic Issue: "Technology, Bail Jurisprudence & Underprivileged Litigants"
                </h2>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                  The Editorial Board of AAWAZ invites manuscripts exploring how the rapid digitization of Indian justice systems impacts undertrial prisoners, daily-wage litigants, and marginalized citizens. We welcome both doctrinal analyses and clinical case field reports.
                </p>

                {/* Sub-Themes */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-[#c59b43] uppercase tracking-wider block mb-2">
                    Illustrative Sub-Themes:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#c59b43] shrink-0 mt-0.5" />
                      <span>E-Courts & the digital divide: Access barriers for unrepresented litigants.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#c59b43] shrink-0 mt-0.5" />
                      <span>Section 479 Bharatiya Nagarik Suraksha Sanhita (BNSS) and pre-trial bail reforms.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#c59b43] shrink-0 mt-0.5" />
                      <span>Automated risk assessments, algorithms, and constitutional liberty under Article 21.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#c59b43] shrink-0 mt-0.5" />
                      <span>Para-Legal Volunteers (PLVs) as frontline technological navigators in rural clinics.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => setActiveTab('submit')}
                    className="px-6 py-3 bg-[#c59b43] hover:bg-[#b08734] text-[#0c1829] font-serif font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2"
                  >
                    <span>Submit Manuscript for this Issue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveTab('guidelines')}
                    className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all cursor-pointer border border-white/20"
                  >
                    View Citation & Formatting Rules
                  </button>
                </div>
              </div>
            </div>

            {/* Editorial Calendar Table */}
            <div className="bg-white rounded-2xl border border-[#e2ded5] p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-[#7b1d28] font-serif font-bold text-lg border-b border-[#e2ded5] pb-3">
                <Clock className="w-5 h-5 text-[#9b7529]" />
                <span>Editorial Calendar & Turnaround Timelines</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#e2ded5] text-gray-500 font-semibold uppercase tracking-wider bg-[#fcfbf9]">
                      <th className="py-3 px-4">Editorial Stage</th>
                      <th className="py-3 px-4">Timeline / Window</th>
                      <th className="py-3 px-4">Action & Expectations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Submission Acknowledgement</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-600">Within 48 hours</td>
                      <td className="py-3.5 px-4">Official tracking token generated; initial editorial scope validation.</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>Plagiarism & First-Cut Review</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-600">5 - 7 Days</td>
                      <td className="py-3.5 px-4">Rigorous similarity check (&lt;10% threshold) and grammar review.</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>Double-Blind Peer Review</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-600">14 - 21 Days</td>
                      <td className="py-3.5 px-4">Evaluated by Senior Student Editors & Faculty Advisors on originality and legal rigor.</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        <span>Decision & Author Revisions</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-600">7 Days for Revisions</td>
                      <td className="py-3.5 px-4">Detailed referee feedback communicated; authors revise citations and text.</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-emerald-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#c59b43]" />
                        <span>Final Publication & Dissemination</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-600">Within 30 Days</td>
                      <td className="py-3.5 px-4">Published on AAWAZ portal, indexed with citation handles, and circulated to legal aid clinics nationwide.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rolling Submissions Notice */}
            <div className="bg-[#f4f1eb] p-6 rounded-2xl border border-[#e2ded5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-serif font-bold text-sm text-[#0c1829] block">
                  Year-Round Rolling Submissions
                </span>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Apart from thematic special issues, AAWAZ accepts manuscripts on a rolling basis across all domains of constitutional law, criminal justice, legal literacy, and human rights.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('submit')}
                className="px-5 py-2.5 bg-[#0c1829] hover:bg-[#162740] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Submit General Manuscript
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SUBMISSION GUIDELINES & CITATION */}
        {activeTab === 'guidelines' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-[#e2ded5] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-[#e2ded5] pb-4 space-y-1">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0c1829]">
                  Author Submission Guidelines & Editorial Standards
                </h2>
                <p className="text-xs text-gray-600">
                  Please review these editorial standards carefully before submitting your manuscript to ensure expedited review.
                </p>
              </div>

              {/* Word Counts */}
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-sm text-[#7b1d28] uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>1. Manuscript Categories & Word Limits</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-[#fcfbf9] border border-[#e2ded5] rounded-xl space-y-2">
                    <span className="font-bold text-gray-900 block text-sm">Short Commentary</span>
                    <span className="font-mono text-[#c59b43] font-bold block">1,500 – 2,500 Words</span>
                    <p className="text-gray-600">Concise analysis of recent Supreme Court/High Court verdicts or legislative amendments.</p>
                  </div>
                  <div className="p-4 bg-[#fcfbf9] border border-[#e2ded5] rounded-xl space-y-2">
                    <span className="font-bold text-gray-900 block text-sm">Socio-Legal Essay</span>
                    <span className="font-mono text-[#c59b43] font-bold block">3,000 – 5,000 Words</span>
                    <p className="text-gray-600">In-depth doctrinal research, comparative jurisprudence, or empirical field study.</p>
                  </div>
                  <div className="p-4 bg-[#fcfbf9] border border-[#e2ded5] rounded-xl space-y-2">
                    <span className="font-bold text-gray-900 block text-sm">Clinical Reflection</span>
                    <span className="font-mono text-[#c59b43] font-bold block">1,000 – 2,000 Words</span>
                    <p className="text-gray-600">First-person case reflections from legal literacy camps, jail visits, or Lok Adalat desks.</p>
                  </div>
                </div>
              </div>

              {/* Citation Standards */}
              <div className="space-y-3 pt-4 border-t border-[#e2ded5]">
                <h3 className="font-serif font-bold text-sm text-[#7b1d28] uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>2. Citation Standards (Bluebook / ILI)</span>
                </h3>
                <div className="text-xs text-gray-700 space-y-2 leading-relaxed bg-[#f4f1eb] p-4 rounded-xl border border-[#e2ded5]">
                  <p>
                    AAWAZ strictly enforces uniform citation practices. Authors must follow either the <span className="font-bold text-gray-900">Harvard Bluebook (21st Edition)</span> or the <span className="font-bold text-gray-900">Indian Law Institute (ILI)</span> format in footnotes:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 pl-1 font-mono text-[11px]">
                    <li>Case Citation: <em>Hussainara Khatoon v. Home Secretary, State of Bihar</em>, (1980) 1 SCC 81.</li>
                    <li>Statutory Citation: The Legal Services Authorities Act, 1987, § 12(c), No. 39, Acts of Parliament, 1987 (India).</li>
                    <li>Book Citation: Upendra Baxi, <em>The Crisis of the Indian Legal System</em> 45 (Vikas Publishing, 1982).</li>
                    <li>Journal Citation: S. Muralidhar, <em>Law, Poverty and Legal Aid: Access to Criminal Justice</em>, 46 JILI 120 (2004).</li>
                  </ul>
                  <p className="text-[11px] text-gray-600 italic">
                    * Speaking footnotes are permitted. Pure hyperlinks or endnotes are discouraged.
                  </p>
                </div>
              </div>

              {/* Formatting and Originality */}
              <div className="space-y-3 pt-4 border-t border-[#e2ded5]">
                <h3 className="font-serif font-bold text-sm text-[#7b1d28] uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>3. Formatting & Plagiarism Policy</span>
                </h3>
                <div className="space-y-2 text-xs text-gray-700 leading-relaxed">
                  <p>
                    • <strong>Font & Spacing:</strong> Times New Roman, Font Size 12 for main text (1.5 line spacing) and Font Size 10 for footnotes (1.0 line spacing). Margin 1-inch on all sides.
                  </p>
                  <p>
                    • <strong>File Format:</strong> Manuscripts must be uploaded in Microsoft Word (<code>.docx</code>) or <code>.pdf</code> format.
                  </p>
                  <p>
                    • <strong>Originality Threshold:</strong> All manuscripts undergo automated similarity screening. Any submission exceeding <strong>10% similarity</strong> (excluding citations and statutory text) will be rejected summarily.
                  </p>
                  <p>
                    • <strong>Anonymity for Peer Review:</strong> The manuscript document itself should NOT contain author names, institutional affiliations, or acknowledgments to maintain blind review integrity. Author details are collected separately in the submission form.
                  </p>
                  <p>
                    • <strong>Co-Authorship:</strong> Co-authorship is permitted up to a maximum of <strong>two (2) authors</strong>.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#e2ded5] flex justify-end">
                <button
                  onClick={() => setActiveTab('submit')}
                  className="px-6 py-3 bg-[#0c1829] hover:bg-[#162740] text-white font-serif font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <span>Proceed to Manuscript Submission</span>
                  <ArrowRight className="w-4 h-4 text-[#c59b43]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUBMIT MANUSCRIPT FORM */}
        {activeTab === 'submit' && (
          <div>
            {submittedManuscript ? (
              /* CONFIRMATION CARD */
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border-2 border-[#c59b43] shadow-2xl p-6 sm:p-10 max-w-3xl mx-auto space-y-6"
              >
                <div className="flex items-center gap-3 text-emerald-700 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <h3 className="font-serif font-bold text-lg text-emerald-900">
                      Manuscript Successfully Received
                    </h3>
                    <p className="text-xs text-emerald-800">
                      Your article has been submitted to the AAWAZ Editorial Board for blind peer review.
                    </p>
                  </div>
                </div>

                {/* Tracking Token Box */}
                <div className="bg-[#0c1829] text-white p-6 rounded-xl border border-[#c59b43]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-xs uppercase tracking-widest text-[#c59b43] font-bold">
                      Manuscript Tracking Token
                    </span>
                    <div className="font-mono text-2xl sm:text-3xl font-bold tracking-wider text-white">
                      {submittedManuscript.trackingToken}
                    </div>
                    <span className="text-[11px] text-gray-400 block">
                      Use this token in the "Track Submission Status" tab to monitor referee evaluations and review decisions.
                    </span>
                  </div>

                  <button
                    onClick={() => copyToken(submittedManuscript.trackingToken)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#c59b43] hover:bg-[#b08734] text-[#0c1829] font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-md shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copied ? 'Copied!' : 'Copy Token'}</span>
                  </button>
                </div>

                {/* Submitted Particulars */}
                <div className="bg-[#fcfbf9] border border-[#e2ded5] rounded-xl p-5 text-xs space-y-3">
                  <div className="font-serif font-bold text-sm text-[#0c1829] border-b border-[#e2ded5] pb-2">
                    Submission Details
                  </div>
                  <div className="space-y-2 text-gray-700">
                    <div>
                      <span className="text-gray-500 block">Manuscript Title:</span>
                      <span className="font-bold text-gray-900 text-sm">{submittedManuscript.title}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-gray-500 block">Primary Author:</span>
                        <span className="font-semibold text-gray-900">{submittedManuscript.authorName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Affiliation:</span>
                        <span className="font-semibold text-gray-900">{submittedManuscript.authorInstitution}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Category & Theme:</span>
                        <span className="font-semibold text-[#7b1d28]">{submittedManuscript.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Word Count:</span>
                        <span className="font-mono font-semibold text-gray-900">~{submittedManuscript.wordCount} words</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={resetForm}
                    className="px-5 py-2.5 bg-[#0c1829] hover:bg-[#162740] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Submit Another Manuscript
                  </button>
                </div>
              </motion.div>
            ) : (
              /* SUBMISSION FORM */
              <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#e2ded5] p-6 sm:p-8 shadow-xs space-y-8">
                <div className="border-b border-[#e2ded5] pb-4 space-y-1">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0c1829]">
                    Manuscript Submission Form
                  </h2>
                  <p className="text-xs text-gray-600">
                    Submit your legal analysis or empirical article for consideration in AAWAZ: Voice of Legal Aid.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 1. Primary Author Particulars */}
                  <div className="space-y-4">
                    <div className="font-serif font-bold text-sm text-[#7b1d28] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-1.5">
                      <Users className="w-4 h-4" />
                      <span>1. Primary Author Details</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={authorName}
                          onChange={e => setAuthorName(e.target.value)}
                          placeholder="e.g. Ananya Sen"
                          className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Institutional / Personal Email <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={authorEmail}
                          onChange={e => setAuthorEmail(e.target.value)}
                          placeholder="e.g. ananya@clc.du.ac.in"
                          className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Contact Phone Number
                        </label>
                        <input
                          type="tel"
                          value={authorPhone}
                          onChange={e => setAuthorPhone(e.target.value)}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          University / Law College / Affiliation <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={authorInstitution}
                          onChange={e => setAuthorInstitution(e.target.value)}
                          placeholder="e.g. Campus Law Centre, University of Delhi"
                          className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Designation / Year of Study
                        </label>
                        <input
                          type="text"
                          value={authorDesignation}
                          onChange={e => setAuthorDesignation(e.target.value)}
                          placeholder="e.g. 2nd Year LL.B. Student / Assistant Professor"
                          className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Short Author Bio (max 50 words)
                        </label>
                        <input
                          type="text"
                          value={authorBio}
                          onChange={e => setAuthorBio(e.target.value)}
                          placeholder="e.g. Student editor focusing on undertrial bail and legal literacy."
                          className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Co-author option */}
                    <div className="bg-[#fcfbf9] p-3.5 rounded-lg border border-[#e2ded5] space-y-3">
                      <label className="flex items-center gap-2.5 text-xs text-gray-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={hasCoAuthor}
                          onChange={e => setHasCoAuthor(e.target.checked)}
                          className="w-4 h-4 text-[#0c1829] rounded border-gray-300 focus:ring-[#c59b43]"
                        />
                        <span className="font-medium">
                          This manuscript has a Co-Author (Maximum 1 co-author permitted).
                        </span>
                      </label>

                      {hasCoAuthor && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Co-Author Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required={hasCoAuthor}
                              value={coAuthorName}
                              onChange={e => setCoAuthorName(e.target.value)}
                              placeholder="Co-Author Name"
                              className="w-full px-3 py-2 bg-white border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Co-Author Email <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="email"
                              required={hasCoAuthor}
                              value={coAuthorEmail}
                              onChange={e => setCoAuthorEmail(e.target.value)}
                              placeholder="coauthor@institution.edu"
                              className="w-full px-3 py-2 bg-white border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Co-Author University / Affiliation
                            </label>
                            <input
                              type="text"
                              value={coAuthorInstitution}
                              onChange={e => setCoAuthorInstitution(e.target.value)}
                              placeholder="University / College Name"
                              className="w-full px-3 py-2 bg-white border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Manuscript Details */}
                  <div className="space-y-4">
                    <div className="font-serif font-bold text-sm text-[#7b1d28] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-1.5">
                      <FileText className="w-4 h-4" />
                      <span>2. Manuscript Particulars</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Manuscript Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Rethinking Default Bail under Section 187 BNSS: Safeguarding Indigent Undertrials"
                        className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none font-serif"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Subject Domain / Category <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={category}
                          onChange={e => setCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none cursor-pointer"
                        >
                          <option value="Access to Justice">Access to Justice</option>
                          <option value="Constitutional Law">Constitutional Law</option>
                          <option value="Prison Reforms">Prison Reforms</option>
                          <option value="Human Rights">Human Rights</option>
                          <option value="Field Insights">Field Insights</option>
                          <option value="Case Commentary">Case Commentary</option>
                          <option value="Women & Child Rights">Women & Child Rights</option>
                          <option value="General Legal Aid">General Legal Aid</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Target Theme or Call for Papers (CFP)
                        </label>
                        <input
                          type="text"
                          value={themeOrCFP}
                          onChange={e => setThemeOrCFP(e.target.value)}
                          placeholder="e.g. Special Issue on Technology & Bail or General Cycle"
                          className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Abstract (max 250 words) <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={abstract}
                        onChange={e => setAbstract(e.target.value)}
                        placeholder="Provide a crisp summary of the central thesis, methodology, arguments, and conclusions of the paper..."
                        className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none resize-y"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Approximate Word Count (Excl. Footnotes) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min={800}
                          max={10000}
                          value={wordCount}
                          onChange={e => setWordCount(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Attach Manuscript File (.docx / .pdf)
                        </label>
                        <input
                          type="file"
                          accept=".docx,.doc,.pdf"
                          onChange={handleFileChange}
                          className="w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#0c1829] file:text-white hover:file:bg-[#162740] file:cursor-pointer"
                        />
                        {file && (
                          <span className="text-[11px] text-emerald-700 font-medium block mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Attached: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3. Originality Declaration */}
                  <div className="bg-[#f4f1eb] p-4 rounded-xl border border-[#e2ded5] space-y-3">
                    <label className="flex items-start gap-2.5 text-xs text-gray-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        required
                        checked={originalityDeclaration}
                        onChange={e => setOriginalityDeclaration(e.target.checked)}
                        className="w-4 h-4 text-[#0c1829] rounded border-gray-300 focus:ring-[#c59b43] mt-0.5"
                      />
                      <span className="leading-relaxed">
                        <strong>Declaration of Academic Integrity:</strong> I/we affirm that this manuscript is our original work, has not been published elsewhere, and is not currently under concurrent review by any other journal, law review, or blog. I confirm adherence to the AAWAZ plagiarism threshold (&lt;10%).
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#0c1829] hover:bg-[#162740] text-white font-serif font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Uploading Manuscript & Generating Tracking Token...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-[#c59b43]" />
                        <span>Submit Manuscript to Editorial Board</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TRACK SUBMISSION STATUS */}
        {activeTab === 'track' && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-white rounded-2xl border border-[#e2ded5] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-[#e2ded5] pb-4 space-y-1">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0c1829]">
                  Track Editorial Review Status
                </h2>
                <p className="text-xs text-gray-600">
                  Enter your official manuscript tracking code (e.g. <span className="font-mono font-bold text-[#7b1d28]">AAWAZ-MS-2026-XXXX</span>) or author email.
                </p>
              </div>

              <form onSubmit={handleTrack} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    required
                    value={trackToken}
                    onChange={e => setTrackToken(e.target.value)}
                    placeholder="Enter Token (e.g. AAWAZ-MS-2026-4401) or Author Email"
                    className="flex-1 px-4 py-3 bg-[#fcfbf9] border border-[#e2ded5] rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-[#c59b43] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isTracking}
                    className="px-6 py-3 bg-[#0c1829] hover:bg-[#162740] text-white font-serif font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs shrink-0 disabled:opacity-50"
                  >
                    {isTracking ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 text-[#c59b43]" />
                    )}
                    <span>Check Review Stage</span>
                  </button>
                </div>
              </form>

              {/* Error State */}
              {trackingError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Manuscript Record Not Found</span>
                    <span>{trackingError}. Please verify the token formatting or contact the student editorial desk.</span>
                  </div>
                </div>
              )}

              {/* Tracked Record Card */}
              {trackedManuscript && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#fcfbf9] border-2 border-[#c59b43] rounded-xl p-6 space-y-6 shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2ded5] pb-4">
                    <div>
                      <span className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">
                        Tracking Token
                      </span>
                      <div className="font-mono text-xl font-bold text-[#0c1829]">
                        {trackedManuscript.trackingToken}
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(trackedManuscript.status)}
                    </div>
                  </div>

                  <div className="space-y-3 text-xs text-gray-700">
                    <div>
                      <span className="text-gray-500 block">Title:</span>
                      <span className="font-serif font-bold text-gray-900 text-sm">{trackedManuscript.title}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-gray-500 block">Primary Author:</span>
                        <span className="font-semibold text-gray-900">{trackedManuscript.authorName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Category:</span>
                        <span className="font-semibold text-gray-900">{trackedManuscript.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Target CFP / Theme:</span>
                        <span className="font-semibold text-gray-900">{trackedManuscript.themeOrCFP}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Submitted On:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(trackedManuscript.submittedAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-[#e2ded5] text-xs text-gray-600">
                    <span className="font-bold text-gray-800 block mb-1">Peer Review Status Note:</span>
                    <span>Editorial communications and blind reviewer feedback will be dispatched to your registered email upon conclusion of the review cycle.</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* 3. SUBMISSION FAQ */}
        <section className="mt-16 pt-12 border-t border-[#e2ded5] max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7b1d28]">
              Frequently Asked Questions
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0c1829]">
              Queries Regarding AAWAZ Submissions & Peer Review
            </h2>
          </div>

          <div className="space-y-3 pt-4">
            {[
              {
                q: 'Who is eligible to submit manuscripts to AAWAZ?',
                a: 'Students enrolled in 3-Year LL.B. or 5-Year Integrated Law programs across all recognized Indian universities, LL.M. candidates, judicial research clerks, advocate practitioners, and academic scholars.'
              },
              {
                q: 'Is there any publication or submission fee?',
                a: 'None whatsoever. AAWAZ is a fully non-profit, student-administered institutional journal published under the auspices of Campus Law Centre, Faculty of Law, University of Delhi. We never levy article processing charges (APC) or submission fees.'
              },
              {
                q: 'Are cross-disciplinary socio-legal articles accepted?',
                a: 'Yes. In fact, AAWAZ strongly values empirical field research, sociological studies of prison conditions, statistical evaluations of Lok Adalat efficiency, and clinical reflections from community legal literacy camps.'
              },
              {
                q: 'What is the copyright and licensing policy?',
                a: 'Authors retain copyright in their work while granting AAWAZ the license of first publication. All articles are distributed under the Creative Commons Attribution-NonCommercial (CC BY-NC 4.0) license to maximize educational reach.'
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-[#e2ded5] rounded-xl overflow-hidden shadow-2xs">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left font-serif font-semibold text-xs sm:text-sm text-[#0c1829] flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#9b7529] transition-transform duration-200 shrink-0 ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-gray-700 leading-relaxed font-sans border-t border-gray-100 pt-3 bg-[#fcfbf9]">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
