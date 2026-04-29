-- BC-OS // Seed Data
-- Initial system state + sample journal entries

-- Initialize Crawler System (one record)
insert into crawler_system (scrap, engineers, fuel, repair_status, active_alerts, system_notes, merchant_bridge)
values (
  120,
  4,
  67,
  'NOMINAL',
  'NONE',
  'BC-OS online. All primary systems nominal. BISCUIT kernel v2.7.1 active.',
  'DRIFTER-MARKET-7 // ACTIVE'
);

-- Seed journal entries
insert into journal_stream (title, content, type, author) values
(
  'BC-OS INITIALIZATION',
  'BISCUIT//CORE OS v2.7.1 started successfully.
Kernel: biscuit-kernel-7734
All subsystems online.
Crawler mesh synchronized.
Awaiting crew registration.',
  'system',
  'BISCUIT//CORE'
),
(
  'HULL INTEGRITY CHECK',
  'Routine diagnostic complete.
Sector D-7: minor structural fatigue. Non-critical.
Reactor shielding: 94% integrity.
Recommend repair allocation next downtime.',
  'alert',
  'DIAGNOSTIC_NODE'
),
(
  'MERCHANT BRIDGE CONTACT',
  'Signal received from DRIFTER-MARKET-7.
Trade window open: 48 cycles.
Available: fuel cells, mech components, salvage contracts.',
  'event',
  'COMMS_NODE'
);
