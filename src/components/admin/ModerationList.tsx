"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AgaEvent } from "@/lib/types";
import { AdminEventGroup, groupEventsForModeration } from "@/lib/events";
import {
  formatDateRange,
  formatEventDate,
  formatEventTime,
  toLocalISODate,
} from "@/lib/format";

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
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  async function handleDeleteOne(id: string, title: string) {
    if (!supabase) return;
    if (!confirm(`Удалить событие «${title}»?`)) return;

    setDeletingKey(id);
    const { error } = await supabase.from("events").delete().eq("id", id);
    setDeletingKey(null);

    if (error) {
      alert("Не удалось удалить: " + error.message);
      return;
    }
    onDeleted();
  }

  async function handleDeleteGroup(group: AdminEventGroup) {
    if (!supabase) return;
    if (
      !confirm(
        `Удалить все ${group.items.length} сеанса(ов) события «${group.title}»?`
      )
    )
      return;

    setDeletingKey(group.key);
    const { error } = await supabase
      .from("events")
      .delete()
      .in(
        "id",
        group.items.map((e) => e.id)
      );
    setDeletingKey(null);

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

  // Мероприятия с несколькими сеансами (кино несколько дней подряд,
  // турнир на несколько дней) группируем в одну строку, как и на
  // главной странице — чтобы не засорять список повторами.
  const groups = useMemo(
    () => groupEventsForModeration(ownEvents),
    [ownEvents]
  );

  const upcomingCount = useMemo(
    () => groups.filter((g) => g.dateTo >= todayIso).length,
    [groups, todayIso]
  );
  const pastCount = groups.length - upcomingCount;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return groups.filter((group) => {
      const isUpcoming = group.dateTo >= todayIso;
      if (tab === "upcoming" && !isUpcoming) return false;
      if (tab === "past" && isUpcoming) return false;
      if (query && !group.title.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [groups, tab, search, todayIso]);

  const visible = filtered.slice(0, visibleCount);

  function switchTab(next: Tab) {
    setTab(next);
    setVisibleCount(PAGE_SIZE);
  }

  function toggleExpanded(key: string) {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
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
            {visible.map((group) => {
              const isEditingInGroup = group.items.some(
                (e) => e.id === editingId
              );
              const isOpen = expanded[group.key] ?? isEditingInGroup;
              const authorEmail = group.items[0].created_by
                ? profileEmails[group.items[0].created_by]
                : null;
              const single = group.items.length === 1;

              return (
                <div
                  key={group.key}
                  className={`rounded-lg border bg-white ${
                    isEditingInGroup ? "border-brand" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 p-3">
                    <button
                      type="button"
                      onClick={() => !single && toggleExpanded(group.key)}
                      className={`flex-1 text-left ${single ? "cursor-default" : ""}`}
                    >
                      <p className="font-medium text-slate-900">
                        {group.title}
                        {!single && (
                          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500">
                            {group.items.length} сеанса(ов) {isOpen ? "▲" : "▼"}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatDateRange(group.dateFrom, group.dateTo)} ·{" "}
                        {group.village} · {group.category}
                      </p>
                      {isAdmin && (
                        <p className="text-xs text-slate-400">
                          добавлено: {authorEmail ?? "неизвестно"}
                        </p>
                      )}
                    </button>

                    <div className="flex shrink-0 gap-2">
                      {single ? (
                        <>
                          <button
                            onClick={() => onEdit(group.items[0])}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteOne(group.items[0].id, group.title)
                            }
                            disabled={deletingKey === group.items[0].id}
                            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingKey === group.items[0].id
                              ? "Удаляем..."
                              : "Удалить"}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleDeleteGroup(group)}
                          disabled={deletingKey === group.key}
                          className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingKey === group.key
                            ? "Удаляем..."
                            : `Удалить все (${group.items.length})`}
                        </button>
                      )}
                    </div>
                  </div>

                  {!single && isOpen && (
                    <div className="flex flex-col gap-2 border-t border-slate-100 p-3 pt-2">
                      {group.items.map((item) => {
                        const time = formatEventTime(item.event_time);
                        return (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between gap-4 rounded-lg bg-slate-50 p-2 pl-3 ${
                              editingId === item.id ? "ring-1 ring-brand" : ""
                            }`}
                          >
                            <p className="text-sm text-slate-600">
                              {formatEventDate(item.event_date)}
                              {time && `, ${time}`}
                            </p>
                            <div className="flex shrink-0 gap-2">
                              <button
                                onClick={() => onEdit(item)}
                                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100"
                              >
                                Редактировать
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteOne(item.id, group.title)
                                }
                                disabled={deletingKey === item.id}
                                className="rounded-lg border border-red-300 bg-white px-2.5 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                              >
                                {deletingKey === item.id ? "Удаляем..." : "Удалить"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
