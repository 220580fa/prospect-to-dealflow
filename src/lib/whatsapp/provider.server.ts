// Abstração de provedores de WhatsApp. Hoje: Evolution API (WhatsApp Web).
// Futuro: Cloud API/Meta e outros — basta implementar WhatsAppProvider.

export type ProviderCredentials = {
  baseUrl: string;
  apiKey: string;
  instanceName: string;
};

export type QrResult = {
  status: "conectado" | "conectando" | "desconectado" | "erro";
  qrBase64?: string | null;
  pairingCode?: string | null;
};

export type StatusResult = {
  status: "conectado" | "conectando" | "desconectado" | "erro";
  phoneNumber?: string | null;
  profileName?: string | null;
  raw?: unknown;
};

export type SendResult = {
  externalMessageId: string | null;
  raw?: unknown;
};

export interface WhatsAppProvider {
  readonly id: string;
  createInstance(c: ProviderCredentials, webhookUrl: string): Promise<void>;
  getQRCode(c: ProviderCredentials): Promise<QrResult>;
  getConnectionStatus(c: ProviderCredentials): Promise<StatusResult>;
  setWebhook(c: ProviderCredentials, webhookUrl: string): Promise<void>;
  disconnectInstance(c: ProviderCredentials): Promise<void>;
  deleteInstance(c: ProviderCredentials): Promise<void>;
  sendText(c: ProviderCredentials, phone: string, text: string): Promise<SendResult>;
  sendMedia(
    c: ProviderCredentials,
    phone: string,
    url: string,
    kind: string,
    caption?: string,
  ): Promise<SendResult>;
}

const trim = (url: string) => url.replace(/\/+$/, "");

async function call(
  c: ProviderCredentials,
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<{ ok: boolean; status: number; data: any }> {
  const res = await fetch(`${trim(c.baseUrl)}${path}`, {
    method: init.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: c.apiKey,
    },
    ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
  });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { ok: res.ok, status: res.status, data };
}

function mapState(state?: string | null): StatusResult["status"] {
  if (state === "open") return "conectado";
  if (state === "connecting" || state === "qr") return "conectando";
  return "desconectado";
}

function errorMessage(data: any, fallback: string) {
  if (!data) return fallback;
  if (typeof data === "string") return data.slice(0, 300);
  const m = data.message ?? data.error ?? data.response?.message;
  if (!m) return fallback;
  return (Array.isArray(m) ? m.join(", ") : String(m)).slice(0, 300);
}

