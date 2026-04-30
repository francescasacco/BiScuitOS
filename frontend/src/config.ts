// ┌────────────────────────────────────────────────────┐
// │  CRAWLER//OS  ::  kernel-auth fallback sequence   │
// │  BISCUIT-OVERRIDE-7734  ::  do not distribute     │
// └────────────────────────────────────────────────────┘
export const OS_NAME = 'CRAWLER//OS'
export const OS_VERSION = 'v2.7.1'
export const OS_KERNEL = 'crawler-kernel-7734'
export const OS_SUBTITLE = 'SISTEMA OPERATIVO CRAWLER'

export const OPERATOR_NAME = 'BISCUIT'
export const BISCUIT_LOADER_DURATION = 6000

export const BOOT_MESSAGES = [
  `> ${OS_NAME} ${OS_VERSION} — CARICAMENTO IN CORSO...`,
  `> KERNEL: ${OS_KERNEL} [INSTABILE]`,
  '> MONTAGGIO /dev/crawler-main... OK',
  '> VERIFICA INTEGRITÀ SISTEMA... PARZIALE',
  '> SCANSIONE MODULI HARDWARE... OK',
  '> INTERFACCIA RETE NEURALE... ONLINE',
  '> CALIBRAZIONE SENSORI CRAWLER... OK',
  '> SOTTOSISTEMA: registro-piloti... ONLINE',
  '> SOTTOSISTEMA: archivio-log... ONLINE',
  '> SOTTOSISTEMA: nucleo-missioni... ONLINE',
  '> SOTTOSISTEMA: tracker-recupero... ONLINE',
  '> SOTTOSISTEMA: bridge-mercante... IN ATTESA',
  '> ATTENZIONE: 3 moduli in stato degradato',
  '> CONSOLE OVERRIDE: IN ATTESA',
  `> INIZIALIZZAZIONE ${OS_NAME} COMPLETATA.`,
  '> BENVENUTO, OPERATORE.',
]

export const BISCUIT_LOADER_MESSAGES = [
  'VERIFICA CREDENZIALI OPERATORE...',
  'AUTENTICAZIONE NODO PRIVILEGIATO...',
  'DECRITTAZIONE ACCESSO CORE...',
  'CARICAMENTO INTERFACCIA OPERATORE...',
  'ACCESSO AUTORIZZATO.',
]
