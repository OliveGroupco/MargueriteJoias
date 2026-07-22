import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, X, Search, LayoutDashboard, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-store";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/", label: "Início" },
  { to: "/catalogo", label: "Catálogo" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
] as const;

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { setIsAdmin(false); return; }
      const { data } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      setIsAdmin(!!data);
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container-luxe flex h-20 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-marguerite border border-marguerite-deep font-display text-2xl text-ivory transition-transform group-hover:scale-105">
            M
          </span>
          <div className="hidden sm:block">
            <div className="font-display text-xl tracking-wider text-ivory leading-none">
              MARGUERITE
            </div>
            <div className="text-[0.6rem] tracking-[0.3em] text-marguerite/80 mt-1">
              JOIAS DE PRATA
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-xs tracking-[0.22em] uppercase text-ivory/80 hover:text-marguerite transition-colors"
              activeProps={{ className: "text-marguerite" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {isAdmin ? (
            <Link to="/admin" className="hidden sm:inline-flex items-center gap-2 text-xs tracking-[0.22em] uppercase text-marguerite hover:text-ivory transition" aria-label="Admin">
              <LayoutDashboard className="h-4 w-4" />
            </Link>
          ) : (
            <Link to="/auth" className="hidden sm:grid h-10 w-10 place-items-center text-ivory/70 hover:text-marguerite transition" aria-label="Login">
              <User className="h-4 w-4" />
            </Link>
          )}
          <Link
            to="/catalogo"
            className="hidden sm:grid h-10 w-10 place-items-center text-ivory/70 hover:text-marguerite transition"
            aria-label="Buscar"
          >
            <Search className="h-4 w-4" />
          </Link>
          <Link
            to="/carrinho"
            className="relative grid h-10 w-10 place-items-center text-ivory/90 hover:text-marguerite transition"
            aria-label="Carrinho"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-marguerite text-onyx text-[0.65rem] font-semibold">
                {count}
              </span>
            )}
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden grid h-10 w-10 place-items-center text-ivory"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/40 bg-background">
          <nav className="container-luxe py-6 flex flex-col gap-5">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="text-sm tracking-[0.22em] uppercase text-ivory/90 hover:text-marguerite"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
