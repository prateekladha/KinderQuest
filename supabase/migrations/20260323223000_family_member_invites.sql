create type public.family_invite_status as enum ('pending', 'accepted', 'revoked');

create table public.family_member_invites (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  invited_by uuid not null references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null,
  role public.member_role not null,
  status public.family_invite_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index family_member_invites_family_id_idx on public.family_member_invites (family_id);
create index family_member_invites_email_idx on public.family_member_invites (email);

alter table public.family_member_invites enable row level security;

create policy "family members can read invites"
on public.family_member_invites
for select
using (family_id in (select public.current_family_ids()));

create policy "parents can manage invites"
on public.family_member_invites
for all
to authenticated
using (public.is_parent_in_family(family_id))
with check (public.is_parent_in_family(family_id));
