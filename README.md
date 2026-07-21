# AgaLife — «Там, где живёт округ»

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
