"use client";

import type { ProductRecord } from "@/lib/types";
import { useCart } from "@/components/cart/CartProvider";

type Props = {
  product: ProductRecord;
  primaryColor: string;
  canOrder: boolean;
};

export function ProductCard({ product, primaryColor, canOrder }: Props) {
  const { add } = useCart();
  const img = product.image?.trim();
  const promoPrice = product.promoPrice;
  const isPromo = product.promoActive && typeof promoPrice === "number";
  const finalPrice = isPromo ? promoPrice : product.price;

  return (
    <article className="flex gap-3 rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl text-zinc-300">
            🍽️
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <h2 className="font-semibold leading-snug text-zinc-900">{product.name}</h2>
          {isPromo ? (
            <div className="mt-1">
              <p className="text-xs text-zinc-400 line-through">
                R$ {product.price.toFixed(2).replace(".", ",")}
              </p>
              <p className="text-sm font-bold text-emerald-600">
                R$ {finalPrice.toFixed(2).replace(".", ",")}
              </p>
            </div>
          ) : (
            <p className="mt-1 text-sm font-medium text-zinc-600">
              R$ {finalPrice.toFixed(2).replace(".", ",")}
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={!canOrder}
          onClick={() => add(product)}
          className="mt-2 w-full rounded-xl py-2.5 text-sm font-semibold text-white shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: primaryColor }}
        >
          {canOrder ? "Adicionar" : "Loja fechada"}
        </button>
      </div>
    </article>
  );
}
