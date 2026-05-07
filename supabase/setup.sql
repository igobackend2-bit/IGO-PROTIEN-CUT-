-- IGO Protein Cuts - Supabase Database Initialization

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- We use IGO-XXXXX custom IDs
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'Processing' CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
    items JSONB DEFAULT '[]'::jsonb,
    delivery_address TEXT,
    billing_address TEXT,
    payment_method TEXT,
    pincode TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for guest checkout)
CREATE POLICY "Allow anon insert on orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon read on orders" ON public.orders FOR SELECT USING (true);

-- Allow anonymous inserts on profiles
CREATE POLICY "Allow anon insert on profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon upsert on profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Allow anon read on profiles" ON public.profiles FOR SELECT USING (true);

-- Note: In a production environment, you should restrict SELECT policies 
-- to ensure users can only see their own orders based on their email.
