-- 1. Add report column to missions
ALTER TABLE missions ADD COLUMN IF NOT EXISTS report JSONB;

-- 2. Create task_board_items table
CREATE TABLE IF NOT EXISTS task_board_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE task_board_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "task_board_allow_all" ON task_board_items FOR ALL USING (true);

-- 3. Insert report on "Sete nel Deserto" mission
UPDATE missions SET report = $${
  "date": "25.04.2026",
  "theater": "03.xx EMPUSA",
  "intel": [
    "Batteri idrofagi confermati nell'Oasi [03.01] — possibile sabotaggio corporativo",
    "Pattuglie Hussar Contour attive in tutto il deserto — massima attenzione",
    "Nicholas Sandival [03.06] — alleanza confermata, Mech T5/T6 disponibile",
    "Due contratti incompatibili aperti — decisione urgente richiesta",
    "Modulo 'Bella Addormentata' recuperato — natura ignota, analisi in corso",
    "3 Mech Squadra 3 in riparazione",
    "6 Hussar Contour neutralizzati — telaio recuperato"
  ],
  "squads": [
    { "number": 1, "name": "Oasi Prosciugata", "location": "03.01", "type": "Esplorazione", "description": "Insediamento abbandonato. Insetti neutralizzati. Barili BIOHAZARD con batteri idrofagi trovati nel pozzo asciutto.", "status": "RIENTRATA" },
    { "number": 2, "name": "Arcolog + Avamposto", "location": "03.02 / 03.05", "type": "Diplomatica", "description": "Due contratti ricevuti da Nara Mash e Cerys. Nessun combattimento. Decisione aperta e urgente.", "status": "CONTRATTO APERTO" },
    { "number": 3, "name": "Avamposto Mercantile", "location": "03.05", "type": "Combattimento", "description": "Due scontri critici con pattuglie Hussar. Tre mech su cinque gravemente danneggiati. Salvati dall'intervento della 4ª squadra.", "status": "DANNI GRAVI" },
    { "number": 4, "name": "Pilota in Pensione", "location": "03.06", "type": "Recupero + Supporto", "description": "Sandival contattato e alleato. Doppio intervento a supporto della 3ª. 6 Hussar neutralizzati. Asset recuperati.", "status": "SUCCESSO" }
  ],
  "discoveries": [
    { "icon": "☣", "title": "Sabotaggio idrico confermato", "description": "Barili biohazard con batteri idrofagi sul fondo del pozzo. La siccità dell'Oasi [03.01] non è naturale. Principale indiziato: corporazione Contour." },
    { "icon": "⚡", "title": "Guerra per l'acqua in corso", "description": "L'Avamposto Mercantile è l'ultimo nodo idrico indipendente del deserto. Contour esercita pressione militare e diplomatica simultaneamente." },
    { "icon": "◆", "title": "Alleato trovato: Sandival", "description": "Pilota veterano con officina T3 e mech superiore a T5. Combattente affidabile, già testato sul campo. Risorsa rara — da consolidare." },
    { "icon": "⚠", "title": "Contour presidia il territorio", "description": "Pattuglie Hussar numerose e aggressive in tutto il Deserto di Empusa. Traversata ad alto rischio senza adeguata copertura." }
  ],
  "characters": [
    { "alignment": "ally", "name": "Nicholas Sandival", "role": "Pilota veterano — [03.06] Canyon", "description": "Officina meccanica autosufficiente T3. Mech T5/T6. Intervento volontario in combattimento. Disponibile: rottami T3 in cambio di assistenza tecnica." },
    { "alignment": "contract", "name": "Cerys", "role": "Braccio destro di Colton — Avamposto Mercantile [03.05]", "description": "Offre 30 rottami T2 + acqua gratuita per il Crawler in cambio dell'eliminazione dei mech Contour alle Colline Selvagge." },
    { "alignment": "hostile", "name": "Nara Mash", "role": "Ufficiale Corporazione Contour — Arcolog [03.02]", "description": "Proposta: eliminare Cerys per facilitare il takeover dell'Avamposto. Ricompensa: 30+ rottami T3. Accettare = monopolio idrico Contour." },
    { "alignment": "neutral", "name": "Colton", "role": "Responsabile Avamposto Mercantile [03.05]", "description": "Non incontrato direttamente. Tutte le trattative passate attraverso Cerys. Grado di controllo reale da determinare." }
  ],
  "contracts": [
    { "name": "Contratto Cerys", "client": "Avamposto Mercantile (indipendente) — Cerys", "objective": "Eliminare i mech Contour presso le Colline Selvagge", "reward": "30 rottami T2 + acqua gratuita per l'intero Crawler", "consequence": "L'Avamposto rimane indipendente. Contour perde influenza. L'acqua rimane accessibile a Sanctuary." },
    { "name": "Contratto Nara Mash", "client": "Corporazione Contour — Nara Mash (non ufficiale)", "objective": "Eliminare Cerys, braccio destro di Colton", "reward": "Almeno 30 rottami T3", "consequence": "Contour acquisisce l'Avamposto Mercantile. Monopolio idrico corporativo. Costo acqua per Sanctuary potenzialmente illimitato." }
  ],
  "contractsIncompatible": true,
  "assets": [
    { "name": "Telaio Hussar (Contour, neutralizzato)", "category": "MECH" },
    { "name": "Unità Dilaniatore M2-X", "category": "MECH" },
    { "name": "Modulo Bella Addormentata", "category": "IGNOTO" },
    { "name": "Rottami classificazione mista", "category": "T2 / T3" }
  ],
  "priorities": [
    "Decidere il contratto — Cerys o Nara Mash (o esplorare una terza via)",
    "Investigare l'origine dei batteri idrofagi e il mandante del sabotaggio idrico",
    "Consolidare la relazione con Nicholas Sandival [03.06]",
    "Analizzare il modulo Bella Addormentata — natura e funzione ignote"
  ]
}$$::jsonb
WHERE title = 'Sete nel Deserto';

-- 4. Insert task board priorities
INSERT INTO task_board_items (text, position) VALUES
  ('Decidere il contratto — Cerys o Nara Mash (o esplorare una terza via)', 0),
  ('Investigare l''origine dei batteri idrofagi e il mandante del sabotaggio idrico', 1),
  ('Consolidare la relazione con Nicholas Sandival [03.06]', 2),
  ('Analizzare il modulo Bella Addormentata — natura e funzione ignote', 3);
