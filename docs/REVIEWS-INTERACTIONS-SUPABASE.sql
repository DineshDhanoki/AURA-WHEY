alter table public.reviews add column if not exists owner_token_hash text;
alter table public.reviews drop constraint if exists reviews_owner_token_hash_format;
alter table public.reviews add constraint reviews_owner_token_hash_format check (owner_token_hash is null or owner_token_hash ~ '^[0-9a-f]{64}$');

create table if not exists public.review_likes (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  visitor_hash text not null check (visitor_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  unique (review_id, visitor_hash)
);
create index if not exists review_likes_review_idx on public.review_likes (review_id);

create table if not exists public.review_like_action_events (
  id uuid primary key default gen_random_uuid(),
  visitor_hash text not null,
  ip_hash text not null,
  acted_at timestamptz not null default now()
);
create index if not exists review_like_actions_visitor_idx on public.review_like_action_events (visitor_hash, acted_at desc);
create index if not exists review_like_actions_ip_idx on public.review_like_action_events (ip_hash, acted_at desc);
create index if not exists review_like_actions_cleanup_idx on public.review_like_action_events (acted_at);

create table if not exists public.review_delete_attempt_events (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  attempted_at timestamptz not null default now()
);
create index if not exists review_delete_attempts_ip_idx on public.review_delete_attempt_events (ip_hash, attempted_at desc);
create index if not exists review_delete_attempts_cleanup_idx on public.review_delete_attempt_events (attempted_at);

alter table public.review_likes enable row level security;
alter table public.review_like_action_events enable row level security;
alter table public.review_delete_attempt_events enable row level security;
revoke all on table public.review_likes, public.review_like_action_events, public.review_delete_attempt_events from public, anon, authenticated;
grant select, insert, delete on table public.review_likes to service_role;
grant select, insert, delete on table public.review_like_action_events, public.review_delete_attempt_events to service_role;
grant select, update, delete on table public.reviews to service_role;

create or replace function public.list_public_reviews(p_product_handle text, p_scope text, p_visitor_hash text, p_limit integer default 50)
returns table(id uuid, shopify_product_handle text, product_name text, display_name text, rating smallint, review_text text, created_at timestamptz, like_count bigint, liked boolean)
language sql security definer set search_path = pg_catalog, public
as $$
  select r.id, r.shopify_product_handle, r.product_name, r.display_name, r.rating, r.review_text, r.created_at,
    count(l.id)::bigint,
    coalesce(bool_or(l.visitor_hash = p_visitor_hash), false)
  from public.reviews r
  left join public.review_likes l on l.review_id = r.id
  where (p_scope = 'home' and r.shopify_product_handle in ('aura-whey-rich-chocolate-1-kg','aura-whey-mawa-kulfi-1-kg'))
     or (p_scope = 'product' and r.shopify_product_handle = p_product_handle)
  group by r.id
  order by r.created_at desc
  limit least(greatest(coalesce(p_limit, 50), 1), 50)
$$;

create or replace function public.set_review_like(p_review_id uuid, p_visitor_hash text, p_ip_hash text, p_liked boolean)
returns table(ok boolean, reason text, like_count bigint, liked boolean)
language plpgsql security definer set search_path = pg_catalog, public
as $$
declare now_at timestamptz := clock_timestamp(); visitor_actions integer; ip_actions integer;
begin
  if p_visitor_hash !~ '^[0-9a-f]{64}$' or p_ip_hash !~ '^[0-9a-f]{64}$' then return query select false,'invalid',0::bigint,false; return; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_ip_hash, 817232));
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_visitor_hash, 817233));
  delete from public.review_like_action_events where acted_at <= now_at - interval '1 minute';
  select count(*) into visitor_actions from public.review_like_action_events where visitor_hash=p_visitor_hash and acted_at>now_at-interval '1 minute';
  select count(*) into ip_actions from public.review_like_action_events where ip_hash=p_ip_hash and acted_at>now_at-interval '1 minute';
  if visitor_actions >= 20 or ip_actions >= 60 then return query select false,'rate_limited',0::bigint,false; return; end if;
  if not exists(select 1 from public.reviews where reviews.id=p_review_id) then return query select false,'not_found',0::bigint,false; return; end if;
  if p_liked then insert into public.review_likes(review_id,visitor_hash) values(p_review_id,p_visitor_hash) on conflict(review_id,visitor_hash) do nothing;
  else delete from public.review_likes where review_id=p_review_id and visitor_hash=p_visitor_hash; end if;
  insert into public.review_like_action_events(visitor_hash,ip_hash,acted_at) values(p_visitor_hash,p_ip_hash,now_at);
  return query select true,'ok',(select count(*) from public.review_likes where review_id=p_review_id),p_liked;
end $$;

create or replace function public.check_review_delete_rate_limit(p_ip_hash text)
returns table(allowed boolean, reason text)
language plpgsql security definer set search_path = pg_catalog, public
as $$
declare now_at timestamptz:=clock_timestamp(); attempts integer;
begin
  if p_ip_hash !~ '^[0-9a-f]{64}$' then return query select false,'invalid'; return; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_ip_hash,817234));
  delete from public.review_delete_attempt_events where attempted_at<=now_at-interval '1 minute';
  select count(*) into attempts from public.review_delete_attempt_events where ip_hash=p_ip_hash and attempted_at>now_at-interval '1 minute';
  if attempts>=10 then return query select false,'rate_limited'; return; end if;
  insert into public.review_delete_attempt_events(ip_hash,attempted_at) values(p_ip_hash,now_at);
  return query select true,'allowed';
end $$;

revoke all on function public.list_public_reviews(text,text,text,integer), public.set_review_like(uuid,text,text,boolean), public.check_review_delete_rate_limit(text) from public, anon, authenticated;
grant execute on function public.list_public_reviews(text,text,text,integer), public.set_review_like(uuid,text,text,boolean), public.check_review_delete_rate_limit(text) to service_role;
