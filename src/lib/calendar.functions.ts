import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const scheduleGoogleMeeting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        summary: z.string().min(2).max(200),
        description: z.string().max(4000).nullable().optional(),
        startISO: z.string().min(10).max(40),
        minutes: z.number().int().min(15).max(480).optional(),
        attendees: z.array(z.string().email()).min(1).max(20),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { createCalendarEvent } = await import("@/lib/calendar/google.server");
    return createCalendarEvent({
      summary: data.summary,
      description: data.description ?? null,
      startISO: data.startISO,
      ...(data.minutes ? { minutes: data.minutes } : {}),
      attendees: data.attendees,
    });
  });
