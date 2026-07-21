"use client";

import { useRef, useState } from "react";
import { AgaEvent } from "@/lib/types";
import { DatePickerPopup } from "./DatePickerPopup";

const WEEKDAY_SHORT = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"];
const MONTH_LABELS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];
const DAYS_AHEAD = 60;
const SCROLL_STEP = 260;

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
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const eventDates = new Set(events.map((e) => e.event_date));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = toISODate(today);

  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  const [monthLabel, setMonthLabel] = useState(
    () => `${MONTH_LABELS[today.getMonth()]} ${today.getFullYear()}`
  );

  function handleScroll() {
    const el = scrollerRef.current;
    const firstCell = el?.firstElementChild as HTMLElement | null;
    if (!el || !firstCell) return;

    const cellWidth = firstCell.offsetWidth + 4; // gap-1 = 4px
    const index = Math.min(
      Math.max(Math.round(el.scrollLeft / cellWidth), 0),
      days.length - 1
    );
    const day = days[index];
    if (day) {
      setMonthLabel(`${MONTH_LABELS[day.getMonth()]} ${day.getFullYear()}`);
    }
  }

  function scrollByStep(direction: 1 | -1) {
    scrollerRef.current?.scrollBy({
      left: direction * SCROLL_STEP,
      behavior: "smooth",
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-display font-bold text-ink">{monthLabel}</span>
        <div className="hidden gap-1 sm:flex">
          <button
            type="button"
            onClick={() => scrollByStep(-1)}
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
            aria-label="Раньше"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollByStep(1)}
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
            aria-label="Позже"
          >
            →
          </button>
        </div>
      </div>

      <div className="flex items-stretch gap-2">
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="flex flex-1 gap-1 overflow-x-auto pb-1"
        >
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

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            className="flex h-full flex-col items-center justify-center rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-medium text-slate-600 hover:bg-slate-200"
          >
            Другая
            <br />
            дата
          </button>
          {pickerOpen && (
            <DatePickerPopup
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
              onClose={() => setPickerOpen(false)}
            />
          )}
        </div>
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
