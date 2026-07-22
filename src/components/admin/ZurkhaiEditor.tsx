"use client";

import { useEffect, useState } from "react";
import { toLocalISODate } from "@/lib/format";
import { getZurkhaiByDate, upsertZurkhai } from "@/lib/zurkhai";

export function ZurkhaiEditor() {
  const [date, setDate] = useState(() => toLocalISODate(new Date()));
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getZurkhaiByDate(date).then((note) => {
      if (!cancelled) {
        setText(note?.text ?? "");
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- загрузка только при первом рендере, дальше её делает loadDate
  }, []);

  function loadDate(nextDate: string) {
    setDate(nextDate);
    setSavedAt(null);
    setLoading(true);
    getZurkhaiByDate(nextDate).then((note) => {
      setText(note?.text ?? "");
      setLoading(false);
    });
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await upsertZurkhai(date, text.trim());
    setSaving(false);

    if (error) {
      alert("Не удалось сохранить: " + error);
      return;
    }
    setSavedAt(Date.now());
  }

  return (
    <details className="rounded-xl border border-slate-200 bg-white p-4">
      <summary className="cursor-pointer font-display text-lg font-bold text-ink">
        🌙 Зурхай на день
      </summary>

      <div className="mt-3 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Дата
          <input
            type="date"
            value={date}
            onChange={(e) => loadDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Текст на этот день
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
            rows={4}
            placeholder="Например: благоприятный день для начинаний, избегайте споров..."
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading || !text.trim()}
            className="self-start rounded-lg bg-brand-deep px-4 py-1.5 text-sm text-white hover:bg-brand disabled:opacity-50"
          >
            {saving ? "Сохраняем..." : "Сохранить"}
          </button>
          {savedAt && (
            <span className="text-sm text-emerald-600">Сохранено ✓</span>
          )}
        </div>
      </div>
    </details>
  );
}
