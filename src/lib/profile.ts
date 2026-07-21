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
