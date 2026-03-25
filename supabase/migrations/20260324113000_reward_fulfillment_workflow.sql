alter table public.reward_redemptions
add column if not exists fulfilled_at timestamptz;

create or replace function public.fulfill_reward_redemption(target_redemption_id uuid)
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
end;
$$;

grant execute on function public.fulfill_reward_redemption(uuid) to authenticated;
