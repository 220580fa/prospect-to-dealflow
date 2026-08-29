create table if not exists public.ai_actions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  conversation_id uuid references public.whatsapp_conversations(id) on delete cascade,
  message_id uuid references public.whatsapp_messages(id) on delete set null,
  actor_id uuid references public.profiles(id) on delete set null,
  agent text not null default 'naia',
  mode text not null,
  status text not null default 'suggested',
  summary text,
  suggested_message text,
  next_action jsonb default '{}'::jsonb,
  request_payload jsonb default '{}'::jsonb,
  response_payload jsonb default '{}'::jsonb,
  error_message text,
  executed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_ai_actions_updated on public.ai_actions;
create trigger trg_ai_actions_updated
  before update on public.ai_actions
  for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.ai_actions to authenticated;
grant all on public.ai_actions to service_role;

alter table public.ai_actions enable row level security;

drop policy if exists "read_all_auth" on public.ai_actions;
create policy "read_all_auth" on public.ai_actions for select to authenticated using (true);
drop policy if exists "insert_auth" on public.ai_actions;
create policy "insert_auth" on public.ai_actions for insert to authenticated with check (true);
drop policy if exists "update_auth" on public.ai_actions;
create policy "update_auth" on public.ai_actions for update to authenticated using (true) with check (true);
drop policy if exists "delete_auth" on public.ai_actions;
create policy "delete_auth" on public.ai_actions for delete to authenticated using (true);

create index if not exists ai_actions_lead_created_idx on public.ai_actions (lead_id, created_at desc);
create index if not exists ai_actions_conversation_created_idx on public.ai_actions (conversation_id, created_at desc);