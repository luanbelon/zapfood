import { countProducts } from "@/lib/products-repo";
import { getSalesSummary } from "@/lib/customer-order-repo";
import Link from "next/link";
import { ADMIN_PRODUCTS_PATH } from "@/lib/admin-path";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { total, active, inactive } = await countProducts();
  const sales = await getSalesSummary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Painel</h1>
        <p className="mt-1 text-sm text-zinc-500">Resumo da sua loja</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Produtos</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">{total}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Ativos no cardápio</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{active}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Inativos</p>
          <p className="mt-1 text-2xl font-bold text-zinc-600">{inactive}</p>
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-zinc-700">Vendas</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-zinc-500">Pedidos hoje</p>
            <p className="mt-1 text-2xl font-bold text-zinc-900">{sales.today}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-zinc-500">Pedidos semana</p>
            <p className="mt-1 text-2xl font-bold text-zinc-900">{sales.week}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-zinc-500">Pedidos mes</p>
            <p className="mt-1 text-2xl font-bold text-zinc-900">{sales.month}</p>
          </div>
        </div>
      </div>
      <Link
        href={ADMIN_PRODUCTS_PATH}
        className="inline-flex rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
      >
        Gerenciar produtos
      </Link>
    </div>
  );
}
