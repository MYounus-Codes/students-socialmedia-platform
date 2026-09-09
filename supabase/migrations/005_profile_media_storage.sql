-- Public profile media buckets with per-user upload paths.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('covers', 'covers', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view profile media" ON storage.objects;
CREATE POLICY "Public can view profile media" ON storage.objects
  FOR SELECT USING (bucket_id IN ('avatars', 'covers'));

DROP POLICY IF EXISTS "Users can upload own profile media" ON storage.objects;
CREATE POLICY "Users can upload own profile media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('avatars', 'covers')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update own profile media" ON storage.objects;
CREATE POLICY "Users can update own profile media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id IN ('avatars', 'covers')
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id IN ('avatars', 'covers')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own profile media" ON storage.objects;
CREATE POLICY "Users can delete own profile media" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id IN ('avatars', 'covers')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
