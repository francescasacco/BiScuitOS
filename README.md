# CRAWLER//OS — BiScuitOS

Dashboard web per la gestione di una crew di crawler in ambientazione sci-fi/post-apocalittica. Funziona come companion app per campagne di gioco di ruolo, offrendo un'interfaccia stile "sistema operativo a bordo di un crawler" per tenere traccia di piloti, missioni, inventario e log di gioco.

---

## Stack tecnico

| Layer | Tecnologia |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Stile | Tailwind CSS v3 (JIT) |
| State | Zustand |
| Backend/DB | Supabase (Postgres + REST API) |
| Deployment | Vercel |
| Font | Orbitron · Playfair Display · Plus Jakarta Sans · Space Mono |

---

## Variabili d'ambiente

Crea un file `frontend/.env.local` con:

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_SYSTEM_KEY=<password-operatore>
```

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — credenziali Supabase, visibili nel pannello del progetto sotto *Project Settings → API*.
- `VITE_SYSTEM_KEY` — chiave segreta inserita dalla Navbar per sbloccare la modalità operatore. Non viene mai salvata nel DB.

---

## Setup locale

```bash
cd frontend
npm install
npm run dev       # dev server su http://localhost:5173
npm run build     # build di produzione in frontend/dist/
npm run preview   # preview della build di produzione
```

---

## Struttura del progetto

```
frontend/src/
├── App.tsx                    # Root: carica dati da Supabase all'avvio
├── router.tsx                 # React Router v6 — definizione delle rotte
├── config.ts                  # Costanti globali (OS_NAME, versione, messaggi di boot)
│
├── components/
│   ├── layout/
│   │   ├── OSFrame.tsx        # Shell principale con Navbar + Sidebar + area contenuto
│   │   ├── Navbar.tsx         # Barra superiore: orologio, stato, login operatore
│   │   ├── Sidebar.tsx        # Navigazione laterale + risorse crawler
│   │   └── BootScreen.tsx     # Schermata di avvio animata (sequenza boot)
│   └── core/
│       ├── BiscuitLoader.tsx  # Overlay di autenticazione operatore (6 secondi)
│       ├── PilotManagement.tsx    # CRUD piloti (solo operatore)
│       ├── SystemCommandInput.tsx # Form per aggiungere voci al journal (solo operatore)
│       └── OverrideConsole.tsx    # Pannello override dati crawler (solo operatore)
│
├── pages/
│   ├── OSMainPage.tsx         # Feed principale: riepilogo sistema, missioni, piloti, ecc.
│   ├── CrewPage.tsx           # Registro equipaggio — lista card piloti
│   ├── JournalPage.tsx        # Archivio log — tutte le voci del journal
│   ├── MissionsPage.tsx       # Nucleo operazioni — lista missioni con stato
│   ├── HangarInterface.tsx    # Inventario hangar — oggetti raggruppati per categoria
│   └── CoreSystemPage.tsx     # Pannello operatore — sezioni crawler, CRUD, console
│
├── services/
│   ├── pilotService.ts        # getAll(), create(), update(), delete()
│   ├── systemService.ts       # get(), update(), initialize()
│   ├── journalService.ts      # getAll(), create()
│   └── missionService.ts      # getAll(), create(), update()
│
├── store/
│   └── useOSStore.ts          # Zustand store — stato globale dell'app
│
├── types/
│   ├── pilot.ts               # Pilot, PilotFormData, CLASSI_PILOTA
│   ├── system.ts              # CrawlerSystem, HangarItem, CrawlerSection, ecc.
│   ├── journal.ts             # JournalEntry, JournalEntryType
│   └── mission.ts             # Mission, MissionStatus, MissionFormData
│
└── lib/
    ├── supabaseClient.ts      # Istanza Supabase (singleton)
    └── audioManager.ts        # YouTube IFrame API — musica di sottofondo con loop
```

---

## Architettura

### Flusso dati

```
App.tsx (mount)
  └─ Promise.all([pilots, system, journal, missions])  ← Supabase
       └─ useOSStore (Zustand)
            └─ tutti i componenti leggono dallo store via useOSStore()
