-- ==============================================================================
-- MEDILINK SUPABASE DATABASE SETUP & ROW LEVEL SECURITY (RLS) SCRIPT
-- Run this script in your Supabase SQL Editor (https://app.supabase.com -> SQL Editor)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Public Profiles Table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'manager', 'admin')),
  manager_id TEXT UNIQUE DEFAULT NULL, -- e.g., 'ML-MGR-001', nullable for normal users
  pharmacy_id TEXT DEFAULT NULL,       -- e.g., 'PH-001', nullable for normal users
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_manager_id ON public.profiles(manager_id);
CREATE INDEX IF NOT EXISTS idx_profiles_pharmacy_id ON public.profiles(pharmacy_id);

-- 3. Automatic Profile Creation Trigger on auth.users Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, manager_id, pharmacy_id, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'MediLink User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NULL,
    NULL,
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Create Pharmacies Table (Store & Partner Locations)
CREATE TABLE IF NOT EXISTS public.pharmacies (
  id TEXT PRIMARY KEY, -- e.g. 'PH-001'
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Bhubaneswar',
  phone TEXT,
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  is_24_7 BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  rating NUMERIC(3, 2) DEFAULT 4.8,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create Medicines Catalog Table
CREATE TABLE IF NOT EXISTS public.medicines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_name TEXT NOT NULL,
  generic_name TEXT NOT NULL,
  category TEXT NOT NULL,
  dosage TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  requires_prescription BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medicines_brand ON public.medicines(brand_name);
CREATE INDEX IF NOT EXISTS idx_medicines_category ON public.medicines(category);

-- 6. Create Pharmacy Inventory Table (Stock levels per pharmacy)
CREATE TABLE IF NOT EXISTS public.pharmacy_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pharmacy_id TEXT NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  stock_quantity INT NOT NULL DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(pharmacy_id, medicine_id)
);

-- 7. Create Reservations Table for Patient Orders
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  medicine_name TEXT NOT NULL,
  pharmacy_name TEXT NOT NULL,
  pharmacy_id TEXT NOT NULL DEFAULT 'PH-001',
  status TEXT NOT NULL DEFAULT 'Ready for Pickup' CHECK (status IN ('Ready for Pickup', 'Confirmed', 'Completed', 'Cancelled')),
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  quantity INT NOT NULL DEFAULT 1,
  qr_code_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_pharmacy_id ON public.reservations(pharmacy_id);

-- 8. Create Prescriptions Table (User prescription uploads)
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Create Reviews Table (Pharmacy & Service Feedback)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pharmacy_id TEXT NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Allow authenticated read profile" ON public.profiles;
CREATE POLICY "Allow authenticated read profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow authenticated insert profile" ON public.profiles;
CREATE POLICY "Allow authenticated insert profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow authenticated update profile" ON public.profiles;
CREATE POLICY "Allow authenticated update profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Public Read for Catalog Data (Pharmacies, Medicines, Inventory)
DROP POLICY IF EXISTS "Allow public read pharmacies" ON public.pharmacies;
CREATE POLICY "Allow public read pharmacies" ON public.pharmacies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read medicines" ON public.medicines;
CREATE POLICY "Allow public read medicines" ON public.medicines FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read inventory" ON public.pharmacy_inventory;
CREATE POLICY "Allow public read inventory" ON public.pharmacy_inventory FOR SELECT USING (true);

-- Reservations Policies
DROP POLICY IF EXISTS "Patients view own reservations" ON public.reservations;
CREATE POLICY "Patients view own reservations" ON public.reservations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients create own reservations" ON public.reservations;
CREATE POLICY "Patients create own reservations" ON public.reservations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Managers view pharmacy reservations" ON public.reservations;
CREATE POLICY "Managers view pharmacy reservations" ON public.reservations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('manager', 'admin') AND (pharmacy_id = reservations.pharmacy_id OR role = 'admin')
  )
);

DROP POLICY IF EXISTS "Managers update pharmacy reservations" ON public.reservations;
CREATE POLICY "Managers update pharmacy reservations" ON public.reservations FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('manager', 'admin') AND (pharmacy_id = reservations.pharmacy_id OR role = 'admin')
  )
);

-- Prescriptions Policies
DROP POLICY IF EXISTS "Users view own prescriptions" ON public.prescriptions;
CREATE POLICY "Users view own prescriptions" ON public.prescriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create own prescriptions" ON public.prescriptions;
CREATE POLICY "Users create own prescriptions" ON public.prescriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- SAMPLE SEED DATA
-- ==============================================================================
INSERT INTO public.pharmacies (id, name, address, city, phone, is_24_7) VALUES
('PH-001', 'Apollo Pharmacy KIIT Square', 'KIIT Road, Patia', 'Bhubaneswar', '+91 9876543210', true),
('PH-002', 'City Central Pharmacy', 'Master Canteen Square', 'Bhubaneswar', '+91 9876543211', false),
('PH-003', 'Metro Meds 24/7', 'Jaydev Vihar', 'Bhubaneswar', '+91 9876543212', true)
ON CONFLICT (id) DO NOTHING;
