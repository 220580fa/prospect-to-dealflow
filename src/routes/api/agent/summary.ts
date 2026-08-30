import { createFileRoute } from '@tanstack/react-router'
import { timingSafeEqual, createHash } from 'node:crypto'

function tokenMatches(received: string, expected: string): boolean {
  // Compare via fixed-length digests to avoid length/timing leaks.
  const a = createHash('sha256').update(received).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

export const Route = createFileRoute('/api/agent/summary')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const expected = process.env['GLODEU_AGENT_TOKEN']
        if (!expected) {
          return Response.json({ error: 'Agent token not configured' }, { status: 500 })
        }

        const auth = request.headers.get('authorization') ?? ''
        const match = auth.match(/^Bearer\s+(.+)$/i)
        const received = match?.[1]?.trim()
        if (!received || !tokenMatches(received, expected)) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Service role only on the server, never shipped to the client bundle.
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

        const now = new Date()
        const staleThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

        const [
          leadsTotal,
          stages,
          leadsByStageRaw,
          openTasks,
          unreadConversations,
          upcomingMeetings,
          openDeals,
          wonDeals,
          lostDeals,
          staleLeads,
        ] = await Promise.all([
          supabaseAdmin.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'ativo'),
          supabaseAdmin.from('stages').select('id, name').order('position'),
          supabaseAdmin.from('leads').select('stage_id').eq('status', 'ativo'),
          supabaseAdmin.from('tasks').select('id', { count: 'exact', head: true }).in('status', ['pendente', 'em_andamento']),
          supabaseAdmin.from('whatsapp_conversations').select('id', { count: 'exact', head: true }).gt('unread_count', 0),
          supabaseAdmin.from('meetings').select('id', { count: 'exact', head: true }).eq('status', 'agendada').gte('scheduled_at', now.toISOString()),
          supabaseAdmin.from('deals').select('id', { count: 'exact', head: true }).eq('status', 'aberto'),
          supabaseAdmin.from('deals').select('id', { count: 'exact', head: true }).eq('status', 'ganho'),
          supabaseAdmin.from('deals').select('id', { count: 'exact', head: true }).eq('status', 'perdido'),
          supabaseAdmin.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'ativo').lt('last_interaction_at', staleThreshold),
        ])

        const stageNames = new Map((stages.data ?? []).map((s) => [s.id, s.name]))
        const leadsByStage: Record<string, number> = {}
        for (const row of leadsByStageRaw.data ?? []) {
          const name = (row.stage_id && stageNames.get(row.stage_id)) || 'Sem etapa'
          leadsByStage[name] = (leadsByStage[name] ?? 0) + 1
        }

        return Response.json(
          {
            generated_at: now.toISOString(),
            total_leads: leadsTotal.count ?? 0,
            leads_por_etapa: leadsByStage,
            tarefas_abertas: openTasks.count ?? 0,
            conversas_sem_resposta: unreadConversations.count ?? 0,
            reunioes_agendadas: upcomingMeetings.count ?? 0,
            oportunidades: {
              abertas: openDeals.count ?? 0,
              ganhas: wonDeals.count ?? 0,
              perdidas: lostDeals.count ?? 0,
            },
            leads_parados_7d: staleLeads.count ?? 0,
          },
          { headers: { 'Cache-Control': 'no-store' } },
        )
      },
    },
  },
})
