export function formatEventDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatEventTime(timeStr: string | null): string | null {
  if (!timeStr) return null;
  return timeStr.slice(0, 5); // "HH:MM:SS" -> "HH:MM"
}

function toLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// event_date хранится как "YYYY-MM-DD" — строки такого формата можно
// сравнивать напрямую как обычные даты (лексикографически = хронологически).

export function isPastDate(eventDate: string, reference: Date): boolean {
  return eventDate < toLocalISODate(reference);
}

export function isSameDay(eventDate: string, reference: Date): boolean {
  return eventDate === toLocalISODate(reference);
}

export function isWithinNextDays(
  eventDate: string,
  reference: Date,
  days: number
): boolean {
  const start = toLocalISODate(reference);
  const end = toLocalISODate(addDays(reference, days));
  return eventDate >= start && eventDate < end;
}

export function isAfterNextDays(
  eventDate: string,
  reference: Date,
  days: number
): boolean {
  const end = toLocalISODate(addDays(reference, days));
  return eventDate >= end;
}
