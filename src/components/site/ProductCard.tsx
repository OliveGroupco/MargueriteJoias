import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/products";
import { formatBRL } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/produto/$slug"
      params={{ slug: product.slug }}
      className="group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-onyx-soft/40">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-onyx/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {product.isNew && (
          <span className="absolute top-3 left-3 px-3 py-1 text-[0.6rem] tracking-[0.25em] uppercase bg-champagne text-onyx font-semibold">
            Novo
          </span>
        )}
        {product.oldPrice && (
          <span className="absolute top-3 right-3 px-3 py-1 text-[0.6rem] tracking-[0.25em] uppercase border border-champagne text-champagne bg-onyx/70">
            Oferta
          </span>
        )}
      </div>
      <div className="pt-4 space-y-1">
        <div className="text-[0.65rem] tracking-[0.25em] uppercase text-champagne/80">
          {product.categoryLabel}
        </div>
        <h3 className="font-display text-lg text-ivory group-hover:text-champagne transition-colors">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-base text-ivory">{formatBRL(product.price)}</span>
          {product.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatBRL(product.oldPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
