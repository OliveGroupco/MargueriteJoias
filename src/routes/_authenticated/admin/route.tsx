import { createFileRoute, Outlet, Link, redirect, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Package, ShoppingBag, Tag, FolderTree, LogOut, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw redirect({ to: "/auth" });
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      await supabase.auth.signOut();
      throw redirect({ to: "/auth" });
    }
    return { userId: userData.user.id };
  },
  pendingComponent: () => (
    <div className="grid min-h-[60vh] place-items-center">
      <Loader2 className="h-6 w-6 animate-spin text-champagne" />
    </div>
  ),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/produtos", label: "Produtos", icon: Package, exact: false },
  { to: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag, exact: false },
  { to: "/admin/categorias", label: "Categorias", icon: FolderTree, exact: false },
  { to: "/admin/cupons", label: "Cupons", icon: Tag, exact: false },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
    navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-border/60 bg-onyx-soft/40 p-6 lg:sticky lg:top-0 lg:h-screen flex flex-col">
        <Link to="/admin" className="flex items-center gap-3 mb-10">
          <span className="grid h-11 w-11 place-items-center rounded-full border border-champagne/50 font-display text-2xl text-gradient-champagne">
            C
          </span>
          <div>
            <div className="font-display text-lg text-ivory leading-none">Cintilare</div>
            <div className="eyebrow mt-1 text-[0.6rem]">Admin</div>
          </div>
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {nav.map((n) => {
            const active = n.exact
              ? loc.pathname === n.to
              : loc.pathname === n.to || loc.pathname.startsWith(n.to + "/");
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition ${
                  active ? "bg-champagne/10 text-champagne" : "text-ivory/70 hover:bg-onyx-soft hover:text-ivory"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/60 pt-5 mt-5 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-champagne"
          >
            <ExternalLink className="h-3 w-3" /> Ver loja
          </Link>
          <div className="text-xs text-muted-foreground truncate">{email}</div>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 text-xs text-muted-foreground hover:text-destructive transition"
          >
            <LogOut className="h-3 w-3" /> Sair
          </button>
        </div>
      </aside>

      <main className="p-6 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
}
