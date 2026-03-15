-- Supabase Database Schema for All Pro App
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE (User Information)
-- =====================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT NOT NULL,
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- 2. PRODUCTS TABLE (Promotions/Deals)
-- =====================================================
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  "promoPrice" NUMERIC(10, 2) NOT NULL,
  "originalPrice" NUMERIC(10, 2) NOT NULL,
  image TEXT NOT NULL,
  category TEXT NOT NULL,
  "shopName" TEXT NOT NULL,
  "shopId" TEXT NOT NULL,
  discount INTEGER NOT NULL,
  location TEXT NOT NULL,
  distance TEXT DEFAULT '0 km',
  likes INTEGER DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  rating NUMERIC(2, 1) DEFAULT 4.5,
  conditions TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies for products
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 3. SAVED_DEALS TABLE (User's Saved Products)
-- =====================================================
CREATE TABLE saved_deals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE saved_deals ENABLE ROW LEVEL SECURITY;

-- Policies for saved_deals
CREATE POLICY "Users can view own saved deals"
  ON saved_deals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved deals"
  ON saved_deals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved deals"
  ON saved_deals FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 4. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_shop_id ON products("shopId");
CREATE INDEX idx_saved_deals_user_id ON saved_deals(user_id);
CREATE INDEX idx_saved_deals_product_id ON saved_deals(product_id);

-- =====================================================
-- 5. TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. FUNCTION: Auto-create profile on user signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, xp, coins, level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Hunter'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://ui-avatars.com/api/?name=' || COALESCE(NEW.raw_user_meta_data->>'username', 'Hunter')),
    0,
    0,
    1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 7. INSERT SAMPLE PRODUCTS (Optional)
-- =====================================================
INSERT INTO products (
  title, description, "promoPrice", "originalPrice", image, category, 
  "shopName", "shopId", discount, location, distance, likes, reviews, rating, conditions
) VALUES
(
  'Premium Salmon Sushi Buffet',
  'All-you-can-eat salmon sushi buffet with 50+ varieties',
  399,
  799,
  'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
  'Food',
  'Sushi World',
  'shop-1',
  50,
  'Central World, Bangkok',
  '1.2 km',
  245,
  89,
  4.8,
  'Valid Mon-Fri only. Advance booking required.'
),
(
  'Luxury Spa Package',
  'Full body massage + facial treatment + aromatherapy',
  1299,
  2999,
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
  'Beauty',
  'Zen Spa',
  'shop-2',
  57,
  'Sukhumvit 24, Bangkok',
  '2.5 km',
  189,
  67,
  4.9,
  'Booking required 24h in advance. Valid for 3 months.'
),
(
  'Designer Sunglasses',
  'Ray-Ban Aviator sunglasses - Limited edition',
  2499,
  5999,
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
  'Fashion',
  'Fashion Hub',
  'shop-3',
  58,
  'Siam Paragon, Bangkok',
  '3.1 km',
  156,
  45,
  4.7,
  'Original with warranty. Limited stock.'
);

-- =====================================================
-- SETUP COMPLETE! 
-- =====================================================
-- Next Steps:
-- 1. Copy your Supabase URL and Anon Key to .env.local
-- 2. Update useAppStore to use Supabase
-- 3. Test authentication and data fetching
