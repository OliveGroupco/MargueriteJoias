import { createFileRoute } from "@tanstack/react-router";
import { Award, Gem, HeartHandshake } from "lucide-react";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre · Marguerite Jóias" },
      { name: "description", content: "Conheça a Marguerite Jóias: joalheria contemporânea em prata 925, com tradição artesanal e design refinado." },
    ],
  }),
  component: Sobre,
});

function Sobre() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1920&q=80"
            alt=""
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-onyx via-onyx/70 to-onyx" />
        </div>
        <div className="container-luxe relative py-32 text-center">
          <div className="eyebrow mb-4">Nossa História</div>
          <h1 className="font-display text-5xl md:text-7xl text-onyx max-w-3xl mx-auto leading-[1.05]">
            Uma marca nascida do <em className="text-gradient-marguerite not-italic">brilho</em>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-onyx/80">
            Marguerite Jóias é a tradução do desejo por peças que ultrapassem tendências —
            joias que se tornam herança.
          </p>
        </div>
      </section>

      <section className="container-luxe py-24 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="eyebrow mb-4">Nossa Trajetória</div>
          <h2 className="font-display text-4xl text-onyx leading-tight">
            Tradição joalheira encontra design contemporâneo.
          </h2>
          <div className="mt-8 space-y-5 text-onyx/80 leading-relaxed">
            <p>
              Fundada em Goiânia, a Marguerite Jóias nasceu da paixão por joalheria autoral.
              Cada peça é desenhada no ateliê e produzida em pequenas séries por
              ourives experientes que dominam técnicas centenárias.
            </p>
            <p>
              Trabalhamos exclusivamente com prata 925 maciça e pedras de origem certificada.
              Nosso compromisso é entregar beleza atemporal, com a confiança de uma marca
              que valoriza cada cliente como parte da história.
            </p>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
          <img
            src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=900&q=80"
            alt="Ateliê Marguerite Jóias"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="bg-ivory-soft/30 py-24">
        <div className="container-luxe">
          <div className="text-center mb-14">
            <div className="eyebrow mb-3">Pilares</div>
            <h2 className="font-display text-4xl text-onyx">Missão, Visão e Valores</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Gem, t: "Missão", d: "Criar joias atemporais em prata 925, traduzindo memórias em peças que cintilam para sempre." },
              { icon: Award, t: "Visão", d: "Tornar-se referência nacional em joalheria de prata premium, com presença em todo o Brasil." },
              { icon: HeartHandshake, t: "Valores", d: "Artesania, transparência, qualidade certificada e relacionamento próximo com cada cliente." },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="text-center p-8 border border-border/60 rounded-sm bg-card/40">
                <div className="grid h-14 w-14 mx-auto place-items-center rounded-full border border-marguerite/40 text-marguerite mb-5">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="font-display text-2xl text-onyx">{t}</div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
