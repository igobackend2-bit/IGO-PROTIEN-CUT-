-- IGO Protein Cuts - Supabase Database Schema
-- Finalized for Production Readiness

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1.5 DROP EXISTING TABLES TO ENSURE CLEAN SCHEMA
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.delivery_slots CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. TABLES

-- Profiles Table (Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    phone TEXT,
    avatar_url TEXT,
    address TEXT,
    pincode TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'delivery')),
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products Table (Inventory)
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    category TEXT NOT NULL,
    image TEXT,
    unit TEXT DEFAULT 'kg',
    badge TEXT,
    stock_left INTEGER DEFAULT 50,
    weight_options JSONB DEFAULT '[{"label": "500g", "priceMultiplier": 0.5}, {"label": "1kg", "priceMultiplier": 1}]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table (Transactions)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- Format: IGO-XXXXX
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'Processing' CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
    items JSONB NOT NULL DEFAULT '[]',
    delivery_address TEXT,
    billing_address TEXT,
    pincode TEXT,
    payment_method TEXT DEFAULT 'COD',
    delivery_slot TEXT,
    delivery_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Delivery Slots Table (Availability)
CREATE TABLE IF NOT EXISTS public.delivery_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    slot_type TEXT NOT NULL, -- express, morning, afternoon, evening
    start_time TIME,
    end_time TIME,
    max_capacity INTEGER DEFAULT 20,
    current_usage INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(date, slot_type)
);

-- 3. ROW LEVEL SECURITY (RLS)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_slots ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid()::text = id::text OR role = 'admin');
CREATE POLICY "Admins can do everything with profiles" ON public.profiles FOR ALL USING (role = 'admin');

-- Products Policies
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Only admins can modify products" ON public.products FOR ALL USING (role = 'admin');

-- Orders Policies
CREATE POLICY "Orders are viewable by customer email or admin" ON public.orders FOR SELECT USING (customer_email = auth.jwt()->>'email' OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Anyone can create an order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Delivery Slots Policies
CREATE POLICY "Slots are viewable by everyone" ON public.delivery_slots FOR SELECT USING (true);
CREATE POLICY "Only admins can modify slots" ON public.delivery_slots FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- 4. FUNCTIONS & TRIGGERS

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 5. INITIAL DATA (Seed)
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
