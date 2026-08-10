-- Users remain in control of the observations the AI stores about them.
create policy "users delete own memory" on public.ai_memory_items for delete using (auth.uid() = user_id);
