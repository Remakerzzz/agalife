import { isSupabaseConfigured, supabase } from "./supabase";
import { toLocalISODate } from "./format";
import { ZurkhaiNote } from "./types";

export async function getTodayZurkhai(): Promise<ZurkhaiNote | null> {
  return getZurkhaiByDate(toLocalISODate(new Date()));
}

export async function getZurkhaiByDate(
  noteDate: string
): Promise<ZurkhaiNote | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase
    .from("zurkhai_notes")
    .select("*")
    .eq("note_date", noteDate)
    .maybeSingle();

  if (error) {
    console.error("Не удалось загрузить зурхай:", error.message);
    return null;
  }

  return data;
}

export async function upsertZurkhai(
  noteDate: string,
  text: string
): Promise<{ error: string | null }> {
  if (!supabase) return { error: "Supabase не подключён" };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("zurkhai_notes").upsert(
    {
      note_date: noteDate,
      text,
      updated_by: user?.id ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "note_date" }
  );

  return { error: error?.message ?? null };
}
