import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart, cart } from "@/lib/cart-store";
import { formatBRL } from "@/lib/products";

export const Route = createFileRoute("/carrinho")({
  head: () => ({ meta: [{ title: "Carrinho · Cintilare" }] }),
  component: Carrinho,
});

function Carrinho() {
  const { items, subtotal, count } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-luxe py-32 text-center">
        <div className="grid h-20 w-20 mx-auto place-items-center rounded-full border border-champagne/40 text-champagne mb-6">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl text-ivory">Seu carrinho está vazio</h1>
        <p className="mt-3 text-muted-foreground">Descubra peças que cintilam com você.</p>
        <Link to="/catalogo" className="btn-luxe btn-luxe-hover mt-8 inline-flex">
          Explorar Catálogo <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-luxe py-16">
      <div className="text-center mb-12">
        <div className="eyebrow mb-3">Seu Pedido</div>
        <h1 className="font-display text-5xl text-ivory">Carrinho</h1>
        <p className="text-muted-foreground mt-2">{count} {count === 1 ? "peça" : "peças"}</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-12">
        <div className="space-y-4">
          {items.map(({ product, qty }) => (
            <div key={product.id} className="flex gap-5 p-5 border border-border/60 rounded-sm bg-card/30">
              <Link to="/produto/$slug" params={{ slug: product.slug }} className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 overflow-hidden rounded-sm bg-onyx-soft/40">
                <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="eyebrow">{product.categoryLabel}</div>
                <Link to="/produto/$slug" params={{ slug: product.slug }} className="font-display text-lg text-ivory truncate hover:text-champagne">
                  {product.name}
                </Link>
                <div className="text-sm text-muted-foreground mt-1">{formatBRL(product.price)} cada</div>
                <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                  <div className="flex items-center border border-border rounded-sm">
                    <button onClick={() => cart.setQty(product.id, qty - 1)} className="grid h-9 w-9 place-items-center text-ivory hover:text-champagne">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-10 text-center text-sm text-ivory">{qty}</span>
                    <button onClick={() => cart.setQty(product.id, qty + 1)} className="grid h-9 w-9 place-items-center text-ivory hover:text-champagne">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-ivory font-medium">{formatBRL(qty * product.price)}</span>
                    <button onClick={() => cart.remove(product.id)} className="text-muted-foreground hover:text-destructive transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit lg:sticky lg:top-28 p-6 border border-border/60 rounded-sm bg-card/30 space-y-5">
          <h2 className="font-display text-2xl text-ivory">Resumo</h2>
          <div className="hairline" />
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-ivory/80"><span>Subtotal</span><span>{formatBRL(subtotal)}</span></div>
            <div className="flex justify-between text-ivory/80"><span>Frete</span><span className="text-champagne">A calcular</span></div>
          </div>
          <div className="hairline" />
          <div className="flex justify-between items-baseline">
            <span className="text-ivory">Total</span>
            <span className="font-display text-2xl text-gradient-champagne">{formatBRL(subtotal)}</span>
          </div>
          <Link to="/checkout" className="btn-luxe btn-luxe-hover w-full">
            Finalizar Compra <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/catalogo" className="block text-center text-xs tracking-[0.22em] uppercase text-muted-foreground hover:text-champagne">
            Continuar comprando
          </Link>
        </aside>
      </div>
    </div>
  );
}
