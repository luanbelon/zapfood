"use client";

import { useEffect, useState } from "react";

type StoreRow = {
  id: string;
  name: string;
  subdomain: string;
  code: string;
  active: boolean;
};

export default function MasterStoresPage() {
  const [items, setItems] = useState<StoreRow[]>([]);
  const [form, setForm] = useState({
    name: "",
    subdomain: "",
    code: "",
    adminEmail: "",
    adminPassword: "",
  });
  const [status, setStatus] = useState("");

  async function load() {
    const res = await fetch("/api/master/stores", { credentials: "include" });
    if (!res.ok) return;
    setItems((await res.json()) as StoreRow[]);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createStore(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");
    const res = await fetch("/api/master/stores", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setStatus("Erro ao criar loja.");
      return;
    }
    setStatus("Loja criada com sucesso.");
    setForm({ name: "", subdomain: "", code: "", adminEmail: "", adminPassword: "" });
    await load();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <h1 className="text-xl font-bold text-zinc-900">Lojas (Admin master)</h1>
      <form onSubmit={createStore} className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-2">
        <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Nome da loja" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Subdominio" value={form.subdomain} onChange={(e) => setForm({ ...form, subdomain: e.target.value })} />
        <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Codigo (6 alfanumerico)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Email admin da loja" value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} />
        <input type="password" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm sm:col-span-2" placeholder="Senha admin da loja" value={form.adminPassword} onChange={(e) => setForm({ ...form, adminPassword: e.target.value })} />
        <button className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white sm:col-span-2">Criar loja</button>
      </form>
      {status ? <p className="text-sm text-zinc-600">{status}</p> : null}
      <ul className="space-y-2">
        {items.map((s) => (
          <li key={s.id} className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm">
            <p className="font-semibold text-zinc-900">{s.name}</p>
            <p className="text-zinc-600">Subdominio: {s.subdomain}</p>
            <p className="text-zinc-600">Codigo: {s.code}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
