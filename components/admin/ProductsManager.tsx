"use client";

import type { ProductRecord } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

type Draft = {
  name: string;
  price: string;
  image: string;
  active: boolean;
  promoActive: boolean;
  promoPrice: string;
};

const emptyDraft: Draft = {
  name: "",
  price: "",
  image: "",
  active: true,
  promoActive: false,
  promoPrice: "",
};

async function parseResponse(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export function ProductsManager() {
  const [items, setItems] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/products", { credentials: "include" });
    if (!res.ok) {
      setError("Não foi possível carregar os produtos.");
      return;
    }
    const data = (await res.json()) as ProductRecord[];
    setItems(data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function createProduct(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name.trim(),
          price: Number(draft.price.replace(",", ".")),
          image: draft.image.trim() || null,
          active: draft.active,
          promoActive: draft.promoActive,
          promoPrice: draft.promoActive ? Number(draft.promoPrice.replace(",", ".")) : null,
        }),
      });
      if (!res.ok) {
        const body = await parseResponse(res);
        setError(typeof body === "string" ? body : "Erro ao salvar.");
        return;
      }
      setDraft(emptyDraft);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(p: ProductRecord) {
    const res = await fetch(`/api/products/${p.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !p.active }),
    });
    if (!res.ok) return;
    await load();
  }

  async function removeProduct(id: string) {
    if (!window.confirm("Excluir este produto?")) return;
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) return;
    await load();
  }

  async function updateProduct(item: ProductRecord, form: Draft) {
    const res = await fetch(`/api/products/${item.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        price: Number(form.price.replace(",", ".")),
        image: form.image.trim() || null,
        active: form.active,
        promoActive: form.promoActive,
        promoPrice: form.promoActive ? Number(form.promoPrice.replace(",", ".")) : null,
      }),
    });
    if (!res.ok) {
      setError("Nao foi possivel atualizar.");
      return;
    }
    setEditingId(null);
    await load();
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Carregando…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Produtos</h1>
        <p className="mt-1 text-sm text-zinc-500">CRUD do cardápio</p>
      </div>

      <form
        onSubmit={createProduct}
        className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold text-zinc-800">Novo produto</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-zinc-600">Nome</span>
            <input
              required
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-zinc-600">Preço (R$)</span>
            <input
              required
              inputMode="decimal"
              value={draft.price}
              onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              placeholder="18.90"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-zinc-600">Imagem do produto</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () =>
                  setDraft((d) => ({ ...d, image: String(reader.result ?? "") }));
                reader.readAsDataURL(file);
              }}
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-zinc-600">
              ou URL da imagem (opcional)
            </span>
            <input
              value={draft.image}
              onChange={(e) => setDraft((d) => ({ ...d, image: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </label>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))}
            />
            <span className="text-sm text-zinc-700">Visível no cardápio</span>
          </label>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={draft.promoActive}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  promoActive: e.target.checked,
                  promoPrice: e.target.checked ? d.promoPrice : "",
                }))
              }
            />
            <span className="text-sm text-zinc-700">Em promocao</span>
          </label>
          {draft.promoActive ? (
            <label className="block">
              <span className="text-xs font-medium text-zinc-600">Preco promocional (R$)</span>
              <input
                required
                inputMode="decimal"
                value={draft.promoPrice}
                onChange={(e) => setDraft((d) => ({ ...d, promoPrice: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
                placeholder="14.90"
              />
            </label>
          ) : null}
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Salvando…" : "Adicionar"}
        </button>
      </form>

      <ul className="space-y-2">
        {items.map((p) => (
          <ProductItemRow
            key={p.id}
            item={p}
            editing={editingId === p.id}
            setEditing={(v) => setEditingId(v ? p.id : null)}
            onToggleActive={toggleActive}
            onDelete={removeProduct}
            onSave={updateProduct}
          />
        ))}
      </ul>

      {items.length === 0 ? (
        <p className="text-center text-sm text-zinc-500">Nenhum produto cadastrado.</p>
      ) : null}
    </div>
  );
}

function ProductItemRow({
  item,
  editing,
  setEditing,
  onToggleActive,
  onDelete,
  onSave,
}: {
  item: ProductRecord;
  editing: boolean;
  setEditing: (value: boolean) => void;
  onToggleActive: (item: ProductRecord) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSave: (item: ProductRecord, draft: Draft) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Draft>({
    name: item.name,
    price: String(item.price),
    image: item.image ?? "",
    active: item.active,
    promoActive: item.promoActive,
    promoPrice: item.promoPrice ? String(item.promoPrice) : "",
  });

  useEffect(() => {
    setDraft({
      name: item.name,
      price: String(item.price),
      image: item.image ?? "",
      active: item.active,
      promoActive: item.promoActive,
      promoPrice: item.promoPrice ? String(item.promoPrice) : "",
    });
  }, [item]);

  if (!editing) {
    return (
      <li className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl opacity-40">
                🍽️
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-zinc-900">{item.name}</p>
            {item.promoActive && item.promoPrice ? (
              <>
                <p className="text-xs text-zinc-400 line-through">
                  R$ {item.price.toFixed(2).replace(".", ",")}
                </p>
                <p className="text-sm font-semibold text-emerald-600">
                  R$ {item.promoPrice.toFixed(2).replace(".", ",")}
                </p>
              </>
            ) : (
              <p className="text-sm text-zinc-600">R$ {item.price.toFixed(2).replace(".", ",")}</p>
            )}
            <p className="text-xs text-zinc-400">{item.active ? "Ativo" : "Inativo"}</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onToggleActive(item)}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700"
          >
            {item.active ? "Ocultar" : "Ativar"}
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-700"
          >
            Excluir
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="space-y-3 rounded-2xl border border-zinc-300 bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm sm:col-span-2"
          placeholder="Nome"
        />
        <input
          value={draft.price}
          onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          placeholder="Preco"
        />
        <input
          value={draft.image}
          onChange={(e) => setDraft((d) => ({ ...d, image: e.target.value }))}
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          placeholder="URL da imagem"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () =>
              setDraft((prev) => ({ ...prev, image: String(reader.result ?? "") }));
            reader.readAsDataURL(file);
          }}
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.active}
            onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))}
          />
          Visivel no cardapio
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.promoActive}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                promoActive: e.target.checked,
                promoPrice: e.target.checked ? d.promoPrice : "",
              }))
            }
          />
          Em promocao
        </label>
        {draft.promoActive ? (
          <input
            value={draft.promoPrice}
            onChange={(e) => setDraft((d) => ({ ...d, promoPrice: e.target.value }))}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
            placeholder="Preco promocional"
          />
        ) : null}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSave(item, draft)}
          className="rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700"
        >
          Cancelar
        </button>
      </div>
    </li>
  );
}
