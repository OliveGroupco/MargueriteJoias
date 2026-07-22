import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingBag, DollarSign, TrendingUp } from "lucide-react";
import { formatBRL } from "@/lib/products";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [produtos, pedidos, novos] = await Promise.all([
        supabase.from("produtos").select("id", { count: "exact", head: true }),
        supabase.from("pedidos").select("valor_total, status, created_at"),
        supabase.from("pedidos").select("id", { count: "exact", head: true }).eq("status", "novo"),
      ]);
      const totalReceita = (pedidos.data ?? [])
        .filter((p) => ["pago", "separacao", "enviado", "entregue"].includes(p.status))
        .reduce((sum, p) => sum + Number(p.valor_total), 0);
      return {
        totalProdutos: produtos.count ?? 0,
        totalPedidos: pedidos.data?.length ?? 0,
        novosPedidos: novos.count ?? 0,
        receita: totalReceita,
        recentes: (pedidos.data ?? []).slice(-5).reverse(),
      };
    },
  });

  return (
    <div>
      <header className="mb-10">
        <div className="eyebrow mb-2">Painel</div>
        <h1 className="font-display text-4xl text-ivory">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-2">Visão geral da loja</p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Package} label="Produtos" value={stats?.totalProdutos ?? "—"} />
        <Stat icon={ShoppingBag} label="Pedidos" value={stats?.totalPedidos ?? "—"} />
        <Stat icon={TrendingUp} label="Novos" value={stats?.novosPedidos ?? "—"} accent />
        <Stat icon={DollarSign} label="Receita" value={stats ? formatBRL(stats.receita) : "—"} />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-ivory mb-5">Pedidos recentes</h2>
        <div className="border border-border/60 rounded-sm bg-card/30">
          {!stats || stats.recentes.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground text-sm">
              Nenhum pedido ainda.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <tr className="border-b border-border/60">
                  <th className="p-4">Data</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentes.map((p, i) => (
                  <tr key={i} className="border-b border-border/40 last:border-0 text-ivory/90">
                    <td className="p-4">{new Date(p.created_at).toLocaleDateString("pt-BR")}</td>
                    <td className="p-4 capitalize">{p.status.replace("_", " ")}</td>
                    <td className="p-4 text-right">{formatBRL(Number(p.valor_total))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }: { icon: typeof Package; label: string; value: number | string; accent?: boolean }) {
  return (
    <div className={`p-6 rounded-sm border ${accent ? "border-marguerite/60 bg-marguerite/5" : "border-border/60 bg-card/30"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="eyebrow">{label}</div>
        <Icon className={`h-4 w-4 ${accent ? "text-marguerite" : "text-muted-foreground"}`} />
      </div>
      <div className="font-display text-3xl text-ivory">{value}</div>
    </div>
  );
}
