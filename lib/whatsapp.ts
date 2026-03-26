export type CartLine = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

/** Digits only, country code included (e.g. 5591999999999) */
export function normalizeWhatsAppNumber(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function formatOrderMessage(
  lines: CartLine[],
  opts: { storeName: string; address?: string; customerName?: string; customerPhone?: string }
): string {
  const parts: string[] = [];
  parts.push(`🍔 Pedido - ${opts.storeName}`);
  if (opts.customerName) parts.push(`👤 Cliente: ${opts.customerName}`);
  if (opts.customerPhone) parts.push(`📞 Telefone: ${opts.customerPhone}`);
  parts.push("");

  for (const line of lines) {
    const subtotal = line.price * line.qty;
    parts.push(`${line.qty}x ${line.name} — R$ ${subtotal.toFixed(2).replace(".", ",")}`);
  }

  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  parts.push("");
  parts.push(`💰 Total: R$ ${total.toFixed(2).replace(".", ",")}`);

  const addr = (opts.address ?? "").trim();
  if (addr) {
    parts.push(`📍 Endereço: ${addr}`);
  }

  return parts.join("\n");
}

export function buildWhatsAppUrl(phoneDigits: string, message: string): string {
  const num = normalizeWhatsAppNumber(phoneDigits);
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}
