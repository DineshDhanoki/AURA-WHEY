alter table public.reviews add column if not exists image_paths text[] not null default '{}';
alter table public.reviews drop constraint if exists reviews_image_paths_limit;
alter table public.reviews add constraint reviews_image_paths_limit check (cardinality(image_paths) <= 3);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review-images', 'review-images', true, 800000, array['image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.list_public_reviews_with_images(p_product_handle text, p_scope text, p_visitor_hash text, p_limit integer default 50)
returns table(id uuid, shopify_product_handle text, product_name text, display_name text, rating smallint, review_text text, created_at timestamptz, image_paths text[], like_count bigint, liked boolean)
language sql security definer set search_path = pg_catalog, public
as $$
  select r.id, r.shopify_product_handle, r.product_name, r.display_name, r.rating, r.review_text, r.created_at, r.image_paths,
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

revoke all on function public.list_public_reviews_with_images(text,text,text,integer) from public, anon, authenticated;
grant execute on function public.list_public_reviews_with_images(text,text,text,integer) to service_role;

revoke all on table public.reviews from anon, authenticated;
grant select, insert, update, delete on table public.reviews to service_role;
