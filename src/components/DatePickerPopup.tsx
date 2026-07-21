"use client";

import { useState } from "react";

const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
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

function toISODate(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function addDaysISO(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return toISODate(d.getFullYear(), d.getMonth(), d.getDate());
}

function nextWeekendISO(base: Date): string {
  const d = new Date(base);
  const day = d.getDay(); // 0=Sun..6=Sat
  const daysUntilSaturday = (6 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilSaturday);
  return toISODate(d.getFullYear(), d.getMonth(), d.getDate());
}

export function DatePickerPopup({
  selectedDate,
  onSelectDate,
  onClose,
}: {
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  onClose: () => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = toISODate(today.getFullYear(), today.getMonth(), today.getDate());

  const initial = selectedDate ? new Date(`${selectedDate}T00:00:00`) : today;
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());

  function goPrevMonth() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goNextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  }

  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<{ day: number; iso: string } | null> = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, iso: toISODate(year, month, day) });
  }

  function pick(iso: string) {
    onSelectDate(iso);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute right-0 top-full z-40 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={goPrevMonth}
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
            aria-label="Предыдущий месяц"
          >
            ←
          </button>
          <span className="font-display font-bold text-ink">
            {MONTH_LABELS[month]} {year}
          </span>
          <button
            type="button"
            onClick={goNextMonth}
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
            aria-label="Следующий месяц"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
          {WEEKDAY_LABELS.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell) return <div key={`empty-${i}`} />;

            const isPast = cell.iso < todayIso;
            const isSelected = selectedDate === cell.iso;
            const isToday = cell.iso === todayIso;

            return (
              <button
                type="button"
                key={cell.iso}
                disabled={isPast}
                onClick={() => pick(cell.iso)}
                className={`rounded-lg py-1.5 text-sm transition disabled:cursor-default disabled:text-slate-300 ${
                  isSelected
                    ? "bg-brand-deep text-white"
                    : isPast
                      ? ""
                      : "text-ink hover:bg-slate-100"
                } ${isToday && !isSelected ? "ring-1 ring-brand" : ""}`}
              >
                {cell.day}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => pick(todayIso)}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
          >
            Сегодня
          </button>
          <button
            type="button"
            onClick={() => pick(addDaysISO(today, 1))}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
          >
            Завтра
          </button>
          <button
            type="button"
            onClick={() => pick(nextWeekendISO(today))}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
          >
            Выходные
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-lg bg-brand-deep py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Готово
        </button>
      </div>
    </>
  );
}
