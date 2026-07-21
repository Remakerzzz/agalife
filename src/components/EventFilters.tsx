"use client";

import { useState } from "react";
import { EVENT_CATEGORIES } from "@/lib/types";
import { formatEventDate } from "@/lib/format";
import { DatePickerPopup } from "./DatePickerPopup";

interface EventFiltersProps {
  villages: string[];
  village: string;
  onVillageChange: (village: string) => void;
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  bare?: boolean;
}

export function EventFilters({
  villages,
  village,
  onVillageChange,
  selectedDate,
  onSelectDate,
  category,
  onCategoryChange,
  bare = false,
}: EventFiltersProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div
      className={
        bare
          ? "flex flex-col gap-4"
          : "flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center"
      }
    >
      <div className="relative flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-500">Когда</span>
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-left text-sm"
        >
          {selectedDate ? formatEventDate(selectedDate) : "Все даты"}
        </button>
        {pickerOpen && (
          <DatePickerPopup
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            onClose={() => setPickerOpen(false)}
          />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500" htmlFor="category-filter">
          Категория
        </label>
        <select
          id="category-filter"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">Все категории</option>
          {EVENT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500" htmlFor="village-filter">
          Посёлок / село
        </label>
        <select
          id="village-filter"
          value={village}
          onChange={(e) => onVillageChange(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">Весь округ</option>
          {villages.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
