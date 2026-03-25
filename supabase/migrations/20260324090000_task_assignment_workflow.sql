create or replace function public.ensure_today_task_assignments(target_child_member_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  target_family_id uuid;
  inserted_count integer;
begin
  select fm.family_id
  into target_family_id
  from public.family_members fm
  where fm.id = target_child_member_id
    and fm.role = 'child';

  if target_family_id is null then
    raise exception 'Child family member not found.';
  end if;

  if not exists (
    select 1
    from public.family_members fm
    where fm.family_id = target_family_id
      and fm.user_id = auth.uid()
  ) then
    raise exception 'Not authorized to load assignments for this child.';
  end if;

  insert into public.task_assignments (
    family_id,
    task_definition_id,
    child_member_id,
    assigned_for,
    status,
    points_awarded
  )
  select
    td.family_id,
    td.id,
    target_child_member_id,
    current_date,
    'assigned',
    td.points
  from public.task_definitions td
  where td.family_id = target_family_id
    and td.is_active = true
    and td.cadence = 'daily'
    and not exists (
      select 1
      from public.task_assignments ta
      where ta.task_definition_id = td.id
        and ta.child_member_id = target_child_member_id
        and ta.assigned_for = current_date
    );

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

grant execute on function public.ensure_today_task_assignments(uuid) to authenticated;

create or replace function public.approve_task_assignment(target_assignment_id uuid)
returns void
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
end;
$$;

grant execute on function public.approve_task_assignment(uuid) to authenticated;

create or replace function public.reject_task_assignment(target_assignment_id uuid)
returns void
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
end;
$$;

grant execute on function public.reject_task_assignment(uuid) to authenticated;
