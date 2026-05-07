import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Order {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  amount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  created_at: string;
  delivered_at?: string;
  items: any[];
  delivery_address?: string;

  billing_address?: string;
  payment_method?: string;
  pincode?: string;
  delivery_slot?: string;
  delivery_date?: string;
}


/**
 * Order Service
 * Handles live transaction management and status lifecycle.
 */

export const getOrders = async (email?: string): Promise<Order[]> => {
  console.log('Fetching orders for:', email || 'all');
  try {
    // Check if Supabase is properly configured
    const isSupabaseLive = isSupabaseConfigured;
    
    let dbOrders: Order[] = [];
    if (isSupabaseLive) {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (email) {
        query = query.eq('customer_email', email);
      }

      const { data, error } = await query;
      if (error) throw error;
      dbOrders = data || [];
    }

    // Always merge with localStorage orders for high reliability (even if DB fails)
    const localOrdersRaw = localStorage.getItem('igo_orders_cache');
    let localOrders: Order[] = localOrdersRaw ? JSON.parse(localOrdersRaw) : [];
    
    if (email) {
      localOrders = localOrders.filter(o => o.customer_email === email);
    }

    // Merge and deduplicate by ID
    const allOrders = [...dbOrders, ...localOrders];
    const uniqueOrders = Array.from(new Map(allOrders.map(item => [item.id, item])).values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    console.log('Total unique orders found:', uniqueOrders.length);
    return uniqueOrders;
  } catch (err) {
    console.error('Fetch Orders Error:', err);
    // Fallback to local only on error
    const localOrdersRaw = localStorage.getItem('igo_orders_cache');
    return localOrdersRaw ? JSON.parse(localOrdersRaw) : [];
  }
};


export const createOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'status'>) => {
  const tempId = `IGO-${Math.floor(Math.random() * 90000) + 10000}`;
  const newOrder: Order = {
    ...orderData,
    id: tempId,
    status: 'Processing',
    created_at: new Date().toISOString()
  };

  try {
    // 1. Always save to localStorage first as a safety net
    const localOrdersRaw = localStorage.getItem('igo_orders_cache');
    const localOrders: Order[] = localOrdersRaw ? JSON.parse(localOrdersRaw) : [];
    localStorage.setItem('igo_orders_cache', JSON.stringify([newOrder, ...localOrders]));

    // 2. Try Supabase if configured
    const isSupabaseLive = isSupabaseConfigured;
    if (isSupabaseLive) {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          id: tempId,
          customer_email: orderData.customer_email,
          customer_name: orderData.customer_name,
          customer_phone: orderData.customer_phone,
          amount: orderData.amount,
          status: 'Processing',
          items: orderData.items,
          delivery_address: orderData.delivery_address,
          billing_address: orderData.billing_address,
          pincode: orderData.pincode,
          payment_method: orderData.payment_method || 'COD',
          delivery_slot: orderData.delivery_slot,
          delivery_date: orderData.delivery_date,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (!error && data) {
        // Update localStorage with real DB ID if successful
        const updatedLocal = [data, ...localOrders];
        localStorage.setItem('igo_orders_cache', JSON.stringify(updatedLocal));
        return { success: true, data: newOrder };
      } else if (error) {
        console.error('Supabase Order Insert Error:', error);
      }
    }

    // 3. Trigger email (best effort)
    if (orderData.customer_email) {
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: orderData.customer_email,
          userName: orderData.customer_name,
          type: 'ORDER_PLACED',
          subject: `Order Confirmed - ${tempId}`,
          data: {
            orderId: tempId,
            amount: orderData.amount,
            status: 'Placed',
            message: `Thank you for choosing IGO Protein Cuts! We've received your order and our team is already selecting the freshest cuts for you.`,
            statusImage: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800',
            items: orderData.items || [],
            address: orderData.delivery_address || 'Registered Address',
            logoUrl: 'https://igo-proteincuts.vercel.app/logo-green.png'
          }
        })
      }).catch(err => console.error('Initial email failed:', err));
    }

    return { success: true, data: newOrder };
  } catch (err) {
    console.error('Create Order Error:', err);
    return { success: true, data: newOrder };
  }
};

