import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures smooth, reliable scroll restoration when navigating across routes.
 * Supports smooth scrolling to top on route change or to specific hash anchors with navbar offset.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // If a hash anchor is provided (e.g. #clinic-desk or #main-content)
    if (hash) {
      const elementId = hash.replace('#', '');
      const timer = setTimeout(() => {
        const targetElement = document.getElementById(elementId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 50);
      return () => clearTimeout(timer);
    }

    // Instant scroll to top on path change so the new page renders immediately without lag
    window.scrollTo(0, 0);
  }, [pathname, search, hash]);

  return null;
};
