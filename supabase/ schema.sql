

-- ============================================================
-- PromptMotion — Schéma Supabase
-- À exécuter dans : Supabase Dashboard -> SQL Editor -> New query
-- ============================================================
-- 1. Profils utilisateurs (1 ligne par utilisateur auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  plan text not null default 'free' check (plan in ('free', 'creator', 'pro')),
  credits integer not null default 30,
  created_at timestamptz not null default now()
);
-- 2. Historique des générations
create table public.prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  idea text not null,
  model text not null,
  options jsonb not null default '{}',
  result jsonb not null,
  created_at timestamptz not null default now()
);
create index prompts_user_id_idx on public.prompts (user_id, created_at desc);
-- 3. Sécurité : Row Level Security (chacun ne voit que SES données)
alter table public.profiles enable row level security;
alter table public.prompts enable row level security;
create policy "Lecture de son propre profil"
  on public.profiles for select
  using (auth.uid() = id);
create policy "Lecture de ses propres prompts"
  on public.prompts for select
  using (auth.uid() = user_id);
create policy "Insertion de ses propres prompts"
  on public.prompts for insert
  with check (auth.uid() = user_id);
-- 4. Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
-- 5. Décrément atomique d'un crédit (évite les courses entre requêtes)
create or replace function public.use_credit()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining integer;
begin
  update public.profiles
     set credits = credits - 1
   where id = auth.uid()
     and credits > 0
   returning credits into remaining;
  if remaining is null then
    raise exception 'NO_CREDITS';
  end if;
  return remaining;
end;
$$;