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

export function toLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// event_date хранится как "YYYY-MM-DD" — строки такого формата можно
// сравнивать напрямую как обычные даты (лексикографически = хронологически).

export function isPastDate(eventDate: string, reference: Date): boolean {
  return eventDate < toLocalISODate(reference);
}

// Для многодневных событий (турнир, показы несколько дней подряд) —
// одна строка вида "24–28 июля 2026 г." вместо двух полных дат, если
// начало и конец в одном месяце и году.
export function formatDateRange(fromISO: string, toISO: string): string {
  if (fromISO === toISO) return formatEventDate(fromISO);

  const from = new Date(`${fromISO}T00:00:00`);
  const to = new Date(`${toISO}T00:00:00`);
  const sameMonthYear =
    from.getFullYear() === to.getFullYear() && from.getMonth() === to.getMonth();

  if (sameMonthYear) {
    return `${from.getDate()}–${formatEventDate(toISO)}`;
  }
  return `${formatEventDate(fromISO)} – ${formatEventDate(toISO)}`;
}
