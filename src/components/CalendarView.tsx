"use client";

import { AgaEvent } from "@/lib/types";

const WEEKDAY_SHORT = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"];
const DAYS_AHEAD = 30;

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function CalendarView({
  events,
  selectedDate,
  onSelectDate,
}: {
  events: AgaEvent[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}) {
  const eventDates = new Set(events.map((e) => e.event_date));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = toISODate(today);

  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {days.map((d) => {
          const iso = toISODate(d);
          const isSelected = selectedDate === iso;
          const isToday = iso === todayIso;
          const hasEvents = eventDates.has(iso);
          const weekday = d.getDay();
          const isWeekend = weekday === 0 || weekday === 6;

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDate(isSelected ? null : iso)}
              className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-3 py-2 transition ${
                isSelected
                  ? "bg-brand-deep text-white"
                  : "hover:bg-slate-100"
              } ${isToday && !isSelected ? "ring-1 ring-brand" : ""}`}
            >
              <span
                className={`text-lg font-bold ${
                  isSelected ? "text-white" : "text-ink"
                }`}
              >
                {d.getDate()}
              </span>
              <span
                className={`text-xs ${
                  isSelected
                    ? "text-white/80"
                    : isWeekend
                      ? "text-rose-500"
                      : "text-slate-400"
                }`}
              >
                {WEEKDAY_SHORT[weekday]}
              </span>
              <span
                className={`h-1 w-1 rounded-full ${
                  hasEvents ? (isSelected ? "bg-white" : "bg-brand") : ""
                }`}
              />
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <button
          type="button"
          onClick={() => onSelectDate(null)}
          className="mt-2 text-sm text-brand underline hover:no-underline"
        >
          Сбросить дату
        </button>
      )}
    </div>
  );
}
