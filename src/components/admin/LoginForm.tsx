"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (error) {
      setError("Неверный email или пароль.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex max-w-sm flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h1 className="text-lg font-semibold">Вход для модератора</h1>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm text-gray-600">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm text-gray-600">
          Пароль
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Входим..." : "Войти"}
      </button>
    </form>
  );
}