```

Al primo render `App.tsx` carica in parallelo tutti i dati da Supabase e li scrive nello store Zustand. I componenti leggono direttamente dallo store — non c'è prop drilling. Le mutazioni passano sempre per i service (`pilotService.update(...)`) e poi aggiornano lo store con il risultato.

### Modalità operatore

L'app ha due livelli di accesso:

- **Sola lettura** (default) — tutti possono vedere feed, piloti, missioni, archivio, hangar.
- **Operatore** — sbloccato inserendo `VITE_SYSTEM_KEY` dalla Navbar. Mostra pannelli CRUD, console di override, e la sezione Core System nella sidebar.

La chiave non viene mai inviata al server — il confronto avviene solo nel browser. Lo stato `isOperator` è in memoria (Zustand) e si perde con il refresh.

---

## Database Supabase

### Tabella `pilots`

| Colonna | Tipo | Descrizione |
|---|---|---|
| `id` | uuid | Chiave primaria |
| `identificativo` | text | Nome/callsign del pilota |
| `aspetto` | text | Descrizione fisica |
| `classe` | text | Salvager · Outrider · Mechwright · Fixer · Hacker · Mercenary |
| `motto_attivato` | text | Motto o frase caratteristica |
| `background` | text | Storia del personaggio |
| `cimelio` | text | Oggetto personale significativo |
| `mech_nome` | text | Nome del mech |
| `mech_info` | text | Descrizione generale del mech |
| `mech_sistemi` | text | Sistemi montati |
| `mech_moduli` | text | Moduli aggiuntivi |
| `mech_status` | text | Stato attuale del mech |
| `role` | text | `pilot` o `operator` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### Tabella `crawler_system`

| Colonna | Tipo | Descrizione |
|---|---|---|
| `id` | uuid | Chiave primaria (una sola riga) |
| `scrap` | integer | Rottami disponibili |
| `engineers` | integer | Numero di ingegneri |
| `fuel` | integer | Carburante |
| `crawler_name` | text | Nome del crawler |
| `crawler_type` | text | Tipo/modello |
| `ps_current` / `ps_max` | integer | Punti struttura attuali / massimi |
| `enhancement_current` / `enhancement_max` | integer | Potenziamenti |
| `maintenance_cost` | integer | Costo di manutenzione |
| `merchant_bridge` | text | Stato del ponte mercante |
| `repair_status` | text | Stato delle riparazioni in corso |
| `active_alerts` | text | Allerte attive |
| `system_notes` | text | Note libere |
| `sections` | jsonb | Array di `CrawlerSection[]` |
| `inventory` | jsonb | Array di `HangarItem[]` |
| `updated_at` | timestamptz | |

### Tabella `journal_entries`

| Colonna | Tipo | Descrizione |
|---|---|---|
| `id` | uuid | Chiave primaria |
| `title` | text | Titolo della voce |
| `content` | text | Testo completo |
| `type` | text | `event` · `mission` · `system` · `pilot_registration` · `override` · `alert` · `narrative` · `pilot_note` |
| `author` | text | Autore (opzionale) |
| `created_at` | timestamptz | |

### Tabella `missions`

| Colonna | Tipo | Descrizione |
|---|---|---|
| `id` | uuid | Chiave primaria |
| `title` | text | Nome della missione |
| `status` | text | `active` · `pending` · `completed` · `failed` · `classified` |
| `summary` | text | Descrizione/briefing |
| `reward` | text | Ricompensa |
| `created_at` | timestamptz | |

---

## Componenti

### Layout

#### `OSFrame`
Shell dell'intera applicazione. Monta `Navbar` (in alto), `Sidebar` (a sinistra) e un'area contenuto scrollabile. Su mobile la sidebar si sovrappone ed è controllata da `sidebarOpen` nello store. Usa `h-[100dvh]` per gestire correttamente il viewport dinamico su iOS.

#### `Navbar`
Barra superiore fissa. A sinistra: hamburger mobile, nome OS, data/ora. A destra: indicatore stato online, pulsante/form login operatore. Quando la chiave è corretta mostra `BiscuitLoader` per 6 secondi prima di impostare `isOperator: true`.

#### `Sidebar`
Navigazione principale con badge attivi (missioni attive, conteggio piloti). In basso mostra le risorse del crawler (rottami con barra di avanzamento, ingegneri, piloti). Se `isOperator` è `true` mostra anche la sezione "Operatore" con il link a Core System.

#### `BootScreen`
Schermata di avvio che simula un boot di sistema. Mostra i messaggi da `BOOT_MESSAGES` in `config.ts` uno alla volta, poi si dissolve e imposta `isBooting: false`.

---

### Core (solo operatore)

#### `BiscuitLoader`
Overlay fullscreen che si attiva dopo il login corretto. Mostra una sequenza di messaggi di autenticazione per 6 secondi (`BISCUIT_LOADER_DURATION`), poi chiama `onComplete` per cedere il controllo a `Navbar`.

#### `PilotManagement`
Form e lista per creare/modificare/eliminare piloti. Gestisce sia i dati del pilota che quelli del mech in un unico form. Usa `pilotService` per le operazioni CRUD e aggiorna lo store via `addPilot` / `updatePilot` / `removePilot`.

#### `SystemCommandInput`
Form per aggiungere manualmente voci al journal. Permette di scegliere il tipo (`JournalEntryType`), titolo, contenuto e autore. Usa `journalService.create()` e aggiorna lo store via `addJournalEntry`.

#### `OverrideConsole`
Form per modificare direttamente i campi numerici e testuali del `crawler_system` (rottami, ingegneri, carburante, note, ecc.). Usa `systemService.update()`.

---

### Pagine

#### `OSMainPage` — Feed principale
Dashboard con 5 widget:
- **Stato Sistema** — ps, potenziamenti, costo manutenzione, sezioni del crawler
- **Missioni Correnti** — missioni attive con badge di stato colorato
- **Equipaggio** — lista piloti con classe e stato mech
- **Inventario Hangar** — oggetti per categoria
- **Archivio Log** — ultime voci del journal

#### `CrewPage` — Registro Equipaggio
Card espandibili per ogni pilota. Collapsed: identificativo, classe, stato mech. Expanded: aspetto, background, cimelio, sistemi e moduli del mech.

#### `JournalPage` — Archivio
Lista cronologica di tutte le voci del journal con badge tipo, titolo, contenuto e timestamp.

#### `MissionsPage` — Nucleo Operazioni
Lista missioni con badge di stato colorato (active → accent, pending → amber, completed → green, failed → red, classified → muted). Operatore può aggiungere/modificare missioni.

#### `HangarInterface` — Inventario
Oggetti raggruppati per categoria (Sistema · Modulo · Telaio · Altro) con indicatore stato (normale → green, danneggiato → amber, distrutto → red). Operatore può aggiungere, modificare, eliminare oggetti e ciclare lo stato con un click.

#### `CoreSystemPage` — Core System (operatore)
Pannello completo di controllo: sezioni del crawler con stato (active/empty/damaged), dati grezzi del sistema, e accesso ai componenti `PilotManagement`, `SystemCommandInput`, `OverrideConsole`.

---

### Lib

#### `audioManager`
Gestisce la musica di sottofondo tramite YouTube IFrame API. L'istanza del player è un singleton. Il video ripart da `1:03` (`START_SEC = 63`) ad ogni fine traccia tramite l'evento `onStateChange` (stato `0` = ended → `seekTo` + `playVideo`).

#### `supabaseClient`
Esporta un'unica istanza di `createClient` usata da tutti i service. Credenziali da `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

