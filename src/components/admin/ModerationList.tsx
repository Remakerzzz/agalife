"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AgaEvent } from "@/lib/types";
import { formatEventDate, formatEventTime, toLocalISODate } from "@/lib/format";

const PAGE_SIZE = 20;

type Tab = "upcoming" | "past";

export function ModerationList({
  events,
  onDeleted,
  onEdit,
  editingId,
  currentUserId,
  isAdmin,
  profileEmails,
}: {
  events: AgaEvent[];
  onDeleted: () => void;
  onEdit: (event: AgaEvent) => void;
  editingId?: string | null;
  currentUserId: string;
  isAdmin: boolean;
  profileEmails: Record<string, string>;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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

  const todayIso = toLocalISODate(new Date());

  // Обычный модератор видит в списке только свои события — чужие для
  // него не показываются вообще. Супер-админ видит все.
  const ownEvents = useMemo(
    () =>
      isAdmin ? events : events.filter((e) => e.created_by === currentUserId),
    [events, isAdmin, currentUserId]
  );

  const upcomingCount = useMemo(
    () => ownEvents.filter((e) => e.event_date >= todayIso).length,
    [ownEvents, todayIso]
  );
  const pastCount = ownEvents.length - upcomingCount;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return ownEvents.filter((event) => {
      const isUpcoming = event.event_date >= todayIso;
      if (tab === "upcoming" && !isUpcoming) return false;
      if (tab === "past" && isUpcoming) return false;
      if (query && !event.title.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [ownEvents, tab, search, todayIso]);

  const visible = filtered.slice(0, visibleCount);

  function switchTab(next: Tab) {
    setTab(next);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => switchTab("upcoming")}
          className={`rounded-full px-3 py-1.5 text-sm transition ${
            tab === "upcoming"
              ? "bg-brand-deep text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Предстоящие ({upcomingCount})
        </button>
        <button
          type="button"
          onClick={() => switchTab("past")}
          className={`rounded-full px-3 py-1.5 text-sm transition ${
            tab === "past"
              ? "bg-brand-deep text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Прошедшие ({pastCount})
        </button>

        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          placeholder="Поиск по названию..."
          className="ml-auto rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500">
          {tab === "upcoming" ? "Предстоящих событий нет." : "Прошедших событий нет."}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {visible.map((event) => {
              const time = formatEventTime(event.event_time);
              const authorEmail = event.created_by
                ? profileEmails[event.created_by]
                : null;

              return (
                <div
                  key={event.id}
                  className={`flex items-center justify-between gap-4 rounded-lg border bg-white p-3 ${
                    editingId === event.id ? "border-brand" : "border-slate-200"
                  }`}
                >
                  <div>
                    <p className="font-medium text-slate-900">{event.title}</p>
                    <p className="text-sm text-slate-500">
                      {formatEventDate(event.event_date)}
                      {time && `, ${time}`} · {event.village} · {event.category}
                    </p>
                    {isAdmin && (
                      <p className="text-xs text-slate-400">
                        добавлено: {authorEmail ?? "неизвестно"}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => onEdit(event)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(event.id, event.title)}
                      disabled={deletingId === event.id}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === event.id ? "Удаляем..." : "Удалить"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length > visible.length && (
            <button
              type="button"
              onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
              className="self-center rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Показать ещё
            </button>
          )}
        </>
      )}
    </div>
  );
}
