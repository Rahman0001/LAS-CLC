import React from 'react';
import { usePortal } from '../context/PortalContext';
import { ShieldCheck, Scale, Eye, FileText, CheckCircle2 } from 'lucide-react';

export const TermsPrivacyPage: React.FC = () => {
  const { data } = usePortal();
  const settings = data?.settings;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="border-b border-[#e2ded5] pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#7b1d28]">
          <span>Institutional Policies</span>
          <span className="w-12 h-0.5 bg-[#c59b43]" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0c1829]">
          Terms of Use, Legal Disclaimer & Accessibility
        </h1>
        <p className="text-xs text-gray-500">
          Campus Law Centre, Faculty of Law, University of Delhi
        </p>
      </div>

      {/* 1. Legal Disclaimer */}
      <section className="bg-white p-6 sm:p-8 rounded-xl border border-[#e2ded5] space-y-4">
        <div className="flex items-center gap-2.5 text-[#0c1829] font-serif text-xl font-bold">
          <Scale className="w-5 h-5 text-[#9b7529]" />
          <h2>Official Legal Disclaimer</h2>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed font-sans">
          {settings?.legalDisclaimer || '[Official Legal Disclaimer Placeholder — The contents, resources, and articles on this institutional web portal are prepared solely for educational awareness, community literacy, and academic research. They do not constitute formal legal counsel or advocate solicitation under the Advocates Act, 1961.]'}
        </p>
        <p className="text-xs text-gray-600 leading-relaxed">
          No advocate-client relationship is formed merely through browsing this website or submitting an exploratory message through the contact form. Any citizen requiring statutory legal representation should consult the Legal Aid Clinic or approach the Delhi State Legal Services Authority (DSLSA).
        </p>
      </section>

      {/* 2. Accessibility Statement */}
      <section className="bg-white p-6 sm:p-8 rounded-xl border border-[#e2ded5] space-y-4">
        <div className="flex items-center gap-2.5 text-[#0c1829] font-serif text-xl font-bold">
          <Eye className="w-5 h-5 text-[#9b7529]" />
          <h2>Web Accessibility Statement (WCAG 2.2 AA)</h2>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed font-sans">
          The Legal Aid Society is committed to ensuring digital accessibility for people with diverse abilities. We are continually improving the user experience for everyone and applying relevant accessibility standards.
        </p>
        <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#9b7529] shrink-0 mt-0.5" />
            <span><strong>High Contrast Mode:</strong> Provides enhanced contrast ratios conforming to WCAG 2.2 AA standards.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#9b7529] shrink-0 mt-0.5" />
            <span><strong>Scalable Typography:</strong> Dedicated font scaling control allowing visitors to enlarge text without layout distortion.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#9b7529] shrink-0 mt-0.5" />
            <span><strong>Keyboard Navigation:</strong> Full keyboard accessibility with skip navigation link and logical tab sequences.</span>
          </li>
        </ul>
      </section>

      {/* 3. Privacy Policy */}
      <section className="bg-white p-6 sm:p-8 rounded-xl border border-[#e2ded5] space-y-4">
        <div className="flex items-center gap-2.5 text-[#0c1829] font-serif text-xl font-bold">
          <ShieldCheck className="w-5 h-5 text-[#9b7529]" />
          <h2>Data Privacy & Institutional Records</h2>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed font-sans">
          Personal information provided through contact inquiries or legal clinic intake is treated with institutional confidentiality. Such data is utilized solely for clinical routing, correspondence, and anonymous statistical reporting in accordance with academic standards.
        </p>
      </section>
    </div>
  );
};
