import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CrestLogo } from './CrestLogo';
import { usePortal } from '../context/PortalContext';
import {
  Search,
  Menu,
  X,
  Eye,
  Type,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Scale,
  FileText,
  Users,
  Bell,
  Layers,
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface SubMenuItem {
  name: string;
  path: string;
  desc?: string;
  badge?: string;
  badgeColor?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface MenuItem {
  name: string;
  path: string;
  badge?: string;
  badgeColor?: string;
  subItems?: SubMenuItem[];
}

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { toggleHighContrast, highContrast, toggleLargeText, largeText, setIsSearchOpen } = usePortal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (name: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  useEffect(() => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Clean, organized desktop navigation architecture
  const menuItems: MenuItem[] = [
    { name: 'Home', path: '/' },
    {
      name: 'Clinic Intake',
      path: '/clinic',
      badge: 'Intake',
      badgeColor: 'bg-[#7b1d28] text-white'
    },
    {
      name: 'About',
      path: '/about',
      subItems: [
        {
          name: 'Mandate & Vision',
          path: '/about',
          desc: 'Article 39A constitutional mandate & institutional history',
          icon: ShieldCheck
        },
        {
          name: 'Executive Committee & Team',
          path: '/team',
          desc: 'Faculty patron, convener & student leadership',
          icon: Users
        },
        {
          name: 'Photo Gallery & Fieldwork',
          path: '/gallery',
          desc: 'Legal literacy drives, jail clinics & archives',
          icon: Layers
        }
      ]
    },
    { name: 'Activities', path: '/activities' },
    {
      name: 'Gazette & Reports',
      path: '/notifications',
      subItems: [
        {
          name: 'Notifications & Gazette',
          path: '/notifications',
          desc: 'Official circulars, impanelment lists & notices',
          icon: Bell
        },
        {
          name: 'Annual Work Reports',
          path: '/reports',
          desc: 'Documented annual activity dossiers & archives',
          icon: FileText
        }
      ]
    },
    {
      name: 'AAWAZ',
      path: '/aawaz',
      badge: 'Blog',
      badgeColor: 'bg-[#0c1829] text-[#e6c887]',
      subItems: [
        {
          name: 'AAWAZ Socio-Legal Blog',
          path: '/aawaz',
          desc: 'Student & faculty legal reflections and critique',
          icon: BookOpen
        },
        {
          name: 'Call for Papers & Submissions',
          path: '/submissions',
          desc: 'Editorial guidelines, CFP themes & manuscript upload',
          badge: 'CFP',
          badgeColor: 'bg-[#7b1d28] text-white',
          icon: FileText
        }
      ]
    },
    { name: 'Resources', path: '/resources' }
  ];

  // Mobile full destination list for 1-tap navigation
  const mobileNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'Clinic Intake & Consultation', path: '/clinic', badge: 'Intake', badgeColor: 'bg-[#7b1d28] text-white' },
    { name: 'About Mandate & Society', path: '/about' },
    { name: 'Executive Team & Volunteers', path: '/team' },
    { name: 'Activities & Outreach Drives', path: '/activities' },
    { name: 'Notifications & Official Gazette', path: '/notifications' },
    { name: 'Annual Work Reports Archive', path: '/reports' },
    { name: 'AAWAZ Socio-Legal Blog', path: '/aawaz', badge: 'Blog', badgeColor: 'bg-[#0c1829] text-[#e6c887]' },
    { name: 'Call for Papers / Submissions', path: '/submissions', badge: 'CFP', badgeColor: 'bg-[#7b1d28] text-white' },
    { name: 'Citizen Legal Resources & Guides', path: '/resources' },
    { name: 'Photo Gallery & Fieldwork', path: '/gallery' }
  ];

  const isItemActive = (item: MenuItem) => {
    if (item.path === '/') return location.pathname === '/';
    if (location.pathname.startsWith(item.path)) return true;
    if (item.subItems) {
      return item.subItems.some(sub => location.pathname.startsWith(sub.path));
    }
    return false;
  };

  const isSubActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fcfbf9]/98 backdrop-blur-xs border-b border-[#e2ded5] shadow-xs transform-gpu">
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#0c1829] focus:text-white focus:outline-none focus:ring-2 focus:ring-[#c59b43] rounded"
      >
        Skip to main content
      </a>

      {/* Top Institutional Identity Bar */}
      <div className="bg-[#0c1829] text-[#e2ded5] text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-[#c59b43]/30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Institutional Heritage Affiliation */}
          <div className="flex items-center gap-2 tracking-wider text-[11px] sm:text-xs font-medium font-sans whitespace-nowrap">
            <span className="text-[#c59b43] font-semibold">CAMPUS LAW CENTRE</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-300">FACULTY OF LAW</span>
            <span className="hidden sm:inline text-gray-600">•</span>
            <span className="hidden sm:inline text-gray-300">UNIVERSITY OF DELHI</span>
            <span className="hidden md:inline text-gray-600">•</span>
            <span className="hidden md:inline text-[#e6c887]/80 text-[10px] uppercase font-serif">Art. 39A Mandate</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Accessibility Toggles */}
            <div className="flex items-center gap-1 border-r border-gray-700 pr-3">
              <button
                onClick={toggleLargeText}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                  largeText ? 'bg-[#c59b43] text-[#0c1829]' : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                title="Toggle larger typography"
                aria-label="Toggle larger typography"
              >
                <Type className="w-3 h-3" />
                <span>Text Size</span>
              </button>

              <button
                onClick={toggleHighContrast}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                  highContrast ? 'bg-[#c59b43] text-[#0c1829]' : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                title="Toggle high contrast accessibility mode"
                aria-label="Toggle high contrast mode"
              >
                <Eye className="w-3 h-3" />
                <span>Contrast</span>
              </button>
            </div>

            {/* Global Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Search institutional portal"
            >
              <Search className="w-3.5 h-3.5 text-[#c59b43]" />
              <span className="hidden sm:inline text-xs">Search</span>
              <kbd className="hidden md:inline text-[9px] px-1 bg-black/40 text-gray-400 rounded border border-gray-700">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo Link - shrink-0 prevents any flex shrinking or text wrapping */}
          <Link
            to="/"
            className="flex items-center gap-3 shrink-0 group focus:outline-none focus:ring-2 focus:ring-[#c59b43] rounded-lg p-1 transition-transform"
            aria-label="Legal Aid Society Home"
          >
            <CrestLogo size="md" variant="dark" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-1.5 shrink-0" aria-label="Main Navigation">
            {menuItems.map(item => {
              const active = isItemActive(item);
              const hasDropdown = Boolean(item.subItems && item.subItems.length > 0);
              const isDropdownOpen = activeDropdown === item.name;

              return (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => hasDropdown && handleMouseEnter(item.name)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    to={item.path}
                    className={`h-9 px-2.5 xl:px-3 text-xs xl:text-[13px] font-medium transition-all relative rounded-md flex items-center gap-1.5 whitespace-nowrap select-none ${
                      active
                        ? 'text-[#0c1829] font-bold bg-[#f4f1eb]'
                        : 'text-[#2d3748] hover:text-[#0c1829] hover:bg-[#f4f1eb]/70'
                    }`}
                  >
                    <span>{item.name}</span>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded leading-none whitespace-nowrap ${
                          item.badgeColor || 'bg-[#7b1d28] text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {hasDropdown && (
                      <ChevronDown
                        className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${
                          isDropdownOpen ? 'rotate-180 text-[#0c1829]' : ''
                        }`}
                      />
                    )}

                    {active && (
                      <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-[#c59b43] rounded-full" />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {hasDropdown && isDropdownOpen && (
                    <div
                      className="absolute top-full left-0 mt-1 w-64 bg-[#fcfbf9] border border-[#e2ded5] rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                      role="menu"
                    >
                      {item.subItems!.map(sub => {
                        const subActive = isSubActive(sub.path);
                        const SubIcon = sub.icon;

                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            className={`flex items-start gap-2.5 px-3.5 py-2 transition-colors group ${
                              subActive ? 'bg-[#f4f1eb]' : 'hover:bg-[#f4f1eb]/80'
                            }`}
                            role="menuitem"
                            onClick={() => setActiveDropdown(null)}
                          >
                            {SubIcon && (
                              <div
                                className={`p-1 rounded-md mt-0.5 shrink-0 ${
                                  subActive ? 'bg-[#0c1829] text-[#c59b43]' : 'bg-[#e2ded5]/40 text-gray-700 group-hover:text-[#0c1829]'
                                }`}
                              >
                                <SubIcon className="w-3.5 h-3.5" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1.5">
                                <span
                                  className={`text-xs font-semibold ${
                                    subActive ? 'text-[#0c1829] font-bold' : 'text-gray-800 group-hover:text-[#0c1829]'
                                  }`}
                                >
                                  {sub.name}
                                </span>
                                {sub.badge && (
                                  <span
                                    className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded leading-none ${
                                      sub.badgeColor || 'bg-[#7b1d28] text-white'
                                    }`}
                                  >
                                    {sub.badge}
                                  </span>
                                )}
                              </div>
                              {sub.desc && (
                                <p className="text-[10px] text-gray-500 leading-snug truncate mt-0.5">
                                  {sub.desc}
                                </p>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Action CTA & Mobile Trigger */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Primary Action Button: Clinic Consultation */}
            <Link
              to="/clinic"
              className="hidden sm:inline-flex items-center gap-2 h-9 px-3.5 text-xs font-bold text-white bg-[#7b1d28] hover:bg-[#962534] transition-all rounded-lg shadow-xs border border-[#7b1d28] whitespace-nowrap"
            >
              <Scale className="w-3.5 h-3.5 text-[#e6c887]" />
              <span>Clinic Consultation</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[#c59b43]"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-[#0c1829]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#fcfbf9] border-b border-[#e2ded5] px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 max-h-[85vh] overflow-y-auto">
          {/* Institutional Mobile Header */}
          <div className="pb-3 mb-3 border-b border-[#e2ded5] flex items-center justify-between">
            <div className="text-xs font-medium text-gray-600">
              Campus Law Centre, University of Delhi
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLargeText}
                className="text-[11px] font-bold px-2 py-0.5 rounded border border-gray-300 text-gray-700"
              >
                A+
              </button>
              <button
                onClick={toggleHighContrast}
                className="text-[11px] font-bold px-2 py-0.5 rounded border border-gray-300 text-gray-700"
              >
                Contrast
              </button>
            </div>
          </div>

          <nav className="flex flex-col space-y-1">
            {mobileNavLinks.map(link => {
              const active = isSubActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    active
                      ? 'bg-[#0c1829] text-white font-semibold'
                      : 'text-gray-800 hover:bg-[#f4f1eb]'
                  }`}
                >
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span>{link.name}</span>
                    {link.badge && (
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded leading-none ${
                          link.badgeColor || 'bg-[#7b1d28] text-white'
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />
                </Link>
              );
            })}

            <div className="pt-4 border-t border-[#e2ded5] mt-2 space-y-2">
              <Link
                to="/clinic"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#7b1d28] hover:bg-[#962534] rounded-md transition-colors shadow-xs"
              >
                <Scale className="w-4 h-4 text-[#e6c887]" />
                <span>Schedule Legal Clinic Consultation</span>
              </Link>

              <Link
                to="/submissions"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0c1829] hover:bg-[#162740] rounded-md transition-colors"
              >
                <BookOpen className="w-4 h-4 text-[#c59b43]" />
                <span>Submit Manuscript (Call for Papers)</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

