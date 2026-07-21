import { GroupedEvent } from "@/lib/events";
import { EventCard } from "./EventCard";

export function EventList({ events }: { events: GroupedEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        Событий по выбранным фильтрам пока нет. Попробуйте изменить село,
        дату или категорию.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
