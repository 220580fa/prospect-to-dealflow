import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Row = Record<string, any>;

const list = (table: string, build?: (q: any) => any) => async () => {
  let q: any = supabase.from(table).select("*");
  if (build) q = build(q);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Row[];
};

export const useTable = (table: string, build?: (q: any) => any, key: any[] = []) =>
  useQuery({ queryKey: [table, ...key], queryFn: list(table, build) });

export const useProfiles = () => useTable("profiles", (q) => q.order("name"));
export const useTeams = () => useTable("teams", (q) => q.order("name"));
export const useFunnels = () => useTable("funnels", (q) => q.order("position"));
export const useStages = () => useTable("stages", (q) => q.order("position"));
export const useCompanies = () => useTable("companies", (q) => q.order("trade_name"));
export const useContacts = () => useTable("contacts", (q) => q.order("first_name"));
export const useLeads = () => useTable("leads", (q) => q.order("updated_at", { ascending: false }));
export const useDeals = () => useTable("deals", (q) => q.order("updated_at", { ascending: false }));
export const useTasks = () => useTable("tasks", (q) => q.order("due_at"));
export const useMeetings = () => useTable("meetings", (q) => q.order("scheduled_at", { ascending: false }));
export const useProducts = () => useTable("products", (q) => q.order("name"));
export const useTags = () => useTable("tags", (q) => q.order("name"));
export const useLeadTags = () => useTable("lead_tags");
export const useLossReasons = () => useTable("loss_reasons", (q) => q.eq("active", true).order("name"));
export const useGoals = () => useTable("goals", (q) => q.order("period_start", { ascending: false }));
export const useNotifications = () =>
  useTable("notifications", (q) => q.order("created_at", { ascending: false }).limit(50));
export const useAutomations = () => useTable("automation_rules", (q) => q.order("created_at"));
export const useTemplates = () => useTable("message_templates", (q) => q.order("name"));
export const useSettings = () => useTable("app_settings");

export const useActivities = (leadId?: string) =>
  useQuery({
    queryKey: ["activities", leadId ?? "all"],
    queryFn: async () => {
      let q: any = supabase.from("activities").select("*").order("occurred_at", { ascending: false });
      if (leadId) q = q.eq("lead_id", leadId);
      else q = q.limit(120);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

export const useCurrentProfile = () =>
  useQuery({
    queryKey: ["current-profile"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return null;
      const { data: existing } = await supabase
        .from("profiles")
        .select("*")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      if (existing) return existing as Row;
      const { data: created, error } = await supabase
        .from("profiles")
        .insert({
          auth_user_id: user.id,
          name: (user.user_metadata?.name as string) ?? user.email?.split("@")[0] ?? "Usuário",
          email: user.email,
          job_title: "Administrador",
        })
        .select()
        .single();
      if (error) throw error;
      await supabase.from("user_roles").insert({ user_id: user.id, role: "administrador" });
      return created as Row;
    },
  });

export const useRoles = () =>
  useQuery({
    queryKey: ["user_roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

export function useCrmMutation<TVars>(
  fn: (vars: TVars) => Promise<unknown>,
  invalidate: string[] = [],
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      const keys = invalidate.length
        ? invalidate
        : ["leads", "deals", "tasks", "meetings", "activities"];
      keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
    },
  });
}

export async function logActivity(entry: Row) {
  await supabase.from("activities").insert(entry);
}

export async function insertRow(table: string, values: Row) {
  const { data, error } = await supabase.from(table).insert(values).select().single();
  if (error) throw error;
  return data as Row;
}

export async function updateRow(table: string, id: string, values: Row) {
  const { data, error } = await supabase.from(table).update(values).eq("id", id).select().single();
  if (error) throw error;
  return data as Row;
}

export async function deleteRow(table: string, id: string) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}
