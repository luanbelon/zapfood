import { ProductCard } from "@/components/ProductCard";
import { listProducts } from "@/lib/products-repo";
import { getStoreSettings } from "@/lib/store-settings-repo";
import { isStoreOpenNow } from "@/lib/store-hours";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const products = await listProducts(false);
  const settings = await getStoreSettings();
  const primary = settings.primaryColor;
  const isOpen = isStoreOpenNow(settings.openTime, settings.closeTime);
  const promo = products.filter((p) => p.promoActive && p.promoPrice !== null);
  const regular = products.filter((p) => !p.promoActive || p.promoPrice === null);

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-100 bg-white p-10 text-center shadow-sm">
        <p className="text-zinc-500">Nenhum item no cardápio ainda.</p>
        <p className="mt-2 text-sm text-zinc-400">
          Cadastre produtos no painel interno da loja.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isOpen ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Loja fechada agora. Horario de atendimento: {settings.openTime} as {settings.closeTime}
        </div>
      ) : null}
      {settings.bannerImageUrl ? (
        <section className="hidden lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={settings.bannerImageUrl}
            alt="Banner da loja"
            className="h-[20vh] w-full rounded-2xl object-cover"
          />
        </section>
      ) : null}
      {promo.length > 0 ? (
        <section className="space-y-3">
          <div className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white">
            Promocao do dia
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {promo.map((p) => (
              <ProductCard key={p.id} product={p} primaryColor={primary} canOrder={isOpen} />
            ))}
          </div>
        </section>
      ) : null}
      <section className="space-y-3">
        {promo.length > 0 ? (
          <h2 className="text-sm font-semibold text-zinc-500">Cardapio</h2>
        ) : null}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {regular.map((p) => (
            <ProductCard key={p.id} product={p} primaryColor={primary} canOrder={isOpen} />
          ))}
        </div>
      </section>
    </div>
  );
}
