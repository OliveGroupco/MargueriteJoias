import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Pencil, Star, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatBRL } from "@/lib/products";

export const Route = createFileRoute("/_authenticated/admin/produtos")({
  component: ProdutosAdmin,
});

type Produto = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  preco: number;
  preco_promocional: number | null;
  estoque: number;
  categoria_id: string | null;
  imagens: string[];
  destaque: boolean;
  ativo: boolean;
};

const emptyForm = {
  nome: "", slug: "", descricao: "", preco: 0, preco_promocional: null as number | null,
  estoque: 0, categoria_id: null as string | null, imagens: [] as string[],
  destaque: false, ativo: true,
};

function ProdutosAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Produto | null>(null);
  const [open, setOpen] = useState(false);

  const { data: produtos, isLoading } = useQuery({
    queryKey: ["admin", "produtos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("produtos").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Produto[];
    },
  });

  const { data: categorias } = useQuery({
    queryKey: ["admin", "categorias"],
    queryFn: async () => {
      const { data } = await supabase.from("categorias").select("id, nome");
      return data ?? [];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("produtos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Produto removido");
      qc.invalidateQueries({ queryKey: ["admin", "produtos"] });
    },
  });

  return (
    <div>
      <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <div className="eyebrow mb-2">Catálogo</div>
          <h1 className="font-display text-4xl text-ivory">Produtos</h1>
        </div>
        <button
          onClick={() => { setEditing(null); setOpen(true); }}
          className="btn-luxe btn-luxe-hover"
        >
          <Plus className="h-4 w-4" /> Novo Produto
        </button>
      </header>

      {isLoading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-champagne" /></div>
      ) : !produtos || produtos.length === 0 ? (
        <div className="p-16 border border-border/60 rounded-sm bg-card/30 text-center text-muted-foreground">
          Nenhum produto cadastrado.
        </div>
      ) : (
        <div className="border border-border/60 rounded-sm bg-card/30 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="p-4">Produto</th>
                <th className="p-4">Preço</th>
                <th className="p-4">Estoque</th>
                <th className="p-4">Status</th>
                <th className="p-4 w-32"></th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => (
                <tr key={p.id} className="border-b border-border/40 last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {p.imagens[0] && (
                        <img src={p.imagens[0]} alt="" className="h-12 w-12 object-cover rounded-sm" />
                      )}
                      <div>
                        <div className="text-ivory flex items-center gap-2">
                          {p.nome}
                          {p.destaque && <Star className="h-3 w-3 fill-champagne text-champagne" />}
                        </div>
                        <div className="text-xs text-muted-foreground">{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-ivory">{formatBRL(Number(p.preco))}</td>
                  <td className="p-4 text-ivory">{p.estoque}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-sm ${p.ativo ? "bg-champagne/15 text-champagne" : "bg-muted text-muted-foreground"}`}>
                      {p.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditing(p); setOpen(true); }} className="p-2 text-muted-foreground hover:text-champagne">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => confirm(`Excluir ${p.nome}?`) && del.mutate(p.id)}
                        className="p-2 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <ProductDialog
          initial={editing}
          categorias={categorias ?? []}
          onClose={() => setOpen(false)}
          onSaved={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["admin", "produtos"] }); }}
        />
      )}
    </div>
  );
}

function ProductDialog({
  initial, categorias, onClose, onSaved,
}: {
  initial: Produto | null;
  categorias: { id: string; nome: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(initial ? {
    nome: initial.nome, slug: initial.slug, descricao: initial.descricao ?? "",
    preco: Number(initial.preco), preco_promocional: initial.preco_promocional ? Number(initial.preco_promocional) : null,
    estoque: initial.estoque, categoria_id: initial.categoria_id,
    imagens: initial.imagens, destaque: initial.destaque, ativo: initial.ativo,
  } : emptyForm);
  const [imgInput, setImgInput] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.nome.trim() || !form.slug.trim()) {
      toast.error("Nome e slug são obrigatórios"); return;
    }
    setSaving(true);
    try {
      const payload = { ...form, slug: form.slug.toLowerCase().replace(/\s+/g, "-") };
      if (initial) {
        const { error } = await supabase.from("produtos").update(payload).eq("id", initial.id);
        if (error) throw error;
        toast.success("Produto atualizado");
      } else {
        const { error } = await supabase.from("produtos").insert(payload);
        if (error) throw error;
        toast.success("Produto criado");
      }
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-onyx/80 backdrop-blur-sm grid place-items-center p-6 overflow-auto">
      <div className="w-full max-w-2xl bg-card border border-border rounded-sm p-8 my-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-2xl text-ivory">
            {initial ? "Editar produto" : "Novo produto"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-ivory"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Nome *" value={form.nome} onChange={(v) => setForm({ ...form, nome: v, slug: form.slug || v.toLowerCase().replace(/[^a-z0-9]+/g, "-") })} />
            <Input label="Slug *" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
          </div>
          <Textarea label="Descrição" value={form.descricao} onChange={(v) => setForm({ ...form, descricao: v })} />
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Preço (R$)" type="number" value={String(form.preco)} onChange={(v) => setForm({ ...form, preco: Number(v) })} />
            <Input label="Promocional (R$)" type="number" value={form.preco_promocional?.toString() ?? ""} onChange={(v) => setForm({ ...form, preco_promocional: v ? Number(v) : null })} />
            <Input label="Estoque" type="number" value={String(form.estoque)} onChange={(v) => setForm({ ...form, estoque: Number(v) })} />
          </div>
          <div>
            <label className="eyebrow block mb-2">Categoria</label>
            <select
              value={form.categoria_id ?? ""}
              onChange={(e) => setForm({ ...form, categoria_id: e.target.value || null })}
              className="w-full bg-onyx-soft/40 border border-border rounded-sm px-4 py-3 text-ivory focus:outline-none focus:border-champagne"
            >
              <option value="">— Sem categoria —</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>

          <div>
            <label className="eyebrow block mb-2">Imagens (URL)</label>
            <div className="flex gap-2">
              <input
                value={imgInput}
                onChange={(e) => setImgInput(e.target.value)}
                placeholder="https://..."
                className="flex-1 bg-onyx-soft/40 border border-border rounded-sm px-4 py-2 text-sm text-ivory focus:outline-none focus:border-champagne"
              />
              <button
                onClick={() => { if (imgInput.trim()) { setForm({ ...form, imagens: [...form.imagens, imgInput.trim()] }); setImgInput(""); } }}
                className="btn-outline-luxe px-4 py-2"
              >Adicionar</button>
            </div>
            {form.imagens.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.imagens.map((u, i) => (
                  <div key={i} className="relative">
                    <img src={u} className="h-16 w-16 object-cover rounded-sm border border-border" alt="" />
                    <button
                      onClick={() => setForm({ ...form, imagens: form.imagens.filter((_, idx) => idx !== i) })}
                      className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-destructive text-white text-xs"
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm text-ivory cursor-pointer">
              <input type="checkbox" checked={form.destaque} onChange={(e) => setForm({ ...form, destaque: e.target.checked })} className="accent-champagne" />
              Em destaque
            </label>
            <label className="flex items-center gap-2 text-sm text-ivory cursor-pointer">
              <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} className="accent-champagne" />
              Ativo
            </label>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="btn-outline-luxe">Cancelar</button>
          <button onClick={save} disabled={saving} className="btn-luxe btn-luxe-hover disabled:opacity-50">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="eyebrow block mb-2">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-onyx-soft/40 border border-border rounded-sm px-4 py-2.5 text-sm text-ivory focus:outline-none focus:border-champagne" />
    </div>
  );
}
function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="eyebrow block mb-2">{label}</label>
      <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-onyx-soft/40 border border-border rounded-sm px-4 py-2.5 text-sm text-ivory focus:outline-none focus:border-champagne resize-none" />
    </div>
  );
}
