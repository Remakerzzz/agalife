"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { AgaEvent } from "@/lib/types";
import { formatEventDate, formatEventTime } from "@/lib/format";

export function ModerationList({
  events,
  onDeleted,
}: {
  events: AgaEvent[];
  onDeleted: () => void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    if (!supabase) return;
    if (!confirm(`Удалить событие «${title}»?`)) return;

    setDeletingId(id);
    const { error } = await supabase.from("events").delete().eq("id", id);
    setDeletingId(null);

    if (error) {
      alert("Не удалось удалить: " + error.message);
      return;
    }
    onDeleted();
  }

  if (events.length === 0) {
    return <p className="text-sm text-slate-500">Событий пока нет.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {events.map((event) => {
        const time = formatEventTime(event.event_time);
        return (
          <div
            key={event.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-3"
          >
            <div>
              <p className="font-medium text-slate-900">{event.title}</p>
              <p className="text-sm text-slate-500">
                {formatEventDate(event.event_date)}
                {time && `, ${time}`} · {event.village} · {event.category}
              </p>
            </div>
            <button
              onClick={() => handleDelete(event.id, event.title)}
              disabled={deletingId === event.id}
              className="shrink-0 rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {deletingId === event.id ? "Удаляем..." : "Удалить"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
