import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, Tag, ArrowRight, CheckCircle2 } from "lucide-react";
import { useCart, cart } from "@/lib/cart-store";
import { formatBRL } from "@/lib/products";
import { whatsappLink, WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout · Cintilare" }] }),
  component: Checkout,
});

const COUPONS: Record<string, number> = {
  CINTILA10: 0.1,
  PRATA15: 0.15,
};

function Checkout() {
  const { items, subtotal } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: "", telefone: "", email: "",
    cep: "", endereco: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "",
  });
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState<number | null>(null);
  const [sent, setSent] = useState(false);

  const total = Math.max(0, subtotal - discount + (shipping ?? 0));

  if (items.length === 0 && !sent) {
    return (
      <div className="container-luxe py-32 text-center">
        <h1 className="font-display text-4xl text-ivory">Carrinho vazio</h1>
        <Link to="/catalogo" className="btn-outline-luxe mt-8 inline-flex">Ver catálogo</Link>
      </div>
    );
  }

  const applyCoupon = () => {
    const c = coupon.trim().toUpperCase();
    if (COUPONS[c]) {
      const d = subtotal * COUPONS[c];
      setDiscount(d);
      toast.success(`Cupom aplicado: -${formatBRL(d)}`);
    } else {
      setDiscount(0);
      toast.error("Cupom inválido");
    }
  };

  const calcShipping = () => {
    if (form.cep.replace(/\D/g, "").length !== 8) {
      toast.error("Digite um CEP válido");
      return;
    }
    const value = subtotal > 500 ? 0 : 29.9;
    setShipping(value);
    toast.success(value === 0 ? "Frete grátis!" : `Frete: ${formatBRL(value)}`);
  };

  const requiredFilled =
    form.nome && form.telefone && form.email && form.cep &&
    form.endereco && form.numero && form.cidade && form.estado;

  const buildMessage = () => {
    const lista = items
      .map((i) => `• ${i.qty}x ${i.product.name} — ${formatBRL(i.qty * i.product.price)}`)
      .join("\n");
    const endereco = `${form.endereco}, ${form.numero}${form.complemento ? ` - ${form.complemento}` : ""}\n${form.bairro} - ${form.cidade}/${form.estado}\nCEP: ${form.cep}`;
    return `*Novo Pedido Recebido*

*Cliente:* ${form.nome}
*Telefone:* ${form.telefone}
*E-mail:* ${form.email}

*Itens:*
${lista}

*Subtotal:* ${formatBRL(subtotal)}${discount ? `\n*Desconto:* -${formatBRL(discount)}` : ""}${shipping !== null ? `\n*Frete:* ${shipping === 0 ? "Grátis" : formatBRL(shipping)}` : ""}
*Total:* ${formatBRL(total)}

*Endereço de Entrega:*
${endereco}`;
  };

  const finalize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requiredFilled) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    try {
      await supabase.from("pedidos").insert({
        cliente_nome: form.nome,
        cliente_email: form.email,
        cliente_telefone: form.telefone,
        endereco: {
          cep: form.cep, endereco: form.endereco, numero: form.numero,
          complemento: form.complemento, bairro: form.bairro,
          cidade: form.cidade, estado: form.estado,
        },
        itens: items.map((i) => ({ nome: i.product.name, qty: i.qty, preco: i.product.price })),
        subtotal,
        desconto: discount,
        frete: shipping ?? 0,
        valor_total: total,
      });
    } catch {
      // continua para o WhatsApp mesmo se DB falhar
    }
    const msg = buildMessage();
    window.open(whatsappLink(msg), "_blank");
    setSent(true);
    cart.clear();
  };

  if (sent) {
    return (
      <div className="container-luxe py-32 text-center max-w-xl mx-auto">
        <div className="grid h-20 w-20 mx-auto place-items-center rounded-full bg-gradient-to-br from-champagne to-champagne-deep text-onyx mb-6">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="font-display text-4xl text-ivory">Pedido enviado!</h1>
        <p className="mt-4 text-muted-foreground">
          Seu pedido foi encaminhado para nosso WhatsApp. Em instantes nossa equipe entrará em contato para confirmar pagamento e entrega.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-luxe btn-luxe-hover"
          >
            <MessageCircle className="h-4 w-4" /> Abrir WhatsApp
          </a>
          <button onClick={() => navigate({ to: "/catalogo" })} className="btn-outline-luxe">
            Continuar Navegando
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-luxe py-16">
      <div className="text-center mb-12">
        <div className="eyebrow mb-3">Finalizar Pedido</div>
        <h1 className="font-display text-5xl text-ivory">Checkout</h1>
      </div>

      <form onSubmit={finalize} className="grid lg:grid-cols-[1fr_420px] gap-12">
        <div className="space-y-10">
          <section>
            <h2 className="font-display text-2xl text-ivory mb-6">Dados Pessoais</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nome completo *" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} className="sm:col-span-2" />
              <Field label="Telefone *" value={form.telefone} onChange={(v) => setForm({ ...form, telefone: v })} placeholder="(62) 99999-9999" />
              <Field label="E-mail *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ivory mb-6">Endereço de Entrega</h2>
            <div className="grid sm:grid-cols-6 gap-4">
              <Field label="CEP *" value={form.cep} onChange={(v) => setForm({ ...form, cep: v })} className="sm:col-span-2" placeholder="00000-000" />
              <div className="sm:col-span-4 flex items-end">
                <button type="button" onClick={calcShipping} className="btn-outline-luxe w-full">
                  Calcular Frete
                </button>
              </div>
              <Field label="Endereço *" value={form.endereco} onChange={(v) => setForm({ ...form, endereco: v })} className="sm:col-span-4" />
              <Field label="Número *" value={form.numero} onChange={(v) => setForm({ ...form, numero: v })} className="sm:col-span-2" />
              <Field label="Complemento" value={form.complemento} onChange={(v) => setForm({ ...form, complemento: v })} className="sm:col-span-3" />
              <Field label="Bairro" value={form.bairro} onChange={(v) => setForm({ ...form, bairro: v })} className="sm:col-span-3" />
              <Field label="Cidade *" value={form.cidade} onChange={(v) => setForm({ ...form, cidade: v })} className="sm:col-span-4" />
              <Field label="UF *" value={form.estado} onChange={(v) => setForm({ ...form, estado: v.toUpperCase().slice(0, 2) })} className="sm:col-span-2" />
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ivory mb-6">Cupom de Desconto</h2>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="CINTILA10"
                  className="w-full pl-10 pr-3 py-3 bg-onyx-soft/40 border border-border rounded-sm text-ivory focus:outline-none focus:border-champagne uppercase"
                />
              </div>
              <button type="button" onClick={applyCoupon} className="btn-outline-luxe">Aplicar</button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Experimente: CINTILA10 ou PRATA15</p>
          </section>
        </div>

        <aside className="h-fit lg:sticky lg:top-28 p-6 border border-border/60 rounded-sm bg-card/30 space-y-5">
          <h2 className="font-display text-2xl text-ivory">Resumo do Pedido</h2>
          <div className="hairline" />
          <div className="space-y-3 max-h-60 overflow-auto">
            {items.map(({ product, qty }) => (
              <div key={product.id} className="flex gap-3 text-sm">
                <img src={product.images[0]} alt="" className="h-14 w-14 object-cover rounded-sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-ivory truncate">{product.name}</div>
                  <div className="text-xs text-muted-foreground">Qtd: {qty}</div>
                </div>
                <div className="text-ivory text-sm">{formatBRL(qty * product.price)}</div>
              </div>
            ))}
          </div>
          <div className="hairline" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-ivory/80"><span>Subtotal</span><span>{formatBRL(subtotal)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-champagne"><span>Desconto</span><span>-{formatBRL(discount)}</span></div>
            )}
            <div className="flex justify-between text-ivory/80">
              <span>Frete</span>
              <span>{shipping === null ? "—" : shipping === 0 ? "Grátis" : formatBRL(shipping)}</span>
            </div>
          </div>
          <div className="hairline" />
          <div className="flex justify-between items-baseline">
            <span className="text-ivory">Total</span>
            <span className="font-display text-3xl text-gradient-champagne">{formatBRL(total)}</span>
          </div>
          <button type="submit" className="btn-luxe btn-luxe-hover w-full">
            <MessageCircle className="h-4 w-4" /> Enviar pedido via WhatsApp
          </button>
          <p className="text-[0.7rem] text-muted-foreground text-center leading-relaxed">
            Após enviar, finalizamos o pagamento e entrega diretamente com você.
            Em breve: Mercado Pago e Stripe.
          </p>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder, className = "",
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label className="eyebrow block mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-onyx-soft/40 border border-border rounded-sm px-4 py-3 text-ivory text-sm focus:outline-none focus:border-champagne"
      />
    </div>
  );
}
