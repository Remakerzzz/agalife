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
  poster_url: string | null;
  created_at: string;
}

