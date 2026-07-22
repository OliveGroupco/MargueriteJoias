import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border/40 bg-ivory-soft/30">
      <div className="container-luxe py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-marguerite border border-marguerite-deep font-display text-2xl text-onyx">
              M
            </span>
            <div>
              <div className="font-display text-2xl tracking-wider text-onyx">MARGUERITE</div>
              <div className="eyebrow mt-1">Joias de Prata 925</div>
            </div>
          </div>
          <p className="mt-6 max-w-md text-sm text-muted-foreground leading-relaxed">
            Peças artesanais em prata 925, criadas para celebrar momentos
            inesquecíveis. Tradição joalheira, design contemporâneo.
          </p>
          <div className="mt-6 flex gap-3">
            {[
              { icon: Instagram, href: "https://instagram.com" },
              { icon: Facebook, href: "https://facebook.com" },
              { icon: Mail, href: "/contato" },
            ].map(({ icon: Icon, href }, i) => (
              <a
                key={i}
                href={href}
                className="grid h-10 w-10 place-items-center rounded-full border border-border hover:border-marguerite hover:text-marguerite text-onyx/70 transition"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="eyebrow mb-5">Navegação</div>
          <ul className="space-y-3 text-sm text-onyx/80">
            <li><Link to="/" className="hover:text-marguerite">Início</Link></li>
            <li><Link to="/catalogo" className="hover:text-marguerite">Catálogo</Link></li>
            <li><Link to="/sobre" className="hover:text-marguerite">Sobre</Link></li>
            <li><Link to="/contato" className="hover:text-marguerite">Contato</Link></li>
          </ul>
        </div>

        <div>
          <div className="eyebrow mb-5">Atendimento</div>
          <ul className="space-y-3 text-sm text-onyx/80">
            <li>WhatsApp: (62) 98145-2436</li>
            <li>Seg a Sex · 9h às 18h</li>
            <li>contato@cintilare.com</li>
            <li>Goiânia · GO</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40">
        <div className="container-luxe py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Marguerite Jóias. Todos os direitos reservados.</span>
          <span className="tracking-[0.2em] uppercase">Feito com requinte em prata 925</span>
        </div>
      </div>
    </footer>
  );
}
