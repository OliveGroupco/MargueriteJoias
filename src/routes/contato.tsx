import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, Mail, MapPin, Clock, Instagram, Facebook } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";
import { toast } from "sonner";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato · Marguerite Jóias" },
      { name: "description", content: "Fale com a Marguerite Jóias. Atendimento via WhatsApp, e-mail e redes sociais." },
    ],
  }),
  component: Contato,
});

function Contato() {
  const [form, setForm] = useState({ nome: "", email: "", mensagem: "" });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.email.trim() || !form.mensagem.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }
    const msg = `Olá Marguerite Jóias!\n\nNome: ${form.nome}\nE-mail: ${form.email}\n\n${form.mensagem}`;
    window.open(whatsappLink(msg), "_blank");
    toast.success("Mensagem enviada via WhatsApp");
    setForm({ nome: "", email: "", mensagem: "" });
  };

  return (
    <div className="container-luxe py-20">
      <div className="text-center mb-16">
        <div className="eyebrow mb-3">Fale Conosco</div>
        <h1 className="font-display text-5xl md:text-6xl text-onyx">Contato</h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Atendimento personalizado para tirar dúvidas, sugerir presentes ou criar uma peça sob encomenda.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="eyebrow block mb-2">Nome</label>
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full bg-ivory-soft/40 border border-border rounded-sm px-4 py-3 text-onyx focus:outline-none focus:border-marguerite"
              placeholder="Seu nome completo"
            />
          </div>
          <div>
            <label className="eyebrow block mb-2">E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-ivory-soft/40 border border-border rounded-sm px-4 py-3 text-onyx focus:outline-none focus:border-marguerite"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="eyebrow block mb-2">Mensagem</label>
            <textarea
              rows={6}
              value={form.mensagem}
              onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
              className="w-full bg-ivory-soft/40 border border-border rounded-sm px-4 py-3 text-onyx focus:outline-none focus:border-marguerite resize-none"
              placeholder="Como podemos ajudar?"
            />
          </div>
          <button type="submit" className="btn-luxe btn-luxe-hover w-full">
            <MessageCircle className="h-4 w-4" /> Enviar via WhatsApp
          </button>
        </form>

        <div className="space-y-6">
          {[
            { icon: MessageCircle, t: "WhatsApp", d: "(62) 98145-2436", href: whatsappLink("Olá Marguerite Jóias!") },
            { icon: Mail, t: "E-mail", d: "contato@cintilare.com", href: "mailto:contato@cintilare.com" },
            { icon: MapPin, t: "Endereço", d: "Goiânia · GO · Brasil" },
            { icon: Clock, t: "Horário", d: "Seg a Sex · 9h às 18h" },
          ].map(({ icon: Icon, t, d, href }) => {
            const content = (
              <div className="flex items-start gap-4 p-6 border border-border/60 rounded-sm hover:border-marguerite/60 transition bg-card/30">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-marguerite/40 text-marguerite">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="eyebrow mb-1">{t}</div>
                  <div className="text-onyx">{d}</div>
                </div>
              </div>
            );
            return href ? (
              <a key={t} href={href} target="_blank" rel="noopener noreferrer" className="block">{content}</a>
            ) : (
              <div key={t}>{content}</div>
            );
          })}

          <div className="flex gap-3 pt-4">
            <a href="https://instagram.com" className="grid h-12 w-12 place-items-center rounded-full border border-border hover:border-marguerite hover:text-marguerite text-onyx transition">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="https://facebook.com" className="grid h-12 w-12 place-items-center rounded-full border border-border hover:border-marguerite hover:text-marguerite text-onyx transition">
              <Facebook className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
