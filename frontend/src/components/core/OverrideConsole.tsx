import { useState } from 'react'
import { systemService } from '@/services/systemService'
import { journalService } from '@/services/journalService'
import { useOSStore } from '@/store/useOSStore'
import { CoreInp, CoreNumInp, CoreLabel, CoreAddBtn, CoreRemoveBtn } from './CoreField'
import { Check, AlertTriangle } from 'lucide-react'

export function OverrideConsole() {
  const { crawlerSystem, setCrawlerSystem, addJournalEntry } = useOSStore()
  const [bridgeItems, setBridgeItems] = useState<string[]>(
    crawlerSystem?.merchant_bridge
      ? crawlerSystem.merchant_bridge.split('|').map(s => s.trim()).filter(Boolean)
      : []
  )
  const [form, setForm] = useState({
    crawler_name:         crawlerSystem?.crawler_name        ?? '',
    crawler_type:         crawlerSystem?.crawler_type        ?? '',
    crawler_tec:          crawlerSystem?.crawler_tec         ?? 0,
    scrap:                crawlerSystem?.scrap               ?? '',
    engineers:            crawlerSystem?.engineers           ?? 0,
    ps_current:           crawlerSystem?.ps_current          ?? 0,
    ps_max:               crawlerSystem?.ps_max              ?? 0,
    enhancement_current:  crawlerSystem?.enhancement_current ?? 0,
    enhancement_max:      crawlerSystem?.enhancement_max     ?? 0,
    maintenance_cost:     crawlerSystem?.maintenance_cost    ?? 0,
    repair_status:        crawlerSystem?.repair_status       ?? 'NOMINALE',
  })
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  const setNum = (key: string) => (v: number | undefined) => setForm(p => ({ ...p, [key]: v ?? 0 }))
  const setTxt = (key: string) => (v: string) => setForm(p => ({ ...p, [key]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await systemService.update({
        ...form,
        merchant_bridge: bridgeItems.filter(Boolean).join(' | '),
      })
      setCrawlerSystem(updated)
      const entry = await journalService.create({
        title: 'OVERRIDE SISTEMA // STATO CRAWLER AGGIORNATO',
        content: `Override eseguito. ROTTAMI: ${form.scrap} | INGEGNERI: ${form.engineers} | PS: ${form.ps_current}/${form.ps_max} | POT: ${form.enhancement_current}/${form.enhancement_max} | STATO: ${form.repair_status} | PONTE: ${bridgeItems.join(', ')}`,
        type: 'override',
        author: 'OPERATORE SISTEMA',
      })
      addJournalEntry(entry)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('[CRAWLER//OS] Override fallito:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bc-panel border border-bc-amber/40 p-3 border-glow-amber overflow-hidden h-full flex flex-col">
      <div className="bc-section-header flex items-center gap-1.5" style={{ color: 'var(--bc-amber)' }}>
        <AlertTriangle size={12} strokeWidth={2} /> CONSOLE OVERRIDE — STATO CRAWLER
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
        <CoreInp label="NOME CRAWLER" value={form.crawler_name} onChange={setTxt('crawler_name')} />
        <CoreInp label="TIPOLOGIA" value={form.crawler_type} onChange={setTxt('crawler_type')} />
        <CoreNumInp label="LIVELLO TEC" value={form.crawler_tec} onChange={setNum('crawler_tec')} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <CoreInp    label="ROTTAMI"      value={form.scrap}            onChange={setTxt('scrap')} placeholder="es. 9 T3 | 6 T4" />
        <CoreNumInp label="INGEGNERI"    value={form.engineers}        onChange={setNum('engineers')} />
        <CoreNumInp label="MANUTENZIONE" value={form.maintenance_cost} onChange={setNum('maintenance_cost')} />
        <CoreInp    label="STATO"        value={form.repair_status}    onChange={setTxt('repair_status')} />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <CoreNumInp label="P.S. CORRENTI" value={form.ps_current}          onChange={setNum('ps_current')} />
        <CoreNumInp label="P.S. MAX"       value={form.ps_max}              onChange={setNum('ps_max')} />
        <CoreNumInp label="POTENZIAMENTO" value={form.enhancement_current} onChange={setNum('enhancement_current')} />
        <CoreNumInp label="POT. MAX"      value={form.enhancement_max}     onChange={setNum('enhancement_max')} />
      </div>

      <div className="mb-3">
        <CoreLabel>PONTE MERCANTILE</CoreLabel>
        <div className="space-y-1.5">
          {bridgeItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className="bc-input border-bc-amber/40 text-bc-amber focus:border-bc-amber flex-1"
                value={item}
                onChange={e => setBridgeItems(p => p.map((v, j) => j === i ? e.target.value : v))}
                placeholder="Voce ponte mercantile..."
              />
              <CoreRemoveBtn onClick={() => setBridgeItems(p => p.filter((_, j) => j !== i))} />
            </div>
          ))}
          <CoreAddBtn label="AGGIUNGI VOCE" onClick={() => setBridgeItems(p => [...p, ''])} />
        </div>
      </div>

      <button className="bc-btn-amber w-full py-2" onClick={handleSave} disabled={saving}>
        {saving ? 'ESECUZIONE OVERRIDE...' : saved ? <span className="flex items-center justify-center gap-1"><Check size={12} strokeWidth={2.5} /> OVERRIDE COMPLETATO</span> : 'ESEGUI OVERRIDE'}
      </button>
    </div>
  )
}
