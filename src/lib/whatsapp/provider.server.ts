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

function apiBaseUrl(url: string) {
  const parsed = new URL(url.trim());
  // Usuários frequentemente copiam a URL aberta no Evolution Manager.
  // O painel vive em /manager, mas os endpoints REST ficam na raiz.
  parsed.pathname = parsed.pathname
    .replace(/\/(manager|dashboard)(\/.*)?$/i, "")
    .replace(/\/+$/, "");
  parsed.search = "";
  parsed.hash = "";
  // O runtime publicado bloqueia fetch para IPv4 literal (Cloudflare 1003).
  // sslip.io resolve o hostname de volta para o mesmo IP, sem alterar o servidor.
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(parsed.hostname)) {
    parsed.hostname = `${parsed.hostname.replaceAll(".", "-")}.sslip.io`;
  }
  return parsed.toString().replace(/\/$/, "");
}

async function call(
  c: ProviderCredentials,
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<{ ok: boolean; status: number; data: any }> {
  const endpoint = `${apiBaseUrl(c.baseUrl)}${path}`;
  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: init.method ?? "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        apikey: c.apiKey,
      },
      ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "falha de rede";
    const host = (() => {
      try {
        return new URL(apiBaseUrl(c.baseUrl)).host;
      } catch {
        return c.baseUrl;
      }
    })();
    throw new Error(
      `O servidor da Evolution API (${host}) não respondeu (${detail}). Verifique se a VPS está ligada, se a porta está liberada no firewall e se a URL cadastrada está correta — use "Editar credenciais" para atualizar o endereço.`,
    );
  }
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  const contentType = res.headers.get("content-type") ?? "";
  if (res.ok && text && !contentType.toLowerCase().includes("application/json")) {
    return {
      ok: false,
      status: 502,
      data: { message: "A URL informada aponta para o painel web, não para a raiz da Evolution API." },
    };
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
  const m = data.message ?? data.error ?? data.response?.message ?? data.response?.data?.message;
  if (!m) return fallback;
  return (Array.isArray(m) ? m.join(", ") : String(m)).slice(0, 300);
}

function providerError(status: number, data: any, fallback: string) {
  const message = errorMessage(data, fallback);
  if (status === 403 && /(?:error\s*)?1003|direct ip access not allowed/i.test(message)) {
    return "A hospedagem bloqueou o acesso direto ao IP da Evolution API. Use um domínio apontado para a VPS ou salve novamente a conexão para aplicar a correção automática.";
  }
  return message;
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
    if (!res.ok) {
      throw new Error(
        `Evolution API (${res.status}): ${providerError(res.status, res.data, "falha ao criar a instância")}`,
      );
    }
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

    const pick = (d: any) => {
      const base64: string | null =
        d?.base64 ?? d?.qrcode?.base64 ?? d?.qrCode?.base64 ?? d?.qr?.base64 ?? d?.instance?.qrcode?.base64 ?? null;
      // Texto bruto do QR (Evolution às vezes devolve só o "code")
      const raw: string | null =
        d?.code ?? d?.qrcode?.code ?? d?.qrCode?.code ?? d?.qr?.code ?? d?.instance?.qrcode?.code ?? null;
      const pairing: string | null = d?.pairingCode ?? d?.qrcode?.pairingCode ?? null;
      return { base64, raw, pairing };
    };

    let last: any = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      const endpoints = [
        `/instance/connect/${encodeURIComponent(c.instanceName)}`,
        `/instance/qrcode/${encodeURIComponent(c.instanceName)}`,
      ];
      for (const path of endpoints) {
        const res = await call(c, path);
        last = res;
        if (!res.ok) continue;
        if (res.data?.instance?.state === "open" || res.data?.state === "open") {
          return { status: "conectado" };
        }
        const { base64, raw, pairing } = pick(res.data);
        if (base64) {
          return {
            status: "conectando",
            qrBase64: base64.startsWith("data:") ? base64 : `data:image/png;base64,${base64}`,
            pairingCode: pairing,
          };
        }
        if (raw && raw.length > 20) {
          const QRCode = await import("qrcode");
          const dataUrl = await QRCode.toDataURL(raw, { margin: 1, width: 512 });
          return { status: "conectando", qrBase64: dataUrl, pairingCode: pairing };
        }
        if (pairing) return { status: "conectando", qrBase64: null, pairingCode: pairing };
      }
      // A instância pode levar alguns instantes para gerar o QR
      await new Promise((r) => setTimeout(r, 1200));
    }

    if (last && !last.ok) {
      throw new Error(
        `Evolution API (${last.status}): ${providerError(last.status, last.data, "falha ao obter o QR Code")}`,
      );
    }
    throw new Error(
      "A Evolution API não retornou o QR Code. Verifique se a instância existe e está no estado 'close', e tente novamente.",
    );
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
