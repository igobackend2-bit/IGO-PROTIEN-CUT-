import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, Camera, CheckCircle2, MessageSquare, ShieldCheck, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../sections/Footer';

const OrderReview = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    // Try to find the order in local cache to show what they bought
    const orders = JSON.parse(localStorage.getItem('igo_orders_cache') || '[]');
    const foundOrder = orders.find((o: any) => o.id === orderId);
    if (foundOrder) setOrder(foundOrder);
  }, [orderId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    // Save to local reviews cache
    const existingReviews = JSON.parse(localStorage.getItem('igo_reviews') || '[]');
    const newReview = {
      id: Date.now(),
      orderId,
      customerName: order?.customer_name || 'Verified Customer',
      rating,
      comment: review,
      date: new Date().toISOString(),
      items: order?.items?.map((i: any) => i.name) || [],
      isVerified: true
    };
    
    localStorage.setItem('igo_reviews', JSON.stringify([newReview, ...existingReviews]));
    setSubmitted(true);
    
    // Auto-redirect after success
    setTimeout(() => navigate('/'), 3000);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-6 py-12 md:py-20">
        {!submitted ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-neutral-200/50 border border-neutral-100"
          >
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-igo-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-igo-green" />
              </div>
              <h1 className="text-3xl font-display font-bold text-neutral-dark mb-2">Rate Your Experience</h1>
              <p className="text-neutral-500">How were your fresh cuts from Order <span className="font-bold text-neutral-800">#{orderId?.slice(0,8)}</span>?</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Star Rating */}
              <div className="text-center">
                <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4">Overall Quality</p>
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-all active:scale-90"
                    >
                      <Star 
                        className={`w-12 h-12 ${
                          (hoveredRating || rating) >= star 
                            ? 'fill-igo-gold text-igo-gold' 
                            : 'text-neutral-200'
                        } transition-colors`} 
                      />
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-sm font-medium text-igo-gold italic h-5">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Could be better"}
                  {rating === 3 && "Good Quality"}
                  {rating === 4 && "Great Experience"}
                  {rating === 5 && "Excellent! Farm Fresh"}
                </p>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-3">Tell us more about the freshness &amp; taste</label>
                <textarea 
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="The mutton was extremely tender, and the delivery was fast..."
                  className="w-full h-32 p-5 bg-neutral-50 border border-neutral-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-igo-green/20 focus:bg-white transition-all text-neutral-700 leading-relaxed"
                  required
                />
              </div>

              {/* Photo Upload Mock */}
              <div className="p-6 border-2 border-dashed border-neutral-100 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-neutral-50 transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center group-hover:bg-igo-green/10 transition-colors">
                  <Camera className="w-6 h-6 text-neutral-400 group-hover:text-igo-green" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-neutral-700">Add a Photo</p>
                  <p className="text-xs text-neutral-400">Show us your cooked masterpiece</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-bold uppercase tracking-widest px-2">
                <ShieldCheck className="w-4 h-4 text-igo-green" />
                Verified Purchase Review
              </div>

              <button 
                type="submit"
                disabled={rating === 0}
                className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl ${
                  rating === 0 
                    ? 'bg-neutral-100 text-neutral-300 cursor-not-allowed' 
                    : 'bg-igo-green text-white hover:bg-igo-green/90 shadow-igo-green/20'
                }`}
              >
                Submit Review
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-12 text-center shadow-xl border border-neutral-100"
          >
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-12 h-12 text-igo-green" />
            </div>
            <h2 className="text-3xl font-display font-bold text-neutral-dark mb-4">Thank You!</h2>
            <p className="text-neutral-500 mb-8 leading-relaxed">
              Your review helps other families choose the freshest proteins. <br/>
              We've added <span className="font-bold text-igo-green">50 IGO Reward Points</span> to your account!
            </p>
            <div className="animate-pulse text-sm font-bold text-igo-gold">Redirecting you home...</div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default OrderReview;
