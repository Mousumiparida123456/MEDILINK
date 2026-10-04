-- Apply after supabase_setup.sql in the Supabase SQL Editor.
-- Manager applicants remain regular users until an administrator validates
-- their credentials and explicitly changes their profile role.

BEGIN;

CREATE TABLE IF NOT EXISTS public.manager_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  pharmacy_name TEXT NOT NULL,
  drug_licence_number TEXT NOT NULL,
  licence_type TEXT NOT NULL,
  pharmacist_name TEXT NOT NULL,
  pharmacist_registration_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.manager_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Applicants read own manager application" ON public.manager_applications;
CREATE POLICY "Applicants read own manager application"
  ON public.manager_applications
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins read manager applications" ON public.manager_applications;
CREATE POLICY "Admins read manager applications"
  ON public.manager_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = (SELECT auth.uid())
        AND role = 'admin'
    )
  );

REVOKE ALL ON public.manager_applications FROM anon, authenticated;
GRANT SELECT ON public.manager_applications TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  metadata JSONB := NEW.raw_user_meta_data;
BEGIN
  INSERT INTO public.profiles (id, email, name, role, manager_id, pharmacy_id, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(metadata->>'name', metadata->>'full_name', 'MediLink User'),
    'user',
    NULL,
    NULL,
    COALESCE(metadata->>'phone', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  IF metadata->>'requested_role' = 'manager' THEN
    IF NULLIF(BTRIM(metadata->>'pharmacy_name'), '') IS NULL
      OR NULLIF(BTRIM(metadata->>'drug_licence_number'), '') IS NULL
      OR NULLIF(BTRIM(metadata->>'licence_type'), '') IS NULL
      OR NULLIF(BTRIM(metadata->>'pharmacist_name'), '') IS NULL
      OR NULLIF(BTRIM(metadata->>'pharmacist_registration_number'), '') IS NULL
    THEN
      RAISE EXCEPTION 'Manager application is missing required pharmacy credentials';
    END IF;

    INSERT INTO public.manager_applications (
      user_id,
      pharmacy_name,
      drug_licence_number,
      licence_type,
      pharmacist_name,
      pharmacist_registration_number
    )
    VALUES (
      NEW.id,
      BTRIM(metadata->>'pharmacy_name'),
      BTRIM(metadata->>'drug_licence_number'),
      BTRIM(metadata->>'licence_type'),
      BTRIM(metadata->>'pharmacist_name'),
      BTRIM(metadata->>'pharmacist_registration_number')
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

COMMIT;
