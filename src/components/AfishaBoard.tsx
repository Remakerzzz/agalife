"use client";

import { useMemo, useState } from "react";
import { AgaEvent, DateFilter } from "@/lib/types";
import {
  isAfterNextDays,
  isPastDate,
  isSameDay,
  isWithinNextDays,
} from "@/lib/format";
import { EventFilters } from "./EventFilters";
import { EventList } from "./EventList";
import { CalendarView } from "./CalendarView";
import { FiltersModal } from "./FiltersModal";

type ViewMode = "list" | "calendar";

export function AfishaBoard({
  events,
  villages,
}: {
  events: AgaEvent[];
  villages: string[];
}) {
  const [village, setVillage] = useState("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [category, setCategory] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
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
    const now = new Date();

    return upcomingEvents.filter((event) => {
      if (viewMode === "calendar") {
        if (selectedDate) return event.event_date === selectedDate;
        return true;
      }

      if (dateFilter === "today" && !isSameDay(event.event_date, now)) {
        return false;
      }
      if (
        dateFilter === "week" &&
        !isWithinNextDays(event.event_date, now, 7)
      ) {
        return false;
      }
      if (dateFilter === "later" && !isAfterNextDays(event.event_date, now, 7)) {
        return false;
      }

      return true;
    });
  }, [upcomingEvents, viewMode, selectedDate, dateFilter]);

  function switchViewMode(mode: ViewMode) {
    setViewMode(mode);
    setSelectedDate(null);
  }

  const activeFiltersCount =
    (village !== "all" ? 1 : 0) +
    (category !== "all" ? 1 : 0) +
    (viewMode === "list" && dateFilter !== "all" ? 1 : 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => switchViewMode("list")}
          className={`rounded-full px-3 py-1.5 text-sm transition ${
            viewMode === "list"
              ? "bg-brand-deep text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          📋 Список
        </button>
        <button
          type="button"
          onClick={() => switchViewMode("calendar")}
          className={`rounded-full px-3 py-1.5 text-sm transition ${
            viewMode === "calendar"
              ? "bg-brand-deep text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          📅 Календарь
        </button>

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
      </div>

      {viewMode === "calendar" && (
        <CalendarView
          events={upcomingEvents}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      )}

      <EventList events={filteredEvents} />

      <FiltersModal open={filtersOpen} onClose={() => setFiltersOpen(false)}>
        <EventFilters
          bare
          villages={villages}
          village={village}
          onVillageChange={setVillage}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          category={category}
          onCategoryChange={setCategory}
          showDateButtons={viewMode === "list"}
        />
      </FiltersModal>
    </div>
  );
}
