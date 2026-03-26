"use client";

import { ADMIN_BASE_PATH } from "@/lib/admin-path";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeCode, setStoreCode] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, storeCode }),
      });
      if (!res.ok) {
        setErr("Dados invalidos.");
        return;
      }
      router.replace(ADMIN_BASE_PATH);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-lg font-bold text-zinc-900">Acesso administrativo</h1>
        <p className="mt-1 text-sm text-zinc-500">Use email, senha e codigo da loja.</p>
        <label className="mt-4 block text-xs font-medium text-zinc-600">Email</label>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-400"
        />
        <label className="mt-3 block text-xs font-medium text-zinc-600">Senha</label>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-400"
        />
        <label className="mt-3 block text-xs font-medium text-zinc-600">Codigo da loja (4 digitos)</label>
        <input
          required
          pattern="\d{4}"
          maxLength={4}
          inputMode="numeric"
          value={storeCode}
          onChange={(e) => setStoreCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
          className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-400"
        />
        {err ? <p className="mt-2 text-sm text-red-600">{err}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
