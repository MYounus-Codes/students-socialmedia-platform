DROP POLICY IF EXISTS "Users can create notifications for others" ON public.notifications;
CREATE POLICY "Users can create notifications for others" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_id AND recipient_id <> auth.uid());