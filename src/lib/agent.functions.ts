import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AgentMode } from "@/lib/agent/naia.server";

export const runNaiaAgentAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        mode: z.enum(["analyze_lead", "suggest_reply", "execute_next_action"]),
        leadId: z.string().uuid().nullable().optional(),
        conversationId: z.string().uuid().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { requestNaiaAction } = await import("@/lib/agent/naia.server");
    return await requestNaiaAction({
      mode: data.mode as AgentMode,
      leadId: data.leadId ?? null,
      conversationId: data.conversationId ?? null,
      userId: context.userId,
    });
  });
