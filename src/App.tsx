import React, { useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './sections/Hero';
import Traceability from './sections/Traceability';
import ProductGrid from './sections/ProductGrid';
import QualityCertifications from './sections/QualityCertifications';
import HowItWorks from './sections/HowItWorks';
import DualCTA from './sections/DualCTA';
import Testimonials from './sections/Testimonials';
import Blog from './sections/Blog';
import Newsletter from './sections/Newsletter';
import Footer from './sections/Footer';
import { CartProvider, useCart } from './context/CartContext';
import { CheckCircle2 } from 'lucide-react';

const Notification = () => {
  const { notification } = useCart();
  
  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          className="fixed bottom-10 left-1/2 z-[100] bg-neutral-dark text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px]"
        >
          <div className="w-8 h-8 bg-igo-green rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-igo-green uppercase tracking-widest leading-none mb-1">Success</p>
            <p className="text-sm font-medium">{notification}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function AppContent() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen selection:bg-igo-green/30">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-igo-green z-50 origin-left"
        style={{ scaleX }}
      />
      
      <Navbar />
      
      <main>
        <Hero />
        <Traceability />
        <HowItWorks />
        <ProductGrid />
        <QualityCertifications />
        <DualCTA />
        <Testimonials />
        <Blog />
        <Newsletter />
      </main>

      <Footer />
      <Notification />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}
