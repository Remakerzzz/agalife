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

  const filteredEvents = useMemo(() => {
    const now = new Date();

    return events.filter((event) => {
      // Прошедшие события в афише не показываем
      if (isPastDate(event.event_date, now)) return false;

      if (village !== "all" && event.village !== village) return false;
      if (category !== "all" && event.category !== category) return false;

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
  }, [events, village, dateFilter, category]);

  return (
    <div className="flex flex-col gap-6">
      <EventFilters
        villages={villages}
        village={village}
        onVillageChange={setVillage}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        category={category}
        onCategoryChange={setCategory}
      />
      <EventList events={filteredEvents} />
    </div>
  );
}
