-- IGO Protein Cuts - Robust Supabase Database Schema
-- Finalized for Production Readiness

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES (Using ALTER to ensure columns exist without dropping data if possible)

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pincode TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY
);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'kg';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_left INTEGER DEFAULT 50;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weight_options JSONB DEFAULT '[{"label": "500g", "priceMultiplier": 0.5}, {"label": "1kg", "priceMultiplier": 1}]';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY
);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS amount NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Processing';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS billing_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pincode TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'COD';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_slot TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Delivery Slots Table
CREATE TABLE IF NOT EXISTS public.delivery_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
);
ALTER TABLE public.delivery_slots ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE public.delivery_slots ADD COLUMN IF NOT EXISTS slot_type TEXT;
ALTER TABLE public.delivery_slots ADD COLUMN IF NOT EXISTS start_time TIME;
ALTER TABLE public.delivery_slots ADD COLUMN IF NOT EXISTS end_time TIME;
ALTER TABLE public.delivery_slots ADD COLUMN IF NOT EXISTS max_capacity INTEGER DEFAULT 20;
ALTER TABLE public.delivery_slots ADD COLUMN IF NOT EXISTS current_usage INTEGER DEFAULT 0;
ALTER TABLE public.delivery_slots ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 3. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_slots ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can do everything with profiles" ON public.profiles;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Only admins can modify products" ON public.products;
DROP POLICY IF EXISTS "Orders are viewable by customer email or admin" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create an order" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Slots are viewable by everyone" ON public.delivery_slots;
DROP POLICY IF EXISTS "Only admins can modify slots" ON public.delivery_slots;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid()::text = id::text OR role = 'admin');
CREATE POLICY "Admins can do everything with profiles" ON public.profiles FOR ALL USING (role = 'admin');

-- Products Policies
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Only admins can modify products" ON public.products FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'));

-- Orders Policies
CREATE POLICY "Orders are viewable by customer email or admin" ON public.orders FOR SELECT USING (customer_email = auth.jwt()->>'email' OR EXISTS (SELECT 1 FROM public.profiles WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'));
CREATE POLICY "Anyone can create an order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'));

-- Delivery Slots Policies
CREATE POLICY "Slots are viewable by everyone" ON public.delivery_slots FOR SELECT USING (true);
CREATE POLICY "Only admins can modify slots" ON public.delivery_slots FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'));

-- 4. FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 5. INITIAL DATA (Seed)
-- Use ON CONFLICT DO NOTHING (requires unique constraint, which we add here if missing)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_date_slot') THEN
    ALTER TABLE public.delivery_slots ADD CONSTRAINT unique_date_slot UNIQUE(date, slot_type);
  END IF;
END $$;

INSERT INTO public.delivery_slots (date, slot_type, start_time, end_time, max_capacity) 
VALUES 
(CURRENT_DATE, 'express', '09:00:00', '21:00:00', 50),
(CURRENT_DATE, 'morning', '07:00:00', '10:00:00', 30),
(CURRENT_DATE, 'afternoon', '13:00:00', '16:00:00', 30),
(CURRENT_DATE, 'evening', '18:00:00', '21:00:00', 30)
ON CONFLICT (date, slot_type) DO NOTHING;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- 6. INBOX & QUERIES (New Features)
-- Inbox Messages Table
CREATE TABLE IF NOT EXISTS public.inbox_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
);
ALTER TABLE public.inbox_messages ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.inbox_messages ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.inbox_messages ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.inbox_messages ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'order_update';
ALTER TABLE public.inbox_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
ALTER TABLE public.inbox_messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Customer Queries Table
CREATE TABLE IF NOT EXISTS public.customer_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
);
ALTER TABLE public.customer_queries ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.customer_queries ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE public.customer_queries ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.customer_queries ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';
ALTER TABLE public.customer_queries ADD COLUMN IF NOT EXISTS admin_reply TEXT;
ALTER TABLE public.customer_queries ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.customer_queries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Setup Policies for the new tables
ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_queries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Inbox viewable by customer or admin" ON public.inbox_messages;
DROP POLICY IF EXISTS "Inbox insertable by admin or system" ON public.inbox_messages;
DROP POLICY IF EXISTS "Inbox updatable by customer" ON public.inbox_messages;
DROP POLICY IF EXISTS "Queries viewable by customer or admin" ON public.customer_queries;
DROP POLICY IF EXISTS "Queries insertable by customer" ON public.customer_queries;
DROP POLICY IF EXISTS "Queries updatable by admin" ON public.customer_queries;

CREATE POLICY "Inbox viewable by customer or admin" ON public.inbox_messages FOR SELECT USING (customer_email = auth.jwt()->>'email' OR EXISTS (SELECT 1 FROM public.profiles WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'));
CREATE POLICY "Inbox insertable by admin or system" ON public.inbox_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Inbox updatable by customer" ON public.inbox_messages FOR UPDATE USING (customer_email = auth.jwt()->>'email');

CREATE POLICY "Queries viewable by customer or admin" ON public.customer_queries FOR SELECT USING (customer_email = auth.jwt()->>'email' OR EXISTS (SELECT 1 FROM public.profiles WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'));
CREATE POLICY "Queries insertable by customer" ON public.customer_queries FOR INSERT WITH CHECK (true);
CREATE POLICY "Queries updatable by admin" ON public.customer_queries FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'));

-- Trigger for customer_queries
DROP TRIGGER IF EXISTS update_customer_queries_updated_at ON public.customer_queries;
CREATE TRIGGER update_customer_queries_updated_at BEFORE UPDATE ON public.customer_queries FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
