create extension if not exists pgcrypto;

create table if not exists public.reviews (
  id uuid primary key,
  shopify_product_id text not null,
  shopify_product_handle text not null,
  product_name text not null,
  display_name text not null check (char_length(display_name) between 2 and 60),
  rating smallint not null check (rating between 1 and 5),
  review_text text not null check (char_length(review_text) between 10 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists reviews_product_created_idx on public.reviews (shopify_product_id, created_at desc);
create index if not exists reviews_created_idx on public.reviews (created_at desc);

create table if not exists public.review_ip_submission_events (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  accepted_at timestamptz not null default now()
);
create index if not exists review_ip_events_lookup_idx on public.review_ip_submission_events (ip_hash, accepted_at desc);
create index if not exists review_ip_events_cleanup_idx on public.review_ip_submission_events (accepted_at);

create table if not exists public.review_duplicate_fingerprints (
  duplicate_hash text primary key,
  expires_at timestamptz not null
);
create index if not exists review_duplicate_expiry_idx on public.review_duplicate_fingerprints (expires_at);

alter table public.reviews enable row level security;
alter table public.review_ip_submission_events enable row level security;
alter table public.review_duplicate_fingerprints enable row level security;
revoke all on table public.reviews, public.review_ip_submission_events, public.review_duplicate_fingerprints from public, anon, authenticated;
grant select, insert on table public.reviews to service_role;

create or replace function public.check_review_antispam(p_ip_hash text, p_duplicate_hash text)
returns table(allowed boolean, reason text)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  now_at timestamptz := clock_timestamp();
  accepted_count integer;
  duplicate_inserted integer;
begin
  if p_ip_hash is null or p_duplicate_hash is null
     or p_ip_hash !~ '^[0-9a-f]{64}$' or p_duplicate_hash !~ '^[0-9a-f]{64}$' then
    return query select false, 'invalid_fingerprint';
    return;
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_ip_hash, 817231));
  delete from public.review_ip_submission_events
    where ip_hash = p_ip_hash and accepted_at <= now_at - interval '60 minutes';
  select count(*)::integer into accepted_count
    from public.review_ip_submission_events
    where ip_hash = p_ip_hash and accepted_at > now_at - interval '60 minutes';
  if accepted_count >= 3 then
    return query select false, 'rate_limited';
    return;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_duplicate_hash, 817232));
  delete from public.review_duplicate_fingerprints
    where duplicate_hash = p_duplicate_hash and expires_at <= now_at;
  insert into public.review_duplicate_fingerprints (duplicate_hash, expires_at)
    values (p_duplicate_hash, now_at + interval '10 minutes')
    on conflict (duplicate_hash) do nothing;
  get diagnostics duplicate_inserted = row_count;
  if duplicate_inserted = 0 then
    return query select false, 'duplicate';
    return;
  end if;

  insert into public.review_ip_submission_events (ip_hash, accepted_at)
    values (p_ip_hash, now_at);
  return query select true, 'allowed';
end;
$$;

revoke all on function public.check_review_antispam(text, text) from public, anon, authenticated;
grant execute on function public.check_review_antispam(text, text) to service_role;
