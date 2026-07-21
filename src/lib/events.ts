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
