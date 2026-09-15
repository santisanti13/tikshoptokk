-- roles
create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Admins can read roles"
on public.user_roles for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

insert into public.user_roles (user_id, role)
values ('82cb3482-11c2-47e9-9ee2-bb3aac947646', 'admin')
on conflict (user_id, role) do nothing;

-- market snapshots
create table public.market_snapshots (
  id uuid primary key default gen_random_uuid(),
  captured_on date not null default (now()::date),
  country text not null default 'ES',
  ranking_type text not null,
  source text not null default 'fastmoss',
  rows jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (captured_on, country, ranking_type, source)
);

grant select on public.market_snapshots to anon;
grant select on public.market_snapshots to authenticated;
grant all on public.market_snapshots to service_role;

alter table public.market_snapshots enable row level security;

create policy "Anyone can read market snapshots"
on public.market_snapshots for select to anon, authenticated
using (true);

create trigger market_snapshots_updated_at
before update on public.market_snapshots
for each row execute function public.set_ugc_videos_updated_at();

-- admin token adjustments
create policy "Admins read all token accounts"
on public.ugc_token_accounts for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins read all token ledger"
on public.ugc_token_ledger for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create or replace function public.ugc_admin_adjust_tokens(_user_id uuid, _delta integer, _reason text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  new_balance integer;
begin
  if actor is null or not public.has_role(actor, 'admin') then
    raise exception 'not authorized';
  end if;
  if _delta is null or _delta = 0 then
    raise exception 'invalid token amount';
  end if;

  insert into public.ugc_token_accounts (user_id)
  values (_user_id)
  on conflict (user_id) do nothing;

  update public.ugc_token_accounts
     set balance_tokens = greatest(balance_tokens + _delta, 0)
   where user_id = _user_id
  returning balance_tokens into new_balance;

  insert into public.ugc_token_ledger (user_id, delta_tokens, reason, metadata)
  values (_user_id, _delta, coalesce(nullif(_reason, ''), 'admin_adjust'), jsonb_build_object('actor', actor));

  return new_balance;
end;
$$;

revoke all on function public.ugc_admin_adjust_tokens(uuid, integer, text) from public, anon;
grant execute on function public.ugc_admin_adjust_tokens(uuid, integer, text) to authenticated;

-- admin lookup of users by email
create or replace function public.admin_find_users(_search text)
returns table(user_id uuid, email text, balance_tokens integer, plan text, renews_at timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.has_role(auth.uid(), 'admin') then
    raise exception 'not authorized';
  end if;

  return query
  select u.id, u.email::text, a.balance_tokens, a.plan, a.renews_at
  from auth.users u
  left join public.ugc_token_accounts a on a.user_id = u.id
  where _search is null or _search = '' or u.email ilike '%' || _search || '%'
  order by u.created_at desc
  limit 50;
end;
$$;

revoke all on function public.admin_find_users(text) from public, anon;
grant execute on function public.admin_find_users(text) to authenticated;