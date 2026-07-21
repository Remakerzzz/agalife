export type EventCategory =
  | "Концерт"
  | "Спорт"
  | "Ярмарка"
  | "Сход жителей"
  | "Праздник"
  | "Кино"
  | "Театр"
  | "Другое";

export const EVENT_CATEGORIES: EventCategory[] = [
  "Концерт",
  "Спорт",
  "Ярмарка",
  "Сход жителей",
  "Праздник",
  "Кино",
  "Театр",
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
  poster_url: string | null;
  created_by: string | null;
  created_at: string;
}

export type UserRole = "admin" | "moderator";

