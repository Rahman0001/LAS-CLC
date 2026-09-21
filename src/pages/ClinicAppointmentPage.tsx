import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  Printer,
  Search,
  UserCheck,
  ArrowRight,
  Info,
  ChevronDown,
  Building,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../components/Toast';
import type { ClinicAppointment, ClinicConsultationMode, ClinicAppointmentStatus } from '../types';

export const ClinicAppointmentPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'request' | 'track'>('request');

  // Intake form state
  const [fullName, setFullName] = useState('');
  const [isRepresentative, setIsRepresentative] = useState(false);
  const [representativeName, setRepresentativeName] = useState('');
  const [relationshipToLitigant, setRelationshipToLitigant] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('North Delhi');
  const [consultationMode, setConsultationMode] = useState<ClinicConsultationMode>('In-Person (CLC Campus Clinic)');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('Morning (10:00 AM - 1:00 PM)');
  const [legalDomain, setLegalDomain] = useState('Labour / Wages / Unorganized Workers');
  const [caseDescription, setCaseDescription] = useState('');
  const [hasExistingCourtCase, setHasExistingCourtCase] = useState(false);
  const [courtCaseDetails, setCourtCaseDetails] = useState('');
  const [qualifiesUnderSection12, setQualifiesUnderSection12] = useState(true);
  const [section12Category, setSection12Category] = useState('Annual Income below ₹3,00,000 / Marginalized');
  const [documentsSummary, setDocumentsSummary] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAppointment, setSubmittedAppointment] = useState<ClinicAppointment | null>(null);

  // Tracking state
  const [searchToken, setSearchToken] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackedAppointment, setTrackedAppointment] = useState<any | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  // Copied token status
  const [copied, setCopied] = useState(false);

  // Open FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !address.trim() || !caseDescription.trim()) {
      showToast('Please fill in all mandatory fields indicated with an asterisk (*).', 'error');
      return;
    }

    if (phone.replace(/[^0-9]/g, '').length < 10) {
      showToast('Please provide a valid 10-digit mobile contact number.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/clinic/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          isRepresentative,
          representativeName: isRepresentative ? representativeName : undefined,
          relationshipToLitigant: isRepresentative ? relationshipToLitigant : undefined,
          phone,
          email: email || undefined,
          address,
          district,
          consultationMode,
          preferredDate: preferredDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          preferredTimeSlot,
          legalDomain,
          caseDescription,
          hasExistingCourtCase,
          courtCaseDetails: hasExistingCourtCase ? courtCaseDetails : undefined,
          qualifiesUnderSection12,
          section12Category: qualifiesUnderSection12 ? section12Category : 'General Public Aid',
          documentsSummary,
          honeypot
        })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to submit consultation request');
      }

      setSubmittedAppointment(json.appointment);
      showToast('Consultation request lodged successfully!', 'success');
      // Scroll smoothly to confirmation
      window.scrollTo({ top: 300, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error submitting consultation request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchToken.trim()) {
      showToast('Please enter your tracking token or registered phone number.', 'error');
      return;
    }

    setIsTracking(true);
    setTrackingError(null);
    setTrackedAppointment(null);

    try {
      const clean = encodeURIComponent(searchToken.trim());
      const res = await fetch(`/api/clinic/appointments/track/${clean}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'No appointment record found');
      }

      setTrackedAppointment(json);
      showToast('Consultation record retrieved successfully.', 'success');
    } catch (err: any) {
      setTrackingError(err.message || 'Unable to locate appointment record');
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

  const printReceipt = () => {
    window.print();
  };

  const resetForm = () => {
    setSubmittedAppointment(null);
    setFullName('');
    setIsRepresentative(false);
    setRepresentativeName('');
    setRelationshipToLitigant('');
    setPhone('');
    setEmail('');
    setAddress('');
    setCaseDescription('');
    setCourtCaseDetails('');
    setHasExistingCourtCase(false);
    setDocumentsSummary('');
  };

  const legalDomainsList = [
    'Labour / Wages / Unorganized Workers',
    'Matrimonial / Family Disputes / Maintenance',
    'Criminal Defence / Bail / Undertrial Aid',
    'Property / Tenancy / Eviction Disputes',
    'Consumer Protection & Financial Frauds',
    'Motor Accident Claims (MACT)',
    'Fundamental Rights & Police Misconduct',
    'Senior Citizen Maintenance & Welfare',
    'Women & Domestic Violence Protections',
    'Other Statutory Grievances'
  ];

  const section12CategoriesList = [
    'Annual Income below ₹3,00,000 / Marginalized',
    'Woman or Child',
    'Member of Scheduled Caste (SC) or Scheduled Tribe (ST)',
    'Industrial Workman / Unorganized Daily Wage Earner',
    'Person in Custody / Undertrial Prisoner',
    'Person with Disability or Mental Illness',
    'Victim of Human Trafficking or Beggary',
    'Victim of Mass Disaster, Violence, or Caste Atrocity'
  ];

  const delhiDistricts = [
    'North Delhi (Civil Lines / Tis Hazari jurisdiction)',
    'Central Delhi',
    'New Delhi (Patiala House jurisdiction)',
    'South Delhi (Saket jurisdiction)',
    'South-East Delhi',
    'South-West Delhi (Dwarka jurisdiction)',
    'West Delhi',
    'North-West Delhi (Rohini jurisdiction)',
    'North-East Delhi (Karkardooma jurisdiction)',
    'East Delhi',
    'Shahdara',
    'NCR / Other Regions'
  ];

  const getStatusBadge = (status: ClinicAppointmentStatus) => {
    switch (status) {
      case 'Scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Scheduled & Assigned
          </span>
        );
      case 'In Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Under Scrutiny by PLVs
          </span>
        );
      case 'Documents Required':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold border border-rose-300">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Supplementary Documents Required
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold border border-blue-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Consultation Completed
          </span>
        );
      case 'Referred to DSLSA':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold border border-purple-300">
            <Scale className="w-3.5 h-3.5 text-purple-600" /> Referred to Statutory DLSA Panel
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold border border-gray-300">
            <Clock className="w-3.5 h-3.5 text-gray-600" /> Request Logged (Pending Review)
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-[#2d3748] pb-16">
      {/* 1. EDITORIAL HEADER */}
      <section className="bg-[#0c1829] text-white border-b-4 border-[#c59b43] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#c59b43_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c59b43]/20 border border-[#c59b43]/40 text-[#e6ca85] text-xs font-semibold uppercase tracking-wider">
                <Scale className="w-3.5 h-3.5 text-[#c59b43]" />
                <span>Statutory Clinical Service • Article 39A</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                Legal Aid Clinic & Consultation Intake
              </h1>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-sans">
                Providing confidential, pro-bono legal consultation, grievance assessment, pre-litigation counseling, and referral to District Legal Services Authorities (DLSA) for citizens and indigent litigants.
              </p>
            </div>

            {/* Quick Clinic Info Box */}
            <div className="bg-[#162740] border border-[#c59b43]/30 rounded-xl p-5 text-xs text-gray-300 space-y-2.5 shrink-0 sm:max-w-xs shadow-lg">
              <div className="font-serif font-bold text-white text-sm flex items-center gap-2 border-b border-white/10 pb-2">
                <Building className="w-4 h-4 text-[#c59b43]" />
                <span>Clinic Desk Location</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#c59b43] shrink-0 mt-0.5" />
                <span>Room No. 102, Ground Floor, Campus Law Centre, Chhatra Marg, North Campus, Delhi - 110007</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#c59b43] shrink-0" />
                <span>Mon to Fri: 10:00 AM – 5:00 PM IST</span>
              </div>
              <div className="flex items-center gap-2 text-[#c59b43] font-medium pt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Free Public Service</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-3 mt-10 border-b border-white/10">
            <button
              onClick={() => setActiveTab('request')}
              className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
                activeTab === 'request'
                  ? 'border-[#c59b43] text-[#c59b43]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Schedule Consultation (Intake Form)</span>
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
                activeTab === 'track'
                  ? 'border-[#c59b43] text-[#c59b43]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Track Consultation Status</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'request' ? (
          <div>
            {submittedAppointment ? (
              /* SUCCESS CONFIRMATION RECEIPT */
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border-2 border-[#c59b43] shadow-2xl p-6 sm:p-10 max-w-3xl mx-auto space-y-6"
              >
                <div className="flex items-center gap-3 text-emerald-700 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <h3 className="font-serif font-bold text-lg text-emerald-900">
                      Consultation Request Successfully Lodged
                    </h3>
                    <p className="text-xs text-emerald-800">
                      Your legal intake request has been registered in the Campus Law Centre Legal Aid Society registry.
                    </p>
                  </div>
                </div>

                {/* Token Box */}
                <div className="bg-[#0c1829] text-white p-6 rounded-xl border border-[#c59b43]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-xs uppercase tracking-widest text-[#c59b43] font-bold">
                      Your Official Tracking Token
                    </span>
                    <div className="font-mono text-2xl sm:text-3xl font-bold tracking-wider text-white">
                      {submittedAppointment.trackingToken}
                    </div>
                    <span className="text-[11px] text-gray-400 block">
                      Save this token to track appointment date, assigned volunteer bench, and updates.
                    </span>
                  </div>

                  <button
                    onClick={() => copyToken(submittedAppointment.trackingToken)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#c59b43] hover:bg-[#b08734] text-[#0c1829] font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-md shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copied ? 'Copied!' : 'Copy Token'}</span>
                  </button>
                </div>

                {/* Summary Table */}
                <div className="bg-[#fcfbf9] border border-[#e2ded5] rounded-xl p-5 text-xs space-y-3">
                  <div className="font-serif font-bold text-sm text-[#0c1829] border-b border-[#e2ded5] pb-2">
                    Intake Case Particulars
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
                    <div>
                      <span className="text-gray-500 block">Applicant / Litigant:</span>
                      <span className="font-semibold text-gray-900">{submittedAppointment.fullName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Contact Phone:</span>
                      <span className="font-semibold text-gray-900">{submittedAppointment.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Legal Grievance Domain:</span>
                      <span className="font-semibold text-gray-900">{submittedAppointment.legalDomain}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Consultation Mode:</span>
                      <span className="font-semibold text-[#7b1d28]">{submittedAppointment.consultationMode}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Preferred Schedule:</span>
                      <span className="font-semibold text-gray-900">
                        {submittedAppointment.preferredDate} ({submittedAppointment.preferredTimeSlot})
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Residential District:</span>
                      <span className="font-semibold text-gray-900">{submittedAppointment.district}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#e2ded5]">
                    <span className="text-gray-500 block">Brief Matter Description:</span>
                    <p className="text-gray-800 italic mt-0.5">{submittedAppointment.caseDescription}</p>
                  </div>
                </div>

                {/* Important Next Steps */}
                <div className="bg-[#f4f1eb] p-5 rounded-xl border border-[#e2ded5] space-y-2 text-xs text-gray-700">
                  <div className="font-bold text-[#0c1829] flex items-center gap-2 text-sm font-serif">
                    <Info className="w-4 h-4 text-[#9b7529]" />
                    <span>Visiting Instructions & What to Bring</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 pl-1">
                    <li>Please bring this Tracking Token or your registered mobile phone when visiting the clinic.</li>
                    <li>Bring photocopies of all relevant documents: Government ID (Aadhaar / Voter ID), FIR or police complaint, court summons or notices, land or rental agreements, employment records.</li>
                    <li>Consultations are conducted in strict confidentiality under the supervision of Faculty Conveners and trained Para-Legal Volunteers.</li>
                    <li>If referred to the Delhi State Legal Services Authority (DSLSA), an empanelled legal advocate will be assigned to represent you free of charge.</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={printReceipt}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#e2ded5] hover:bg-gray-50 text-gray-800 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-gray-600" />
                    <span>Print Receipt</span>
                  </button>

                  <button
                    onClick={resetForm}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0c1829] hover:bg-[#162740] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Submit Another Request</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              /* INTAKE FORM */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Column (8 cols) */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-[#e2ded5] p-6 sm:p-8 shadow-xs space-y-8">
                  <div className="border-b border-[#e2ded5] pb-4 space-y-1">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0c1829]">
                      Legal Intake & Consultation Form
                    </h2>
                    <p className="text-xs text-gray-600">
                      All communications made to the Campus Law Centre Legal Aid Society are strictly confidential and privileged under the Advocates Act & Legal Services Authorities Act.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Honeypot for spam bot prevention */}
                    <input
                      type="text"
                      name="honeypot"
                      value={honeypot}
                      onChange={e => setHoneypot(e.target.value)}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    {/* 1. APPLICANT DETAILS */}
                    <div className="space-y-4">
                      <div className="font-serif font-bold text-sm text-[#7b1d28] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-1.5">
                        <UserCheck className="w-4 h-4" />
                        <span>1. Litigant / Applicant Information</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Full Legal Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            placeholder="e.g. Ramesh Chandra / Sunita Devi"
                            className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Mobile Phone Number <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="e.g. 9812345678"
                            className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none"
                          />
                          <span className="text-[10px] text-gray-500 mt-0.5 block">For SMS / WhatsApp consultation updates.</span>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Email Address (Optional)
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="e.g. citizen@example.com"
                            className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            District in Delhi / NCR <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={district}
                            onChange={e => setDistrict(e.target.value)}
                            className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none cursor-pointer"
                          >
                            {delhiDistricts.map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Residential / Postal Address <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={e => setAddress(e.target.value)}
                          placeholder="House / Street / Locality / Landmark, Delhi"
                          className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none"
                        />
                      </div>

                      {/* Representative checkbox */}
                      <div className="bg-[#fcfbf9] p-3.5 rounded-lg border border-[#e2ded5] space-y-3">
                        <label className="flex items-center gap-2.5 text-xs text-gray-800 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isRepresentative}
                            onChange={e => setIsRepresentative(e.target.checked)}
                            className="w-4 h-4 text-[#0c1829] rounded border-gray-300 focus:ring-[#c59b43]"
                          />
                          <span className="font-medium">
                            I am applying on behalf of someone else (e.g. undertrial prisoner, disabled person, elderly relative, or child).
                          </span>
                        </label>

                        {isRepresentative && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Representative Name <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="text"
                                required={isRepresentative}
                                value={representativeName}
                                onChange={e => setRepresentativeName(e.target.value)}
                                placeholder="Name of person assisting"
                                className="w-full px-3 py-2 bg-white border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Relationship to Litigant <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="text"
                                required={isRepresentative}
                                value={relationshipToLitigant}
                                onChange={e => setRelationshipToLitigant(e.target.value)}
                                placeholder="e.g. Son, Daughter, Social Worker, Guardian"
                                className="w-full px-3 py-2 bg-white border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 2. LEGAL GRIEVANCE DETAILS */}
                    <div className="space-y-4">
                      <div className="font-serif font-bold text-sm text-[#7b1d28] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-1.5">
                        <Scale className="w-4 h-4" />
                        <span>2. Nature of Legal Dispute / Matter</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Legal Domain / Category <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={legalDomain}
                            onChange={e => setLegalDomain(e.target.value)}
                            className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none cursor-pointer"
                          >
                            {legalDomainsList.map(domain => (
                              <option key={domain} value={domain}>{domain}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Consultation Mode <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={consultationMode}
                            onChange={e => setConsultationMode(e.target.value as ClinicConsultationMode)}
                            className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none cursor-pointer"
                          >
                            <option value="In-Person (CLC Campus Clinic)">In-Person (CLC Campus Clinic, Chhatra Marg)</option>
                            <option value="Telephonic / Online">Telephonic / Online Consultation</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Brief Facts & Description of the Dispute <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={caseDescription}
                          onChange={e => setCaseDescription(e.target.value)}
                          placeholder="Briefly state what happened, who is the opposing party, dates of major incidents, and what remedy or guidance you are seeking..."
                          className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none resize-y"
                        />
                      </div>

                      {/* Existing court case */}
                      <div className="bg-[#fcfbf9] p-3.5 rounded-lg border border-[#e2ded5] space-y-3">
                        <label className="flex items-center gap-2.5 text-xs text-gray-800 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={hasExistingCourtCase}
                            onChange={e => setHasExistingCourtCase(e.target.checked)}
                            className="w-4 h-4 text-[#0c1829] rounded border-gray-300 focus:ring-[#c59b43]"
                          />
                          <span className="font-medium">
                            A court case or police FIR is already instituted or pending in this matter.
                          </span>
                        </label>

                        {hasExistingCourtCase && (
                          <div className="pt-2 border-t border-gray-200">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Court Name, FIR No., or Case / CNR Number (if known)
                            </label>
                            <input
                              type="text"
                              value={courtCaseDetails}
                              onChange={e => setCourtCaseDetails(e.target.value)}
                              placeholder="e.g. Tis Hazari Courts, Civil Suit No. 204/2025 or PS Timarpur FIR No. 112"
                              className="w-full px-3 py-2 bg-white border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 3. SECTION 12 STATUTORY ELIGIBILITY */}
                    <div className="space-y-4">
                      <div className="font-serif font-bold text-sm text-[#7b1d28] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        <span>3. Statutory Legal Aid Eligibility (Section 12, LSAA 1987)</span>
                      </div>

                      <div className="bg-[#f4f1eb] p-4 rounded-xl border border-[#e2ded5] space-y-3">
                        <div className="text-xs text-gray-700">
                          Under Section 12 of the Legal Services Authorities Act, 1987, specific citizen groups are entitled to free legal aid services.
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-800 mb-1">
                              Eligibility Criterion Category
                            </label>
                            <select
                              value={section12Category}
                              onChange={e => setSection12Category(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none cursor-pointer"
                            >
                              {section12CategoriesList.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-800 mb-1">
                              Summary of Documents Available
                            </label>
                            <input
                              type="text"
                              value={documentsSummary}
                              onChange={e => setDocumentsSummary(e.target.value)}
                              placeholder="e.g. Aadhaar card, notice copy, salary slip"
                              className="w-full px-3 py-2 bg-white border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4. PREFERRED SCHEDULE */}
                    <div className="space-y-4">
                      <div className="font-serif font-bold text-sm text-[#7b1d28] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>4. Preferred Date & Time Window</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Preferred Consultation Date
                          </label>
                          <input
                            type="date"
                            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                            value={preferredDate}
                            onChange={e => setPreferredDate(e.target.value)}
                            className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Preferred Time Slot
                          </label>
                          <select
                            value={preferredTimeSlot}
                            onChange={e => setPreferredTimeSlot(e.target.value)}
                            className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e2ded5] rounded-lg text-xs focus:ring-2 focus:ring-[#c59b43] focus:outline-none cursor-pointer"
                          >
                            <option value="Morning (10:00 AM - 1:00 PM)">Morning (10:00 AM - 1:00 PM)</option>
                            <option value="Afternoon (2:00 PM - 5:00 PM)">Afternoon (2:00 PM - 5:00 PM)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Declaration & Submit Button */}
                    <div className="pt-4 border-t border-[#e2ded5] space-y-4">
                      <div className="text-[11px] text-gray-500 italic">
                        * By submitting this intake form, you affirm that the information provided is truthful to the best of your knowledge. The Campus Law Centre Legal Aid Society operates as an educational and clinical body; services do not create an advocate-client commercial contract until formally assigned through legal aid authority panels.
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 bg-[#0c1829] hover:bg-[#162740] text-white font-serif font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Processing Legal Intake Registration...</span>
                          </>
                        ) : (
                          <>
                            <Scale className="w-4 h-4 text-[#c59b43]" />
                            <span>Submit Consultation Request & Generate Token</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Sidebar Column (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Quick Track Box */}
                  <div className="bg-[#0c1829] text-white p-6 rounded-2xl border border-[#c59b43]/30 shadow-md space-y-4">
                    <div className="flex items-center gap-2 text-[#c59b43] font-serif font-bold text-sm">
                      <Search className="w-4 h-4" />
                      <span>Already Have a Token?</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Check your scheduled consultation time, assigned student PLVs, or status updates anytime.
                    </p>
                    <button
                      onClick={() => setActiveTab('track')}
                      className="w-full py-2.5 bg-[#c59b43] hover:bg-[#b08734] text-[#0c1829] font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Track Appointment Status</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Section 12 Info Card */}
                  <div className="bg-[#fcfbf9] border border-[#e2ded5] p-5 rounded-2xl space-y-3 text-xs text-gray-700">
                    <div className="font-serif font-bold text-sm text-[#0c1829] flex items-center gap-2 border-b border-[#e2ded5] pb-2">
                      <ShieldCheck className="w-4 h-4 text-[#9b7529]" />
                      <span>Who Is Entitled to Legal Aid?</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Section 12 of the Legal Services Authorities Act guarantees free legal services to:
                    </p>
                    <ul className="space-y-1.5 text-gray-700 list-disc list-inside">
                      <li>Women and children</li>
                      <li>Members of Scheduled Castes and Tribes</li>
                      <li>Industrial workers & daily wage earners</li>
                      <li>Persons in custody or under detention</li>
                      <li>Persons with disabilities or mental illness</li>
                      <li>Persons with annual income under ₹3,00,000 (Delhi)</li>
                    </ul>
                  </div>

                  {/* Urgent Helpline Card */}
                  <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl space-y-3 text-xs text-amber-900">
                    <div className="font-serif font-bold text-sm text-amber-950 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-amber-700" />
                      <span>National Legal Aid Helpline</span>
                    </div>
                    <p className="text-amber-800 leading-relaxed">
                      For immediate emergency assistance during arrest, detention, or urgent court bail, dial the NALSA 24/7 toll-free helpline:
                    </p>
                    <div className="text-xl font-bold font-mono text-amber-950 bg-white p-2.5 rounded-lg border border-amber-300 text-center">
                      15100 (Toll-Free)
                    </div>
                    <span className="text-[11px] text-amber-700 block text-center">
                      Available across Delhi & all Indian States.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 3. TRACK CONSULTATION STATUS TAB */
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-white rounded-2xl border border-[#e2ded5] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-[#e2ded5] pb-4 space-y-1">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0c1829]">
                  Track Consultation Request Status
                </h2>
                <p className="text-xs text-gray-600">
                  Enter your official tracking token (e.g. <span className="font-mono font-bold text-[#7b1d28]">CLC-LAC-2026-XXXX</span>) or your registered 10-digit mobile number.
                </p>
              </div>

              <form onSubmit={handleTrack} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    required
                    value={searchToken}
                    onChange={e => setSearchToken(e.target.value)}
                    placeholder="Enter Token (e.g. CLC-LAC-2026-8812) or Mobile Number"
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
                    <span>Search Record</span>
                  </button>
                </div>
              </form>

              {/* Error state */}
              {trackingError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Record Not Found</span>
                    <span>{trackingError}. Please check your token formatting or call the clinic desk for manual verification.</span>
                  </div>
                </div>
              )}

              {/* Tracked Record Result */}
              {trackedAppointment && (
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
                        {trackedAppointment.trackingToken}
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(trackedAppointment.status)}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-700">
                    <div>
                      <span className="text-gray-500 block">Litigant Name:</span>
                      <span className="font-bold text-gray-900">{trackedAppointment.fullName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Legal Grievance Domain:</span>
                      <span className="font-bold text-gray-900">{trackedAppointment.legalDomain}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Mode of Consultation:</span>
                      <span className="font-semibold text-gray-900">{trackedAppointment.consultationMode}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Registered On:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(trackedAppointment.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    {trackedAppointment.scheduledDate && (
                      <div className="sm:col-span-2 bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-900">
                        <span className="font-bold block text-xs flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Confirmed Appointment Schedule:</span>
                        </span>
                        <span className="text-sm font-semibold">{trackedAppointment.scheduledDate}</span>
                        {trackedAppointment.assignedVolunteers && (
                          <span className="block text-xs text-emerald-800 mt-1">
                            Assigned Bench: {trackedAppointment.assignedVolunteers}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Consultation instructions reminder */}
                  <div className="bg-white p-4 rounded-lg border border-[#e2ded5] text-xs text-gray-600 space-y-1">
                    <span className="font-bold text-gray-800 block">Need to reschedule or submit additional documents?</span>
                    <span>Contact the clinic desk directly at Chhatra Marg, Room 102 or via email quoting your tracking token.</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* 4. CLINIC FAQ & PROTOCOL ACCORDION */}
        <section className="mt-16 pt-12 border-t border-[#e2ded5] max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7b1d28]">
              Legal Literacy & Guidance
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0c1829]">
              Frequently Asked Questions Regarding Legal Consultations
            </h2>
          </div>

          <div className="space-y-3 pt-4">
            {[
              {
                q: 'Is there any fee or charge for consultation at the Campus Law Centre clinic?',
                a: 'No. All services provided by the Campus Law Centre Legal Aid Society are strictly 100% free of charge. In accordance with the Legal Services Authorities Act, 1987, indigent litigants are not required to pay any consultation, drafting, or advisory fees.'
              },
              {
                q: 'What should I do if my matter requires filing a petition in court?',
                a: 'The Legal Aid Society conducts preliminary counseling, grievance drafting, and conciliation. If your dispute requires formal litigation representation in the High Court of Delhi or District Courts (Tis Hazari, Patiala House, Rohini, Saket, etc.), our clinic coordinates directly with the Delhi State Legal Services Authority (DSLSA) to assign you an empanelled legal aid advocate at zero cost.'
              },
              {
                q: 'Can a relative or social worker file an intake request for an undertrial prisoner in custody?',
                a: 'Yes. Check the "I am applying on behalf of someone else" option in the form. Our Prison & Undertrial Rights vertical actively assists families of detainees in securing bail applications, legal representation, and monitoring incarceration conditions under Section 436A CrPC / BNSS.'
              },
              {
                q: 'What documents should I bring for my consultation?',
                a: 'Please bring government identity proof (Aadhaar, Voter ID, or Ration Card), relevant notices, police complaints/FIRs, court orders, tenancy agreements, termination letters, or salary slips relating to your matter.'
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
