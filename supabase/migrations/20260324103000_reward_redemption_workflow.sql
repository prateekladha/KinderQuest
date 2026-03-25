create or replace function public.approve_reward_redemption(target_redemption_id uuid)
returns void
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
end;
$$;

grant execute on function public.approve_reward_redemption(uuid) to authenticated;

create or replace function public.reject_reward_redemption(target_redemption_id uuid)
returns void
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
end;
$$;

grant execute on function public.reject_reward_redemption(uuid) to authenticated;
