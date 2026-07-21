export type EventCategory =
  | "Концерт"
  | "Спорт"
  | "Ярмарка"
  | "Сход жителей"
  | "Праздник"
  | "Другое";

export const EVENT_CATEGORIES: EventCategory[] = [
  "Концерт",
  "Спорт",
  "Ярмарка",
  "Сход жителей",
  "Праздник",
  "Другое",
];

export interface AgaEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string; // YYYY-MM-DD
  event_time: string | null; // HH:MM:SS
  location: string | null;
  village: string;
  category: string;
  organizer: string | null;
  contacts: string | null;
  created_at: string;
}

export type DateFilter = "all" | "today" | "week" | "later";

export interface EventFilters {
  village: string; // "all" или конкретное село
  dateFilter: DateFilter;
  category: string; // "all" или конкретная категория
}
