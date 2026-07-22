import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";

export function WhatsAppFab() {
  return (
    <a
      href={whatsappLink("Olá! Gostaria de saber mais sobre as joias da Marguerite Jóias.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-marguerite to-marguerite-deep text-onyx shadow-lg hover:scale-110 transition-transform"
      style={{ boxShadow: "0 10px 40px -10px rgba(217, 194, 160, 0.6)" }}
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
