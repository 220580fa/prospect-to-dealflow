import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const originOf = () => new URL(getRequest().url).origin;

export const createWhatsAppConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        name: z.string().min(2).max(80),
        instanceName: z
          .string()
          .min(2)
          .max(60)
          .regex(/^[a-zA-Z0-9._-]+$/, "Use apenas letras, números, ponto, hífen ou underline"),
        baseUrl: z.string().url().max(300),
        apiKey: z.string().min(4).max(300),
        responsibleUserId: z.string().uuid().nullable().optional(),
        autoCreateLead: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const svc = await import("@/lib/whatsapp/service.server");
    const conn = await svc.createConnection(data);
    return { id: conn.id as string };
  });

export const updateWhatsAppCredentials = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        connectionId: z.string().uuid(),
        baseUrl: z.string().url().max(300).optional(),
        apiKey: z.string().min(4).max(300).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const svc = await import("@/lib/whatsapp/service.server");
    await svc.updateCredentials(data.connectionId, data);
    return { ok: true };
  });

export const getWhatsAppQrCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ connectionId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const svc = await import("@/lib/whatsapp/service.server");
    const qr = await svc.getQRCode(data.connectionId, originOf());
    return { status: qr.status, qrBase64: qr.qrBase64 ?? null, pairingCode: qr.pairingCode ?? null };
  });

export const getWhatsAppStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ connectionId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const svc = await import("@/lib/whatsapp/service.server");
    const st = await svc.getConnectionStatus(data.connectionId);
    return { status: st.status, phoneNumber: st.phoneNumber ?? null, profileName: st.profileName ?? null };
  });

export const disconnectWhatsApp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ connectionId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const svc = await import("@/lib/whatsapp/service.server");
    await svc.disconnectInstance(data.connectionId);
    return { ok: true };
  });

export const deleteWhatsAppConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ connectionId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const svc = await import("@/lib/whatsapp/service.server");
    await svc.deleteConnection(data.connectionId);
    return { ok: true };
  });

export const getWhatsAppWebhookUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ connectionId: z.string().uuid(), refresh: z.boolean().optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    const svc = await import("@/lib/whatsapp/service.server");
    return data.refresh
      ? await svc.refreshWebhook(data.connectionId, originOf())
      : await svc.webhookInfo(data.connectionId, originOf());
  });

export const sendWhatsAppMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        leadId: z.string().uuid().nullable().optional(),
        connectionId: z.string().uuid().nullable().optional(),
        conversationId: z.string().uuid().nullable().optional(),
        phone: z.string().max(30).nullable().optional(),
        message: z.string().min(1).max(4000),
        mediaUrl: z.string().url().nullable().optional(),
        messageType: z.enum(["text", "image", "audio", "video", "document"]).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const svc = await import("@/lib/whatsapp/service.server");
    const userId = await svc.profileIdFor(context.userId);
    const result = await svc.sendWhatsAppMessage({ ...data, userId });
    return { ok: result.ok, conversationId: result.conversationId as string };
  });

export const runWhatsAppStageAutomations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ leadId: z.string().uuid(), stageId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const svc = await import("@/lib/whatsapp/service.server");
    const userId = await svc.profileIdFor(context.userId);
    return await svc.runStageAutomations(data.leadId, data.stageId, userId);
  });
