import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Box,
  TicketPercent,
  FileText,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Store
} from 'lucide-react';
import { useNavigate, useLocation, Link, Outlet, Navigate } from 'react-router-dom';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [globalSearch, setGlobalSearch] = useState('');
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    
    const query = globalSearch.trim().toLowerCase();
    // If query looks like an order (contains numbers or 'igo')
    if (query.includes('igo') || /\d/.test(query)) {
      navigate(`/admin/orders?search=${encodeURIComponent(query)}`);
    } else {
      navigate(`/admin/customers?search=${encodeURIComponent(query)}`);
    }
    setGlobalSearch('');
  };

  const isAuth = localStorage.getItem('admin_auth') === 'true';

  if (!isAuth) {
    return <Navigate to="/admin/login" replace />;
  }


  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('igo_admin_session');
    navigate('/admin/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
    { icon: ShoppingBag, label: 'Products', path: '/admin/products' },
    { icon: Box, label: 'Orders', path: '/admin/orders' },
    { icon: Users, label: 'Customers', path: '/admin/customers' },
    { icon: TicketPercent, label: 'Promotions', path: '/admin/promotions' },
    { icon: HelpCircle, label: 'Queries', path: '/admin/queries' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: FileText, label: 'Content', path: '/admin/content' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-neutral-800 font-sans">
      {/* Desktop Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-white border-r border-neutral-200 z-50 transition-all duration-300 hidden lg:block ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-igo-green rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="font-display font-bold text-xl tracking-tight"
              >
                IGO <span className="text-igo-green text-sm uppercase align-top ml-1">Admin</span>
              </motion.span>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1 mt-4">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
                    isActive 
                      ? 'bg-igo-green text-white shadow-lg shadow-igo-green/20' 
                      : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'
                  }`}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-800'}`} />
                  {isSidebarOpen && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }}
                      className="font-medium text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Toggle Button */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute -right-3 top-20 bg-white border border-neutral-200 rounded-full w-6 h-6 flex items-center justify-center shadow-sm hover:bg-neutral-50 text-neutral-400"
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-100 space-y-1">
            <Link
              to="/"
              className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-neutral-500 hover:bg-igo-green/10 hover:text-igo-green transition-all"
              title="View Live Store"
            >
              <Store className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium text-sm">View Live Store</motion.span>}
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-neutral-500 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="font-medium text-sm">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isMobileOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full w-72 bg-white z-[70] lg:hidden shadow-2xl"
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-igo-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <span className="font-display font-bold text-xl tracking-tight">IGO Admin</span>
            </div>
            <button onClick={() => setIsMobileOpen(false)} className="text-neutral-400 hover:text-neutral-800">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 space-y-2 mt-6">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${
                    isActive 
                      ? 'bg-igo-green text-white shadow-lg' 
                      : 'text-neutral-500 hover:bg-neutral-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-semibold text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-6 border-t border-neutral-100 space-y-3">
            <Link
              to="/"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-igo-green bg-igo-green/10 font-bold text-sm"
            >
              <Store className="w-5 h-5" />
              View Live Store
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-red-500 bg-red-50 font-bold text-sm"
            >
              <LogOut className="w-5 h-5" />
              Logout Session
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main 
        className={`flex-1 transition-all duration-300 min-h-screen ${
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-neutral-200 z-40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Search orders, customers..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="bg-neutral-100 border-none rounded-xl pl-10 pr-4 py-2 text-sm w-64 focus:ring-2 focus:ring-igo-green/20 transition-all"
              />
            </form>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-igo-green bg-igo-green/10 hover:bg-igo-green/20 rounded-xl transition-all"
                title="Go to Live Storefront"
              >
                <Store className="w-4 h-4" />
                <span>Live Store</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <button className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-xl relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
              </button>
              <button
                onClick={() => navigate('/admin/help')}
                className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-xl"
                title="Help & Documentation"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="h-8 w-px bg-neutral-200 mx-1"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-neutral-800 leading-none">Admin User</p>
                <p className="text-[10px] font-bold text-igo-green uppercase tracking-wider mt-1">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center text-neutral-600 font-bold shadow-sm">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;