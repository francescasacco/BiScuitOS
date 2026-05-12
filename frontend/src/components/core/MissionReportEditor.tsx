import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useOSStore } from '@/store/useOSStore'
import { missionService } from '@/services/missionService'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import type { MissionReport, MissionSquad, MissionCharacter, MissionContract, MissionAsset } from '@/types/mission'
import { CoreInp, CoreTextarea, CoreSelect, CoreListEditor, CoreAddBtn, CoreRemoveBtn, CoreLabel } from './CoreField'

const SQUAD_STATUSES = ['COMPLETATA', 'COMPLETATA CON DANNI', 'CONTRATTO APERTO', 'FALLITA', 'IN CORSO', 'DISPERSA']
const ALIGNMENTS = ['ally', 'contract', 'hostile', 'neutral']
const ALIGNMENT_LABELS: Record<string, string> = { ally: 'ALLEATO', contract: 'CONTRATTO', hostile: 'OSTILE', neutral: 'NEUTRO' }
const PAGES = ['METADATI', 'INTEL', 'SQUADRE', 'SCOPERTE', 'PERSONAGGI', 'CONTRATTI', 'ASSET', 'PRIORITÀ']

export function MissionReportEditor() {
  const { missions, updateMission } = useOSStore()
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [selectedId, setSelectedId] = useState<string>('')
  const [report, setReport] = useState<MissionReport>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const tabsRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (tabsRef.current && activeTabRef.current) {
      activeTabRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [page])

  const selectMission = (id: string) => {
    setSelectedId(id)
    const m = missions.find(m => m.id === id)
    setReport(m?.report ? { ...m.report } : {})
  }

  const set = <K extends keyof MissionReport>(key: K, value: MissionReport[K]) =>
    setReport(p => ({ ...p, [key]: value }))

  const handleSave = async () => {
    if (!selectedId) return
    setSaving(true)
    try {
      updateMission(await missionService.updateReport(selectedId, report))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('[CORE//REPORT] Salvataggio fallito:', err)
    } finally {
      setSaving(false)
    }
  }

  const updateSquad    = (i: number, patch: Partial<MissionSquad>)    => set('squads',      (report.squads      ?? []).map((s, j) => j === i ? { ...s, ...patch } : s))
  const updateChar     = (i: number, patch: Partial<MissionCharacter>) => set('characters',  (report.characters  ?? []).map((c, j) => j === i ? { ...c, ...patch } : c))
  const updateContract = (i: number, patch: Partial<MissionContract>)  => set('contracts',   (report.contracts   ?? []).map((c, j) => j === i ? { ...c, ...patch } : c))
  const updateDisc     = (i: number, patch: Partial<{ icon: string; title: string; description: string }>) =>
    set('discoveries', (report.discoveries ?? []).map((d, j) => j === i ? { ...d, ...patch } : d))
  const updateAsset    = (i: number, patch: Partial<MissionAsset>)     => set('assets',      (report.assets      ?? []).map((a, j) => j === i ? { ...a, ...patch } : a))

  const removeFrom = <K extends 'squads' | 'discoveries' | 'characters' | 'contracts' | 'assets'>(key: K, i: number) =>
    set(key, ((report[key] ?? []) as unknown[]).filter((_, j) => j !== i) as MissionReport[K])

  const pages: React.ReactNode[] = [
    <div className="grid grid-cols-2 gap-3">
      <CoreInp label="DATA" value={report.date ?? ''} onChange={v => set('date', v)} placeholder="es. 25.04.2026" />
      <CoreInp label="LUOGO" value={report.place ?? ''} onChange={v => set('place', v)} placeholder="es. 03.xx EMPUSA" />
    </div>,

    <CoreListEditor label="INTEL LIVE" items={report.intel ?? []} onChange={v => set('intel', v)} />,

    <div className="space-y-2">
      {(report.squads ?? []).map((sq, i) => (
        <div key={i} className="border border-bc-border/40 rounded p-3 bg-bc-dark/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-bc-amber/60">SQ.{sq.number}</span>
            <CoreRemoveBtn onClick={() => removeFrom('squads', i)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <CoreInp label="NOME"     value={sq.name}     onChange={v => updateSquad(i, { name: v })} />
            <CoreInp label="LOCATION" value={sq.location} onChange={v => updateSquad(i, { location: v })} />
            <CoreInp label="TIPO"     value={sq.type}     onChange={v => updateSquad(i, { type: v })} />
            <CoreSelect label="STATO" value={Array.isArray(sq.status) ? sq.status[0] : sq.status} onChange={v => updateSquad(i, { status: v })} options={SQUAD_STATUSES} />
          </div>
          <CoreTextarea label="DESCRIZIONE" value={sq.description} onChange={v => updateSquad(i, { description: v })} />
        </div>
      ))}
      <CoreAddBtn label="AGGIUNGI SQUADRA" onClick={() => set('squads', [...(report.squads ?? []), { number: (report.squads?.length ?? 0) + 1, name: '', location: '', type: '', description: '', status: 'IN CORSO' }])} />
    </div>,

    <div className="space-y-2">
      {(report.discoveries ?? []).map((d, i) => (
        <div key={i} className="border border-bc-border/40 rounded p-3 bg-bc-dark/40 space-y-2">
          <div className="flex justify-end"><CoreRemoveBtn onClick={() => removeFrom('discoveries', i)} /></div>
          <div className="grid grid-cols-[60px_1fr] gap-2">
            <CoreInp label="ICONA"  value={d.icon}  onChange={v => updateDisc(i, { icon: v })} />
            <CoreInp label="TITOLO" value={d.title} onChange={v => updateDisc(i, { title: v })} />
          </div>
          <CoreTextarea label="DESCRIZIONE" value={d.description} onChange={v => updateDisc(i, { description: v })} />
        </div>
      ))}
      <CoreAddBtn label="AGGIUNGI SCOPERTA" onClick={() => set('discoveries', [...(report.discoveries ?? []), { icon: 'diamond', title: '', description: '' }])} />
    </div>,

    <div className="space-y-2">
      {(report.characters ?? []).map((c, i) => (
        <div key={i} className="border border-bc-border/40 rounded p-3 bg-bc-dark/40 space-y-2">
          <div className="flex justify-end"><CoreRemoveBtn onClick={() => removeFrom('characters', i)} /></div>
          <div className="grid grid-cols-2 gap-2">
            <CoreInp label="NOME" value={c.name} onChange={v => updateChar(i, { name: v })} />
            <CoreSelect label="ALLINEAMENTO" value={c.alignment} onChange={v => updateChar(i, { alignment: v as MissionCharacter['alignment'] })} options={ALIGNMENTS} getLabel={v => ALIGNMENT_LABELS[v]} />
            <div className="col-span-2"><CoreInp label="RUOLO" value={c.role} onChange={v => updateChar(i, { role: v })} /></div>
          </div>
          <CoreTextarea label="DESCRIZIONE" value={c.description} onChange={v => updateChar(i, { description: v })} />
        </div>
      ))}
      <CoreAddBtn label="AGGIUNGI PERSONAGGIO" onClick={() => set('characters', [...(report.characters ?? []), { name: '', role: '', alignment: 'neutral', description: '' }])} />
    </div>,

    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-xs text-bc-amber/70">CONTRATTI</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={report.contractsIncompatible ?? false}
            onChange={e => set('contractsIncompatible', e.target.checked)} className="accent-bc-red" />
          <span className="font-mono text-xs text-bc-red/70">INCOMPATIBILI</span>
        </label>
      </div>
      {(report.contracts ?? []).map((ct, i) => (
        <div key={i} className="border border-bc-border/40 rounded p-3 bg-bc-dark/40 space-y-2">
          <div className="flex justify-end"><CoreRemoveBtn onClick={() => removeFrom('contracts', i)} /></div>
          <div className="grid grid-cols-2 gap-2">
            <CoreInp label="NOME"       value={ct.name}      onChange={v => updateContract(i, { name: v })} />
            <CoreInp label="CLIENTE"    value={ct.client}    onChange={v => updateContract(i, { client: v })} />
            <CoreInp label="OBIETTIVO"  value={ct.objective} onChange={v => updateContract(i, { objective: v })} />
            <CoreInp label="RICOMPENSA" value={ct.reward}    onChange={v => updateContract(i, { reward: v })} />
          </div>
          <CoreTextarea label="CONSEGUENZA" value={ct.consequence} onChange={v => updateContract(i, { consequence: v })} />
        </div>
      ))}
      <CoreAddBtn label="AGGIUNGI CONTRATTO" onClick={() => set('contracts', [...(report.contracts ?? []), { name: '', client: '', objective: '', reward: '', consequence: '' }])} />
    </div>,

    <div className="space-y-2">
      {(report.assets ?? []).map((a, i) => (
        <div key={i} className="border border-bc-border/40 rounded p-3 bg-bc-dark/40 space-y-2">
          <div className="flex justify-end"><CoreRemoveBtn onClick={() => removeFrom('assets', i)} /></div>
          <div className="grid grid-cols-2 gap-2">
            <CoreInp label="NOME" value={a.name} onChange={v => updateAsset(i, { name: v })} />
            <CoreInp label="CATEGORIA" value={a.category} onChange={v => updateAsset(i, { category: v })} />
          </div>
        </div>
      ))}
      <CoreAddBtn label="AGGIUNGI ASSET" onClick={() => set('assets', [...(report.assets ?? []), { name: '', category: '' }])} />
    </div>,

    <CoreListEditor label="PRIORITÀ" items={report.priorities ?? []} onChange={v => set('priorities', v)} />,
  ]

  return (
    <>
      <div className="bc-panel border border-bc-amber/40 p-4">
        <div className="bc-section-header" style={{ color: 'var(--bc-amber)' }}>EDITOR REPORT MISSIONE</div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <CustomSelect
              value={selectedId}
              onChange={selectMission}
              options={missions.map(m => m.id)}
              getLabel={id => missions.find(m => m.id === id)?.title ?? id}
              dropUp
            />
          </div>
          <button className="bc-btn-amber px-4 py-2 shrink-0" disabled={!selectedId} onClick={() => { setPage(0); setOpen(true) }}>
            APRI EDITOR
          </button>
        </div>
      </div>

      {open && typeof document !== 'undefined' && document.body && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" style={{ background: 'rgba(9,9,14,0.75)', backdropFilter: 'blur(4px)' }} onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
          <div className="w-full sm:max-w-2xl bg-bc-panel border border-bc-amber/40 rounded-xl shadow-[0_0_40px_rgba(251,191,36,0.1)] flex flex-col max-h-[80dvh] sm:max-h-[85vh]">

            <div className="flex items-start justify-between px-4 py-3 border-b border-bc-border shrink-0 gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[10px] text-bc-amber/50 uppercase tracking-widest mb-0.5">EDITOR REPORT</div>
                <span className="font-display text-sm font-bold text-bc-amber tracking-wider leading-snug break-words block">
                  {missions.find(m => m.id === selectedId)?.title}
                </span>
              </div>
              <button className="p-1 text-bc-text/70 hover:text-bc-red transition-colors shrink-0 mt-0.5" onClick={() => setOpen(false)}>
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            <div ref={tabsRef} className="flex items-center sm:justify-center px-3 py-2 border-b border-bc-border/40 shrink-0 gap-1 overflow-x-auto scroll-smooth" style={{ scrollbarWidth: 'none' }}>
              {PAGES.map((p, i) => (
                <button
                  key={i}
                  ref={i === page ? activeTabRef : undefined}
                  onClick={() => setPage(i)}
                  className={`font-mono text-[10px] px-2.5 py-1 rounded shrink-0 transition-colors ${
                    i === page
                      ? 'bg-bc-amber/20 text-bc-amber border border-bc-amber/40'
                      : 'text-bc-muted/60 hover:text-bc-muted border border-transparent'
                  }`}>
                  {p}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {pages[page]}
            </div>

            <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-bc-border/40 shrink-0">
              <button
                className="flex items-center gap-1 font-mono text-xs px-3 py-2 border border-bc-muted/30 text-bc-muted hover:border-bc-text hover:text-bc-text transition-all disabled:opacity-30"
                onClick={() => setPage(p => p - 1)} disabled={page === 0}>
                <ChevronLeft size={14} /> INDIETRO
              </button>
              <button className="bc-btn-amber px-4 py-2" onClick={handleSave} disabled={saving}>
                {saving ? 'SALVATAGGIO...' : saved ? <span className="flex items-center gap-1"><Check size={12} strokeWidth={2.5} /> SALVATO</span> : 'SALVA'}
              </button>
              <button
                className="flex items-center gap-1 font-mono text-xs px-3 py-2 border border-bc-muted/30 text-bc-muted hover:border-bc-text hover:text-bc-text transition-all disabled:opacity-30"
                onClick={() => setPage(p => p + 1)} disabled={page === PAGES.length - 1}>
                AVANTI <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
