-- BC-OS // Row Level Security Policies
-- For now: open access (no auth required)
-- Upgrade to auth-based policies when ready

-- Pilots: public read, public write (adjust when adding auth)
alter table pilots enable row level security;

create policy "pilots_select_all" on pilots
  for select using (true);

create policy "pilots_insert_all" on pilots
  for insert with check (true);

create policy "pilots_update_all" on pilots
  for update using (true);

create policy "pilots_delete_all" on pilots
  for delete using (true);

-- Crawler system: public read, public write
alter table crawler_system enable row level security;

create policy "crawler_system_select_all" on crawler_system
  for select using (true);

create policy "crawler_system_insert_all" on crawler_system
  for insert with check (true);

create policy "crawler_system_update_all" on crawler_system
  for update using (true);

-- Journal: public read, public write
alter table journal_stream enable row level security;

create policy "journal_select_all" on journal_stream
  for select using (true);

create policy "journal_insert_all" on journal_stream
  for insert with check (true);

create policy "journal_delete_all" on journal_stream
  for delete using (true);

-- Missions: public read/write
alter table missions enable row level security;

create policy "missions_select_all" on missions
  for select using (true);

create policy "missions_insert_all" on missions
  for insert with check (true);

create policy "missions_update_all" on missions
  for update using (true);

create policy "missions_delete_all" on missions
  for delete using (true);
