import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Shield, Truck, Heart, Star, MessageCircle } from "lucide-react";
import { useProducts, categories } from "@/lib/products";
import { Loader2 } from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";
import { whatsappLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Marguerite Jóias · Joias de Prata 925 Premium" },
      { name: "description", content: "Descubra a joalheria contemporânea Marguerite Jóias. Anéis, colares, brincos e pulseiras em prata 925 com design refinado." },
      { property: "og:title", content: "Marguerite Jóias · Joias de Prata 925" },
      { property: "og:image", content: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80" },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: products = [], isLoading } = useProducts();
  const featured = products.filter((p) => p.featured).slice(0, 4);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1920&q=80"
            alt=""
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ivory via-ivory/80 to-ivory/40" />
        </div>
        <div className="container-luxe relative grid min-h-[85vh] items-center py-24">
          <div className="max-w-2xl animate-fade-up">
            <div className="eyebrow mb-6">Coleção Inverno 2026</div>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] text-onyx">
              Sua beleza é <em className="text-gradient-marguerite not-italic">única</em> e merece joias à altura!
            </h1>
            <p className="mt-8 max-w-xl text-base md:text-lg text-onyx/80 leading-relaxed">
              Loja on-line (Varejo) de joias contemporâneas em prata. Enviamos para todo o Brasil diretamente de Goiânia - GO.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/catalogo" className="btn-luxe btn-luxe-hover">
                Explorar Coleção <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={whatsappLink("Olá! Quero conhecer as novidades da Marguerite Jóias.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-luxe"
              >
                <MessageCircle className="h-4 w-4" /> Atendimento VIP
              </a>
            </div>
          </div>
        </div>
        <div className="hairline" />
      </section>

      {/* BENEFICIOS */}
      <section className="container-luxe py-20">
        <div className="grid gap-10 md:grid-cols-4">
          {[
            { icon: Sparkles, t: "Prata 925 Maciça", d: "Certificada e garantida" },
            { icon: Shield, t: "Garantia Vitalícia", d: "Banho e estrutura" },
            { icon: Truck, t: "Entrega Segura", d: "Embalagem premium" },
            { icon: Heart, t: "Trocas Facilitadas", d: "30 dias para troca" },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-marguerite/40 text-marguerite">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="font-display text-lg text-onyx">{t}</div>
                <div className="text-sm text-muted-foreground mt-1">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="container-luxe py-20">
        <div className="text-center mb-14">
          <div className="eyebrow mb-4">Coleções</div>
          <h2 className="font-display text-4xl md:text-5xl text-onyx">
            Cada categoria, uma história
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {categories.map((cat, idx) => {
            const img = products.find((p) => p.category === cat.id)?.images[0];
            return (
              <Link
                key={cat.id}
                to="/catalogo"
                search={{ category: cat.id } as never}
                className="group block relative overflow-hidden rounded-sm aspect-[4/5]"
              >
                <img
                  src={img || cat.image}
                  alt={cat.label}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ivory via-ivory/80 to-ivory/0" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="font-display text-2xl text-onyx">{cat.label}</div>
                  <div className="text-xs text-marguerite mt-1 tracking-[0.2em] uppercase">
                    {cat.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="container-luxe py-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="eyebrow mb-4">Selecionados</div>
            <h2 className="font-display text-4xl md:text-5xl text-onyx">Em destaque</h2>
          </div>
          <Link
            to="/catalogo"
            className="hidden md:inline-flex items-center gap-2 text-xs tracking-[0.22em] uppercase text-marguerite hover:gap-3 transition-all"
          >
            Ver todas <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
          {isLoading ? (
            <div className="grid place-items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-marguerite" />
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
      </section>

      {/* DEPOIMENTOS */}
      <section className="bg-ivory-soft/30 py-24 mt-12">
        <div className="container-luxe">
          <div className="text-center mb-14">
            <div className="eyebrow mb-4">Clientes</div>
            <h2 className="font-display text-4xl md:text-5xl text-onyx">
              Histórias que brilham
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { n: "Mariana C.", t: "Recebi meu colar e fiquei sem palavras. Embalagem impecável, peça perfeita.", l: "São Paulo" },
              { n: "Beatriz R.", t: "Comprei o anel solitário para minha esposa. Qualidade de alta joalheria, atendimento humano.", l: "Goiânia" },
              { n: "Luiza M.", t: "Já é minha terceira compra. As peças mantêm o brilho como no primeiro dia.", l: "Brasília" },
            ].map((d) => (
              <figure key={d.n} className="rounded-sm border border-border/60 bg-card/40 p-8 backdrop-blur">
                <div className="flex gap-1 text-marguerite mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="font-display text-lg text-onyx/90 leading-relaxed">
                  "{d.t}"
                </blockquote>
                <figcaption className="mt-6 text-sm">
                  <div className="text-marguerite">{d.n}</div>
                  <div className="text-muted-foreground text-xs mt-1">{d.l}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA WHATSAPP */}
      <section className="container-luxe py-24">
        <div className="relative overflow-hidden rounded-sm border border-marguerite/30 p-12 md:p-16 text-center">
          <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-luxe)" }} />
          <div className="relative">
            <div className="eyebrow mb-4">Atendimento Personalizado</div>
            <h2 className="font-display text-4xl md:text-5xl text-onyx max-w-2xl mx-auto">
              Sua joia ideal, escolhida a quatro mãos.
            </h2>
            <p className="mt-6 max-w-xl mx-auto text-muted-foreground">
              Fale com nossa consultoria via WhatsApp e descubra a peça perfeita para você ou para presentear.
            </p>
            <a
              href={whatsappLink("Olá Marguerite Jóias! Gostaria de uma consultoria personalizada.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-luxe btn-luxe-hover mt-10"
            >
              <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
