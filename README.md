# CRAWLER//OS — BiScuitOS

Dashboard web per la gestione di una crew di crawler in ambientazione sci-fi/post-apocalittica. Companion app per campagne di gioco di ruolo — interfaccia stile "sistema operativo a bordo di un crawler" per piloti, missioni, inventario e log di gioco.

---

## Stack

| Layer | Tecnologia |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Stile | Tailwind CSS v3 |
| State | Zustand |
| Backend/DB | Supabase (Postgres) |
| Deployment | Vercel |

---

## Setup

```bash
cd frontend
npm install
npm run dev
```

Crea `frontend/.env` con:

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_SYSTEM_KEY=<password-operatore>
```

---

## Modalità operatore

L'app ha due livelli di accesso:

- **Sola lettura** — feed, piloti, missioni, hangar visibili a tutti
- **Operatore** — sbloccato con `VITE_SYSTEM_KEY` dalla Navbar. Abilita CRUD piloti, override sistema, editor report missioni, bacheca scambi con eliminazione

La chiave non viene mai inviata al server. Lo stato `isOperator` è in memoria e si perde al refresh.

---

## UX Mobile

Le schede collassate (missioni e piloti) mostrano un hint "TOCCA PER ULTERIORI DETTAGLI" visibile solo su mobile (`sm:hidden`) per guidare l'utente all'interazione touch. Il pulsante menu nella Navbar mostra label "MENU" con animazione pulse per rendere evidente la presenza della sidebar.

---

## Database

Tabelle Supabase: `pilots`, `crawler_system`, `journal_stream`, `missions`, `task_board_items`, `trade_board`

Tutte le tabelle richiedono RLS con policy di lettura pubblica. `trade_board` richiede anche policy di insert e delete pubblica.

```sql
-- Colonna sesso piloti
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS sesso TEXT DEFAULT '';

-- Colonna abilità piloti  
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS abilita TEXT DEFAULT '';

-- Tabella bacheca scambi
CREATE TABLE IF NOT EXISTS trade_board (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pilot_name text NOT NULL,
  type text NOT NULL CHECK (type IN ('offerta', 'richiesta')),
  item_name text NOT NULL,
  item_category text NOT NULL DEFAULT 'Sistema',
  notes text,
  archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```
