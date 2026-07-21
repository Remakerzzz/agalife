import Link from "next/link";
import { AgaEvent } from "@/lib/types";
import { formatEventDate, formatEventTime } from "@/lib/format";

const CATEGORY_META: Record<string, { text: string; tint: string; emoji: string }> = {
  Концерт: { text: "text-purple-800", tint: "bg-purple-50", emoji: "🎤" },
  Спорт: { text: "text-green-800", tint: "bg-green-50", emoji: "🏆" },
  Ярмарка: { text: "text-amber-800", tint: "bg-amber-50", emoji: "🧺" },
  "Сход жителей": { text: "text-sky-800", tint: "bg-sky-50", emoji: "🏘️" },
  Праздник: { text: "text-rose-800", tint: "bg-rose-50", emoji: "🎉" },
  Другое: { text: "text-slate-800", tint: "bg-slate-50", emoji: "📌" },
};

export function EventCard({ event }: { event: AgaEvent }) {
  const time = formatEventTime(event.event_time);
  const meta = CATEGORY_META[event.category] ?? CATEGORY_META["Другое"];

  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-video w-full shrink-0 overflow-hidden">
        {event.poster_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.poster_url}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center text-4xl ${meta.tint}`}
          >
            {meta.emoji}
          </div>
        )}
        <span
          className={`absolute top-2 right-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium ${meta.text}`}
        >
          {event.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display line-clamp-2 text-lg font-bold text-ink group-hover:underline">
          {event.title}
        </h3>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-600">
          <span>📅 {formatEventDate(event.event_date)}</span>
          {time && <span>🕒 {time}</span>}
          <span>📍 {event.village}</span>
        </div>
      </div>
    </Link>
  );
}
