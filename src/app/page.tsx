import { AfishaBoard } from "@/components/AfishaBoard";
import { HappeningNow } from "@/components/HappeningNow";
import {
  getCategories,
  getEvents,
  getVillages,
  groupEventsByShowing,
} from "@/lib/events";
import { toLocalISODate } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getTodayZurkhai } from "@/lib/zurkhai";

// Кэшируем страницу на edge и обновляем не чаще раза в минуту — так
// посетители из удалённых регионов получают мгновенный ответ из кэша, а
// не ждут SSR-рендер + запрос в Supabase при каждом заходе.
export const revalidate = 60;

export default async function HomePage() {
  const events = await getEvents();
  const villages = getVillages(events);
  const categories = getCategories(events);
  const zurkhai = await getTodayZurkhai();

  const todayIso = toLocalISODate(new Date());
  const happeningNow = groupEventsByShowing(events).filter(
    (e) => e.dateFrom <= todayIso && e.dateTo >= todayIso
  );
  const todayLabel = `Сегодня, ${new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
  }).format(new Date())}`;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <section className="text-center">
        <h1 className="font-display text-3xl font-extrabold text-brand-deep sm:text-4xl">
          Там, где живёт округ
        </h1>
        <p className="mt-2 text-slate-600">
          AgaLife — цифровой дом Агинского Бурятского округа. Здесь видно, чем
          округ живёт прямо сейчас.
        </p>

        {zurkhai && (
          <div className="mx-auto mt-4 max-w-md rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              🌙 Зурхай на сегодня
            </p>
            <p className="mt-1 whitespace-pre-line text-sm text-amber-900">
              {zurkhai.text}
            </p>
          </div>
        )}
      </section>

      {!isSupabaseConfigured && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Показаны тестовые события — Supabase ещё не подключён. Добавьте
          ключи в <code>.env.local</code>, чтобы видеть реальные данные.
        </div>
      )}

      <HappeningNow events={happeningNow} dateLabel={todayLabel} />

      <section>
        <h2 className="font-display mb-4 text-xl font-bold text-ink">
          Афиша мероприятий
        </h2>
        <AfishaBoard events={events} villages={villages} categories={categories} />
      </section>
    </div>
  );
}
