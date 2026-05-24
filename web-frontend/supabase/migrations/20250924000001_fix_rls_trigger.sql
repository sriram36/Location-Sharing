-- Fix 1: Robust handle_new_user trigger
-- Previous version didn't insert email and had no COALESCE fallbacks,
-- causing 500 errors on signup when metadata fields were missing.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''), SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'phone', '')), ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'parent')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name  = COALESCE(NULLIF(EXCLUDED.name, ''), public.users.name),
    updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix 2: RLS policy was blocking the trigger insert.
-- When the trigger fires, auth.uid() IS NULL (no session context),
-- so "Admins can insert users" always denied the insert → 500 on signup.
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;

CREATE POLICY "Allow profile creation" ON public.users
  FOR INSERT WITH CHECK (
    auth.uid() IS NULL     OR   -- trigger / service-role (no session)
    is_admin(auth.uid())   OR   -- admin creating a user via the UI
    auth.uid() = id             -- user bootstrapping their own profile
  );
