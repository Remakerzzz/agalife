import { isSupabaseConfigured, supabase } from "./supabase";
import { AgaEvent } from "./types";
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

export function getVillages(events: AgaEvent[]): string[] {
  const villages = new Set(events.map((e) => e.village));
  return Array.from(villages).sort((a, b) => a.localeCompare(b, "ru"));
}
