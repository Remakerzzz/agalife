import Link from "next/link";
import { AgaEvent } from "@/lib/types";
import { formatEventDate, formatEventTime } from "@/lib/format";

const CATEGORY_STYLES: Record<string, string> = {
  Концерт: "bg-purple-100 text-purple-800",
  Спорт: "bg-green-100 text-green-800",
  Ярмарка: "bg-amber-100 text-amber-800",
  "Сход жителей": "bg-sky-100 text-sky-800",
  Праздник: "bg-rose-100 text-rose-800",
  Другое: "bg-slate-100 text-slate-800",
};

export function EventCard({ event }: { event: AgaEvent }) {
  const time = formatEventTime(event.event_time);
  const mapQuery = encodeURIComponent(
    [event.location, event.village, "Агинский Бурятский округ"]
      .filter(Boolean)
      .join(", ")
  );
  const categoryStyle =
    CATEGORY_STYLES[event.category] ?? CATEGORY_STYLES["Другое"];

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {event.poster_url && (
        <Link href={`/events/${event.id}`} className="-mx-5 -mt-5 block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.poster_url}
            alt={event.title}
            className="aspect-video w-[calc(100%+2.5rem)] rounded-t-xl object-cover"
          />
        </Link>
      )}

      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display line-clamp-2 text-lg font-bold text-ink">
          <Link href={`/events/${event.id}`} className="hover:underline">
            {event.title}
          </Link>
        </h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${categoryStyle}`}
        >
          {event.category}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
        <span>📅 {formatEventDate(event.event_date)}</span>
        {time && <span>🕒 {time}</span>}
        <span>📍 {event.village}</span>
      </div>

      {event.description && (
        <p className="line-clamp-3 text-sm text-slate-700">
          {event.description}
        </p>
      )}

      <Link
        href={`/events/${event.id}`}
        className="text-sm font-medium text-brand hover:underline"
      >
        Подробнее →
      </Link>

      <div className="mt-auto flex flex-col gap-1 border-t border-slate-100 pt-3 text-sm text-slate-600">
        {event.location && (
          <p>
            <span className="font-medium">Место:</span> {event.location}{" "}
            <a
              href={`https://yandex.ru/maps/?text=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline hover:no-underline"
            >
              показать на карте
            </a>
          </p>
        )}
        {event.organizer && (
          <p>
            <span className="font-medium">Организатор:</span>{" "}
            {event.organizer}
          </p>
        )}
        {event.contacts && (
          <p>
            <span className="font-medium">Контакты:</span> {event.contacts}
          </p>
        )}
      </div>
    </article>
  );
}
