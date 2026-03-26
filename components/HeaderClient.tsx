"use client";

import { useCart } from "@/components/cart/CartProvider";
import { Header } from "@/components/Header";

type Props = {
  storeName: string;
  primaryColor: string;
  logoUrl?: string | null;
};

export function HeaderClient({ storeName, primaryColor, logoUrl }: Props) {
  const { count } = useCart();
  return (
    <Header
      storeName={storeName}
      primaryColor={primaryColor}
      logoUrl={logoUrl}
      cartCount={count}
    />
  );
}
