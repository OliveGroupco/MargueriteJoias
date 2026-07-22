import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { formatBRL } from "@/lib/products";

export const Route = createFileRoute("/_authenticated/admin/pedidos")({
  component: PedidosAdmin,
});

const STATUS = ["novo", "em_analise", "pago", "separacao", "enviado", "entregue", "cancelado"] as const;
type Status = (typeof STATUS)[number];

const STATUS_LABEL: Record<Status, string> = {
  novo: "Novo", em_analise: "Em análise", pago: "Pago",
  separacao: "Separação", enviado: "Enviado", entregue: "Entregue", cancelado: "Cancelado",
};

type Pedido = {
  id: string;
  numero: number;
  cliente_nome: string;
  cliente_email: string | null;
  cliente_telefone: string | null;
  endereco: Record<string, string> | null;
  itens: { nome: string; qty: number; preco: number }[];
  subtotal: number;
  desconto: number;
  frete: number;
  valor_total: number;
  status: Status;
  created_at: string;
};

function PedidosAdmin() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Status | "todos">("todos");
  const [selected, setSelected] = useState<Pedido | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "pedidos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pedidos").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Pedido[];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const { error } = await supabase.from("pedidos").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status atualizado");
      qc.invalidateQueries({ queryKey: ["admin", "pedidos"] });
    },
  });

  const filtered = (data ?? []).filter((p) => {
    if (filter !== "todos" && p.status !== filter) return false;
    if (q.trim()) {
      const s = q.toLowerCase();
      return p.cliente_nome.toLowerCase().includes(s) || String(p.numero).includes(s);
    }
    return true;
  });

  return (
    <div>
      <header className="mb-8">
        <div className="eyebrow mb-2">Vendas</div>
        <h1 className="font-display text-4xl text-ivory">Pedidos</h1>
      </header>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por cliente ou número"
            className="w-full pl-10 pr-3 py-2.5 bg-onyx-soft/40 border border-border rounded-sm text-sm text-ivory focus:outline-none focus:border-champagne"
          />
        </div>
        <select
          value={filter} onChange={(e) => setFilter(e.target.value as Status | "todos")}
          className="bg-onyx-soft/40 border border-border rounded-sm text-sm text-ivory px-3 py-2.5 focus:outline-none focus:border-champagne"
        >
          <option value="todos">Todos status</option>
          {STATUS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-champagne" /></div>
      ) : filtered.length === 0 ? (
        <div className="p-16 border border-border/60 rounded-sm bg-card/30 text-center text-muted-foreground">
          Nenhum pedido encontrado.
        </div>
      ) : (
        <div className="border border-border/60 rounded-sm bg-card/30 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="p-4">#</th>
                <th className="p-4">Data</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} onClick={() => setSelected(p)} className="border-b border-border/40 last:border-0 cursor-pointer hover:bg-onyx-soft/50">
                  <td className="p-4 text-champagne font-mono">#{p.numero}</td>
                  <td className="p-4 text-ivory/80">{new Date(p.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="p-4 text-ivory">{p.cliente_nome}</td>
                  <td className="p-4 text-ivory">{formatBRL(Number(p.valor_total))}</td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={p.status}
                      onChange={(e) => update.mutate({ id: p.id, status: e.target.value as Status })}
                      className="bg-onyx-soft border border-border rounded-sm px-2 py-1 text-xs text-ivory focus:outline-none focus:border-champagne"
                    >
                      {STATUS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && <PedidoDialog pedido={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function PedidoDialog({ pedido, onClose }: { pedido: Pedido; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-onyx/80 backdrop-blur-sm grid place-items-center p-6 overflow-auto">
      <div className="w-full max-w-xl bg-card border border-border rounded-sm p-8 my-10 space-y-5">
        <div className="flex justify-between">
          <div>
            <div className="eyebrow">Pedido</div>
            <h2 className="font-display text-3xl text-champagne">#{pedido.numero}</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-ivory">✕</button>
        </div>

        <div className="hairline" />

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <Info label="Cliente" value={pedido.cliente_nome} />
          <Info label="Telefone" value={pedido.cliente_telefone ?? "—"} />
          <Info label="E-mail" value={pedido.cliente_email ?? "—"} />
          <Info label="Data" value={new Date(pedido.created_at).toLocaleString("pt-BR")} />
        </div>

        {pedido.endereco && (
          <div>
            <div className="eyebrow mb-2">Endereço</div>
            <div className="text-sm text-ivory/80">
              {pedido.endereco.endereco}, {pedido.endereco.numero}
              {pedido.endereco.complemento && ` - ${pedido.endereco.complemento}`}<br />
              {pedido.endereco.bairro} - {pedido.endereco.cidade}/{pedido.endereco.estado}<br />
              CEP: {pedido.endereco.cep}
            </div>
          </div>
        )}

        <div>
          <div className="eyebrow mb-2">Itens</div>
          <div className="space-y-2">
            {pedido.itens.map((i, idx) => (
              <div key={idx} className="flex justify-between text-sm text-ivory/90">
                <span>{i.qty}x {i.nome}</span>
                <span>{formatBRL(i.qty * i.preco)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hairline" />

        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-ivory/80"><span>Subtotal</span><span>{formatBRL(Number(pedido.subtotal))}</span></div>
          {Number(pedido.desconto) > 0 && <div className="flex justify-between text-champagne"><span>Desconto</span><span>-{formatBRL(Number(pedido.desconto))}</span></div>}
          <div className="flex justify-between text-ivory/80"><span>Frete</span><span>{formatBRL(Number(pedido.frete))}</span></div>
          <div className="flex justify-between font-display text-lg text-gradient-champagne pt-2"><span>Total</span><span>{formatBRL(Number(pedido.valor_total))}</span></div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="eyebrow text-[0.6rem]">{label}</div>
      <div className="text-ivory mt-1">{value}</div>
    </div>
  );
}
