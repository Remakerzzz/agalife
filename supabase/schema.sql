-- AgaLife: таблица событий для раздела «Афиша»
-- Выполните этот скрипт в Supabase: Project -> SQL Editor -> New query -> Run

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date not null,
  event_time time,
  location text,
  village text not null,
  category text not null default 'Другое',
  organizer text,
  contacts text,
  poster_url text,
  created_by uuid references auth.users (id) default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.events add column if not exists poster_url text;
alter table public.events add column if not exists created_by uuid references auth.users (id);
alter table public.events alter column created_by set default auth.uid();

comment on table public.events is 'События афиши AgaLife';
comment on column public.events.village is 'Село/посёлок проведения события (для фильтра "рядом со мной")';
comment on column public.events.category is 'Категория: концерт, спорт, ярмарка, сход жителей, праздник, другое';

create index if not exists events_event_date_idx on public.events (event_date);
create index if not exists events_village_idx on public.events (village);
create index if not exists events_category_idx on public.events (category);

-- Включаем Row Level Security и разрешаем всем читать события (афиша — публичный раздел)
alter table public.events enable row level security;

drop policy if exists "События доступны всем для чтения" on public.events;
create policy "События доступны всем для чтения"
  on public.events for select
  using (true);

-- Роли пользователей: обычный модератор видит/редактирует только свои
-- события, «admin» (супер-админ) — любые.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'moderator' check (role in ('admin', 'moderator')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Пользователь видит свой профиль" on public.profiles;
create policy "Пользователь видит свой профиль"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

-- Автоматически создаём профиль (роль по умолчанию — moderator) для
-- каждого нового пользователя Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role) values (new.id, 'moderator');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Небольшая функция-помощник: является ли текущий пользователь админом.
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Добавлять события может любой вошедший (авторизованный) модератор —
-- через страницу /admin. Анонимным посетителям сайта запись запрещена.
drop policy if exists "Модераторы могут добавлять события" on public.events;
create policy "Модераторы могут добавлять события"
  on public.events for insert
  to authenticated
  with check (true);

-- Удалять/редактировать может только автор события или админ.
drop policy if exists "Модераторы могут удалять события" on public.events;
create policy "Модераторы могут удалять события"
  on public.events for delete
  to authenticated
  using (created_by = auth.uid() or public.is_admin());

drop policy if exists "Модераторы могут редактировать события" on public.events;
create policy "Модераторы могут редактировать события"
  on public.events for update
  to authenticated
  using (created_by = auth.uid() or public.is_admin())
  with check (created_by = auth.uid() or public.is_admin());

-- Хранилище для постеров (фото) событий
insert into storage.buckets (id, name, public)
values ('event-posters', 'event-posters', true)
on conflict (id) do nothing;

drop policy if exists "Постеры событий доступны всем для чтения" on storage.objects;
create policy "Постеры событий доступны всем для чтения"
  on storage.objects for select
  using (bucket_id = 'event-posters');

drop policy if exists "Модераторы могут загружать постеры" on storage.objects;
create policy "Модераторы могут загружать постеры"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'event-posters');

drop policy if exists "Модераторы могут удалять постеры" on storage.objects;
create policy "Модераторы могут удалять постеры"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'event-posters');

-- Немного тестовых данных, чтобы сразу увидеть, как работает афиша
insert into public.events (title, description, event_date, event_time, location, village, category, organizer, contacts)
values
  ('Сурхарбан 2026', 'Национальный летний праздник: борьба, стрельба из лука, конные скачки.', current_date + interval '3 day', '10:00', 'Центральный стадион', 'Агинское', 'Праздник', 'Администрация округа', '+7 (30239) 3-XX-XX'),
  ('Ярмарка выходного дня', 'Продажа фермерской продукции, мёда, изделий ручной работы.', current_date + interval '1 day', '09:00', 'Центральная площадь', 'Могойтуй', 'Ярмарка', 'Могойтуйский Дом культуры', '+7 (30255) 2-XX-XX'),
  ('Сход жителей села', 'Обсуждение вопросов благоустройства и планов на следующий год.', current_date, '18:00', 'Сельский клуб', 'Дульдурга', 'Сход жителей', 'Администрация села Дульдурга', '+7 (30256) 2-XX-XX'),
  ('Концерт народного ансамбля', 'Праздничный концерт бурятской и русской народной песни.', current_date + interval '7 day', '17:00', 'Дом культуры', 'Агинское', 'Концерт', 'Агинский окружной Дом культуры', '+7 (30239) 3-XX-XX')
on conflict do nothing;

-- Сделать себя супер-админом (выполнить один раз):
-- 1. Supabase -> Authentication -> Users -> скопировать свой User UID
-- 2. Выполнить, подставив свой UID:
-- update public.profiles set role = 'admin' where id = 'ВАШ-USER-UID';
--
-- Существующие события (созданные до появления ролей) не привязаны
-- к конкретному автору — их сможет редактировать только админ. Если
-- хотите закрепить их за собой, выполните (после того как стали admin):
-- update public.events set created_by = 'ВАШ-USER-UID' where created_by is null;
