-- Legacy Supabase schema. The admin application uses server/database-setup.sql (MySQL).
-- This schema is not used by the current application.

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password text not null,
  role text not null check (role in ('admin', 'staff', 'donor', 'volunteer', 'engineer')),
  name text not null,
  phone text,
  method text,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id text primary key,
  title text not null,
  category text not null,
  image text,
  excerpt text not null,
  content text not null,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.blog_posts enable row level security;

