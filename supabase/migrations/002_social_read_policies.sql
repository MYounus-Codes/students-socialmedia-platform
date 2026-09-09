-- Upgrade an existing Campusly database so the feed and comments can be read safely.
DROP POLICY IF EXISTS "Authenticated users can view public posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can view permitted posts" ON public.posts;

CREATE POLICY "Authenticated users can view permitted posts" ON public.posts
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND NOT is_deleted
    AND (
      visibility = 'public'
      OR author_id = auth.uid()
      OR (
        visibility = 'followers_only'
        AND EXISTS (
          SELECT 1 FROM public.follows
          WHERE follower_id = auth.uid() AND following_id = author_id
        )
      )
    )
  );

DROP POLICY IF EXISTS "Authenticated users can view post reactions" ON public.reactions;
CREATE POLICY "Authenticated users can view post reactions" ON public.reactions
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can view comments" ON public.comments;
CREATE POLICY "Authenticated users can view comments" ON public.comments
  FOR SELECT USING (auth.role() = 'authenticated' AND NOT is_deleted);

DROP POLICY IF EXISTS "Authenticated users can view comment reactions" ON public.comment_reactions;
CREATE POLICY "Authenticated users can view comment reactions" ON public.comment_reactions
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can view their own bookmarks" ON public.bookmarks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can view follows" ON public.follows;
CREATE POLICY "Authenticated users can view follows" ON public.follows
  FOR SELECT USING (auth.role() = 'authenticated');
