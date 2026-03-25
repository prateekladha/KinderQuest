create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  expo_push_token text not null unique,
  platform text not null,
  device_name text,
  disabled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index push_tokens_user_id_idx on public.push_tokens (user_id);

alter table public.push_tokens enable row level security;

create policy "users can read their own push tokens"
on public.push_tokens
for select
to authenticated
using (user_id = auth.uid());

create policy "users can insert their own push tokens"
on public.push_tokens
for insert
to authenticated
with check (user_id = auth.uid());

create policy "users can update their own push tokens"
on public.push_tokens
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create or replace function public.set_push_tokens_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists push_tokens_set_updated_at on public.push_tokens;

create trigger push_tokens_set_updated_at
before update on public.push_tokens
for each row
execute function public.set_push_tokens_updated_at();
