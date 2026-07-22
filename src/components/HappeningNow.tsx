import { GroupedEvent } from "@/lib/events";
import { EventCard } from "./EventCard";

export function HappeningNow({
  events,
  dateLabel,
}: {
  events: GroupedEvent[];
  dateLabel: string;
}) {
  return (
    <section className="rounded-xl border border-brand/30 bg-brand-deep/5 p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-bold text-ink">
          🔥 Сейчас в округе
        </h2>
        <span className="text-sm text-slate-500">{dateLabel}</span>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-slate-600">
          Сегодня в афише пусто — но ниже есть расписание на ближайшие дни.
        </p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {events.map((event) => (
            <div key={event.id} className="w-64 shrink-0">
              <EventCard event={event} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
