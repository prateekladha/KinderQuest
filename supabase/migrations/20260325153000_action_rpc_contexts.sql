drop function if exists public.claim_task_assignment(uuid);
drop function if exists public.request_reward_redemption(uuid);
drop function if exists public.approve_task_assignment(uuid);
drop function if exists public.reject_task_assignment(uuid);
drop function if exists public.approve_reward_redemption(uuid);
drop function if exists public.reject_reward_redemption(uuid);
drop function if exists public.fulfill_reward_redemption(uuid);

create or replace function public.claim_task_assignment(target_assignment_id uuid)
returns table(
  assignment_id uuid,
  family_id uuid,
  child_member_id uuid,
  child_display_name text,
  task_title text,
  parent_user_ids uuid[]
)
language plpgsql
security definer
set search_path = public
as $$
declare
  assignment_record public.task_assignments%rowtype;
begin
  select ta.*
  into assignment_record
  from public.task_assignments ta
  where ta.id = target_assignment_id;

  if assignment_record.id is null then
    raise exception 'Task assignment not found.';
  end if;

  if not exists (
    select 1
    from public.family_members fm
    where fm.id = assignment_record.child_member_id
      and fm.user_id = auth.uid()
      and fm.role = 'child'
  ) then
    raise exception 'Tasks can only be claimed from a child account.';
  end if;

  if assignment_record.status <> 'assigned' then
    raise exception 'Only assigned tasks can be claimed.';
  end if;

  update public.task_assignments
  set
    status = 'claimed',
    claimed_at = now()
  where id = target_assignment_id;

  return query
  select
    assignment_record.id,
    assignment_record.family_id,
    assignment_record.child_member_id,
    child_member.display_name,
    task_definition.title,
    coalesce(
      array_agg(parent_member.user_id) filter (where parent_member.user_id is not null),
      '{}'::uuid[]
    ) as parent_user_ids
  from public.family_members child_member
  left join public.task_definitions task_definition
    on task_definition.id = assignment_record.task_definition_id
  left join public.family_members parent_member
    on parent_member.family_id = assignment_record.family_id
   and parent_member.role = 'parent'
  where child_member.id = assignment_record.child_member_id
  group by child_member.display_name, task_definition.title;
end;
$$;

grant execute on function public.claim_task_assignment(uuid) to authenticated;

create or replace function public.request_reward_redemption(target_reward_id uuid)
returns table(
  redemption_id uuid,
  family_id uuid,
  child_member_id uuid,
  child_display_name text,
  reward_title text,
  reward_cost integer,
  parent_user_ids uuid[]
)
language plpgsql
security definer
set search_path = public
as $$
declare
  member_record public.family_members%rowtype;
  reward_record public.reward_definitions%rowtype;
  inserted_record public.reward_redemptions%rowtype;
begin
  select fm.*
  into member_record
  from public.family_members fm
  where fm.user_id = auth.uid()
    and fm.role = 'child'
  limit 1;

  if member_record.id is null then
    raise exception 'Rewards can only be redeemed from a child account.';
  end if;

  select rd.*
  into reward_record
  from public.reward_definitions rd
  where rd.id = target_reward_id
    and rd.family_id = member_record.family_id
    and rd.is_active = true;

  if reward_record.id is null then
    raise exception 'Reward not found.';
  end if;

  if member_record.stars_balance < reward_record.cost then
    raise exception 'You need % more stars for this reward.', reward_record.cost - member_record.stars_balance;
  end if;

  if exists (
    select 1
    from public.reward_redemptions rr
    where rr.child_member_id = member_record.id
      and rr.reward_definition_id = target_reward_id
      and rr.status = 'requested'
  ) then
    raise exception 'This reward is already waiting for parent approval.';
  end if;

  if exists (
    select 1
    from public.reward_redemptions rr
    where rr.child_member_id = member_record.id
      and rr.reward_definition_id = target_reward_id
      and rr.status = 'approved'
  ) then
    raise exception 'This reward is already approved. Mark it fulfilled before requesting it again.';
  end if;

  insert into public.reward_redemptions (
    family_id,
    reward_definition_id,
    child_member_id,
    cost_at_redemption
  )
  values (
    member_record.family_id,
    target_reward_id,
    member_record.id,
    reward_record.cost
  )
  returning *
  into inserted_record;

  return query
  select
    inserted_record.id,
    inserted_record.family_id,
    inserted_record.child_member_id,
    member_record.display_name,
    reward_record.title,
    reward_record.cost,
    coalesce(
      array_agg(parent_member.user_id) filter (where parent_member.user_id is not null),
      '{}'::uuid[]
    ) as parent_user_ids
  from public.family_members parent_member
  where parent_member.family_id = inserted_record.family_id
    and parent_member.role = 'parent'
  group by inserted_record.id, inserted_record.family_id, inserted_record.child_member_id, member_record.display_name, reward_record.title, reward_record.cost;