export const EvolutionProvider: WhatsAppProvider = {
  id: "evolution",

  async createInstance(c, webhookUrl) {
    const existing = await call(c, `/instance/connectionState/${encodeURIComponent(c.instanceName)}`);
    if (existing.ok) {
      await EvolutionProvider.setWebhook(c, webhookUrl);
      return;
    }
    const body = {
      instanceName: c.instanceName,
      qrcode: true,
      integration: "WHATSAPP-BAILEYS",
    };
    const res = await call(c, "/instance/create", { method: "POST", body });
    if (!res.ok) throw new Error(errorMessage(res.data, "Falha ao criar a instância na Evolution API"));
    await EvolutionProvider.setWebhook(c, webhookUrl);
  },

  async setWebhook(c, webhookUrl) {
    const events = [
      "MESSAGES_UPSERT",
      "MESSAGES_UPDATE",
      "SEND_MESSAGE",
      "CONNECTION_UPDATE",
      "QRCODE_UPDATED",
    ];
    // Evolution v2
    const v2 = await call(c, `/webhook/set/${encodeURIComponent(c.instanceName)}`, {
      method: "POST",
      body: { webhook: { enabled: true, url: webhookUrl, byEvents: false, base64: false, events } },
    });
    if (v2.ok) return;
    // Evolution v1
    await call(c, `/webhook/set/${encodeURIComponent(c.instanceName)}`, {
      method: "POST",
      body: { enabled: true, url: webhookUrl, webhook_by_events: false, events },
    });
  },

  async getQRCode(c) {
    const state = await call(c, `/instance/connectionState/${encodeURIComponent(c.instanceName)}`);
    if (state.ok && mapState(state.data?.instance?.state ?? state.data?.state) === "conectado") {
      return { status: "conectado" };
    }
    const res = await call(c, `/instance/connect/${encodeURIComponent(c.instanceName)}`);
    if (!res.ok) throw new Error(errorMessage(res.data, "Falha ao obter o QR Code"));
    const base64: string | null = res.data?.base64 ?? res.data?.qrcode?.base64 ?? null;
    const pairing: string | null = res.data?.pairingCode ?? res.data?.code ?? null;
    if (!base64 && res.data?.instance?.state === "open") return { status: "conectado" };
    return { status: "conectando", qrBase64: base64, pairingCode: pairing };
  },

  async getConnectionStatus(c) {
    const res = await call(c, `/instance/connectionState/${encodeURIComponent(c.instanceName)}`);
    if (!res.ok) return { status: "desconectado", raw: res.data };
    const status = mapState(res.data?.instance?.state ?? res.data?.state);
    let phoneNumber: string | null = null;
    let profileName: string | null = null;
    if (status === "conectado") {
      const info = await call(
        c,
        `/instance/fetchInstances?instanceName=${encodeURIComponent(c.instanceName)}`,
      );
      const item = Array.isArray(info.data) ? info.data[0] : info.data;
      const inst = item?.instance ?? item;
      const owner: string | undefined = inst?.owner ?? inst?.ownerJid ?? inst?.number;
      phoneNumber = owner ? String(owner).split("@")[0]! : null;
      profileName = inst?.profileName ?? inst?.profilePictureName ?? null;
    }
    return { status, phoneNumber, profileName, raw: res.data };
  },

  async disconnectInstance(c) {
    await call(c, `/instance/logout/${encodeURIComponent(c.instanceName)}`, { method: "DELETE" });
  },

  async deleteInstance(c) {
    await call(c, `/instance/logout/${encodeURIComponent(c.instanceName)}`, { method: "DELETE" });
    await call(c, `/instance/delete/${encodeURIComponent(c.instanceName)}`, { method: "DELETE" });
  },

  async sendText(c, phone, text) {
    const path = `/message/sendText/${encodeURIComponent(c.instanceName)}`;
    let res = await call(c, path, { method: "POST", body: { number: phone, text } });
    if (!res.ok) {
      // Evolution v1 payload
      res = await call(c, path, {
        method: "POST",
        body: { number: phone, options: { delay: 300, presence: "composing" }, textMessage: { text } },
      });
    }
    if (!res.ok) throw new Error(errorMessage(res.data, "Falha ao enviar a mensagem"));
    return { externalMessageId: res.data?.key?.id ?? res.data?.messageId ?? null, raw: res.data };
  },

  async sendMedia(c, phone, url, kind, caption) {
    const path = `/message/sendMedia/${encodeURIComponent(c.instanceName)}`;
    const mediatype = ["image", "video", "audio", "document"].includes(kind) ? kind : "document";
    let res = await call(c, path, {
      method: "POST",
      body: { number: phone, mediatype, media: url, caption: caption ?? "" },
    });
    if (!res.ok) {
      res = await call(c, path, {
        method: "POST",
        body: {
          number: phone,
          mediaMessage: { mediatype, media: url, caption: caption ?? "" },
        },
      });
    }
    if (!res.ok) throw new Error(errorMessage(res.data, "Falha ao enviar a mídia"));
    return { externalMessageId: res.data?.key?.id ?? null, raw: res.data };
  },
};

export function getProvider(id?: string | null): WhatsAppProvider {
  switch (id ?? "evolution") {
    case "evolution":
      return EvolutionProvider;
    default:
      throw new Error(`Provedor de WhatsApp não suportado: ${id}`);
  }
}
