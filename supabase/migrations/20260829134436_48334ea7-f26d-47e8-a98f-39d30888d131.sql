revoke all on function public.has_role(uuid, public.app_role) from public, anon;
revoke all on function public.can_view_all() from public, anon;
revoke all on function public.set_updated_at() from public, anon, authenticated;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.can_view_all() to authenticated;