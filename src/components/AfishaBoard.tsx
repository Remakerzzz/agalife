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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
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
      </div>

      <EventFilters
        villages={villages}
        village={village}
        onVillageChange={setVillage}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        category={category}
        onCategoryChange={setCategory}
        showDateButtons={viewMode === "list"}
      />

      {viewMode === "calendar" && (
        <CalendarView
          events={upcomingEvents}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      )}

      <EventList events={filteredEvents} />
    </div>
  );
}
