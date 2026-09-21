import React from 'react';
import { Link } from 'react-router-dom';
import { CrestLogo } from './CrestLogo';
import { usePortal } from '../context/PortalContext';
import { MapPin, Mail, Phone, Clock, Shield, ExternalLink, Lock, Scale, BookOpen, ChevronRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const { data } = usePortal();
  const settings = data?.settings;

  return (
    <footer className="bg-[#0c1829] text-[#e2ded5] border-t-2 border-[#c59b43]/60" role="contentinfo">
      {/* Top Institutional Banner inside footer */}
      <div className="border-b border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Col 1: Identity & Constitutional Mandate (5 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <CrestLogo size="md" variant="light" showSubtitle={true} />
            <p className="text-xs text-gray-300 leading-relaxed font-sans mt-3">
              An institutional student-clinical body of Campus Law Centre, Faculty of Law, University of Delhi, committed to advancing constitutional justice, free legal representation, and grassroots legal empowerment pursuant to Article 39A of the Constitution of India.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#e6c887]">
              <span className="font-semibold px-2 py-0.5 bg-white/5 border border-white/10 rounded">Established Clinical Tradition</span>
              <span>•</span>
              <span className="font-semibold px-2 py-0.5 bg-white/5 border border-white/10 rounded">Non-Commercial Legal Aid</span>
            </div>
          </div>

          {/* Col 2: Navigation Links (2.5 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-crest text-xs font-bold text-white tracking-widest uppercase border-b border-[#c59b43]/40 pb-2">
              Institutional Navigation
            </h3>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <Link to="/clinic" className="hover:text-[#c59b43] transition-colors flex items-center gap-1.5 text-amber-200 font-semibold">
                  <ChevronRight className="w-3 h-3 text-[#c59b43]" />
                  <span>Clinic Appointment / Intake</span>
                </Link>
              </li>
              <li>
                <Link to="/submissions" className="hover:text-[#c59b43] transition-colors flex items-center gap-1.5 text-amber-200 font-semibold">
                  <ChevronRight className="w-3 h-3 text-[#c59b43]" />
                  <span>Submissions Portal & CFP</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#c59b43] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-[#c59b43]" />
                  <span>About Society & Mandate</span>
                </Link>
              </li>
              <li>
                <Link to="/team" className="hover:text-[#c59b43] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-[#c59b43]" />
                  <span>Faculty & Student Directory</span>
                </Link>
              </li>
              <li>
                <Link to="/activities" className="hover:text-[#c59b43] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-[#c59b43]" />
                  <span>Legal Aid Camps & Activities</span>
                </Link>
              </li>
              <li>
                <Link to="/notifications" className="hover:text-[#c59b43] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-[#c59b43]" />
                  <span>Official Circulars & Notices</span>
                </Link>
              </li>
              <li>
                <Link to="/reports" className="hover:text-[#c59b43] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-[#c59b43]" />
                  <span>Previous Work Reports & Archive</span>
                </Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-[#c59b43] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-[#c59b43]" />
                  <span>Citizen Legal Resources & Guides</span>
                </Link>
              </li>
              <li>
                <Link to="/aawaz" className="hover:text-[#c59b43] transition-colors flex items-center gap-1.5 text-[#e6c887] font-semibold">
                  <BookOpen className="w-3 h-3 text-[#c59b43]" />
                  <span>AAWAZ — The Socio-Legal Blog</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Secretariat & Clinic Hours (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-crest text-xs font-bold text-white tracking-widest uppercase border-b border-[#c59b43]/40 pb-2">
              Office & Secretariat
            </h3>
            <div className="space-y-3 text-xs text-gray-300 font-sans">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#c59b43] shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {settings?.address || 'Campus Law Centre, Faculty of Law, University of Delhi, Chhatra Marg, North Campus, Delhi - 110007'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#c59b43] shrink-0" />
                <span>{settings?.email || 'legalaidsociety@clc.du.ac.in'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#c59b43] shrink-0" />
                <span>{settings?.phone || '+91 11 2766 7895'}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#c59b43] shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {settings?.officeHours || 'Monday to Friday: 10:00 AM – 5:00 PM IST (Clinic Working Hours)'}
                </span>
              </div>
            </div>
          </div>

          {/* Col 4: Statutory Affiliated Portals (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-crest text-xs font-bold text-white tracking-widest uppercase border-b border-[#c59b43]/40 pb-2">
              Affiliated Bodies
            </h3>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <a
                  href="https://nalsa.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#c59b43] transition-colors flex items-center justify-between group"
                >
                  <span>NALSA (National)</span>
                  <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-[#c59b43]" />
                </a>
              </li>
              <li>
                <a
                  href="http://dslsa.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#c59b43] transition-colors flex items-center justify-between group"
                >
                  <span>DSLSA (Delhi State)</span>
                  <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-[#c59b43]" />
                </a>
              </li>
              <li>
                <a
                  href="https://delhihighcourt.nic.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#c59b43] transition-colors flex items-center justify-between group"
                >
                  <span>High Court LSC</span>
                  <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-[#c59b43]" />
                </a>
              </li>
              <li>
                <a
                  href="http://clc.du.ac.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#c59b43] transition-colors flex items-center justify-between group"
                >
                  <span>CLC Official Portal</span>
                  <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-[#c59b43]" />
                </a>
              </li>
            </ul>

            <div className="pt-2 text-[11px] text-gray-400">
              Session Archive: <span className="text-[#c59b43] font-semibold">2025–2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Legal Disclaimer Bar */}
      <div className="bg-[#070e19] py-4 px-4 sm:px-6 lg:px-8 border-b border-white/5 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-[#c59b43] shrink-0 mt-0.5" />
          <p className="leading-relaxed font-sans">
            <span className="text-gray-200 font-semibold">Statutory Public Disclaimer:</span>{' '}
            {settings?.legalDisclaimer || 'The resources, legal awareness guides, research publications, and circulars hosted on this portal are published exclusively for clinical legal education, academic dissemination, and citizen legal empowerment under the auspices of Campus Law Centre. They do not constitute formal legal counsel or advocate-client solicitation under the Advocates Act, 1961. For statutory free legal aid representation, eligible persons may also approach DSLSA / NALSA authorities.'}
          </p>
        </div>
      </div>

      {/* Bottom Sub-Footer with Discreet Admin Entry */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
        <div>
          © {new Date().getFullYear()} Legal Aid Society, Campus Law Centre, Faculty of Law, University of Delhi.
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/terms-privacy" className="hover:text-gray-200 transition-colors">
            Terms & Disclaimers
          </Link>
          <span>•</span>
          <Link to="/terms-privacy" className="hover:text-gray-200 transition-colors">
            Accessibility Statement
          </Link>
          <span>•</span>
          {/* Discreet Admin Link */}
          <Link
            to="/admin"
            className="text-gray-400 hover:text-[#c59b43] transition-colors flex items-center gap-1 text-[11px]"
            title="Administrative Access (Authorized Personnel Only)"
          >
            <Lock className="w-3 h-3 text-[#c59b43]" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </div>
    </footer>
  );
};

