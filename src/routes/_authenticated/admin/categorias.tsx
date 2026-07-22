import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/categorias")({
  component: Categorias,
});

type Categoria = { id: string; nome: string; slug: string; descricao: string | null };

function Categorias() {
  const qc = useQueryClient();
  const [nome, setNome] = useState("");
  const [desc, setDesc] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "categorias-full"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categorias").select("*").order("nome");
      if (error) throw error;
      return data as Categoria[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const slug = nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
      const { error } = await supabase.from("categorias").insert({ nome, slug, descricao: desc || null });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Categoria criada");
      setNome(""); setDesc("");
      qc.invalidateQueries({ queryKey: ["admin", "categorias-full"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categorias").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Removida");
      qc.invalidateQueries({ queryKey: ["admin", "categorias-full"] });
    },
  });

  return (
    <div>
      <header className="mb-8">
        <div className="eyebrow mb-2">Organização</div>
        <h1 className="font-display text-4xl text-ivory">Categorias</h1>
      </header>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div>
          {isLoading ? (
            <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-marguerite" /></div>
          ) : !data || data.length === 0 ? (
            <div className="p-16 border border-border/60 rounded-sm bg-card/30 text-center text-muted-foreground">
              Nenhuma categoria.
            </div>
          ) : (
            <div className="space-y-2">
              {data.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-4 border border-border/60 rounded-sm bg-card/30">
                  <div>
                    <div className="text-ivory">{c.nome}</div>
                    <div className="text-xs text-muted-foreground">{c.slug}</div>
                  </div>
                  <button
                    onClick={() => confirm(`Excluir ${c.nome}?`) && del.mutate(c.id)}
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
          <h2 className="font-display text-xl text-ivory">Nova categoria</h2>
          <div>
            <label className="eyebrow block mb-2">Nome</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} className="w-full bg-onyx-soft/40 border border-border rounded-sm px-3 py-2 text-sm text-ivory focus:outline-none focus:border-marguerite" />
          </div>
          <div>
            <label className="eyebrow block mb-2">Descrição</label>
            <textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full bg-onyx-soft/40 border border-border rounded-sm px-3 py-2 text-sm text-ivory focus:outline-none focus:border-marguerite resize-none" />
          </div>
          <button onClick={() => nome.trim() && create.mutate()} disabled={!nome.trim() || create.isPending} className="btn-luxe btn-luxe-hover w-full disabled:opacity-50">
            <Plus className="h-4 w-4" /> Adicionar
          </button>
        </aside>
      </div>
    </div>
  );
}
