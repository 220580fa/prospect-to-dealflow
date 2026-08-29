import { createFileRoute } from "@tanstack/react-router";
import { useFunnels, useLossReasons, useProducts, useStages, useTags } from "@/lib/crm-data";
import { brl } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Glodeu CRM" },
      { name: "description", content: "Funis, etapas, produtos, tags e motivos de perda da operação comercial." },
      { property: "og:title", content: "Configurações — Glodeu CRM" },
      { property: "og:description", content: "Funis, etapas, produtos, tags e motivos de perda da operação comercial." },
    ],
  }),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const { data: funnels = [] } = useFunnels();
  const { data: stages = [] } = useStages();
  const { data: products = [] } = useProducts();
  const { data: tags = [] } = useTags();
  const { data: reasons = [] } = useLossReasons();

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="panel p-5">
        <p className="label-mono">Funis e etapas</p>
        <div className="mt-4 space-y-4">
          {funnels.map((f) => (
            <div key={f["id"]}>
              <p className="text-sm font-semibold">{f["name"]}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {stages
                  .filter((s) => s["funnel_id"] === f["id"])
                  .map((s) => (
                    <span
                      key={s["id"]}
                      className="rounded-full border border-border px-3 py-1 text-xs"
                      style={{ borderColor: s["color"] ?? undefined }}
                    >
                      {s["name"]} · {s["probability"]}%
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel p-5">
        <p className="label-mono">Produtos e serviços</p>
        <div className="mt-4 space-y-2 text-sm">
          {products.map((p) => (
            <div key={p["id"]} className="flex justify-between border-b border-border py-2 last:border-0">
              <span>{p["name"]}</span>
              <span className="kpi-number text-[var(--signal)]">{brl(p["price"])}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel p-5">
        <p className="label-mono">Tags</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t["id"]} className="rounded-full bg-secondary px-3 py-1 text-xs">
              {t["name"]}
            </span>
          ))}
        </div>
      </section>

      <section className="panel p-5">
        <p className="label-mono">Motivos de perda</p>
        <div className="mt-4 space-y-2 text-sm">
          {reasons.map((r) => (
            <p key={r["id"]} className="border-b border-border py-2 last:border-0">
              {r["name"]}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
