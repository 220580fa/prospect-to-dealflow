-- ENUMS
create type public.app_role as enum ('administrador','gestor','vendedor');
create type public.funnel_kind as enum ('prospeccao','venda');
create type public.temperature as enum ('frio','morno','quente');
create type public.task_status as enum ('pendente','em_andamento','concluida','cancelada');
create type public.task_priority as enum ('baixa','media','alta','urgente');
create type public.meeting_status as enum ('agendada','realizada','no_show','reagendada','cancelada');
create type public.deal_status as enum ('aberto','ganho','perdido');

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path=public as $$
begin new.updated_at = now(); return new; end $$;

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  name text not null,
  email text,
  phone text,
  job_title text,
  team_id uuid references public.teams(id) on delete set null,
  status text not null default 'ativo',
  avatar_color text default '#39D5FF',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean
language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.user_roles where user_id=_user_id and role=_role)
$$;

create or replace function public.can_view_all() returns boolean
language sql stable security definer set search_path=public as $$
  select coalesce((select true from public.user_roles where user_id=auth.uid() and role in ('administrador','gestor') limit 1), false)
$$;

create table public.funnels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind funnel_kind not null default 'prospeccao',
  position int not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid
);
create table public.stages (
  id uuid primary key default gen_random_uuid(),
  funnel_id uuid not null references public.funnels(id) on delete cascade,
  name text not null,
  color text not null default '#39D5FF',
  probability int not null default 10,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  legal_name text,
  trade_name text not null,
  cnpj text,
  segment text,
  website text,
  phone text,
  employees int,
  city text,
  state text,
  owner_id uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid
);
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  first_name text not null,
  last_name text,
  job_title text,
  phone text,
  whatsapp text,
  email text,
  linkedin text,
  is_decision_maker boolean not null default false,
  is_influencer boolean not null default false,
  is_user boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text,
  phone text,
  whatsapp text,
  email text,
  job_title text,
  linkedin text,
  company_id uuid references public.companies(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  company_name text,
  cnpj text,
  website text,
  segment text,
  employees int,
  city text,
  state text,
  funnel_id uuid references public.funnels(id) on delete set null,
  stage_id uuid references public.stages(id) on delete set null,
  owner_id uuid references public.profiles(id) on delete set null,
  source text,
  campaign text,
  temperature temperature not null default 'frio',
  lead_score int not null default 0,
  potential_value numeric(14,2) default 0,
  product_interest text,
  expected_close_date date,
  probability int default 10,
  competitor text,
  notes text,
  status text not null default 'ativo',
  loss_reason_id uuid,
  loss_notes text,
  stage_entered_at timestamptz not null default now(),
  last_interaction_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  title text not null,
  funnel_id uuid references public.funnels(id) on delete set null,
  stage_id uuid references public.stages(id) on delete set null,
  owner_id uuid references public.profiles(id) on delete set null,
  value numeric(14,2) not null default 0,
  probability int not null default 60,
  expected_close_date date,
  status deal_status not null default 'aberto',
  loss_reason_id uuid,
  loss_notes text,
  source text,
  stage_entered_at timestamptz not null default now(),
  won_at timestamptz,
  lost_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#39D5FF',
  created_at timestamptz not null default now()
);
create table public.lead_tags (
  lead_id uuid not null references public.leads(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (lead_id, tag_id)
);

create table public.loss_reasons (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(14,2) not null default 0,
  category text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.deal_products (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity int not null default 1,
  unit_price numeric(14,2) not null default 0
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  lead_id uuid references public.leads(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  owner_id uuid references public.profiles(id) on delete set null,
  type text not null default 'follow_up',
  description text,
  due_at timestamptz not null default now(),
  priority task_priority not null default 'media',
  status task_status not null default 'pendente',
  reminder_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid
);

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  owner_id uuid references public.profiles(id) on delete set null,
  scheduled_at timestamptz not null,
  previous_scheduled_at timestamptz,
  status meeting_status not null default 'agendada',
  participants text,
  meeting_url text,
  notes text,
  outcome text,
  next_steps text,
  cancel_reason text,
  reschedule_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid
);

create table public.meeting_qualifications (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete set null,
  problem text,
  current_situation text,
  impacts text[] default '{}',
  impact_notes text,
  need_level text,
  need_notes text,
  interest_products text[] default '{}',
  is_decision_maker text,
  other_decision_makers text,
  decision_makers jsonb default '[]'::jsonb,
  budget_status text,
  potential_value numeric(14,2),
  timing text,
  expected_close_date date,
  competitors_present text,
  competitors text,
  interest_level text,
  probability int,
  discussed_points text,
  objections text,
  next_steps text,
  next_action text,
  next_action_owner_id uuid references public.profiles(id) on delete set null,
  next_action_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null,
  title text not null,
  description text,
  channel text,
  result text,
  metadata jsonb default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by uuid
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  metric text not null,
  period_type text not null default 'mensal',
  period_start date not null,
  period_end date not null,
  target numeric(14,2) not null default 0,
  owner_id uuid references public.profiles(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  type text,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trigger_event text not null,
  condition jsonb default '{}'::jsonb,
  action_type text not null,
  action_config jsonb default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.message_templates (
  id uuid primary key default gen_random_uuid(),
  channel text not null default 'email',
  name text not null,
  subject text,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

do $$ declare t text; begin
  foreach t in array array['teams','profiles','funnels','stages','companies','contacts','leads','deals','products','tasks','meetings','goals','automation_rules','message_templates']
  loop execute format('create trigger trg_%1$s_updated before update on public.%1$s for each row execute function public.set_updated_at()', t); end loop;
end $$;

do $$ declare t text; begin
  foreach t in array array['teams','profiles','user_roles','funnels','stages','companies','contacts','leads','deals','tags','lead_tags','loss_reasons','products','deal_products','tasks','meetings','meeting_qualifications','activities','goals','notifications','automation_rules','message_templates','app_settings']
  loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "read_all_auth" on public.%I for select to authenticated using (true)', t);
  end loop;
end $$;

do $$ declare t text; begin
  foreach t in array array['teams','profiles','funnels','stages','companies','contacts','leads','deals','tags','lead_tags','loss_reasons','products','deal_products','tasks','meetings','meeting_qualifications','activities','goals','notifications','automation_rules','message_templates','app_settings']
  loop
    execute format('create policy "insert_auth" on public.%I for insert to authenticated with check (true)', t);
    execute format('create policy "update_auth" on public.%I for update to authenticated using (true) with check (true)', t);
    execute format('create policy "delete_auth" on public.%I for delete to authenticated using (true)', t);
  end loop;
end $$;

create policy "roles_insert_admin" on public.user_roles for insert to authenticated
  with check (public.has_role(auth.uid(),'administrador') or not exists (select 1 from public.user_roles));
create policy "roles_update_admin" on public.user_roles for update to authenticated
  using (public.has_role(auth.uid(),'administrador')) with check (public.has_role(auth.uid(),'administrador'));
create policy "roles_delete_admin" on public.user_roles for delete to authenticated
  using (public.has_role(auth.uid(),'administrador'));

create index on public.leads (stage_id);
create index on public.leads (owner_id);
create index on public.deals (stage_id);
create index on public.tasks (owner_id, status);
create index on public.activities (lead_id, occurred_at desc);