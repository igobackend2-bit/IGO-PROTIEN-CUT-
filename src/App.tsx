import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import DeliveryBar from './components/DeliveryBar';
import Hero from './sections/Hero';
import CategoryGrid from './sections/CategoryGrid';
import CustomBoxBuilder from './sections/CustomBoxBuilder';
import FreshnessStrip from './sections/FreshnessStrip';
import WhyIGO from './sections/WhyIGO';
import Traceability from './sections/Traceability';
import HowItWorks from './sections/HowItWorks';
import OffersSection from './sections/OffersSection';
import ProductGrid from './sections/ProductGrid';
import FeaturedRecipes from './sections/FeaturedRecipes';
import QualityCertifications from './sections/QualityCertifications';
import AIProductComparison from './sections/AIProductComparison';
import DualCTA from './sections/DualCTA';
import IGOPrime from './sections/IGOPrime';
import Testimonials from './sections/Testimonials';
import Blog from './sections/Blog';
import Newsletter from './sections/Newsletter';
import PersonalizedRecommendations from './sections/PersonalizedRecommendations';
import Footer from './sections/Footer';
import { CartProvider, useCart } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import MobileBottomNav from './components/MobileBottomNav';
import AIAssistant from './components/AIAssistant';
import CrossSellModal from './components/CrossSellModal';
import FloatingCheckoutBar from './components/FloatingCheckoutBar';
import { CheckCircle2 } from 'lucide-react';

const Notification = () => {
  const { notification, setNotification } = useCart();

  useEffect(() => {
    const handler = (e: Event) => {
      const orderId = (e as CustomEvent).detail;
      setNotification(`Tracking order ${orderId}. Freshness incoming!`);
    };
    window.addEventListener('trackOrder', handler);
    return () => window.removeEventListener('trackOrder', handler);
  }, [setNotification]);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 80, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 40, x: '-50%' }}
          className="fixed bottom-20 md:bottom-10 left-1/2 z-[100] bg-neutral-dark text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[280px] max-w-[90vw]"
        >
          <div className="w-8 h-8 bg-igo-green rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-igo-green uppercase tracking-widest leading-none mb-1">Status Update</p>
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
      {/* Scroll Progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-igo-green z-[60] origin-left"
        style={{ scaleX }}
      />

      {/* Top delivery bar */}
      <DeliveryBar />

      {/* Navbar */}
      <Navbar />

      <main>
        <Hero />
        <CategoryGrid />
        <CustomBoxBuilder />
        <FreshnessStrip />
        <WhyIGO />
        <Traceability />
        <ProductGrid />
        <FeaturedRecipes />
        <OffersSection />
        <HowItWorks />
        <IGOPrime />
        <DualCTA />
        <QualityCertifications />
        <AIProductComparison />
        <Testimonials />
        <PersonalizedRecommendations />
        <Blog />
        <Newsletter />
      </main>

      <Footer />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Floating Checkout Bar */}
      <FloatingCheckoutBar />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Cart Added Notification */}
      <Notification />

      {/* AI Meat Assistant */}
      <AIAssistant />

      {/* Cross-sell Success Modal */}
      <CrossSellModal />
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
