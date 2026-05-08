import { useOSStore } from '@/store/useOSStore'
import { OverrideConsole } from '@/components/core/OverrideConsole'
import { SystemCommandInput } from '@/components/core/SystemCommandInput'
import { PilotManagement } from '@/components/core/PilotManagement'
import { HangarManagement } from '@/components/core/HangarManagement'
import { useNavigate } from 'react-router-dom'

export function CoreSystemInterface() {
  const { isOperator } = useOSStore()
  const navigate = useNavigate()

  if (!isOperator) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <div className="text-bc-red text-glow-red font-display text-2xl tracking-widest animate-pulse">
          ACCESSO NEGATO
        </div>
        <div className="font-mono text-bc-muted text-sm">
          SISTEMA CORE richiede autenticazione con CHIAVE SISTEMA valida.
        </div>
        <div className="font-mono text-xs text-bc-red/60">
          ERRORE: AUTENTICAZIONE_OPERATORE_FALLITA // CRAWLER//OS // NODO RISTRETTO
        </div>
        <button className="bc-btn border-bc-muted text-bc-muted mt-4" onClick={() => navigate('/')}>
          ← TORNA AL FEED PRINCIPALE
        </button>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-3">
    <div className="space-y-3 animate-boot-in">
      <div className="border border-bc-amber/40 bg-bc-amber/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-bc-amber text-glow-amber font-display text-sm font-bold tracking-widest">
            ⚠ INTERFACCIA SISTEMA CORE — ACCESSO OPERATORE ATTIVO
          </span>
        </div>
        <p className="font-mono text-xs text-bc-amber/60 mt-1">
          Tutte le azioni sono registrate nell'Archivio Log. Procedere con cautela.
        </p>
      </div>

      <div className="border-b border-bc-border pb-3">
        <h1 className="font-display text-lg font-bold text-bc-amber text-glow-amber tracking-widest">
          SISTEMA CORE // CONSOLE OPERATORE
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[520px_1fr] xl:grid-cols-[600px_1fr] gap-4 items-start">
        <OverrideConsole />
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:h-[230px]">
            <div className="overflow-y-auto"><PilotManagement /></div>
            <div className="overflow-y-auto"><HangarManagement /></div>
          </div>
          <div className="h-[204px]"><SystemCommandInput /></div>
        </div>
      </div>
    </div></div>
  )
}
