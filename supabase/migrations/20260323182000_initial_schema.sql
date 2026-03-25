create extension if not exists pgcrypto;

create type public.member_role as enum ('parent', 'child');
create type public.task_cadence as enum ('daily', 'weekly', 'once');
create type public.task_assignment_status as enum ('assigned', 'claimed', 'approved', 'rejected');
create type public.redemption_status as enum ('requested', 'approved', 'rejected', 'fulfilled');

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  display_name text not null,
  role public.member_role not null,
  avatar_url text,
  stars_balance integer not null default 0,
  created_at timestamptz not null default now(),
  unique (family_id, user_id)
);

create table public.task_definitions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  title text not null,
  description text,
  points integer not null check (points >= 0),
  cadence public.task_cadence not null default 'daily',
  requires_photo boolean not null default false,
  is_active boolean not null default true,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create table public.task_assignments (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  task_definition_id uuid not null references public.task_definitions (id) on delete cascade,
  child_member_id uuid not null references public.family_members (id) on delete cascade,
  assigned_for date not null,
  status public.task_assignment_status not null default 'assigned',
  claimed_at timestamptz,
  approved_at timestamptz,
  approved_by uuid references auth.users (id),
  points_awarded integer not null check (points_awarded >= 0),
  proof_note text,
  created_at timestamptz not null default now(),
  unique (task_definition_id, child_member_id, assigned_for)
);

create table public.reward_definitions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  title text not null,
  description text,
  cost integer not null check (cost >= 0),
  is_active boolean not null default true,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create table public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  reward_definition_id uuid not null references public.reward_definitions (id) on delete cascade,
  child_member_id uuid not null references public.family_members (id) on delete cascade,
  status public.redemption_status not null default 'requested',
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references auth.users (id),
  cost_at_redemption integer not null check (cost_at_redemption >= 0),
  notes text
);

create index family_members_user_id_idx on public.family_members (user_id);
create index task_definitions_family_id_idx on public.task_definitions (family_id);
create index task_assignments_family_id_idx on public.task_assignments (family_id);
create index task_assignments_child_member_id_idx on public.task_assignments (child_member_id);
create index reward_definitions_family_id_idx on public.reward_definitions (family_id);
create index reward_redemptions_family_id_idx on public.reward_redemptions (family_id);
create index reward_redemptions_child_member_id_idx on public.reward_redemptions (child_member_id);

create or replace function public.current_family_ids()
returns setof uuid
language sql
stable
as $$
  select fm.family_id
  from public.family_members fm
  where fm.user_id = auth.uid()
$$;

create or replace function public.is_parent_in_family(target_family_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.family_members fm
    where fm.family_id = target_family_id
      and fm.user_id = auth.uid()
      and fm.role = 'parent'
  )
$$;

create or replace function public.is_child_member(target_member_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.family_members fm
    where fm.id = target_member_id
      and fm.user_id = auth.uid()
      and fm.role = 'child'
  )
$$;

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.task_definitions enable row level security;
alter table public.task_assignments enable row level security;
alter table public.reward_definitions enable row level security;
alter table public.reward_redemptions enable row level security;

create policy "family members can read families"
on public.families
for select
using (id in (select public.current_family_ids()));

create policy "authenticated users can create families"
on public.families
for insert
to authenticated
with check (created_by = auth.uid());

create policy "family members can read members"
on public.family_members
for select
using (family_id in (select public.current_family_ids()));

create policy "parents can manage members"
on public.family_members
for all
to authenticated
using (public.is_parent_in_family(family_id))
with check (public.is_parent_in_family(family_id));

create policy "family members can read task definitions"
on public.task_definitions
for select
using (family_id in (select public.current_family_ids()));

create policy "parents can manage task definitions"
on public.task_definitions
for all
to authenticated
using (public.is_parent_in_family(family_id))
with check (public.is_parent_in_family(family_id));

create policy "family members can read task assignments"
on public.task_assignments
for select
using (family_id in (select public.current_family_ids()));

create policy "parents can manage task assignments"
on public.task_assignments
for all
to authenticated
using (public.is_parent_in_family(family_id))
with check (public.is_parent_in_family(family_id));

create policy "children can claim their own task assignments"
on public.task_assignments
for update
to authenticated
using (public.is_child_member(child_member_id))
with check (public.is_child_member(child_member_id));

create policy "family members can read reward definitions"
on public.reward_definitions
for select
using (family_id in (select public.current_family_ids()));

create policy "parents can manage reward definitions"
on public.reward_definitions
for all
to authenticated
using (public.is_parent_in_family(family_id))
with check (public.is_parent_in_family(family_id));

create policy "family members can read reward redemptions"
on public.reward_redemptions
for select
using (family_id in (select public.current_family_ids()));

create policy "parents can manage reward redemptions"
on public.reward_redemptions
for all
to authenticated
using (public.is_parent_in_family(family_id))
with check (public.is_parent_in_family(family_id));

create policy "children can create their own redemptions"
on public.reward_redemptions
for insert
to authenticated
with check (public.is_child_member(child_member_id) and family_id in (select public.current_family_ids()));

create policy "children can update their own pending redemptions"
on public.reward_redemptions
for update
to authenticated
using (public.is_child_member(child_member_id))
with check (public.is_child_member(child_member_id));

create or replace function public.set_task_points_awarded()
returns trigger
language plpgsql
as $$
begin
  if new.points_awarded is null or new.points_awarded = 0 then
    select td.points
    into new.points_awarded
    from public.task_definitions td
    where td.id = new.task_definition_id;
  end if;

  return new;
end;
$$;

create trigger set_task_points_awarded_before_insert
before insert on public.task_assignments
for each row
execute function public.set_task_points_awarded();

create or replace function public.set_redemption_cost()
returns trigger
language plpgsql
as $$
begin
  if new.cost_at_redemption is null or new.cost_at_redemption = 0 then
    select rd.cost
    into new.cost_at_redemption
    from public.reward_definitions rd
    where rd.id = new.reward_definition_id;
  end if;

  return new;
end;
$$;

create trigger set_redemption_cost_before_insert
before insert on public.reward_redemptions
for each row
execute function public.set_redemption_cost();
