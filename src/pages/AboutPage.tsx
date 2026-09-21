import React from 'react';
import { usePortal } from '../context/PortalContext';
import {
  Scale,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Shield,
  Building,
  Target,
  FileCheck
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { data } = usePortal();
  const settings = data?.settings;
  const timeline = data?.timeline || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Page Header */}
      <div className="border-b border-[#e2ded5] pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#7b1d28]">
          <span>Institutional Profile</span>
          <span className="w-12 h-0.5 bg-[#c59b43]" />
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#0c1829]">
          About the Legal Aid Society
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-3xl">
          Campus Law Centre • Faculty of Law • University of Delhi
        </p>
      </div>

      {/* About the Society Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 space-y-6">
          <h2 className="font-serif text-2xl font-bold text-[#0c1829]">
            History, Inception & Mandate
          </h2>
          <div className="prose text-gray-700 text-sm sm:text-base leading-relaxed space-y-4 font-sans">
            <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-lg text-xs sm:text-sm text-gray-800">
              <span className="font-bold text-[#0c1829] block mb-1">Official Society Description:</span>
              <p className="italic">
                {settings?.descriptionPlaceholder || '[Official Society Description Placeholder — The Legal Aid Society of Campus Law Centre, Faculty of Law, University of Delhi, is a clinical educational initiative dedicated to promoting legal literacy, pro-bono assistance, and student involvement in social justice.]'}
              </p>
            </div>

            <p>
              Rooted in the prestigious legacy of Campus Law Centre (CLC) — one of India's premier legal education institutions — the Legal Aid Society bridges scholarly legal analysis with hands-on grassroots legal service. Law students are not mere observers of the judicial process; through the Society, they actively participate as para-legal volunteers under faculty and statutory authority supervision.
            </p>
            <p>
              The Society regularly coordinates with statutory bodies including the National Legal Services Authority (NALSA) and the Delhi State Legal Services Authority (DSLSA) to conduct legal literacy camps, maintain consultation helpdesks at court complexes, and undertake undertrial prisoner welfare initiatives.
            </p>
          </div>
        </div>

        {/* Institutional Association Card */}
        <div className="lg:col-span-4 bg-[#f4f1eb] p-6 rounded-xl border border-[#e2ded5] space-y-4">
          <div className="flex items-center gap-3 text-[#0c1829]">
            <Building className="w-6 h-6 text-[#9b7529]" />
            <h3 className="font-serif text-base font-bold">
              Institutional Association
            </h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed font-sans">
            Campus Law Centre (CLC) was established as a premier department under the Faculty of Law, University of Delhi. The Legal Aid Society functions directly under the mentorship of the Faculty Convener and the Dean & Head of the Faculty of Law.
          </p>
          <div className="pt-2 border-t border-[#e2ded5] text-[11px] text-gray-500 space-y-1">
            <div><strong className="text-gray-700">Affiliation:</strong> Faculty of Law, University of Delhi</div>
            <div><strong className="text-gray-700">Jurisdiction:</strong> National Capital Territory of Delhi</div>
            <div><strong className="text-gray-700">Governance:</strong> Faculty Mentorship & Student Board</div>
          </div>
        </div>
      </section>

      {/* Vision, Mission, Objectives */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Vision */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#e2ded5] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-[#0c1829] text-[#c59b43] flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#0c1829]">
            Our Vision
          </h3>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans italic bg-[#fcfbf9] p-3 rounded border border-gray-100">
            "{settings?.visionPlaceholder || '[Official Society Vision Statement Placeholder — Ensuring justice is accessible, equitable, and understandable to all sections of society irrespective of socio-economic standing.]'}"
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#e2ded5] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-[#0c1829] text-[#c59b43] flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#0c1829]">
            Our Mission
          </h3>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans italic bg-[#fcfbf9] p-3 rounded border border-gray-100">
            "{settings?.missionPlaceholder || '[Official Society Mission Statement Placeholder — To bridge the gap between statutory guarantees and grassroots reality through clinical education, public literacy camps, and dedicated legal aid clinics.]'}"
          </p>
        </div>
      </section>

      {/* Objectives */}
      <section className="bg-[#fcfbf9] p-8 rounded-xl border border-[#e2ded5] space-y-6">
        <h2 className="font-serif text-2xl font-bold text-[#0c1829]">
          Key Objectives of the Society
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(settings?.objectives || [
            '[Objective 1: Legal Literacy & Community Awareness Placeholder]',
            '[Objective 2: Para-Legal Volunteer Training & Clinic Representation Placeholder]',
            '[Objective 3: Jail & Remand Home Legal Aid Initiatives Placeholder]',
            '[Objective 4: Research, Policy Advocacy & Access to Justice Documentation Placeholder]'
          ]).map((obj, i) => (
            <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-lg border border-[#e2ded5]">
              <CheckCircle2 className="w-5 h-5 text-[#9b7529] shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm text-gray-800 leading-relaxed">{obj}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Legal Aid Philosophy & Why Legal Aid Matters */}
      <section className="bg-[#0c1829] text-white p-8 sm:p-12 rounded-2xl border-2 border-[#c59b43]/40 shadow-xl space-y-6">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#c59b43]">
            Constitutional Foundations
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Legal Aid Philosophy & Article 39A
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
            "{settings?.philosophyPlaceholder || '[Official Legal Aid Philosophy Placeholder — Grounded in Article 39A of the Constitution of India, embodying the institutional belief that equal justice is a constitutional guarantee, not a privilege.]'}"
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-gray-800 text-xs sm:text-sm">
          <div className="space-y-1.5">
            <h4 className="font-serif font-bold text-[#e6c887]">Article 39A of the Constitution</h4>
            <p className="text-gray-300 leading-relaxed">
              Mandates that the State shall secure that the operation of the legal system promotes justice on a basis of equal opportunity.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-serif font-bold text-[#e6c887]">The Legal Services Authorities Act, 1987</h4>
            <p className="text-gray-300 leading-relaxed">
              Provides the statutory framework for free legal services to women, children, undertrials, and weaker sections through Lok Adalats and legal clinics.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-serif font-bold text-[#e6c887]">Bar Council of India Clinical Directives</h4>
            <p className="text-gray-300 leading-relaxed">
              Requires premier law schools to institute functional legal aid clinics where law students develop practical counseling skills under supervision.
            </p>
          </div>
        </div>
      </section>

      {/* Visual Timeline for Milestones */}
      <section className="space-y-8">
        <div className="border-b border-[#e2ded5] pb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#7b1d28]">
            Archival Chronology
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0c1829]">
            Society Milestones & Timeline
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Major institutional milestones as recorded by the society records archive.
          </p>
        </div>

        <div className="relative border-l-2 border-[#c59b43] ml-4 sm:ml-8 space-y-8 py-2">
          {timeline.map((item, idx) => (
            <div key={item.id || idx} className="relative pl-6 sm:pl-8 group">
              {/* Timeline marker */}
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#0c1829] border-2 border-[#c59b43] group-hover:scale-125 transition-transform" />

              <div className="bg-white p-5 rounded-xl border border-[#e2ded5] shadow-xs space-y-2 max-w-2xl hover:border-[#c59b43] transition-colors">
                <span className="inline-block text-xs font-bold font-serif text-[#9b7529] bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                  {item.year}
                </span>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0c1829]">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
