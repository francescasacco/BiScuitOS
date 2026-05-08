-- 1. Converti tutte le voci 'narrative' esistenti in 'event'
UPDATE journal_entries SET type = 'event' WHERE type = 'narrative';

-- 2. Inserisci voci journal per le missioni presenti nel DB
INSERT INTO journal_entries (title, content, type, author)
SELECT
  'MISSIONE REGISTRATA: ' || title,
  COALESCE(summary, 'Nessun briefing disponibile.'),
  'mission',
  'SISTEMA'
FROM missions
WHERE title IN ('Sete nel Deserto')
ON CONFLICT DO NOTHING;

-- Inserisci anche per l'altra missione (aggiorna il titolo se diverso)
INSERT INTO journal_entries (title, content, type, author)
SELECT
  'MISSIONE REGISTRATA: ' || title,
  COALESCE(summary, 'Nessun briefing disponibile.'),
  'mission',
  'SISTEMA'
FROM missions
WHERE title != 'Sete nel Deserto'
ON CONFLICT DO NOTHING;
