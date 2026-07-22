import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/cupons")({
  component: CuponsAdmin,
});

type Cupom = {
  id: string;
  codigo: string;
  descricao: string | null;
  desconto_percent: number;
  validade: string | null;
  ativo: boolean;
};

function CuponsAdmin() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ codigo: "", descricao: "", desconto_percent: 10, validade: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "cupons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cupons").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Cupom[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("cupons").insert({
        codigo: form.codigo.toUpperCase(),
        descricao: form.descricao || null,
        desconto_percent: form.desconto_percent,
        validade: form.validade || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Cupom criado");
      setForm({ codigo: "", descricao: "", desconto_percent: 10, validade: "" });
      qc.invalidateQueries({ queryKey: ["admin", "cupons"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase.from("cupons").update({ ativo }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "cupons"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Removido");
      qc.invalidateQueries({ queryKey: ["admin", "cupons"] });
    },
  });

  return (
    <div>
      <header className="mb-8">
        <div className="eyebrow mb-2">Promoções</div>
        <h1 className="font-display text-4xl text-ivory">Cupons</h1>
      </header>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div>
          {isLoading ? (
            <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-marguerite" /></div>
          ) : !data || data.length === 0 ? (
            <div className="p-16 border border-border/60 rounded-sm bg-card/30 text-center text-muted-foreground">
              Nenhum cupom.
            </div>
          ) : (
            <div className="space-y-2">
              {data.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-4 p-4 border border-border/60 rounded-sm bg-card/30">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-marguerite text-lg">{c.codigo}</span>
                      <span className="text-xs px-2 py-0.5 rounded-sm bg-marguerite/15 text-marguerite">
                        {c.desconto_percent}% OFF
                      </span>
                    </div>
                    {c.descricao && <div className="text-xs text-muted-foreground mt-1">{c.descricao}</div>}
                    {c.validade && <div className="text-xs text-muted-foreground mt-1">Válido até {new Date(c.validade).toLocaleDateString("pt-BR")}</div>}
                  </div>
                  <label className="flex items-center gap-2 text-xs text-ivory cursor-pointer">
                    <input type="checkbox" checked={c.ativo} onChange={(e) => toggle.mutate({ id: c.id, ativo: e.target.checked })} className="accent-marguerite" />
                    Ativo
                  </label>
                  <button
                    onClick={() => confirm(`Excluir cupom ${c.codigo}?`) && del.mutate(c.id)}
                    className="p-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="h-fit p-6 border border-border/60 rounded-sm bg-card/30 space-y-4">
          <h2 className="font-display text-xl text-ivory">Novo cupom</h2>
          <div>
            <label className="eyebrow block mb-2">Código</label>
            <input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })} placeholder="CINTILA10" className="w-full bg-onyx-soft/40 border border-border rounded-sm px-3 py-2 text-sm text-ivory uppercase focus:outline-none focus:border-marguerite" />
          </div>
          <div>
            <label className="eyebrow block mb-2">Descrição</label>
            <input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className="w-full bg-onyx-soft/40 border border-border rounded-sm px-3 py-2 text-sm text-ivory focus:outline-none focus:border-marguerite" />
          </div>
          <div>
            <label className="eyebrow block mb-2">Desconto (%)</label>
            <input type="number" min={1} max={100} value={form.desconto_percent} onChange={(e) => setForm({ ...form, desconto_percent: Number(e.target.value) })} className="w-full bg-onyx-soft/40 border border-border rounded-sm px-3 py-2 text-sm text-ivory focus:outline-none focus:border-marguerite" />
          </div>
          <div>
            <label className="eyebrow block mb-2">Validade</label>
            <input type="date" value={form.validade} onChange={(e) => setForm({ ...form, validade: e.target.value })} className="w-full bg-onyx-soft/40 border border-border rounded-sm px-3 py-2 text-sm text-ivory focus:outline-none focus:border-marguerite" />
          </div>
          <button onClick={() => form.codigo.trim() && create.mutate()} disabled={!form.codigo.trim() || create.isPending} className="btn-luxe btn-luxe-hover w-full disabled:opacity-50">
            <Plus className="h-4 w-4" /> Criar Cupom
          </button>
        </aside>
      </div>
    </div>
  );
}
