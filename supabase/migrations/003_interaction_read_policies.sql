-- Ensure existing projects can read interaction rows used for feed counts.
DROP POLICY IF EXISTS "Authenticated users can view post reactions" ON public.reactions;
CREATE POLICY "Authenticated users can view post reactions" ON public.reactions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can view comments" ON public.comments;
CREATE POLICY "Authenticated users can view comments" ON public.comments
  FOR SELECT TO authenticated USING (NOT is_deleted);

DROP POLICY IF EXISTS "Authenticated users can view comment reactions" ON public.comment_reactions;
CREATE POLICY "Authenticated users can view comment reactions" ON public.comment_reactions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can view their own bookmarks" ON public.bookmarks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
