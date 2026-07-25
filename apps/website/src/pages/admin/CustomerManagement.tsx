import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Search, Mail, Phone, MapPin, Star, 
  ChevronRight, Filter, Download, IndianRupee, X,
  ShoppingBag, Clock, TrendingUp, CreditCard
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const CustomerManagement = () => {
  const [searchParams] = useSearchParams();
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  React.useEffect(() => {
    const fetch = async () => {
      const { getCustomerList } = await import('../../services/orderService');
      const list = await getCustomerList();
      setCustomers(list);
      setLoading(false);
    };
    fetch();
  }, []);

  const filteredCustomers = customers.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = c.name.toLowerCase().includes(searchLower);
    const emailMatch = c.email.toLowerCase().includes(searchLower);
    const orderMatch = c.orderHistory?.some((o: any) => o.id.toLowerCase().includes(searchLower));
    return nameMatch || emailMatch || orderMatch;
  });

  if (loading) return <div className="p-20 text-center font-bold text-neutral-400">Syncing customer records...</div>;

  const totalSpend = customers.reduce((sum, c) => sum + c.totalSpend, 0);
  const avgLTV = customers.length > 0 ? Math.round(totalSpend / customers.length) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 text-display">Customer Intelligence</h1>
          <p className="text-neutral-500 text-sm">Monitor your user base and their engagement levels.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-all">
            <Download className="w-4 h-4" />
            Export Segments
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Customers', value: customers.length, change: 'Live', icon: Users, color: 'text-igo-green' },
          { label: 'Active This Month', value: customers.filter(c => new Date(c.lastOrder) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, change: 'Live', icon: Star, color: 'text-igo-gold' },
          { label: 'Avg. Lifetime Value', value: `₹${avgLTV.toLocaleString()}`, change: 'Live', icon: IndianRupee, color: 'text-blue-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
            <div className={`p-3 rounded-2xl bg-neutral-50 inline-block mb-4 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                <h4 className="text-2xl font-bold mt-1 text-neutral-800">{stat.value}</h4>
              </div>
              <span className="text-green-500 text-xs font-bold">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search & List */}
      <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-igo-green/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-neutral-50 text-neutral-600 rounded-xl text-xs font-bold">
              <Filter className="w-3.5 h-3.5" />
              Status: All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Total Spend</th>
                <th className="px-6 py-4">Last Activity</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-500 uppercase">
                        {c.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-neutral-800">{c.name}</p>
                        <p className="text-[10px] text-neutral-400 font-medium">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      c.status === 'Diamond' ? 'bg-purple-100 text-purple-600' :
                      c.status === 'VIP' ? 'bg-igo-green/10 text-igo-green' :
                      c.status === 'Regular' ? 'bg-blue-100 text-blue-600' :
                      'bg-neutral-100 text-neutral-500'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-neutral-600">{c.orders} Orders</td>
                  <td className="px-6 py-4 text-sm font-bold text-neutral-800">₹{c.totalSpend.toLocaleString()}</td>
                  <td className="px-6 py-4 text-xs text-neutral-400 font-medium">{new Date(c.lastOrder).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedCustomer(c)}
                      className="p-2 text-neutral-400 hover:text-igo-green hover:bg-neutral-50 rounded-xl transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCustomer(null)}
              className="fixed inset-0 bg-neutral-dark/60 backdrop-blur-sm z-[1000]"
            />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-[1001] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-igo-green to-igo-green/50 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-igo-green/20">
                      {selectedCustomer.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <h2 className="text-3xl font-display font-bold text-neutral-800">{selectedCustomer.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          selectedCustomer.status === 'Diamond' ? 'bg-purple-100 text-purple-600' :
                          selectedCustomer.status === 'VIP' ? 'bg-igo-green/10 text-igo-green' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {selectedCustomer.status} Tier
                        </span>
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">• Member since 2024</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedCustomer(null)}
                    className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 hover:bg-neutral-100 transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {/* Left Column: Stats & Contact */}
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-neutral-50 rounded-[2rem] border border-neutral-100">
                        <div className="flex items-center gap-2 text-neutral-400 mb-2">
                          <ShoppingBag className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Orders</span>
                        </div>
                        <p className="text-2xl font-bold text-neutral-800">{selectedCustomer.orders}</p>
                      </div>
                      <div className="p-5 bg-neutral-50 rounded-[2rem] border border-neutral-100">
                        <div className="flex items-center gap-2 text-neutral-400 mb-2">
                          <TrendingUp className="w-4 h-4 text-igo-green" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Revenue</span>
                        </div>
                        <p className="text-2xl font-bold text-neutral-800">₹{selectedCustomer.totalSpend.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-2">Identity Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 p-4 bg-white border border-neutral-100 rounded-[2rem] shadow-sm">
                          <div className="w-10 h-10 rounded-xl bg-igo-green/10 flex items-center justify-center text-igo-green">
                            <Mail className="w-5 h-5" />
                          </div>
                          <p className="text-sm font-bold text-neutral-700">{selectedCustomer.email}</p>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white border border-neutral-100 rounded-[2rem] shadow-sm">
                          <div className="w-10 h-10 rounded-xl bg-igo-gold/10 flex items-center justify-center text-igo-gold">
                            <Phone className="w-5 h-5" />
                          </div>
                          <p className="text-sm font-bold text-neutral-700">{selectedCustomer.phone || '+91 98765 43210'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-2">Logistics Center</h3>
                      <div className="space-y-4">
                        <div className="p-5 bg-blue-50/30 border border-blue-100 rounded-[2rem]">
                          <div className="flex items-center gap-2 text-blue-500 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Primary Delivery Address</span>
                          </div>
                          <p className="text-sm font-medium text-neutral-700 leading-relaxed">
                            {selectedCustomer.address || 'Chennai Central, Tamil Nadu, 600001'}
                          </p>
                        </div>
                        <div className="p-5 bg-neutral-50 border border-neutral-100 rounded-[2rem]">
                          <div className="flex items-center gap-2 text-neutral-400 mb-2">
                            <CreditCard className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Default Billing Address</span>
                          </div>
                          <p className="text-sm font-medium text-neutral-700 leading-relaxed">
                            {selectedCustomer.billing_address || selectedCustomer.address || 'Chennai Central, Tamil Nadu, 600001'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Order History Timeline */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-2">Transaction History</h3>
                    <div className="bg-neutral-50 rounded-[2rem] border border-neutral-100 p-2 overflow-hidden">
                      <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {selectedCustomer.orderHistory?.map((order: any, idx: number) => (
                          <div key={idx} className="p-4 bg-white rounded-2xl border border-neutral-50 shadow-sm hover:border-igo-green/20 transition-all">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tighter">Order ID</p>
                                <p className="text-sm font-bold text-neutral-800">#{order.id.slice(0, 8)}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                                order.status === 'Delivered' ? 'bg-green-100 text-green-600' :
                                order.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-neutral-400">{new Date(order.created_at).toLocaleDateString()}</p>
                              <p className="text-sm font-bold text-igo-green">₹{order.amount}</p>
                            </div>
                          </div>
                        ))}
                        {(!selectedCustomer.orderHistory || selectedCustomer.orderHistory.length === 0) && (
                          <div className="p-8 text-center text-neutral-400 italic text-sm">
                            No recent transactions found.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 py-4 bg-igo-green text-white rounded-2xl font-bold hover:bg-igo-green/90 transition-all shadow-lg shadow-igo-green/20 flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Personalized Coupon
                  </button>
                  <button className="flex-1 py-4 bg-neutral-dark text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2">
                    <Star className="w-4 h-4 text-igo-gold" />
                    Mark as VIP
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerManagement;
