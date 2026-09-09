-- Enforce blocking at the database boundary for follows and visible posts.
DROP POLICY IF EXISTS "Users can manage their own follows" ON public.follows;
CREATE POLICY "Users can view follows" ON public.follows
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert unblocked follows" ON public.follows
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = follower_id
    AND NOT EXISTS (
      SELECT 1 FROM public.blocks
      WHERE (blocker_id = auth.uid() AND blocked_id = following_id)
         OR (blocker_id = following_id AND blocked_id = auth.uid())
    )
  );
CREATE POLICY "Users can delete own follows" ON public.follows
  FOR DELETE TO authenticated USING (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Authenticated users can view permitted posts" ON public.posts;
CREATE POLICY "Authenticated users can view permitted posts" ON public.posts
  FOR SELECT TO authenticated USING (
    NOT is_deleted
    AND NOT EXISTS (
      SELECT 1 FROM public.blocks
      WHERE (blocker_id = auth.uid() AND blocked_id = author_id)
         OR (blocker_id = author_id AND blocked_id = auth.uid())
    )
    AND (
      visibility = 'public'
      OR author_id = auth.uid()
      OR (
        visibility = 'followers_only'
        AND EXISTS (SELECT 1 FROM public.follows WHERE follower_id = auth.uid() AND following_id = author_id)
      )
    )
  );
