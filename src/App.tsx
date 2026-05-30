import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import BrandNarrative from './sections/BrandNarrative';
import Footer from './sections/Footer';
import { CartProvider, useCart } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import MobileBottomNav from './components/MobileBottomNav';
import AIAssistant from './components/AIAssistant';
import CrossSellModal from './components/CrossSellModal';
import FloatingCheckoutBar from './components/FloatingCheckoutBar';
import SmoothScroll from './components/SmoothScroll';
import WhatsAppButton from './components/WhatsAppButton';
import AdminGuard from './components/AdminGuard';
import { CheckCircle2, Loader2 } from 'lucide-react';

// Admin Pages - Lazy Loaded for Production Stability
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout'));
const DashboardOverview = React.lazy(() => import('./pages/admin/DashboardOverview'));
const ProductManagement = React.lazy(() => import('./pages/admin/ProductManagement'));
const SystemSettings = React.lazy(() => import('./pages/admin/SystemSettings'));
const Analytics = React.lazy(() => import('./pages/admin/Analytics'));
const CustomerManagement = React.lazy(() => import('./pages/admin/CustomerManagement'));
const AdminHelp = React.lazy(() => import('./pages/admin/AdminHelp'));
const OrderManagement = React.lazy(() => import('./pages/admin/OrderManagement'));
const OrderReview = React.lazy(() => import('./pages/OrderReview'));
const BlogPage = React.lazy(() => import('./pages/Blog'));
const CustomerQueries = React.lazy(() => import('./pages/admin/CustomerQueries'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const Checkout = React.lazy(() => import('./pages/Checkout'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-neutral-dark flex flex-col items-center justify-center gap-4">
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    >
      <Loader2 className="w-12 h-12 text-igo-green" />
    </motion.div>
    <p className="text-white/50 font-display font-bold uppercase tracking-widest text-xs">IGO Protein Cuts</p>
  </div>
);


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

function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen selection:bg-igo-green/30">
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-igo-green z-[60] origin-left"
        style={{ scaleX }}
      />
      <DeliveryBar />
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
        <BrandNarrative />
        <Newsletter />
      </main>
      <Footer />
      <CartDrawer />
      <FloatingCheckoutBar />
      <MobileBottomNav />
      <Notification />
      <AIAssistant />
      <CrossSellModal />
      <WhatsAppButton />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <SmoothScroll>
        <React.Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Admin Routes - Protected */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminGuard><AdminLayout /></AdminGuard>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardOverview />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="promotions" element={<div className="p-8"><h1 className="text-2xl font-bold">Promotions &amp; Offers</h1><p className="text-neutral-500">Coming soon...</p></div>} />
              <Route path="queries" element={<CustomerQueries />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="content" element={<div className="p-8"><h1 className="text-2xl font-bold">Content Management</h1><p className="text-neutral-500">Coming soon...</p></div>} />
              <Route path="settings" element={<SystemSettings />} />
              <Route path="help" element={<AdminHelp />} />
            </Route>

            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/review/:orderId" element={<OrderReview />} />
            <Route path="/blog" element={<BlogPage />} />

            {/* Fallback Catch-all - Custom 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </React.Suspense>
      </SmoothScroll>
    </CartProvider>
  );
}
