import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Row } from "@/lib/crm-data";

const db = supabase as any;

export const useWhatsAppConnections = () =>
  useQuery({
    queryKey: ["whatsapp_connections"],
    queryFn: async () => {
      const { data, error } = await db.from("whatsapp_connections").select("*").order("created_at");
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

export const useWhatsAppConversations = () =>
  useQuery({
    queryKey: ["whatsapp_conversations"],
    queryFn: async () => {
      const { data, error } = await db
        .from("whatsapp_conversations")
        .select("*")
        .order("last_message_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

export const useWhatsAppMessages = (conversationId?: string | null) =>
  useQuery({
    queryKey: ["whatsapp_messages", conversationId ?? "none"],
    enabled: !!conversationId,
    queryFn: async () => {
      const { data, error } = await db
        .from("whatsapp_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

export const useLeadConversation = (leadId?: string | null) =>
  useQuery({
    queryKey: ["whatsapp_conversations", "lead", leadId ?? "none"],
    enabled: !!leadId,
    queryFn: async () => {
      const { data, error } = await db
        .from("whatsapp_conversations")
        .select("*")
        .eq("lead_id", leadId)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .limit(1);
      if (error) throw error;
      return ((data ?? [])[0] ?? null) as Row | null;
    },
  });

export const useQuickReplies = () =>
  useQuery({
    queryKey: ["whatsapp_quick_replies"],
    queryFn: async () => {
      const { data, error } = await db
        .from("whatsapp_quick_replies")
        .select("*")
        .eq("active", true)
        .order("shortcut");
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

/** Assina as mudanças em tempo real de conversas e mensagens. */
export function useWhatsAppRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    // Nome único por instância: dois componentes montados ao mesmo tempo não
    // podem compartilhar o mesmo canal (o Supabase lança erro ao reusar).
    const channel = supabase
      .channel(`whatsapp-stream-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "whatsapp_messages" }, () => {
        qc.invalidateQueries({ queryKey: ["whatsapp_messages"] });
        qc.invalidateQueries({ queryKey: ["whatsapp_conversations"] });
        qc.invalidateQueries({ queryKey: ["activities"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "whatsapp_conversations" }, () => {
        qc.invalidateQueries({ queryKey: ["whatsapp_conversations"] });
        qc.invalidateQueries({ queryKey: ["leads"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}


export async function markConversationRead(conversationId: string) {
  await db.from("whatsapp_conversations").update({ unread_count: 0 }).eq("id", conversationId);
}
