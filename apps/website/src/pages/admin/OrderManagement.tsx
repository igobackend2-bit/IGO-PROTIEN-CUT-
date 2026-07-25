import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, Search, Filter, Eye, CheckCircle2, 
  Truck, Package, XCircle, RefreshCw, X, 
  MapPin, Phone, Mail, CreditCard, Clock, FileText,
  Award, ShieldCheck, Calendar as CalendarIcon, Map as MapIcon
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getOrders, updateOrderStatus, Order } from '../../services/orderService';

const TraceabilityModal = ({ order, onClose }: { order: Order, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-neutral-100"
      >
        {/* Certificate Header */}
        <div className="bg-igo-green p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <Award className="w-16 h-16 mx-auto mb-4 text-igo-gold drop-shadow-lg" />
          <h2 className="text-3xl font-display font-bold">Certificate of Traceability</h2>
          <p className="text-white/70 text-sm mt-2 tracking-widest uppercase font-bold">Batch ID: #IGO-TR-{order.id.slice(-6)}</p>
        </div>

        <div className="p-10 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <MapIcon className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase">Farm Source</p>
                  <p className="text-sm font-bold text-neutral-800">IGO Heritage Farms, TN</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase">Slaughter Date</p>
                  <p className="text-sm font-bold text-neutral-800">{new Date(new Date(order.created_at).getTime() - 86400000).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase">Quality Grade</p>
                  <p className="text-sm font-bold text-neutral-800">Prime Plus A+</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase">Vet Certificate</p>
                  <p className="text-sm font-bold text-neutral-800">Verified &amp; Signed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 rounded-3xl p-6 border border-neutral-100">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Batch Details</h4>
            <div className="space-y-3">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-neutral-600 font-medium">{item.name}</span>
                  <span className="font-bold text-neutral-800">{item.weight || '500g'} · Fresh Iced</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              <img src="/logo-green.png" alt="IGO" className="h-6 opacity-30 grayscale" />
              <div className="h-4 w-px bg-neutral-200 mx-2" />
              <p className="text-[10px] text-neutral-300 font-medium">Digital Signature: 0x8F...2E9A</p>
            </div>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-neutral-900 text-white rounded-2xl text-sm font-bold hover:bg-neutral-800 transition-all"
            >
              Close Certificate
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const OrderManagement = () => {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showTraceability, setShowTraceability] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const data = await getOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const handleStatusUpdate = async (order: Order, newStatus: Order['status']) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    setUpdateSuccess(null);
    
    const result = await updateOrderStatus(order.id, newStatus, order);
    
    if (result.success) {
      await fetchOrders();
      if (selectedOrder?.id === order.id) {
        setSelectedOrder({ ...order, status: newStatus });
      }
      setUpdateSuccess(`Order marked as ${newStatus}`);
      setTimeout(() => setUpdateSuccess(null), 3000);
    } else {
      alert('Failed to update order status. Please try again.');
    }
    setIsUpdating(false);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-600';
      case 'Shipped': return 'bg-purple-100 text-purple-600';
      case 'Processing': return 'bg-blue-100 text-blue-600';
      case 'Cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-orange-100 text-orange-600';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-800">Live Order Intelligence</h1>
          <p className="text-sm text-neutral-500 mt-1">Real-time fulfillment and logistics management.</p>
        </div>
        <button 
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-all shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Pipeline
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-neutral-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search Order ID, Customer Name or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-igo-green/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-400 ml-2" />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-neutral-50 border-none rounded-2xl text-sm py-2.5 pl-4 pr-10 focus:ring-2 focus:ring-igo-green/20 font-bold text-neutral-600"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                <th className="px-6 py-4 text-center">Detail</th>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="w-8 h-8 border-4 border-igo-green/20 border-t-igo-green rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-neutral-400 font-medium tracking-tight">Syncing with farm logistics...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-neutral-400 italic">No orders in current view.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors group">
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 bg-neutral-100 text-neutral-400 hover:bg-igo-green hover:text-white rounded-xl transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm text-neutral-800">#{order.id.slice(0, 8)}</p>
                      <p className="text-[10px] text-neutral-400 font-medium">{new Date(order.created_at).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-neutral-700">{order.customer_name}</p>
                      <p className="text-[10px] text-neutral-400">{order.customer_email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-sm text-neutral-800">₹{order.amount}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleStatusUpdate(order, 'Processing')}
                          title="Mark as Packed"
                          className="p-2 hover:bg-blue-50 text-blue-400 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                        >
                          <Package className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(order, 'Shipped')}
                          title="Mark as Shipped"
                          className="p-2 hover:bg-purple-50 text-purple-400 rounded-lg transition-colors border border-transparent hover:border-purple-100"
                        >
                          <Truck className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(order, 'Delivered')}
                          title="Mark as Delivered"
                          className="p-2 hover:bg-green-50 text-green-400 rounded-lg transition-colors border border-transparent hover:border-green-100"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(order, 'Cancelled')}
                          title="Cancel Order"
                          className="p-2 hover:bg-red-50 text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-neutral-dark/60 backdrop-blur-sm z-[1000]"
            />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-[1001] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getStatusColor(selectedOrder.status)} bg-opacity-20`}>
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-bold text-neutral-800">Order #{selectedOrder.id.slice(0, 8)}</h2>
                      <p className="text-sm text-neutral-500">Placed on {new Date(selectedOrder.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShowTraceability(selectedOrder)}
                      className="flex items-center gap-2 px-4 py-2 bg-igo-gold/10 text-igo-gold rounded-xl text-xs font-bold hover:bg-igo-gold/20 transition-all"
                    >
                      <Award className="w-4 h-4" />
                      Traceability
                    </button>
                    <button 
                      onClick={() => setSelectedOrder(null)}
                      className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 hover:bg-neutral-100 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Customer Info */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Customer Details</h3>
                      <div className="bg-neutral-50 rounded-2xl p-4 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <Mail className="w-4 h-4 text-igo-green" />
                          </div>
                          <div>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase">Email Address</p>
                            <p className="text-sm font-bold text-neutral-700">{selectedOrder.customer_email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <Phone className="w-4 h-4 text-igo-gold" />
                          </div>
                          <div>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase">Phone Number</p>
                            <p className="text-sm font-bold text-neutral-700">{selectedOrder.customer_phone || '+91 98765 43210'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Logistics Information</h3>
                      <div className="bg-neutral-50 rounded-2xl p-4 space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                            <MapPin className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase">Delivery Address</p>
                            <p className="text-sm font-medium text-neutral-700 leading-relaxed">
                              {selectedOrder.delivery_address || 'Chennai Central, Tamil Nadu'} <br />
                              Pincode: {selectedOrder.pincode || '600001'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <CreditCard className="w-4 h-4 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase">Payment Method</p>
                            <p className="text-sm font-bold text-neutral-700">{selectedOrder.payment_method || 'Online Payment'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Items Summary</h3>
                    <div className="border border-neutral-100 rounded-2xl overflow-hidden">
                      {selectedOrder.items?.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                              <Package className="w-5 h-5 text-neutral-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-neutral-800">{item.name}</p>
                              <p className="text-[10px] text-neutral-400 font-medium">{item.weight || '500g'} × {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-bold text-sm text-neutral-800">₹{item.price * item.quantity}</p>
                        </div>
                      ))}
                      <div className="bg-neutral-800 text-white p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium opacity-60">Total Amount Paid</span>
                          <span className="text-xl font-display font-bold text-igo-gold">₹{selectedOrder.amount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Order Timeline</h3>
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-igo-green/20 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-igo-green" />
                            </div>
                            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-full bg-neutral-100" />
                          </div>
                          <div className="pb-4">
                            <p className="text-sm font-bold text-neutral-800">Order Placed</p>
                            <p className="text-[10px] text-neutral-400">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="relative">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              ['Processing', 'Shipped', 'Delivered'].includes(selectedOrder.status) ? 'bg-blue-500/20 text-blue-500' : 'bg-neutral-100 text-neutral-300'
                            }`}>
                              <Package className="w-4 h-4" />
                            </div>
                            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-full bg-neutral-100" />
                          </div>
                          <div className="pb-4">
                            <p className="text-sm font-bold text-neutral-800">Packed &amp; Ready</p>
                            <p className="text-[10px] text-neutral-400">Status: {selectedOrder.status === 'Pending' ? 'Waiting' : 'Completed'}</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            selectedOrder.status === 'Delivered' ? 'bg-green-500 text-white' : 'bg-neutral-100 text-neutral-300'
                          }`}>
                            <Truck className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-neutral-800">Delivery Status</p>
                            <p className="text-[10px] text-neutral-400">{selectedOrder.status}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="mt-12 pt-8 border-t border-neutral-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-neutral-800">Update Fulfillment Status</h3>
                    {updateSuccess && (
                      <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] font-bold text-igo-green bg-igo-green/10 px-3 py-1 rounded-full"
                      >
                        {updateSuccess}
                      </motion.span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button 
                      onClick={() => handleStatusUpdate(selectedOrder, 'Processing')}
                      disabled={isUpdating}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        selectedOrder.status === 'Processing' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-neutral-100 hover:border-blue-200 text-neutral-400'
                      } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Package className="w-6 h-6" />
                      <span className="text-[10px] font-bold uppercase">Packed</span>
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(selectedOrder, 'Shipped')}
                      disabled={isUpdating}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        selectedOrder.status === 'Shipped' ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-neutral-100 hover:border-purple-200 text-neutral-400'
                      } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Truck className="w-6 h-6" />
                      <span className="text-[10px] font-bold uppercase">Shipped</span>
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(selectedOrder, 'Delivered')}
                      disabled={isUpdating}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        selectedOrder.status === 'Delivered' ? 'border-green-500 bg-green-50 text-green-600' : 'border-neutral-100 hover:border-green-200 text-neutral-400'
                      } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="text-[10px] font-bold uppercase">Delivered</span>
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(selectedOrder, 'Cancelled')}
                      disabled={isUpdating}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        selectedOrder.status === 'Cancelled' ? 'border-red-500 bg-red-50 text-red-600' : 'border-neutral-100 hover:border-red-200 text-neutral-400'
                      } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <XCircle className="w-6 h-6" />
                      <span className="text-[10px] font-bold uppercase">Cancel</span>
                    </button>
                  </div>
                  <p className="mt-4 text-[10px] text-neutral-400 font-medium italic">
                    * Changing status will automatically trigger a notification email to {selectedOrder.customer_email}.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Traceability Modal Overlay */}
      <AnimatePresence>
        {showTraceability && (
          <TraceabilityModal order={showTraceability} onClose={() => setShowTraceability(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderManagement;