end;
$$;

grant execute on function public.request_reward_redemption(uuid) to authenticated;

create or replace function public.approve_task_assignment(target_assignment_id uuid)
returns table(
  assignment_id uuid,
  family_id uuid,
  child_member_id uuid,
  child_user_id uuid,
  task_title text,
  points_awarded integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  assignment_record public.task_assignments%rowtype;
begin
  select ta.*
  into assignment_record
  from public.task_assignments ta
  where ta.id = target_assignment_id;

  if assignment_record.id is null then
    raise exception 'Task assignment not found.';
  end if;

  if not exists (
    select 1
    from public.family_members fm
    where fm.family_id = assignment_record.family_id
      and fm.user_id = auth.uid()
      and fm.role = 'parent'
  ) then
    raise exception 'Only a parent in this family can approve tasks.';
  end if;

  if assignment_record.status <> 'claimed' then
    raise exception 'Only claimed tasks can be approved.';
  end if;

  update public.task_assignments
  set
    status = 'approved',
    approved_at = now(),
    approved_by = auth.uid()
  where id = target_assignment_id;

  update public.family_members
  set stars_balance = stars_balance + assignment_record.points_awarded
  where id = assignment_record.child_member_id;

  return query
  select
    assignment_record.id,
    assignment_record.family_id,
    assignment_record.child_member_id,
    child_member.user_id,
    task_definition.title,
    assignment_record.points_awarded
  from public.family_members child_member
  left join public.task_definitions task_definition
    on task_definition.id = assignment_record.task_definition_id
  where child_member.id = assignment_record.child_member_id;
end;
$$;

grant execute on function public.approve_task_assignment(uuid) to authenticated;

create or replace function public.reject_task_assignment(target_assignment_id uuid)
returns table(
  assignment_id uuid,
  family_id uuid,
  child_member_id uuid,
  child_user_id uuid,
  task_title text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  assignment_record public.task_assignments%rowtype;
begin
  select ta.*
  into assignment_record
  from public.task_assignments ta
  where ta.id = target_assignment_id;

  if assignment_record.id is null then
    raise exception 'Task assignment not found.';
  end if;

  if not exists (
    select 1
    from public.family_members fm
    where fm.family_id = assignment_record.family_id
      and fm.user_id = auth.uid()
      and fm.role = 'parent'
  ) then
    raise exception 'Only a parent in this family can reject tasks.';
  end if;

  if assignment_record.status <> 'claimed' then
    raise exception 'Only claimed tasks can be rejected.';
  end if;

  update public.task_assignments
  set
    status = 'rejected',
    approved_at = null,
    approved_by = null
  where id = target_assignment_id;

  return query
  select
    assignment_record.id,
    assignment_record.family_id,
    assignment_record.child_member_id,
    child_member.user_id,
    task_definition.title
  from public.family_members child_member
  left join public.task_definitions task_definition
    on task_definition.id = assignment_record.task_definition_id
  where child_member.id = assignment_record.child_member_id;
end;
$$;

grant execute on function public.reject_task_assignment(uuid) to authenticated;

create or replace function public.approve_reward_redemption(target_redemption_id uuid)
returns table(
  redemption_id uuid,
  family_id uuid,
  child_member_id uuid,
  child_user_id uuid,
  reward_title text,
  reward_cost integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  redemption_record public.reward_redemptions%rowtype;
begin
  select rr.*
  into redemption_record
  from public.reward_redemptions rr
  where rr.id = target_redemption_id;

  if redemption_record.id is null then
    raise exception 'Reward redemption not found.';
  end if;

  if not exists (
    select 1
    from public.family_members fm
    where fm.family_id = redemption_record.family_id
      and fm.user_id = auth.uid()
      and fm.role = 'parent'
  ) then
    raise exception 'Only a parent in this family can approve rewards.';
  end if;

  if redemption_record.status <> 'requested' then
    raise exception 'Only requested rewards can be approved.';
  end if;

  update public.reward_redemptions
  set
    status = 'approved',
    decided_at = now(),
    decided_by = auth.uid()
  where id = target_redemption_id;

  update public.family_members
  set stars_balance = greatest(0, stars_balance - redemption_record.cost_at_redemption)
  where id = redemption_record.child_member_id;

  return query
  select
    redemption_record.id,
    redemption_record.family_id,
    redemption_record.child_member_id,
    child_member.user_id,
    reward_definition.title,
    redemption_record.cost_at_redemption
  from public.family_members child_member
  left join public.reward_definitions reward_definition
    on reward_definition.id = redemption_record.reward_definition_id
  where child_member.id = redemption_record.child_member_id;
end;
$$;

grant execute on function public.approve_reward_redemption(uuid) to authenticated;

create or replace function public.reject_reward_redemption(target_redemption_id uuid)
returns table(
  redemption_id uuid,
  family_id uuid,
  child_member_id uuid,
  child_user_id uuid,
  reward_title text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  redemption_record public.reward_redemptions%rowtype;
begin
  select rr.*
  into redemption_record
  from public.reward_redemptions rr
  where rr.id = target_redemption_id;

  if redemption_record.id is null then
    raise exception 'Reward redemption not found.';
  end if;

  if not exists (
    select 1
    from public.family_members fm
    where fm.family_id = redemption_record.family_id
      and fm.user_id = auth.uid()
      and fm.role = 'parent'
  ) then
    raise exception 'Only a parent in this family can reject rewards.';
  end if;

  if redemption_record.status <> 'requested' then
    raise exception 'Only requested rewards can be rejected.';
  end if;

  update public.reward_redemptions
  set
    status = 'rejected',
    decided_at = now(),
    decided_by = auth.uid()
  where id = target_redemption_id;

  return query
  select
    redemption_record.id,
    redemption_record.family_id,
    redemption_record.child_member_id,
    child_member.user_id,
    reward_definition.title
  from public.family_members child_member
  left join public.reward_definitions reward_definition
    on reward_definition.id = redemption_record.reward_definition_id
  where child_member.id = redemption_record.child_member_id;
end;
$$;

grant execute on function public.reject_reward_redemption(uuid) to authenticated;

create or replace function public.fulfill_reward_redemption(target_redemption_id uuid)
returns table(
  redemption_id uuid,
  family_id uuid,
  child_member_id uuid,
  child_display_name text,
  reward_title text,
  parent_user_ids uuid[]
)
language plpgsql
security definer
set search_path = public
as $$
declare
  redemption_record public.reward_redemptions%rowtype;
begin
  select rr.*
  into redemption_record
  from public.reward_redemptions rr
  where rr.id = target_redemption_id;

  if redemption_record.id is null then
    raise exception 'Reward redemption not found.';
  end if;

  if not exists (
    select 1
    from public.family_members fm
    where fm.id = redemption_record.child_member_id
      and fm.user_id = auth.uid()
      and fm.role = 'child'
  ) then
    raise exception 'Only the child who requested this reward can mark it fulfilled.';
  end if;

  if redemption_record.status <> 'approved' then
    raise exception 'Only approved rewards can be fulfilled.';
  end if;

  update public.reward_redemptions
  set
    status = 'fulfilled',
    fulfilled_at = now()
  where id = target_redemption_id;

  return query
  select
    redemption_record.id,
    redemption_record.family_id,
    redemption_record.child_member_id,
    child_member.display_name,
    reward_definition.title,
    coalesce(
      array_agg(parent_member.user_id) filter (where parent_member.user_id is not null),
      '{}'::uuid[]
    ) as parent_user_ids
  from public.family_members child_member
  left join public.reward_definitions reward_definition
    on reward_definition.id = redemption_record.reward_definition_id
  left join public.family_members parent_member
    on parent_member.family_id = redemption_record.family_id
   and parent_member.role = 'parent'
  where child_member.id = redemption_record.child_member_id
  group by child_member.display_name, reward_definition.title;
end;
$$;

grant execute on function public.fulfill_reward_redemption(uuid) to authenticated;
