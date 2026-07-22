import { isSupabaseConfigured, supabase } from "./supabase";
import { AgaEvent, EVENT_CATEGORIES } from "./types";
import { MOCK_EVENTS } from "./mock-events";

export async function getEvents(): Promise<AgaEvent[]> {
  if (!isSupabaseConfigured || !supabase) {
    return MOCK_EVENTS;
  }

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true })
    .order("event_time", { ascending: true });

  if (error) {
    console.error("Не удалось загрузить события из Supabase:", error.message);
    return MOCK_EVENTS;
  }

  return data ?? [];
}

export async function getEventsForModeration(): Promise<AgaEvent[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Не удалось загрузить события для модерации:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getEventById(id: string): Promise<AgaEvent | null> {
  if (!isSupabaseConfigured || !supabase) {
    return MOCK_EVENTS.find((e) => e.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Не удалось загрузить событие:", error.message);
    return null;
  }

  return data;
}

export function getVillages(events: AgaEvent[]): string[] {
  const villages = new Set(events.map((e) => e.village));
  return Array.from(villages).sort((a, b) => a.localeCompare(b, "ru"));
}

// Только категории, в которых реально есть события — чтобы в фильтре
// нельзя было выбрать, например, «Кино», если сеансов ещё никто не добавил.
export function getCategories(events: AgaEvent[]): string[] {
  const present = new Set(events.map((e) => e.category));
  return EVENT_CATEGORIES.filter((c) => present.has(c));
}

export interface GroupedEvent extends AgaEvent {
  times: string[];
  dateFrom: string;
  dateTo: string;
}

function isNextDay(a: string, b: string): boolean {
  const d = new Date(`${a}T00:00:00`);
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}` === b;
}

// Группируем повторы одного и того же события:
// - несколько сеансов в один день (кино в 15:00/18:00/21:00) — одна
//   карточка с перечислением времён;
// - подряд идущие дни без пропуска (кино несколько дней подряд, турнир
//   на несколько дней) — одна карточка с плашкой "24–28 июля";
// Если между датами есть разрыв (тот же концерт через месяц) — это уже
// отдельная, самостоятельная карточка.
export function groupEventsByShowing(events: AgaEvent[]): GroupedEvent[] {
  const clusters = new Map<string, AgaEvent[]>();

  for (const event of events) {
    const key = `${event.title}__${event.village}__${event.category}`;
    const list = clusters.get(key);
    if (list) {
      list.push(event);
    } else {
      clusters.set(key, [event]);
    }
  }

  const result: GroupedEvent[] = [];

  for (const clusterEvents of clusters.values()) {
    const byDate = new Map<string, AgaEvent[]>();
    for (const event of clusterEvents) {
      const list = byDate.get(event.event_date);
      if (list) {
        list.push(event);
      } else {
        byDate.set(event.event_date, [event]);
      }
    }

    const dates = Array.from(byDate.keys()).sort();

    let runStart = 0;
    for (let i = 1; i <= dates.length; i++) {
      const isBreak = i === dates.length || !isNextDay(dates[i - 1], dates[i]);
      if (!isBreak) continue;

      const runDates = dates.slice(runStart, i);
      const firstDateEvents = byDate.get(runDates[0])!;
      const representative = [...firstDateEvents].sort((a, b) =>
        (a.event_time ?? "").localeCompare(b.event_time ?? "")
      )[0];
      const dateFrom = runDates[0];
      const dateTo = runDates[runDates.length - 1];
      const times =
        dateFrom === dateTo
          ? firstDateEvents
              .map((e) => e.event_time)
              .filter((t): t is string => Boolean(t))
          : [];

      result.push({ ...representative, times, dateFrom, dateTo });
      runStart = i;
    }
  }

  return result;
}
