import { supabase } from "./supabase";
import { UserRole } from "./types";

export async function getMyRole(userId: string): Promise<UserRole> {
  if (!supabase) return "moderator";

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return "moderator";
  return data.role as UserRole;
}

// Для супер-админа: email по id пользователя, чтобы показать в
// админ-панели, кто из модераторов добавил событие. Обычному модератору
// политика Row Level Security вернёт только его собственный профиль —
// это ожидаемо и безопасно.
export async function getProfileEmails(): Promise<Record<string, string>> {
  if (!supabase) return {};

  const { data, error } = await supabase.from("profiles").select("id, email");
  if (error || !data) return {};

  const map: Record<string, string> = {};
  for (const row of data) {
    if (row.email) map[row.id] = row.email;
  }
  return map;
}
