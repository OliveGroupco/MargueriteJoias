export const WHATSAPP_NUMBER = "5562981452436";

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function whatsappProductMessage(productName: string) {
  return `Olá Cintilare! Tenho interesse na peça: ${productName}. Pode me ajudar?`;
}
