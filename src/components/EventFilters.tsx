"use client";

import { DateFilter, EVENT_CATEGORIES } from "@/lib/types";

const DATE_FILTER_LABELS: Record<DateFilter, string> = {
  all: "Все даты",
  today: "Сегодня",
  week: "На этой неделе",
  later: "Позже",
};

interface EventFiltersProps {
  villages: string[];
  village: string;
  onVillageChange: (village: string) => void;
  dateFilter: DateFilter;
  onDateFilterChange: (filter: DateFilter) => void;
  category: string;
  onCategoryChange: (category: string) => void;
}

export function EventFilters({
  villages,
  village,
  onVillageChange,
  dateFilter,
  onDateFilterChange,
  category,
  onCategoryChange,
}: EventFiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500" htmlFor="village-filter">
          Село / посёлок
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

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-500">Когда</span>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(DATE_FILTER_LABELS) as DateFilter[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onDateFilterChange(key)}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                dateFilter === key
                  ? "bg-brand-deep text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {DATE_FILTER_LABELS[key]}
            </button>
          ))}
        </div>
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
    </div>
  );
}
