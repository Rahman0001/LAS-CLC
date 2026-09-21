import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PortalProvider } from './context/PortalContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { NotificationModal } from './components/NotificationModal';
import { ReportModal } from './components/ReportModal';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { TeamPage } from './pages/TeamPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { GalleryPage } from './pages/GalleryPage';
import { AawazBlogPage } from './pages/AawazBlogPage';
import { ClinicAppointmentPage } from './pages/ClinicAppointmentPage';
import { AawazSubmissionsPage } from './pages/AawazSubmissionsPage';
import { TermsPrivacyPage } from './pages/TermsPrivacyPage';
import { BlogReaderModal } from './components/BlogReaderModal';
import { ScrollToTop } from './components/ScrollToTop';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { PageTransition } from './components/PageTransition';

import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';

// Public Layout with institutional Navbar, Footer, and accessible Modals
const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9] text-[#2d3748] font-sans antialiased selection:bg-[#c59b43] selection:text-[#0c1829]">
      <Navbar />
      <main id="main-content" className="flex-1 flex flex-col">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <ScrollToTopButton />
      <GlobalSearchModal />
      <NotificationModal />
      <ReportModal />
      <BlogReaderModal />
    </div>
  );
};

// Admin Route Guard
const AdminRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f1eb] text-[#0c1829]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#c59b43] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-sm">Verifying Institutional Administrative Session...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <AdminDashboard /> : <AdminLoginPage />;
};

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider>
        <AuthProvider>
          <PortalProvider>
            <Routes>
              {/* Public Institutional Portal Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="team" element={<TeamPage />} />
                <Route path="activities" element={<ActivitiesPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="resources" element={<ResourcesPage />} />
                <Route path="gallery" element={<GalleryPage />} />
                <Route path="aawaz" element={<AawazBlogPage />} />
                <Route path="aawaz/:id" element={<AawazBlogPage />} />
                <Route path="blogs" element={<AawazBlogPage />} />
                <Route path="blogs/:id" element={<AawazBlogPage />} />
                <Route path="clinic" element={<ClinicAppointmentPage />} />
                <Route path="clinic/appointment" element={<ClinicAppointmentPage />} />
                <Route path="legal-clinic" element={<ClinicAppointmentPage />} />
                <Route path="submissions" element={<AawazSubmissionsPage />} />
                <Route path="aawaz/submissions" element={<AawazSubmissionsPage />} />
                <Route path="call-for-papers" element={<AawazSubmissionsPage />} />
                <Route path="contact" element={<Navigate to="/about" replace />} />
                <Route path="terms-privacy" element={<TermsPrivacyPage />} />
              </Route>

              {/* Secure Administrative Portal */}
              <Route path="/admin" element={<AdminRoute />} />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PortalProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
