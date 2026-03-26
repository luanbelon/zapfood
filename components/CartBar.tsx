"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";

type Props = {
  storeName: string;
  whatsappNumber: string;
  primaryColor: string;
  isStoreOpen: boolean;
};

export function CartBar({ storeName, whatsappNumber, primaryColor, isStoreOpen }: Props) {
  const { items, total, count, dec, inc, remove, clear } = useCart();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  async function lookupCustomerByPhone(nextPhone: string) {
    if (nextPhone.replace(/\D/g, "").length < 10) return;
    setLoadingCustomer(true);
    try {
      const res = await fetch(`/api/customers/by-phone?phone=${encodeURIComponent(nextPhone)}`);
      if (!res.ok) return;
      const data = (await res.json()) as { customer: { name: string; address: string } | null };
      if (!data.customer) return;
      setCustomerName(data.customer.name);
      setAddress(data.customer.address);
    } finally {
      setLoadingCustomer(false);
    }
  }

  async function openWhatsApp() {
    if (!isStoreOpen) {
      window.alert("Loja fechada no momento.");
      return;
    }
    if (!whatsappNumber) {
      window.alert("Configure WHATSAPP_NUMBER no servidor.");
      return;
    }
    if (items.length === 0) return;
    if (!phone.trim() || !customerName.trim() || !address.trim()) {
      window.alert("Preencha telefone, nome e endereco antes de enviar.");
      return;
    }
    const lines = items.map((i) => ({
      id: i.productId,
      name: i.name,
      price: i.price,
      qty: i.qty,
    }));
    const response = await fetch("/api/orders/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeName,
        whatsappNumber,
        phone,
        customerName,
        address,
        lines,
      }),
    });
    if (!response.ok) {
      window.alert("Nao foi possivel finalizar pedido.");
      return;
    }
    const data = (await response.json()) as { whatsappUrl: string };
    window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
  }

  if (count === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto w-full max-w-6xl">
        {open && (
          <div className="mb-2 max-h-[55vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">Seu pedido</h3>
              <button
                type="button"
                onClick={() => clear()}
                className="text-xs font-medium text-red-600"
              >
                Limpar
              </button>
            </div>
            <ul className="space-y-3">
              {items.map((i) => (
                <li key={i.productId} className="flex items-center gap-2 text-sm">
                  <div className="flex flex-1 flex-col">
                    <span className="font-medium text-zinc-800">{i.name}</span>
                    <span className="text-xs text-zinc-500">
                      R$ {(i.price * i.qty).toFixed(2).replace(".", ",")}
                    </span>
                    {i.originalPrice ? (
                      <span className="text-[11px] text-zinc-400 line-through">
                        R$ {(i.originalPrice * i.qty).toFixed(2).replace(".", ",")}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-1">
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-lg font-medium text-zinc-700"
                      onClick={() => dec(i.productId)}
                      aria-label="Menos"
                    >
                      −
                    </button>
                    <span className="min-w-[1.5rem] text-center text-xs font-semibold">{i.qty}</span>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-lg font-medium text-zinc-700"
                      onClick={() => inc(i.productId)}
                      aria-label="Mais"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(i.productId)}
                    className="text-xs text-zinc-400 underline"
                  >
                    remover
                  </button>
                </li>
              ))}
            </ul>
            <label className="mt-4 block">
              <span className="text-xs font-medium text-zinc-600">Telefone</span>
              <input
                value={phone}
                onChange={(e) => {
                  const next = e.target.value;
                  setPhone(next);
                  void lookupCustomerByPhone(next);
                }}
                placeholder="(11) 99999-9999"
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-400"
              />
            </label>
            <label className="mt-3 block">
              <span className="text-xs font-medium text-zinc-600">
                Nome {loadingCustomer ? "(buscando...)" : ""}
              </span>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Seu nome"
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-400"
              />
            </label>
            <label className="mt-3 block">
              <span className="text-xs font-medium text-zinc-600">Endereco de entrega</span>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                placeholder="Rua, número, referência..."
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-400"
              />
            </label>
          </div>
        )}
        <div className="flex gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex flex-1 flex-col items-start rounded-xl px-3 py-2 text-left transition active:bg-zinc-50"
          >
            <span className="text-xs text-zinc-500">Total ({count} itens)</span>
            <span className="text-lg font-bold text-zinc-900">
              R$ {total.toFixed(2).replace(".", ",")}
            </span>
          </button>
          <button
            type="button"
            onClick={openWhatsApp}
            className="flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-md active:opacity-95"
            style={{ backgroundColor: primaryColor }}
          >
            <span className="text-lg leading-none">💬</span>
            {isStoreOpen ? "WhatsApp" : "Loja fechada"}
          </button>
        </div>
      </div>
    </div>
  );
}
