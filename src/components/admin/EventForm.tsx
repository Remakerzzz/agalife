"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { AgaEvent, EVENT_CATEGORIES } from "@/lib/types";

const EMPTY_FORM = {
  title: "",
  description: "",
  event_date: "",
  event_time: "",
  location: "",
  village: "",
  category: EVENT_CATEGORIES[0] as string,
  organizer: "",
  contacts: "",
};

type FormValues = typeof EMPTY_FORM;

function eventToForm(event: AgaEvent): FormValues {
  return {
    title: event.title,
    description: event.description ?? "",
    event_date: event.event_date,
    event_time: event.event_time?.slice(0, 5) ?? "",
    location: event.location ?? "",
    village: event.village,
    category: event.category,
    organizer: event.organizer ?? "",
    contacts: event.contacts ?? "",
  };
}

async function uploadPoster(file: File): Promise<string> {
  if (!supabase) throw new Error("Supabase не настроен");

  const path = `${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("event-posters")
    .upload(path, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("event-posters").getPublicUrl(path);
  return data.publicUrl;
}

export function EventForm({
  villages,
  onSaved,
  editingEvent = null,
  onCancelEdit,
}: {
  villages: string[];
  onSaved: () => void;
  editingEvent?: AgaEvent | null;
  onCancelEdit?: () => void;
}) {
  const [form, setForm] = useState<FormValues>(() =>
    editingEvent ? eventToForm(editingEvent) : EMPTY_FORM
  );
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function updateField<K extends keyof FormValues>(field: K, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    setSaving(true);
    setError(null);

    let posterUrl = editingEvent?.poster_url ?? null;

    if (posterFile) {
      try {
        posterUrl = await uploadPoster(posterFile);
      } catch (uploadError) {
        setSaving(false);
        setError(
          "Не удалось загрузить фото: " + (uploadError as Error).message
        );
        return;
      }
    }

    const payload = {
      title: form.title,
      description: form.description || null,
      event_date: form.event_date,
      event_time: form.event_time || null,
      location: form.location || null,
      village: form.village,
      category: form.category,
      organizer: form.organizer || null,
      contacts: form.contacts || null,
      poster_url: posterUrl,
    };

    const { error } = editingEvent
      ? await supabase.from("events").update(payload).eq("id", editingEvent.id)
      : await supabase.from("events").insert(payload);

    setSaving(false);

    if (error) {
      setError("Не удалось сохранить событие: " + error.message);
      return;
    }

    if (!editingEvent) {
      setForm(EMPTY_FORM);
      setPosterFile(null);
    }
    onSaved();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="font-display text-lg font-bold text-ink">
        {editingEvent ? "Редактировать событие" : "Добавить событие"}
      </h2>

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

      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Фото / постер</label>
        {editingEvent?.poster_url && !posterFile && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={editingEvent.poster_url}
            alt=""
            className="mb-1 h-24 w-40 rounded-lg object-cover"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPosterFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="self-start rounded-lg bg-brand-deep px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving
            ? "Сохраняем..."
            : editingEvent
              ? "Сохранить изменения"
              : "Добавить событие"}
        </button>
        {editingEvent && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="self-start rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}
