"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { EVENT_CATEGORIES } from "@/lib/types";

const EMPTY_FORM = {
  title: "",
  description: "",
  event_date: "",
  event_time: "",
  location: "",
  village: "",
  category: EVENT_CATEGORIES[0],
  organizer: "",
  contacts: "",
};

export function EventForm({
  villages,
  onAdded,
}: {
  villages: string[];
  onAdded: () => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function updateField<K extends keyof typeof EMPTY_FORM>(
    field: K,
    value: string
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    setSaving(true);
    setError(null);

    const { error } = await supabase.from("events").insert({
      title: form.title,
      description: form.description || null,
      event_date: form.event_date,
      event_time: form.event_time || null,
      location: form.location || null,
      village: form.village,
      category: form.category,
      organizer: form.organizer || null,
      contacts: form.contacts || null,
    });

    setSaving(false);

    if (error) {
      setError("Не удалось сохранить событие: " + error.message);
      return;
    }

    setForm(EMPTY_FORM);
    onAdded();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-lg font-semibold">Добавить событие</h2>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Название</label>
        <input
          required
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Описание</label>
        <textarea
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={3}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-600">Дата</label>
          <input
            type="date"
            required
            value={form.event_date}
            onChange={(e) => updateField("event_date", e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-600">Время</label>
          <input
            type="time"
            value={form.event_time}
            onChange={(e) => updateField("event_time", e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-600">Село / посёлок</label>
          <input
            required
            list="village-suggestions"
            value={form.village}
            onChange={(e) => updateField("village", e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <datalist id="village-suggestions">
            {villages.map((v) => (
              <option key={v} value={v} />
            ))}
          </datalist>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-600">Категория</label>
          <select
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Место проведения</label>
        <input
          value={form.location}
          onChange={(e) => updateField("location", e.target.value)}
          placeholder="Например: Дом культуры"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-600">Организатор</label>
          <input
            value={form.organizer}
            onChange={(e) => updateField("organizer", e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-600">Контакты</label>
          <input
            value={form.contacts}
            onChange={(e) => updateField("contacts", e.target.value)}
            placeholder="Телефон и т.п."
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="self-start rounded-lg bg-brand-deep px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Сохраняем..." : "Добавить событие"}
      </button>
    </form>
  );
}
