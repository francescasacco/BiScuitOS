export const OS_NAME = 'CRAWLER//OS'
export const OS_VERSION = 'v2.7.1'
export const OS_KERNEL = 'crawler-kernel-7734'
export const OS_SUBTITLE = 'SISTEMA OPERATIVO CRAWLER'

export const OPERATOR_NAME = 'BISCUIT'
export const BISCUIT_LOADER_DURATION = 6000

export const BOOT_MESSAGES = [
  `> ${OS_NAME} ${OS_VERSION} — CARICAMENTO IN CORSO...`,
  '> CONNESSIONE NODO DATABASE... OK',
  '> SINCRONIZZAZIONE TABELLA: pilots... OK',
  '> SINCRONIZZAZIONE TABELLA: journal_stream... OK',
  '> SINCRONIZZAZIONE TABELLA: missions... OK',
  '> SINCRONIZZAZIONE TABELLA: crawler_system... OK',
  '> MODULO /crew — registro equipaggio... ONLINE',
  '> MODULO /journal — archivio log... ONLINE',
  '> MODULO /missions — nucleo missioni... ONLINE',
  '> MODULO /hangar — inventario crawler... ONLINE',
  '> MODULO /core — console operatore... ACCESSO RISERVATO',
  '> PONTE MERCANTILE... IN ATTESA',
  '> VERIFICA INTEGRITÀ DATI... PARZIALE',
  `> INIZIALIZZAZIONE ${OS_NAME} COMPLETATA.`,
  '> BENVENUTO, PILOTA!',
]

export const BISCUIT_LOADER_MESSAGES = [
  'VERIFICA CREDENZIALI OPERATORE...',
  'AUTENTICAZIONE NODO PRIVILEGIATO...',
  'DECRITTAZIONE ACCESSO CORE...',
  'CARICAMENTO INTERFACCIA OPERATORE...',
  'ACCESSO AUTORIZZATO.',
]
