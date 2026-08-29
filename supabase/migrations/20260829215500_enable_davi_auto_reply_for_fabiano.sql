alter table public.whatsapp_connections
  add column if not exists auto_reply_enabled boolean not null default false;

update public.whatsapp_connections wc
set auto_reply_enabled = true
from public.whatsapp_connection_secrets s
where s.connection_id = wc.id
  and s.webhook_token = '7de4c065ee67af8bec86317a561641653097f7625ac94e31';
