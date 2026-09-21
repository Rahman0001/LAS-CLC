import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  SiteSettings,
  TeamMember,
  NotificationItem,
  ReportItem,
  ActivityItem,
  GalleryItem,
  TimelineItem,
  LegalResourceItem,
  BlogPost
} from '../types';

interface PortalData {
  settings: SiteSettings;
  team: TeamMember[];
  notifications: NotificationItem[];
  reports: ReportItem[];
  activities: ActivityItem[];
  gallery: GalleryItem[];
  timeline: TimelineItem[];
  resources: LegalResourceItem[];
  blogs: BlogPost[];
}

interface PortalContextType {
  data: PortalData | null;
  isLoading: boolean;
  error: string | null;
  refreshContent: () => Promise<void>;
  highContrast: boolean;
  toggleHighContrast: () => void;
  largeText: boolean;
  toggleLargeText: () => void;
  selectedNotification: NotificationItem | null;
  setSelectedNotification: (n: NotificationItem | null) => void;
  selectedReport: ReportItem | null;
  setSelectedReport: (r: ReportItem | null) => void;
  selectedBlog: BlogPost | null;
  setSelectedBlog: (b: BlogPost | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PortalData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [highContrast, setHighContrast] = useState<boolean>(() => localStorage.getItem('clc_high_contrast') === 'true');
  const [largeText, setLargeText] = useState<boolean>(() => localStorage.getItem('clc_large_text') === 'true');

  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/content');
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error('Failed to load portal content:', err);
      setError('Unable to load institutional content. Please check your connection or refresh.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Handle accessibility root classes
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('contrast-more');
    } else {
      document.documentElement.classList.remove('contrast-more');
    }
    localStorage.setItem('clc_high_contrast', String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    if (largeText) {
      document.documentElement.classList.add('text-lg');
    } else {
      document.documentElement.classList.remove('text-lg');
    }
    localStorage.setItem('clc_large_text', String(largeText));
  }, [largeText]);

  // Global keyboard shortcut: Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleHighContrast = () => setHighContrast(prev => !prev);
  const toggleLargeText = () => setLargeText(prev => !prev);

  return (
    <PortalContext.Provider
      value={{
        data,
        isLoading,
        error,
        refreshContent: fetchContent,
        highContrast,
        toggleHighContrast,
        largeText,
        toggleLargeText,
        selectedNotification,
        setSelectedNotification,
        selectedReport,
        setSelectedReport,
        selectedBlog,
        setSelectedBlog,
        isSearchOpen,
        setIsSearchOpen
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = (): PortalContextType => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
};
