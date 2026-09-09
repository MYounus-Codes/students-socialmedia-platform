-- Guarantee that every Auth user has a profile row and a unique handle.
CREATE OR REPLACE FUNCTION public.create_profile_for_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  generated_name TEXT;
  generated_username TEXT;
BEGIN
  generated_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
    split_part(COALESCE(NEW.email, 'student'), '@', 1),
    'Student'
  );
  generated_username := 'student-' || replace(NEW.id::text, '-', '')::text;

  INSERT INTO public.profiles (id, full_name, username)
  VALUES (NEW.id, generated_name, generated_username)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_create_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_create_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_profile_for_auth_user();

-- Backfill accounts created before profile provisioning was installed.
INSERT INTO public.profiles (id, full_name, username)
SELECT
  users.id,
  COALESCE(NULLIF(users.raw_user_meta_data ->> 'full_name', ''), split_part(COALESCE(users.email, 'student'), '@', 1), 'Student'),
  'student-' || replace(users.id::text, '-', '')
FROM auth.users AS users
LEFT JOIN public.profiles AS existing ON existing.id = users.id
WHERE existing.id IS NULL
ON CONFLICT (id) DO NOTHING;
