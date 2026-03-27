"use client";

import { MASTER_BASE_PATH } from "@/lib/admin-path";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MasterLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        body: JSON.stringify({ mode: "master", email, password }),
      });
      if (!res.ok) {
        setErr("Credenciais invalidas.");
        return;
      }
      router.replace(MASTER_BASE_PATH);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-bold text-zinc-900">Painel master</h1>
        <label className="mt-4 block text-xs font-medium text-zinc-600">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm"
        />
        <label className="mt-3 block text-xs font-medium text-zinc-600">Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm"
        />
        {err ? <p className="mt-2 text-sm text-red-600">{err}</p> : null}
        <button type="submit" disabled={loading} className="mt-4 w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
