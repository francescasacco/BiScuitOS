import { useOSStore } from '@/store/useOSStore'
import { OverrideConsole } from '@/components/core/OverrideConsole'
import { SystemCommandInput } from '@/components/core/SystemCommandInput'
import { PilotManagement } from '@/components/core/PilotManagement'
import { HangarManagement } from '@/components/core/HangarManagement'
import { MissionReportEditor } from '@/components/core/MissionReportEditor'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ChevronLeft } from 'lucide-react'

export function CoreSystemInterface() {
  const { isOperator } = useOSStore()
  const navigate = useNavigate()

  if (!isOperator) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 px-6 text-center">
        <div className="text-bc-red text-glow-red font-display text-xl sm:text-2xl tracking-widest animate-pulse">
          ACCESSO NEGATO
        </div>
        <div className="font-mono text-bc-muted text-sm max-w-sm">
          SISTEMA CORE richiede autenticazione con CHIAVE SISTEMA valida.
        </div>
        <div className="font-mono text-xs text-bc-red/60 max-w-xs break-words">
          ERRORE: AUTENTICAZIONE_OPERATORE_FALLITA // CRAWLER//OS // NODO RISTRETTO
        </div>
        <button className="bc-btn border-bc-muted text-bc-muted mt-4 flex items-center gap-1" onClick={() => navigate('/')}>
          <ChevronLeft size={13} /> TORNA AL FEED PRINCIPALE
        </button>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-3">
    <div className="space-y-3 animate-boot-in">
      <div className="border-b border-bc-border pb-3 flex items-center justify-between gap-4">
        <h1 className="font-display text-lg font-bold text-bc-amber text-glow-amber tracking-widest shrink-0">
          SISTEMA CORE // CONSOLE OPERATORE
        </h1>
        <div className="border border-bc-amber/40 bg-bc-amber/5 px-3 py-2 text-right">
          <span className="text-bc-amber font-display text-xs font-bold tracking-widest flex items-center gap-1.5">
            <AlertTriangle size={12} strokeWidth={2} /> INTERFACCIA SISTEMA CORE — ACCESSO OPERATORE ATTIVO
          </span>
          <p className="font-mono text-xs text-bc-amber/60 mt-0.5">
            Tutte le azioni sono registrate nell'Archivio Log. Procedere con cautela.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[520px_1fr] xl:grid-cols-[600px_1fr] gap-4">
        <OverrideConsole />
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:h-[230px]">
            <div className="overflow-y-auto"><PilotManagement /></div>
            <div className="overflow-y-auto"><HangarManagement /></div>
          </div>
          <SystemCommandInput /></div>
      </div>
      <MissionReportEditor />
    </div></div>
  )
}
