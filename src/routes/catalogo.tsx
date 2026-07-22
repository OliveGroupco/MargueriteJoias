import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useProducts, categories, formatBRL } from "@/lib/products";
import { Loader2 } from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/catalogo")({
  head: () => ({
    meta: [
      { title: "Catálogo · Marguerite Jóias" },
      { name: "description", content: "Explore o catálogo completo Marguerite Jóias: anéis, colares, brincos e pulseiras em prata 925." },
    ],
  }),
  component: Catalogo,
});

type Sort = "relevancia" | "menor" | "maior" | "novos";

function Catalogo() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("todas");
  const [max, setMax] = useState(1000);
  const [sort, setSort] = useState<Sort>("relevancia");

  const { data: products = [], isLoading } = useProducts();

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.price <= max);
    if (cat !== "todas") list = list.filter((p) => p.category === cat);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
    }
    if (sort === "menor") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "maior") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "novos") list = [...list].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    return list;
  }, [q, cat, max, sort, products]);

  return (
    <div className="container-luxe py-16">
      <div className="text-center mb-12">
        <div className="eyebrow mb-3">Coleção Completa</div>
        <h1 className="font-display text-5xl md:text-6xl text-ivory">Catálogo</h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          {filtered.length} peças disponíveis · Prata 925 com certificado
        </p>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-10">
        {/* Sidebar Filtros */}
        <aside className="space-y-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar peça..."
              className="w-full pl-10 pr-3 py-3 bg-onyx-soft/40 border border-border rounded-sm text-sm text-ivory placeholder:text-muted-foreground focus:outline-none focus:border-marguerite transition"
            />
          </div>

          <div>
            <div className="eyebrow mb-4">Categoria</div>
            <div className="space-y-2">
              {[{ id: "todas", label: "Todas" }, ...categories].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className={`block w-full text-left text-sm py-2 transition ${
                    cat === c.id ? "text-marguerite" : "text-ivory/70 hover:text-ivory"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="eyebrow mb-4">Preço até</div>
            <input
              type="range"
              min={200}
              max={1000}
              step={50}
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
              className="w-full accent-marguerite"
            />
            <div className="mt-2 text-sm text-ivory">{formatBRL(max)}</div>
          </div>
        </aside>

        {/* Grid */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-border/60">
            <div className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "peça" : "peças"}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="bg-onyx-soft/40 border border-border rounded-sm text-sm text-ivory px-3 py-2 focus:outline-none focus:border-marguerite"
            >
              <option value="relevancia">Relevância</option>
              <option value="novos">Lançamentos</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
            </select>
          </div>

          {isLoading ? (
            <div className="grid place-items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-marguerite" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              Nenhuma peça encontrada. <button onClick={() => {setQ(''); setCat('todas'); setMax(1000); setSort('relevancia')}} className="text-marguerite underline">Limpar filtros</button>
            </div>
          ) : (
            <div className="grid gap-x-6 gap-y-12 grid-cols-2 md:grid-cols-3">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
