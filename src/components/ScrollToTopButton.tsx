import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const visibleRef = useRef(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const shouldBeVisible = window.scrollY > 360;
          if (shouldBeVisible !== visibleRef.current) {
            visibleRef.current = shouldBeVisible;
            setIsVisible(shouldBeVisible);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    if (window.scrollY > 360) {
      visibleRef.current = true;
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          id="scroll-to-top-button"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.85, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 12 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#0c1829] text-[#c59b43] border-2 border-[#c59b43]/70 shadow-xl hover:border-[#c59b43] hover:text-white transition-colors cursor-pointer group flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#c59b43] focus:ring-offset-2 transform-gpu"
          aria-label="Scroll back to top"
          title="Scroll back to top"
        >
          <ArrowUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5 duration-200" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