---

## Design system

I token sono definiti in `tailwind.config.js` (classi Tailwind) e `src/index.css` (variabili CSS `--bc-*`). I due file vanno mantenuti sincronizzati.

| Token | Valore | Uso |
|---|---|---|
| `bc-black` | `#09090e` | Sfondo base |
| `bc-dark` | `#111119` | Sfondo secondario, input |
| `bc-panel` | `#181826` | Card e pannelli |
| `bc-border` | `#5252c8` | Tutti i border visibili |
| `bc-track` | `#272748` | Barre di avanzamento, sfondo track |
| `bc-text` | `#f5f2ff` | Testo principale |
| `bc-accent` | `#a78bfa` | Viola — accento principale |
| `bc-green` | `#5eead4` | Teal — stato nominale |
| `bc-amber` | `#fbbf24` | Giallo — warning, operatore |
| `bc-red` | `#f87171` | Rosso — critico, distrutto |
| `bc-blue` | `#60a5fa` | Blu — info, moduli |
| `bc-muted` | `#64648a` | Testo secondario/disabilitato |

Utility CSS globali rilevanti (`index.css`):

| Classe | Uso |
|---|---|
| `.bc-btn`, `.bc-btn-green/amber/red` | Pulsanti con border e hover glow |
| `.bc-input`, `.bc-select` | Input e select unificati |
| `.bc-section-header` | Intestazione sezione uppercase con border-bottom |
| `.text-glow[-green/-amber/-red]` | text-shadow colorati |
| `.border-glow[-amber/-red]` | box-shadow su card |
| `.status-dot.nominal/warning/critical` | Pallini di stato con glow animato |
| `.animate-boot-in`, `.boot-delay-*` | Animazione entrata con stagger (0.1s–0.8s) |
| `.crt-overlay` | Scanline CRT + sweep luminoso |
