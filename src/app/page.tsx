import { AfishaBoard } from "@/components/AfishaBoard";
import { getEvents, getVillages } from "@/lib/events";
import { isSupabaseConfigured } from "@/lib/supabase";

// Афиша должна показывать свежие события сразу после добавления в базу,
// поэтому страница не кэшируется статически.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await getEvents();
  const villages = getVillages(events);

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
      </section>

      {!isSupabaseConfigured && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Показаны тестовые события — Supabase ещё не подключён. Добавьте
          ключи в <code>.env.local</code>, чтобы видеть реальные данные.
        </div>
      )}

      <section>
        <h2 className="font-display mb-4 text-xl font-bold text-ink">
          Афиша мероприятий
        </h2>
        <AfishaBoard events={events} villages={villages} />
      </section>
    </div>
  );
}
