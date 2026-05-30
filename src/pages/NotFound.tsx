import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, ShoppingBag, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-neutral-light flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md"
      >
        {/* Big 404 */}
        <div className="text-[120px] font-display font-bold leading-none text-igo-green/10 select-none mb-4">
          404
        </div>

        <div className="w-20 h-20 bg-igo-green/10 rounded-full flex items-center justify-center mx-auto mb-6 -mt-8">
          <Search className="w-9 h-9 text-igo-green" />
        </div>

        <h1 className="text-3xl font-display font-bold text-neutral-dark mb-3">
          Page Not Found
        </h1>
        <p className="text-neutral-500 mb-10 leading-relaxed">
          Looks like this cut isn't on our menu. The page you're looking for doesn't exist or may have moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-igo-green text-white font-bold rounded-xl hover:bg-igo-green/90 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            to="/#products"
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-igo-green text-igo-green font-bold rounded-xl hover:bg-igo-green/5 transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            Shop Products
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
