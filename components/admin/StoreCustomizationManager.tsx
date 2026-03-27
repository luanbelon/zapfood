"use client";

import type { StoreSettings } from "@/lib/types";
import { useEffect, useState } from "react";

export function StoreCustomizationManager() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/admin/settings", { credentials: "include" });
      if (!res.ok) return;
      const data = (await res.json()) as StoreSettings;
      setSettings(data);
    })();
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setStatus(res.ok ? "Salvo com sucesso." : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return <p className="text-sm text-zinc-500">Carregando...</p>;
  }

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h1 className="text-xl font-bold text-zinc-900">Customizacao da loja</h1>
      <label className="block">
        <span className="text-xs font-medium text-zinc-600">Nome da loja</span>
        <input
          value={settings.storeName}
          onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
          className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-zinc-600">Abertura</span>
          <input
            type="time"
            value={settings.openTime}
            onChange={(e) => setSettings({ ...settings, openTime: e.target.value })}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-zinc-600">Fechamento</span>
          <input
            type="time"
            value={settings.closeTime}
            onChange={(e) => setSettings({ ...settings, closeTime: e.target.value })}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-xs font-medium text-zinc-600">Cor principal</span>
        <div className="mt-1 flex gap-2">
          <input
            type="color"
            value={settings.primaryColor}
            onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
            className="h-10 w-16 rounded-lg border border-zinc-200"
          />
          <input
            value={settings.primaryColor}
            onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
      </label>
      <label className="block">
        <span className="text-xs font-medium text-zinc-600">Logo</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () =>
              setSettings((prev) => (prev ? { ...prev, logoUrl: String(reader.result ?? "") } : prev));
            reader.readAsDataURL(file);
          }}
          className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-zinc-600">ou URL da logo</span>
        <input
          value={settings.logoUrl ?? ""}
          onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value || null })}
          className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          placeholder="https://..."
        />
      </label>
      {settings.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={settings.logoUrl} alt="Logo preview" className="h-16 w-16 rounded-xl object-cover" />
      ) : null}
      <label className="block">
        <span className="text-xs font-medium text-zinc-600">Banner desktop (BG)</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () =>
              setSettings((prev) =>
                prev ? { ...prev, bannerImageUrl: String(reader.result ?? "") } : prev,
              );
            reader.readAsDataURL(file);
          }}
          className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-zinc-600">ou URL do banner</span>
        <input
          value={settings.bannerImageUrl ?? ""}
          onChange={(e) => setSettings({ ...settings, bannerImageUrl: e.target.value || null })}
          className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          placeholder="https://..."
        />
      </label>
      {settings.bannerImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={settings.bannerImageUrl}
          alt="Banner preview"
          className="h-24 w-full rounded-xl object-cover"
        />
      ) : null}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar alteracoes"}
        </button>
        {status ? <span className="text-sm text-zinc-500">{status}</span> : null}
      </div>
    </div>
  );
}
