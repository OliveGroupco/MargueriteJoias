import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Acesso · Marguerite Jóias" }, { name: "robots", content: "noindex" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot" | "reset">("login");
  const [form, setForm] = useState({ nome: "", email: "", senha: "" });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("reset");
      } else if (session?.user && mode !== "reset") {
        const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" });
        if (isAdmin) {
          navigate({ to: "/admin" });
        } else {
          await supabase.auth.signOut();
        }
      }
    });
    
    // Initial check
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user && mode !== "reset") {
        const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
        if (isAdmin) navigate({ to: "/admin" });
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate, mode]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.senha });
        if (error) throw error;
        
        const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
        if (!isAdmin) {
          await supabase.auth.signOut();
          throw new Error("Acesso negado.");
        }
        toast.success("Bem-vindo(a)!");
        navigate({ to: "/admin" });
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
          redirectTo: window.location.origin + "/auth",
        });
        if (error) throw error;
        toast.success("Link de recuperação enviado para o e-mail!");
        setMode("login");
      } else if (mode === "reset") {
        const { error } = await supabase.auth.updateUser({ password: form.senha });
        if (error) throw error;
        toast.success("Senha atualizada com sucesso!");
        setMode("login");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro de autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] grid place-items-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-xs tracking-[0.22em] uppercase text-muted-foreground hover:text-marguerite mb-10">
          <ArrowLeft className="h-3 w-3" /> Voltar
        </Link>

        <div className="text-center mb-10">
          <span className="grid h-16 w-16 mx-auto place-items-center rounded-full bg-marguerite border border-marguerite-deep font-display text-3xl text-ivory mb-5">
            M
          </span>
          <h1 className="font-display text-4xl text-onyx">
            {mode === "login" ? "Acesso Administrativo" : mode === "forgot" ? "Recuperar Senha" : "Nova Senha"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login" ? "Entre para gerenciar a loja" : mode === "forgot" ? "Enviaremos um link para redefinir sua senha" : "Digite sua nova senha de acesso"}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {mode !== "reset" && (
            <Field label="E-mail" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          )}
          {mode !== "forgot" && (
            <Field label="Senha" type="password" value={form.senha} onChange={(v) => setForm({ ...form, senha: v })} />
          )}

          {mode === "login" && (
            <div className="flex justify-end">
              <button type="button" onClick={() => setMode("forgot")} className="text-xs text-marguerite hover:underline">
                Esqueci minha senha
              </button>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-luxe btn-luxe-hover w-full disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "Entrar" : mode === "forgot" ? "Enviar link" : "Salvar nova senha"}
          </button>

          {(mode === "forgot" || mode === "reset") && (
            <div className="text-center mt-4">
              <button type="button" onClick={() => setMode("login")} className="text-xs text-muted-foreground hover:text-onyx">
                Voltar para o login
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text",
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="eyebrow block mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full bg-ivory-soft/40 border border-border rounded-sm px-4 py-3 text-onyx focus:outline-none focus:border-marguerite"
      />
    </div>
  );
}
