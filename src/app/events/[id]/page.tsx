import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById } from "@/lib/events";
import { formatEventDate, formatEventTime } from "@/lib/format";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    return { title: "Событие не найдено — AgaLife" };
  }

  const description =
    event.description ??
    `${formatEventDate(event.event_date)} · ${event.village}`;

  return {
    title: `${event.title} — AgaLife`,
    description,
    openGraph: {
      title: event.title,
      description,
      images: event.poster_url ? [{ url: event.poster_url }] : undefined,
    },
  };
}

export default async function EventPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const time = formatEventTime(event.event_time);
  const mapQuery = encodeURIComponent(
    [event.location, event.village, "Агинский Бурятский округ"]
      .filter(Boolean)
      .join(", ")
  );

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <Link href="/" className="text-sm text-brand underline hover:no-underline">
        ← Вся афиша
      </Link>

      <article className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {event.poster_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.poster_url}
            alt={event.title}
            className="w-full rounded-lg object-cover"
          />
        )}

        <div className="flex items-start justify-between gap-2">
          <h1 className="font-display text-2xl font-bold text-ink">
            {event.title}
          </h1>
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800">
            {event.category}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
          <span>📅 {formatEventDate(event.event_date)}</span>
          {time && <span>🕒 {time}</span>}
          <span>📍 {event.village}</span>
        </div>

        {event.description && (
          <p className="whitespace-pre-line text-slate-700">
            {event.description}
          </p>
        )}

        <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
          {event.location && (
            <p>
              <span className="font-medium">Место:</span> {event.location}{" "}
              <a
                href={`https://yandex.ru/maps/?text=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand underline hover:no-underline"
              >
                открыть в Яндекс Картах
              </a>
            </p>
          )}

          {event.location && (
            <iframe
              src={`https://yandex.ru/map-widget/v1/?text=${mapQuery}&z=15`}
              width="100%"
              height="280"
              loading="lazy"
              className="rounded-lg border border-slate-200"
            />
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
    </div>
  );
}
