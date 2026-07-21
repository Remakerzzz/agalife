# AgaLife — «Там, где живёт округ»

**Это частный проект и личный бренд, а не open-source.** Репозиторий закрытый,
код и дизайн принадлежат владельцу проекта. Копирование, повторное
использование или распространение без разрешения не допускается — подробнее
в разделе «Лицензия» внизу файла.

Цифровая площадка для жителей Агинского Бурятского округа. Текущий этап:
каркас проекта + раздел «Афиша мероприятий» (главная страница).

Технологии: Next.js (App Router) + TypeScript + Tailwind CSS + Supabase.

## Быстрый старт

1. Установите зависимости:
   ```bash
   npm install
   ```
2. Создайте файл `.env.local` в корне проекта (по образцу `.env.local.example`)
   и укажите ключи вашего проекта Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-anon-или-publishable-ключ
   ```
   Без этого файла сайт всё равно откроется и покажет тестовые
   («заглушечные») события — так можно посмотреть, как всё работает,
   ещё до подключения базы.
3. В Supabase (SQL Editor вашего проекта) выполните скрипт
   `supabase/schema.sql` — он создаст таблицу `events` и добавит
   несколько примеров событий.
4. Запустите сервер разработки:
   ```bash
   npm run dev
   ```
   Откройте [http://localhost:3000](http://localhost:3000).

## Админ-панель (добавление и удаление событий)

Модератор заходит на `/admin` и входит по email/паролю (через Supabase Auth).

Чтобы создать аккаунт модератора: в Supabase → **Authentication → Users →
Add user** — укажите email и пароль. Этими же данными входить на `/admin`.

Право добавлять/удалять/редактировать события есть только у вошедших
(авторизованных) пользователей — это обеспечивают политики Row Level Security в
`supabase/schema.sql`. Анонимные посетители сайта видят только просмотр афиши.

В форме есть поле для загрузки фото/постера события (хранится в Supabase
Storage, бакет `event-posters`).

## Роли: супер-админ и модераторы

Каждый новый пользователь по умолчанию — обычный модератор: может добавлять
события, но редактировать/удалять только свои собственные (не чужие).
Супер-админ может редактировать и удалять вообще все события.

Чтобы сделать себя супер-админом (один раз):
1. Supabase → **Authentication → Users** → скопируйте свой **User UID**
2. В SQL Editor выполните, подставив свой UID:
   ```sql
   update public.profiles set role = 'admin' where id = 'ВАШ-USER-UID';
   ```

Чтобы добавить ещё одного модератора — так же, как и первого: Supabase →
**Authentication → Users → Add user** (email + пароль), новый пользователь
автоматически получает роль обычного модератора.

## У вас уже была подключена база — что довыполнить

Если вы уже выполняли `supabase/schema.sql` раньше, выполните в SQL Editor
только новую часть (создание таблицы и старые политики выполнять повторно
не нужно):

```sql
alter table public.events add column if not exists poster_url text;

drop policy if exists "Модераторы могут редактировать события" on public.events;
create policy "Модераторы могут редактировать события"
  on public.events for update
  to authenticated
  using (true)
  with check (true);

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
```

А также миграцию для ролей (супер-админ / модератор):

```sql
alter table public.events add column if not exists created_by uuid references auth.users (id);
alter table public.events alter column created_by set default auth.uid();

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
```

**Важно:** ваш собственный аккаунт уже существовал до этой миграции, поэтому
у Supabase нет триггера, который создал бы для него профиль автоматически.
Создайте профиль и сразу сделайте себя админом одним запросом (подставьте
свой User UID из **Authentication → Users**):

```sql
insert into public.profiles (id, role) values ('ВАШ-USER-UID', 'admin')
on conflict (id) do update set role = 'admin';
```

## Структура проекта

- `src/app/page.tsx` — главная страница (Афиша)
- `src/app/events/[id]/page.tsx` — отдельная страница события (для шаринга ссылкой)
- `src/app/admin/page.tsx` — админ-панель модератора
- `src/app/layout.tsx` — общий каркас страниц (шапка/подвал)
- `src/app/icon.tsx`, `src/app/apple-icon.tsx` — иконка сайта
- `src/components/` — карточка события, фильтры, список афиши
- `src/components/admin/` — форма входа, форма добавления/редактирования события, список для модерации
- `src/lib/` — подключение к Supabase, типы данных, запросы, форматирование дат
- `supabase/schema.sql` — SQL-схема таблицы `events`, Storage-бакет и политики доступа

## Что дальше по плану

Следующие этапы (см. `AgaLife_TZ.md`): Барахолка, платежи, деплой.

## Лицензия

© AgaLife. Все права защищены.

Это проприетарный (закрытый) проект, а не open-source. Код, дизайн, контент
и бренд «AgaLife» принадлежат владельцу проекта. Без письменного разрешения
владельца запрещается копировать, изменять, публиковать, распространять или
использовать этот код и материалы — целиком или частично — в любых других
проектах.
