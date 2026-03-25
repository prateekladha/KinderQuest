create index if not exists family_members_family_id_role_idx
on public.family_members (family_id, role);

create index if not exists task_assignments_child_member_assigned_for_idx
on public.task_assignments (child_member_id, assigned_for);

create index if not exists task_assignments_child_member_status_assigned_for_idx
on public.task_assignments (child_member_id, status, assigned_for);

create index if not exists task_assignments_child_member_status_approved_at_idx
on public.task_assignments (child_member_id, status, approved_at desc);

create index if not exists task_assignments_family_id_status_claimed_at_idx
on public.task_assignments (family_id, status, claimed_at desc);

create index if not exists task_assignments_family_id_assigned_for_idx
on public.task_assignments (family_id, assigned_for desc);

create index if not exists reward_definitions_family_id_is_active_cost_idx
on public.reward_definitions (family_id, is_active, cost);

create index if not exists reward_redemptions_child_member_status_requested_at_idx
on public.reward_redemptions (child_member_id, status, requested_at desc);

create index if not exists reward_redemptions_family_id_status_requested_at_idx
on public.reward_redemptions (family_id, status, requested_at desc);

create index if not exists reward_redemptions_family_id_status_fulfilled_at_decided_at_idx
on public.reward_redemptions (family_id, status, fulfilled_at desc, decided_at desc);

create index if not exists push_tokens_user_id_active_idx
on public.push_tokens (user_id)
where disabled_at is null;
