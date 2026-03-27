"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ADMIN_BASE_PATH,
  ADMIN_LOGIN_PATH,
  ADMIN_PRODUCTS_PATH,
  ADMIN_SETTINGS_PATH,
} from "@/lib/admin-path";

type Props = {
  children: React.ReactNode;
  storeName: string;
  primaryColor: string;
  logoUrl?: string | null;
};

export function AdminShell({ children, storeName, primaryColor, logoUrl }: Props) {
  const path = usePathname();
  if (path === ADMIN_LOGIN_PATH) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <nav className="border-b border-zinc-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium">
          <Link href={ADMIN_BASE_PATH} className="mr-2 flex items-center gap-2 text-zinc-900">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" className="h-20 w-20 rounded-lg object-cover" />
            ) : null}
            <span style={{ color: primaryColor }}>{storeName}</span>
          </Link>
          <Link href={ADMIN_BASE_PATH} className="text-zinc-900">
            Painel
          </Link>
          <Link href={ADMIN_PRODUCTS_PATH} className="text-zinc-600 hover:text-zinc-900">
            Produtos
          </Link>
          <Link href={ADMIN_SETTINGS_PATH} className="text-zinc-600 hover:text-zinc-900">
            Customizacao
          </Link>
          <Link href="/" className="ml-auto text-zinc-500 hover:text-zinc-800">
            Ver cardápio
          </Link>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="text-red-600 hover:text-red-700"
            >
              Sair
            </button>
          </form>
        </div>
      </nav>
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}
