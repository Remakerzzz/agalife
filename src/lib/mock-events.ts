import { AgaEvent } from "./types";

// Эти события показываются только если Supabase ещё не подключён
// (нет ключей в .env.local) — чтобы страницу можно было увидеть сразу.
function inDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const MOCK_EVENTS: AgaEvent[] = [
  {
    id: "mock-1",
    title: "Сурхарбан 2026",
    description:
      "Национальный летний праздник: борьба, стрельба из лука, конные скачки.",
    event_date: inDays(3),
    event_time: "10:00:00",
    location: "Центральный стадион",
    village: "Агинское",
    category: "Праздник",
    organizer: "Администрация округа",
    contacts: "+7 (30239) 3-XX-XX",
    poster_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-2",
    title: "Ярмарка выходного дня",
    description: "Продажа фермерской продукции, мёда, изделий ручной работы.",
    event_date: inDays(1),
    event_time: "09:00:00",
    location: "Центральная площадь",
    village: "Могойтуй",
    category: "Ярмарка",
    organizer: "Могойтуйский Дом культуры",
    contacts: "+7 (30255) 2-XX-XX",
    poster_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-3",
    title: "Сход жителей села",
    description:
      "Обсуждение вопросов благоустройства и планов на следующий год.",
    event_date: inDays(0),
    event_time: "18:00:00",
    location: "Сельский клуб",
    village: "Дульдурга",
    category: "Сход жителей",
    organizer: "Администрация села Дульдурга",
    contacts: "+7 (30256) 2-XX-XX",
    poster_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-4",
    title: "Концерт народного ансамбля",
    description: "Праздничный концерт бурятской и русской народной песни.",
    event_date: inDays(7),
    event_time: "17:00:00",
    location: "Дом культуры",
    village: "Агинское",
    category: "Концерт",
    organizer: "Агинский окружной Дом культуры",
    contacts: "+7 (30239) 3-XX-XX",
    poster_url: null,
    created_at: new Date().toISOString(),
  },
];
