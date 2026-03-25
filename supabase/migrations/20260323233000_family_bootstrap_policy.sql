create policy "family creators can bootstrap their own parent membership"
on public.family_members
for insert
to authenticated
with check (
  user_id = auth.uid()
  and role = 'parent'
  and exists (
    select 1
    from public.families f
    where f.id = family_id
      and f.created_by = auth.uid()
  )
);
