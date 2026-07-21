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
  created_at timestamptz not null default now()
);

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

-- Запись/изменение событий пока не разрешена анонимно — это будет делать модератор
-- через админ-панель (следующий этап) либо через Supabase Dashboard вручную.

-- Немного тестовых данных, чтобы сразу увидеть, как работает афиша
insert into public.events (title, description, event_date, event_time, location, village, category, organizer, contacts)
values
  ('Сурхарбан 2026', 'Национальный летний праздник: борьба, стрельба из лука, конные скачки.', current_date + interval '3 day', '10:00', 'Центральный стадион', 'Агинское', 'Праздник', 'Администрация округа', '+7 (30239) 3-XX-XX'),
  ('Ярмарка выходного дня', 'Продажа фермерской продукции, мёда, изделий ручной работы.', current_date + interval '1 day', '09:00', 'Центральная площадь', 'Могойтуй', 'Ярмарка', 'Могойтуйский Дом культуры', '+7 (30255) 2-XX-XX'),
  ('Сход жителей села', 'Обсуждение вопросов благоустройства и планов на следующий год.', current_date, '18:00', 'Сельский клуб', 'Дульдурга', 'Сход жителей', 'Администрация села Дульдурга', '+7 (30256) 2-XX-XX'),
  ('Концерт народного ансамбля', 'Праздничный концерт бурятской и русской народной песни.', current_date + interval '7 day', '17:00', 'Дом культуры', 'Агинское', 'Концерт', 'Агинский окружной Дом культуры', '+7 (30239) 3-XX-XX')
on conflict do nothing;
