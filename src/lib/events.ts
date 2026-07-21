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
}

// Несколько сеансов одного и того же события в один день (например, кино
// в 15:00, 18:00 и 21:00) показываем одной карточкой с несколькими
// временами, а не отдельными почти одинаковыми карточками подряд.
export function groupEventsByShowing(events: AgaEvent[]): GroupedEvent[] {
  const groups = new Map<string, AgaEvent[]>();

  for (const event of events) {
    const key = `${event.title}__${event.event_date}__${event.village}`;
    const list = groups.get(key);
    if (list) {
      list.push(event);
    } else {
      groups.set(key, [event]);
    }
  }

  return Array.from(groups.values()).map((group) => {
    const sorted = [...group].sort((a, b) =>
      (a.event_time ?? "").localeCompare(b.event_time ?? "")
    );
    const times = sorted
      .map((e) => e.event_time)
      .filter((t): t is string => Boolean(t));
    return { ...sorted[0], times };
  });
}
