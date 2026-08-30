const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";

export interface CalendarEventInput {
  summary: string;
  description?: string | null;
  startISO: string;
  minutes?: number;
  attendees: string[];
  timeZone?: string;
}

export interface CalendarEventResult {
  eventId: string;
  htmlLink: string | null;
  meetLink: string | null;
}

function headers() {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connKey = process.env["GOOGLE_CALENDAR_API_KEY"];
  if (!lovableKey || !connKey) {
    throw new Error(
      "Google Agenda não está conectada ao projeto. Conecte o conector Google Calendar.",
    );
  }
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": connKey,
    "Content-Type": "application/json",
  };
}

export async function createCalendarEvent(input: CalendarEventInput): Promise<CalendarEventResult> {
  const timeZone = input.timeZone ?? "America/Sao_Paulo";
  const start = new Date(input.startISO);
  const end = new Date(start.getTime() + (input.minutes ?? 60) * 60000);

  const body = {
    summary: input.summary,
    description: input.description ?? undefined,
    start: { dateTime: start.toISOString(), timeZone },
    end: { dateTime: end.toISOString(), timeZone },
    attendees: input.attendees.map((email) => ({ email })),
    conferenceData: {
      createRequest: {
        requestId: `glodeu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
    reminders: { useDefault: true },
  };

  const res = await fetch(
    `${GATEWAY_URL}/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all`,
    { method: "POST", headers: headers(), body: JSON.stringify(body) },
  );

  if (!res.ok) {
    const text = await res.text();
    console.error(`Google Calendar failed [${res.status}]: ${text}`);
    throw new Error(`Google Agenda recusou o agendamento [${res.status}]: ${text.slice(0, 300)}`);
  }

  const json: any = await res.json();
  const meet =
    json?.hangoutLink ??
    json?.conferenceData?.entryPoints?.find((e: any) => e?.entryPointType === "video")?.uri ??
    null;

  return { eventId: String(json?.id ?? ""), htmlLink: json?.htmlLink ?? null, meetLink: meet };
}
