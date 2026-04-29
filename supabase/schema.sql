-- BISCUIT//CORE OS — Database Schema
-- BC-OS v2.7.1 // Salvage Union — Rainmaker

-- Pilots registry
create table if not exists pilots (
  id uuid primary key default gen_random_uuid(),

  identificativo text not null,
  aspetto text,
  classe text not null,
  motto_attivato text,
  background text,
  cimelio text,

  mech_nome text,
  mech_info text,
  mech_sistemi text,
  mech_moduli text,
  mech_status text default 'OPERATIONAL',

  role text default 'pilot' check (role in ('pilot', 'operator')),

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Crawler system state (single row)
create table if not exists crawler_system (
  id uuid primary key default gen_random_uuid(),

  scrap integer default 0,
  engineers integer default 0,
  fuel integer default 0,

  merchant_bridge text,
  repair_status text default 'NOMINAL',
  active_alerts text default 'NONE',
  system_notes text,

  updated_at timestamptz default now()
);

-- Journal stream
create table if not exists journal_stream (
  id uuid primary key default gen_random_uuid(),

  title text not null,
  content text not null,
  type text default 'event' check (
    type in ('event', 'mission', 'system', 'pilot_registration', 'override', 'alert', 'narrative')
  ),
  author text,

  created_at timestamptz default now()
);

-- Missions
create table if not exists missions (
  id uuid primary key default gen_random_uuid(),

  title text not null,
  status text default 'pending' check (
    status in ('active', 'pending', 'completed', 'failed', 'classified')
  ),
  summary text,
  reward text,

  created_at timestamptz default now()
);

-- Auto-update updated_at on pilots
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger pilots_updated_at
  before update on pilots
  for each row execute function update_updated_at();

create trigger crawler_system_updated_at
  before update on crawler_system
  for each row execute function update_updated_at();
