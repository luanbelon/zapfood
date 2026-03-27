import Link from "next/link";

type Props = {
  storeName: string;
  primaryColor: string;
  logoUrl?: string | null;
  cartCount: number;
};

export function Header({ storeName, primaryColor, logoUrl, cartCount }: Props) {
  return (
    <header
      className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md"
      style={{ borderBottomColor: `${primaryColor}33` }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" className="h-20 w-20 rounded-xl object-cover" />
          ) : null}
          <div className="min-w-0">
          <h1
            className="truncate text-lg font-bold tracking-tight"
            style={{ color: primaryColor }}
          >
            {storeName}
          </h1>
          <p className="truncate text-xs text-zinc-500">Cardápio • Peça pelo WhatsApp</p>
          </div>
        </Link>
        {cartCount > 0 ? (
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {cartCount} no carrinho
          </span>
        ) : (
          <span className="shrink-0 text-xs text-zinc-400">Aberto</span>
        )}
      </div>
    </header>
  );
}
