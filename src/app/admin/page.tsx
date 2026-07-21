"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { AgaEvent } from "@/lib/types";
import { getEventsForModeration, getVillages } from "@/lib/events";
import { LoginForm } from "@/components/admin/LoginForm";
import { EventForm } from "@/components/admin/EventForm";
import { ModerationList } from "@/components/admin/ModerationList";

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(isSupabaseConfigured);
  const [events, setEvents] = useState<AgaEvent[]>([]);

  const loadEvents = useCallback(async () => {
    const data = await getEventsForModeration();
    setEvents(data);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;
    getEventsForModeration().then((data) => {
      if (!cancelled) setEvents(data);
    });

    return () => {
      cancelled = true;
    };
  }, [session]);

  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center text-slate-600">
        Supabase не подключён (нет ключей в <code>.env.local</code>) —
        админ-панель недоступна.
      </div>
    );
  }

  if (checkingSession) {
    return <div className="px-4 py-12 text-center text-slate-500">Загрузка...</div>;
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink">
          Админ-панель — события
        </h1>
        <button
          onClick={() => supabase?.auth.signOut()}
          className="text-sm text-slate-500 underline hover:no-underline"
        >
          Выйти
        </button>
      </div>

      <EventForm villages={getVillages(events)} onAdded={loadEvents} />

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold text-ink">
          Все события
        </h2>
        <ModerationList events={events} onDeleted={loadEvents} />
      </div>
    </div>
  );
}
