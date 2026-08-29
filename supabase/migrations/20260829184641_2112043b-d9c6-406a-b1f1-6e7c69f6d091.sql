-- CONNECTIONS
CREATE TABLE public.whatsapp_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  instance_name text NOT NULL UNIQUE,
  provider text NOT NULL DEFAULT 'evolution',
  phone_number text,
  profile_name text,
  responsible_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'desconectado',
  auto_create_lead boolean NOT NULL DEFAULT true,
  last_status_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_connections TO authenticated;
GRANT ALL ON public.whatsapp_connections TO service_role;
ALTER TABLE public.whatsapp_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wa_conn_select" ON public.whatsapp_connections FOR SELECT TO authenticated USING (true);
CREATE POLICY "wa_conn_insert" ON public.whatsapp_connections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "wa_conn_update" ON public.whatsapp_connections FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "wa_conn_delete" ON public.whatsapp_connections FOR DELETE TO authenticated USING (true);
CREATE TRIGGER trg_whatsapp_connections_updated BEFORE UPDATE ON public.whatsapp_connections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SECRETS (server only)
CREATE TABLE public.whatsapp_connection_secrets (
  connection_id uuid PRIMARY KEY REFERENCES public.whatsapp_connections(id) ON DELETE CASCADE,
  base_url text NOT NULL,
  api_key text NOT NULL,
  webhook_token text NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.whatsapp_connection_secrets TO service_role;
ALTER TABLE public.whatsapp_connection_secrets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wa_secrets_service_only" ON public.whatsapp_connection_secrets FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TRIGGER trg_whatsapp_secrets_updated BEFORE UPDATE ON public.whatsapp_connection_secrets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CONVERSATIONS
CREATE TABLE public.whatsapp_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  connection_id uuid REFERENCES public.whatsapp_connections(id) ON DELETE SET NULL,
  assigned_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  phone text NOT NULL,
  contact_name text,
  status text NOT NULL DEFAULT 'aberta',
  unread_count integer NOT NULL DEFAULT 0,
  last_message_preview text,
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX whatsapp_conversations_conn_phone_idx ON public.whatsapp_conversations (connection_id, phone);
CREATE INDEX whatsapp_conversations_lead_idx ON public.whatsapp_conversations (lead_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_conversations TO authenticated;
GRANT ALL ON public.whatsapp_conversations TO service_role;
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wa_conv_select" ON public.whatsapp_conversations FOR SELECT TO authenticated USING (true);
CREATE POLICY "wa_conv_insert" ON public.whatsapp_conversations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "wa_conv_update" ON public.whatsapp_conversations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "wa_conv_delete" ON public.whatsapp_conversations FOR DELETE TO authenticated USING (true);
CREATE TRIGGER trg_whatsapp_conversations_updated BEFORE UPDATE ON public.whatsapp_conversations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- MESSAGES
CREATE TABLE public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  connection_id uuid REFERENCES public.whatsapp_connections(id) ON DELETE SET NULL,
  external_message_id text,
  direction text NOT NULL CHECK (direction IN ('inbound','outbound')),
  message_type text NOT NULL DEFAULT 'text',
  body text,
  media_url text,
  media_mime text,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','delivered','read','failed')),
  error_message text,
  sender_phone text,
  recipient_phone text,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  sent_at timestamptz,
  received_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX whatsapp_messages_external_idx ON public.whatsapp_messages (connection_id, external_message_id) WHERE external_message_id IS NOT NULL;
CREATE INDEX whatsapp_messages_conv_idx ON public.whatsapp_messages (conversation_id, created_at);
CREATE INDEX whatsapp_messages_lead_idx ON public.whatsapp_messages (lead_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_messages TO authenticated;
GRANT ALL ON public.whatsapp_messages TO service_role;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wa_msg_select" ON public.whatsapp_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "wa_msg_insert" ON public.whatsapp_messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "wa_msg_update" ON public.whatsapp_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "wa_msg_delete" ON public.whatsapp_messages FOR DELETE TO authenticated USING (true);

-- QUICK REPLIES
CREATE TABLE public.whatsapp_quick_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shortcut text NOT NULL UNIQUE,
  title text NOT NULL,
  body text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_quick_replies TO authenticated;
GRANT ALL ON public.whatsapp_quick_replies TO service_role;
ALTER TABLE public.whatsapp_quick_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wa_qr_select" ON public.whatsapp_quick_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY "wa_qr_insert" ON public.whatsapp_quick_replies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "wa_qr_update" ON public.whatsapp_quick_replies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "wa_qr_delete" ON public.whatsapp_quick_replies FOR DELETE TO authenticated USING (true);
CREATE TRIGGER trg_whatsapp_quick_replies_updated BEFORE UPDATE ON public.whatsapp_quick_replies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.whatsapp_quick_replies (shortcut, title, body) VALUES
  ('/apresentacao', 'Apresentação', 'Olá {{primeiro_nome}}, aqui é o {{vendedor}} da Glodeu. Preparei uma apresentação sobre como podemos ajudar a {{empresa}}. Posso te enviar agora?'),
  ('/reuniao', 'Confirmação de reunião', 'Olá {{primeiro_nome}}, sua reunião está agendada para {{data_reuniao}}. Segue o link: {{link_reuniao}}. Nos vemos lá!'),
  ('/followup', 'Follow-up', 'Oi {{primeiro_nome}}, tudo bem? Passando para saber se conseguiu avaliar o que conversamos. Qualquer dúvida estou por aqui.'),
  ('/proposta', 'Proposta enviada', '{{primeiro_nome}}, acabei de enviar a proposta para a {{empresa}}. Posso te ligar para explicar os detalhes?');

-- REALTIME
ALTER TABLE public.whatsapp_messages REPLICA IDENTITY FULL;
ALTER TABLE public.whatsapp_conversations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_conversations;