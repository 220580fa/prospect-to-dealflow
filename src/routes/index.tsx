import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, GitBranch, LineChart, Workflow } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Glodeu CRM — Infraestrutura comercial" },
      {
        name: "description",
        content:
          "CRM da Glodeu: prospecção, qualificação, reuniões e funil de venda em um único sistema orientado à próxima ação.",
      },
      { property: "og:title", content: "Glodeu CRM — Infraestrutura comercial" },
      {
        property: "og:description",
        content: "Do primeiro contato ao fechamento: pipeline, forecast e performance em tempo real.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="grid-lines min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-[1320px] flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <span className="font-display text-lg font-extrabold tracking-[0.2em]">GLODEU</span>
          <Link
            to="/auth"
            className="rounded-md border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
          >
            Entrar
          </Link>
        </header>

        <section className="flex flex-1 flex-col justify-center py-16">
          <p className="label-mono">Infraestrutura comercial · CRM</p>
          <h1 className="mt-6 max-w-3xl text-5xl leading-[1.05] font-extrabold md:text-6xl">
            Crescimento deixa de ser sorte quando existe sistema.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Prospecção, qualificação, reuniões e fechamento conectados pelo mesmo lead — com
            pipeline, forecast e próxima ação sempre visíveis.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Acessar o CRM <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-20 grid gap-4 md:grid-cols-3">
            {[
              { icon: GitBranch, t: "Funil de Prospecção", d: "Smart Lead, Ativado, Triagem, Hot Lead, MQL e SQL." },
              { icon: Workflow, t: "Funil de Venda", d: "Proposta, Oportunidade, Negociação, Fechamento e Ganho." },
              { icon: LineChart, t: "Forecast e performance", d: "Pipeline ponderado, conversão por etapa e ranking." },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="panel p-6">
                <Icon className="h-5 w-5 text-[var(--flow)]" strokeWidth={1.5} />
                <h2 className="mt-4 text-base font-semibold">{t}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="label-mono border-t border-border pt-6">
          Glodeu · Movimento organizado
        </footer>
      </div>
    </main>
  );
}
