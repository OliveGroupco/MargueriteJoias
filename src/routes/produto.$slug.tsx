import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Star, MessageCircle, ShoppingBag, Check, Minus, Plus, ArrowRight } from "lucide-react";
import { fetchProductBySlug, formatBRL, useProducts } from "@/lib/products";
import { cart } from "@/lib/cart-store";
import { whatsappLink, whatsappProductMessage } from "@/lib/whatsapp";
import { toast } from "sonner";
import { ProductCard } from "@/components/site/ProductCard";

import type { Product } from "@/lib/products";

export const Route = createFileRoute("/produto/$slug")({
  loader: async ({ params }): Promise<{ product: Product }> => {
    const product = await fetchProductBySlug(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} · Cintilare` },
          { name: "description", content: loaderData.product.description },
          { property: "og:title", content: `${loaderData.product.name} · Cintilare` },
          { property: "og:description", content: loaderData.product.description },
          { property: "og:image", content: loaderData.product.images[0] },
        ]
      : [],
  }),
  errorComponent: ({ error }) => (
    <div className="container-luxe py-32 text-center">
      <div className="text-muted-foreground">Erro ao carregar produto.</div>
      <div className="text-xs mt-2">{error.message}</div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-luxe py-32 text-center">
      <h1 className="font-display text-4xl text-ivory">Peça não encontrada</h1>
      <Link to="/catalogo" className="btn-outline-luxe mt-8 inline-flex">Ver catálogo</Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [coords, setCoords] = useState({ x: 50, y: 50 });

  const { data: allProducts = [] } = useProducts();
  const related = allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    cart.add(product, qty);
    toast.success(`${product.name} adicionado ao carrinho`);
  };

  return (
    <div className="container-luxe py-12">
      <nav className="text-xs text-muted-foreground mb-8">
        <Link to="/" className="hover:text-champagne">Início</Link>
        <span className="mx-2">/</span>
        <Link to="/catalogo" className="hover:text-champagne">Catálogo</Link>
        <span className="mx-2">/</span>
        <span className="text-ivory">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Galeria */}
        <div>
          <div
            className="relative aspect-square overflow-hidden rounded-sm bg-onyx-soft/40 cursor-zoom-in"
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setCoords({
                x: ((e.clientX - r.left) / r.width) * 100,
                y: ((e.clientY - r.top) / r.height) * 100,
              });
            }}
          >
            <img
              src={product.images[active]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300"
              style={zoom ? { transform: "scale(1.8)", transformOrigin: `${coords.x}% ${coords.y}%` } : {}}
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`aspect-square overflow-hidden rounded-sm border transition ${
                    active === i ? "border-champagne" : "border-border hover:border-champagne/60"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="eyebrow">{product.categoryLabel}</div>
          <h1 className="font-display text-4xl md:text-5xl text-ivory mt-3">{product.name}</h1>

          <div className="flex items-center gap-3 mt-4">
            <div className="flex gap-0.5 text-champagne">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-current" : ""}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.rating.toFixed(1)} · {product.reviews} avaliações
            </span>
          </div>

          <div className="mt-8 flex items-baseline gap-3">
            <span className="font-display text-4xl text-gradient-champagne">{formatBRL(product.price)}</span>
            {product.oldPrice && (
              <span className="text-base text-muted-foreground line-through">{formatBRL(product.oldPrice)}</span>
            )}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            ou 6x de {formatBRL(product.price / 6)} sem juros
          </div>

          <p className="mt-8 text-ivory/85 leading-relaxed">{product.description}</p>

          <div className="hairline my-8" />

          <div className="space-y-3">
            <div className="eyebrow">Especificações</div>
            {product.details.map((d) => (
              <div key={d} className="flex items-start gap-3 text-sm text-ivory/80">
                <Check className="h-4 w-4 text-champagne shrink-0 mt-0.5" />
                <span>{d}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-5">
            <div className="flex items-center border border-border rounded-sm">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-12 w-12 place-items-center text-ivory hover:text-champagne"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-ivory">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                className="grid h-12 w-12 place-items-center text-ivory hover:text-champagne"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className="text-xs text-muted-foreground">
              {product.stock} em estoque
            </span>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button onClick={handleAdd} className="btn-luxe btn-luxe-hover flex-1">
              <ShoppingBag className="h-4 w-4" /> Comprar agora
            </button>
            <a
              href={whatsappLink(whatsappProductMessage(product.name))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-luxe flex-1"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-32">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="eyebrow mb-3">Você também vai amar</div>
              <h2 className="font-display text-3xl md:text-4xl text-ivory">Peças semelhantes</h2>
            </div>
            <Link to="/catalogo" className="hidden md:inline-flex items-center gap-2 text-xs tracking-[0.22em] uppercase text-champagne hover:gap-3 transition-all">
              Ver mais <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-x-6 gap-y-12 grid-cols-2 md:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
