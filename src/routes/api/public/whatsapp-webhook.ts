import { createFileRoute } from "@tanstack/react-router";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...cors },
  });

export const Route = createFileRoute("/api/public/whatsapp-webhook")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async () => json({ status: "online", service: "glodeu-whatsapp-webhook" }),
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("token") ?? "";
        if (!token || token.length < 16) return json({ error: "unauthorized" }, 401);

        let payload: any = null;
        try {
          payload = await request.json();
        } catch {
          return json({ error: "invalid json" }, 400);
        }

        try {
          const { processWebhook } = await import("@/lib/whatsapp/service.server");
          const result = await processWebhook(token, payload);
          if (!result.ok) return json({ error: "unauthorized" }, 401);
          return json({ received: true });
        } catch (e) {
          console.error("[whatsapp-webhook]", e);
          // 200 evita reenvios infinitos da Evolution API
          return json({ received: true, error: "processing_failed" });
        }
      },
    },
  },
});