export const updateOrderStatus = async (orderId: string, status: string, orderData?: any) => {
  console.log(`Updating order ${orderId} to status ${status}`);
  try {
    const updateData: any = { status };
    if (status === 'Delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    // 1. Update Local Cache (Primary source of truth for demo)
    const localOrdersRaw = localStorage.getItem('igo_orders_cache');
    if (localOrdersRaw) {
      const localOrders: Order[] = JSON.parse(localOrdersRaw);
      const updatedOrders = localOrders.map(o => 
        o.id === orderId ? { ...o, ...updateData } : o
      );
      localStorage.setItem('igo_orders_cache', JSON.stringify(updatedOrders));
      console.log('Local cache updated for order status');
    }

    // 2. Try Supabase (Optional)
    const isSupabaseLive = isSupabaseConfigured;
    if (isSupabaseLive) {
      await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);
    }

    // 3. Trigger Professional Email
    if (orderData?.customer_email) {
    const APP_URL = window.location.origin;
    const getAbsoluteUrl = (path: string) => {
      if (!path) return '';
      if (path.startsWith('http')) return path;
      return `${APP_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const statusInfo: Record<string, any> = {
      Pending: {
        type: 'ORDER_PLACED',
        subject: 'Order Confirmed - ' + orderId,
        message: 'Hi ' + orderData.customer_name + ', your farm-fresh order is confirmed and is being prepared for selection.',
        image: 'https://images.pexels.com/photos/2255938/pexels-photo-2255938.jpeg?auto=compress&cs=tinysrgb&w=800' // Fresh meat selection
      },
      Processing: {
        type: 'ORDER_PACKED',
        subject: 'Your IGO Box is Packed!',
        message: 'Great news! Our farmers have hand-selected your cuts and they are now securely packed for freshness.',
        image: 'https://i.imgur.com/8N4pWzK.png' // IGO Branded Packed Box
      },
      Shipped: {
        type: 'ORDER_SHIPPED',
        subject: 'Freshness is on the Way!',
        message: 'Your order has been handed over to our express delivery partner and will arrive shortly.',
        image: 'https://i.imgur.com/8Qp49Xp.png' // IGO Branded Fast Truck
      },
      Delivered: {
        type: 'ORDER_DELIVERED',
        subject: 'Your Fresh Cuts have Arrived!',
        message: 'Your IGO Protein Cuts have been delivered. Thank you for choosing farm-fresh quality!',
        image: 'https://i.imgur.com/X4y5v6N.png' // IGO Branded Delivery Success
      },
      Cancelled: {
        type: 'ORDER_CANCELLED',
        subject: 'Order Cancelled - ' + orderId,
        message: 'Your order has been cancelled as requested. If you have any questions, please contact our support.',
        image: 'https://images.pexels.com/photos/4506249/pexels-photo-4506249.jpeg?auto=compress&cs=tinysrgb&w=800' // Abstract dark/red
      }
    };

    const info = statusInfo[status];
    if (info) {
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: orderData.customer_email,
          userName: orderData.customer_name,
          type: info.type,
          subject: info.subject,
          data: {
            orderId: orderId,
            amount: orderData.amount,
            status: status,
            message: info.message,
            statusImage: info.image,
            items: (orderData.items || []).map((item: any) => ({
              ...item,
              image: getAbsoluteUrl(item.image)
            })),
            address: orderData.delivery_address || 'Registered Address',
            logoUrl: 'https://i.imgur.com/Z4v6vXN.png', // Reliable IGO logo fallback
            reviewUrl: `${APP_URL}/review/${encodeURIComponent(orderId)}`
          }
        })
      })
          .then(d => console.log('Email sent successfully:', d))
          .catch(err => console.error('Update email failed:', err));
      }
    }

    return { success: true };
  } catch (err) {
    console.error('Update Order Error:', err);
    return { success: false, error: err };
  }
};

export const getAnalytics = async () => {
  const orders = await getOrders();
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.amount : 0), 0);
  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => ['Processing', 'Shipped'].includes(o.status)).length;
  
  // Calculate category mix
  const categoryMix = {
    Chicken: 0,
    Mutton: 0,
    Fish: 0,
    Others: 0
  };

  orders.forEach(o => {
    o.items?.forEach((item: any) => {
      const name = item.name.toLowerCase();
      if (name.includes('chicken')) categoryMix.Chicken++;
      else if (name.includes('mutton') || name.includes('goat')) categoryMix.Mutton++;
      else if (name.includes('fish') || name.includes('prawn')) categoryMix.Fish++;
      else categoryMix.Others++;
    });
  });

  const totalItems = Object.values(categoryMix).reduce((a, b) => a + b, 0) || 1;
  
  return {
    totalRevenue,
    totalOrders,
    activeOrders,
    categoryPercentages: {
      Chicken: Math.round((categoryMix.Chicken / totalItems) * 100),
      Mutton: Math.round((categoryMix.Mutton / totalItems) * 100),
      Fish: Math.round((categoryMix.Fish / totalItems) * 100),
      Others: Math.round((categoryMix.Others / totalItems) * 100),
    },
    weeklyData: orders.slice(0, 7).map(o => ({
      label: new Date(o.created_at).toLocaleDateString('en-US', { weekday: 'short' }),
      amount: o.amount,
      height: Math.min(Math.round((o.amount / 2000) * 100), 100)
    })).reverse()
  };
};

export const getCustomerList = async () => {
  const orders = await getOrders();
  const customerMap = new Map();

  orders.forEach(o => {
    if (!o.customer_email) return;
    const existing = customerMap.get(o.customer_email) || {
      id: o.customer_email,
      name: o.customer_name,
      email: o.customer_email,
      phone: o.customer_phone || '',
      address: o.delivery_address || '',
      orders: 0,
      totalSpend: 0,
      lastOrder: o.created_at,
      status: 'New'
    };


    existing.orders++;
    existing.totalSpend += o.amount;
    if (!existing.orderHistory) existing.orderHistory = [];
    existing.orderHistory.push(o);
    
    if (o.delivery_address) existing.address = o.delivery_address;
    if (o.billing_address) existing.billing_address = o.billing_address;
    if (o.pincode) existing.pincode = o.pincode;

    if (new Date(o.created_at) > new Date(existing.lastOrder)) {
      existing.lastOrder = o.created_at;
    }

    // Dynamic Status
    if (existing.totalSpend > 20000) existing.status = 'Diamond';
    else if (existing.orders > 5) existing.status = 'VIP';
    else if (existing.orders > 1) existing.status = 'Regular';

    customerMap.set(o.customer_email, existing);
  });

  return Array.from(customerMap.values());
};
