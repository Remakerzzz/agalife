import { AgaEvent } from "@/lib/types";
import { formatEventDate, formatEventTime } from "@/lib/format";

const CATEGORY_STYLES: Record<string, string> = {
  Концерт: "bg-purple-100 text-purple-800",
  Спорт: "bg-green-100 text-green-800",
  Ярмарка: "bg-amber-100 text-amber-800",
  "Сход жителей": "bg-blue-100 text-blue-800",
  Праздник: "bg-rose-100 text-rose-800",
  Другое: "bg-gray-100 text-gray-800",
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
    <article className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${categoryStyle}`}
        >
          {event.category}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
        <span>📅 {formatEventDate(event.event_date)}</span>
        {time && <span>🕒 {time}</span>}
        <span>📍 {event.village}</span>
      </div>

      {event.description && (
        <p className="text-sm text-gray-700">{event.description}</p>
      )}

      <div className="mt-auto flex flex-col gap-1 border-t border-gray-100 pt-3 text-sm text-gray-600">
        {event.location && (
          <p>
            <span className="font-medium">Место:</span> {event.location}{" "}
            <a
              href={`https://yandex.ru/maps/?text=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:no-underline"
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
