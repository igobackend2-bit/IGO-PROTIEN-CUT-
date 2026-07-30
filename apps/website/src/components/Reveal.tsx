import React from 'react';
import { motion } from 'motion/react';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Distance (px) the content travels in from — smaller reads as more subtle. */
  y?: number;
}

// Lightweight, reusable "fade + rise into view" wrapper used to give the
// homepage a more premium, animated feel as the user scrolls — every
// section on the page was previously popping straight into place with zero
// motion. Uses the already-installed `motion` package (Framer Motion) so no
// new dependency is introduced. `viewport={{ once: true }}` means each
// section only ever animates in once per page load — it doesn't replay
// every time you scroll past it, which would feel gimmicky/distracting.
export const Reveal: React.FC<RevealProps> = ({ children, className, delay = 0, y = 28 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
