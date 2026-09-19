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

-- Index for quick lookup of roles and manager IDs
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
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'), -- Always defaults to 'user'
    NULL, -- manager_id can never be set during self-signup
    NULL, -- pharmacy_id can never be set during self-signup
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Create Reservations Table for Row Level Security (RLS) Protection
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

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on profiles and reservations
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES RLS POLICIES (NON-RECURSIVE)
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated read profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated insert profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated update profile" ON public.profiles;

-- Allow users to read their own profile (NO RECURSION)
CREATE POLICY "Allow authenticated read profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Allow authenticated insert profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Allow authenticated update profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- RESERVATIONS RLS POLICIES
-- ------------------------------------------------------------------------------

-- Patients can only view their own reservations
DROP POLICY IF EXISTS "Patients can view own reservations" ON public.reservations;
CREATE POLICY "Patients can view own reservations" ON public.reservations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Patients can insert their own reservations
DROP POLICY IF EXISTS "Patients can create own reservations" ON public.reservations;
CREATE POLICY "Patients can create own reservations" ON public.reservations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Managers can ONLY view reservations for their authorized pharmacy_id
DROP POLICY IF EXISTS "Managers view pharmacy reservations" ON public.reservations;
CREATE POLICY "Managers view pharmacy reservations" ON public.reservations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
        AND role IN ('manager', 'admin')
        AND (pharmacy_id = reservations.pharmacy_id OR role = 'admin')
    )
  );

-- Managers can update reservation status for their authorized pharmacy_id
DROP POLICY IF EXISTS "Managers update pharmacy reservations" ON public.reservations;
CREATE POLICY "Managers update pharmacy reservations" ON public.reservations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
        AND role IN ('manager', 'admin')
        AND (pharmacy_id = reservations.pharmacy_id OR role = 'admin')
    )
  );

-- ==============================================================================
-- 6. HELPER FUNCTION TO PROPERLY SEED MANAGER ACCOUNT (RUN IN SQL EDITOR)
-- ==============================================================================
-- Note: Manager accounts must be created or updated directly in database.
-- Example SQL to set a user as a Manager with Manager ID and Pharmacy ID:
--
-- UPDATE public.profiles 
-- SET role = 'manager', manager_id = 'ML-MGR-001', pharmacy_id = 'PH-001'
-- WHERE email = 'manager@medilink.com';
-- ==============================================================================
