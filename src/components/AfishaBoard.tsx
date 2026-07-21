"use client";

import { useMemo, useState } from "react";
import { AgaEvent } from "@/lib/types";
import { groupEventsByShowing } from "@/lib/events";
import { isPastDate } from "@/lib/format";
import { EventFilters } from "./EventFilters";
import { EventList } from "./EventList";
import { CalendarView } from "./CalendarView";
import { FiltersModal } from "./FiltersModal";

export function AfishaBoard({
  events,
  villages,
  categories,
}: {
  events: AgaEvent[];
  villages: string[];
  categories: string[];
}) {
  const [village, setVillage] = useState("all");
  const [category, setCategory] = useState("all");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events.filter((event) => {
      if (isPastDate(event.event_date, now)) return false;
      if (village !== "all" && event.village !== village) return false;
      if (category !== "all" && event.category !== category) return false;
      return true;
    });
  }, [events, village, category]);

  const filteredEvents = useMemo(() => {
    if (!selectedDate) return upcomingEvents;
    return upcomingEvents.filter((event) => event.event_date === selectedDate);
  }, [upcomingEvents, selectedDate]);

  const displayEvents = useMemo(
    () => groupEventsByShowing(filteredEvents),
    [filteredEvents]
  );

  const activeFiltersCount =
    (village !== "all" ? 1 : 0) +
    (category !== "all" ? 1 : 0) +
    (selectedDate ? 1 : 0);

  return (
    <div className="flex flex-col gap-4">
      <CalendarView
        events={upcomingEvents}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          ☰ Все фильтры
          {activeFiltersCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-deep text-[10px] text-white">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700"
        >
          <option value="all">Категория</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <EventList events={displayEvents} />

      <FiltersModal open={filtersOpen} onClose={() => setFiltersOpen(false)}>
        <EventFilters
          bare
          villages={villages}
          village={village}
          onVillageChange={setVillage}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          category={category}
          onCategoryChange={setCategory}
          categories={categories}
        />
      </FiltersModal>
    </div>
  );
}
