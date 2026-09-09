-- Storage and RLS for images/videos attached to posts.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-media',
  'post-media',
  true,
  104857600,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view post media" ON storage.objects;
CREATE POLICY "Public can view post media" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-media');

DROP POLICY IF EXISTS "Users can upload post media in own folder" ON storage.objects;
CREATE POLICY "Users can upload post media in own folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'post-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update post media in own folder" ON storage.objects;
CREATE POLICY "Users can update post media in own folder" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'post-media' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'post-media' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete post media in own folder" ON storage.objects;
CREATE POLICY "Users can delete post media in own folder" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'post-media' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Authenticated users can view media metadata" ON public.media;
CREATE POLICY "Authenticated users can view media metadata" ON public.media
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can view post media links" ON public.post_media;
CREATE POLICY "Authenticated users can view post media links" ON public.post_media
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can link media to own posts" ON public.post_media;
CREATE POLICY "Users can link media to own posts" ON public.post_media
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.posts WHERE posts.id = post_id AND posts.author_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.media WHERE media.id = media_id AND media.user_id = auth.uid())
  );
