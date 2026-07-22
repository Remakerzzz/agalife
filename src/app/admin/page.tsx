"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { AgaEvent, UserRole } from "@/lib/types";
import { getEventsForModeration, getVillages } from "@/lib/events";
import { getMyRole, getProfileEmails } from "@/lib/profile";
import { LoginForm } from "@/components/admin/LoginForm";
import { EventForm } from "@/components/admin/EventForm";
import { ModerationList } from "@/components/admin/ModerationList";
import { ZurkhaiEditor } from "@/components/admin/ZurkhaiEditor";

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(isSupabaseConfigured);
  const [role, setRole] = useState<UserRole>("moderator");
  const [profileEmails, setProfileEmails] = useState<Record<string, string>>({});
  const [events, setEvents] = useState<AgaEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<AgaEvent | null>(null);

  const loadEvents = useCallback(async () => {
    const data = await getEventsForModeration();
    setEvents(data);
  }, []);

  const handleSaved = useCallback(() => {
    setEditingEvent(null);
    loadEvents();
  }, [loadEvents]);

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

  useEffect(() => {
    if (!session) return;

    let cancelled = false;
    getMyRole(session.user.id).then((r) => {
      if (!cancelled) setRole(r);
    });

    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (role !== "admin") return;

    let cancelled = false;
    getProfileEmails().then((emails) => {
      if (!cancelled) setProfileEmails(emails);
    });

    return () => {
      cancelled = true;
    };
  }, [role]);

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
        <div className="flex items-center gap-2">
          <h1 className="font-display text-xl font-bold text-ink">
            Админ-панель — события
          </h1>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              role === "admin"
                ? "bg-amber-100 text-amber-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {role === "admin" ? "Супер-админ" : "Модератор"}
          </span>
        </div>
        <button
          onClick={() => supabase?.auth.signOut()}
          className="text-sm text-slate-500 underline hover:no-underline"
        >
          Выйти
        </button>
      </div>

      <ZurkhaiEditor />

      <EventForm
        key={editingEvent?.id ?? "new"}
        villages={getVillages(events)}
        onSaved={handleSaved}
        editingEvent={editingEvent}
        onCancelEdit={() => setEditingEvent(null)}
      />

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold text-ink">
          Все события
        </h2>
        <ModerationList
          events={events}
          onDeleted={loadEvents}
          onEdit={setEditingEvent}
          editingId={editingEvent?.id}
          currentUserId={session.user.id}
          isAdmin={role === "admin"}
          profileEmails={profileEmails}
        />
      </div>
    </div>
  );
}
