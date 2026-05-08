import { useState } from 'react'
import { systemService } from '@/services/systemService'
import { journalService } from '@/services/journalService'
import { useOSStore } from '@/store/useOSStore'
import { NumericStepper } from '@/components/ui/NumericStepper'

export function OverrideConsole() {
  const { crawlerSystem, setCrawlerSystem, addJournalEntry } = useOSStore()
  const [bridgeItems, setBridgeItems] = useState<string[]>(
    crawlerSystem?.merchant_bridge
      ? crawlerSystem.merchant_bridge.split('|').map(s => s.trim()).filter(Boolean)
      : []
  )

  const [form, setForm] = useState({
    crawler_name:         crawlerSystem?.crawler_name        ?? 'SANCTUARY',
    crawler_type:         crawlerSystem?.crawler_type        ?? "d'Ingegneria",
    scrap:                crawlerSystem?.scrap               ?? 0,
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

  const setNum = (key: string) => (v: number | undefined) =>
    setForm(p => ({ ...p, [key]: v ?? 0 }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await systemService.update({
        crawler_name:        form.crawler_name,
        crawler_type:        form.crawler_type,
        scrap:               form.scrap,
        engineers:           form.engineers,
        ps_current:          form.ps_current,
        ps_max:              form.ps_max,
        enhancement_current: form.enhancement_current,
        enhancement_max:     form.enhancement_max,
        maintenance_cost:    form.maintenance_cost,
        repair_status:       form.repair_status,
        merchant_bridge:     bridgeItems.filter(Boolean).join(' | '),
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

  const textInp = (key: string, label: string) => (
    <div>
      <label className="font-mono text-xs text-bc-amber/70 block mb-1">{label}</label>
      <input
        type="text"
        className="bc-input border-bc-amber/40 text-bc-amber focus:border-bc-amber"
        value={form[key as keyof typeof form] as string}
        onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))}
      />
    </div>
  )

  const numInp = (key: string, label: string) => (
    <div>
      <label className="font-mono text-xs text-bc-amber/70 block mb-1">{label}</label>
      <NumericStepper
        value={form[key as keyof typeof form] as number}
        onChange={setNum(key)}
        min={0}
      />
    </div>
  )

  return (
    <div className="bc-panel border border-bc-amber/40 p-4 border-glow-amber overflow-hidden">
      <div className="bc-section-header" style={{ color: 'var(--bc-amber)' }}>
        ⚠ // CONSOLE OVERRIDE — STATO CRAWLER
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {textInp('crawler_name', 'NOME CRAWLER')}
        {textInp('crawler_type', 'TIPOLOGIA')}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {numInp('scrap',            'ROTTAMI')}
        {numInp('engineers',        'INGEGNERI')}
        {numInp('maintenance_cost', 'MANUTENZIONE')}
        {textInp('repair_status',   'STATO')}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {numInp('ps_current',          'PS CORRENTI')}
        {numInp('ps_max',              'PS MAX')}
        {numInp('enhancement_current', 'POTENZIAMENTO')}
        {numInp('enhancement_max',     'POT. MAX')}
      </div>

      <div className="mb-5">
        <label className="font-mono text-xs text-bc-amber/70 block mb-2">PONTE MERCANTILE</label>
        <div className="space-y-2">
          {bridgeItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className="bc-input border-bc-amber/40 text-bc-amber focus:border-bc-amber flex-1"
                value={item}
                onChange={(e) => setBridgeItems(p => p.map((v, j) => j === i ? e.target.value : v))}
                placeholder="Voce ponte mercantile..."
              />
              <button
                type="button"
                className="font-mono text-xs text-bc-muted hover:text-bc-red transition-colors px-2 py-1 border border-bc-muted/30 hover:border-bc-red/40"
                onClick={() => setBridgeItems(p => p.filter((_, j) => j !== i))}
              >✕</button>
            </div>
          ))}
          <button
            type="button"
            className="font-mono text-xs text-bc-amber/60 hover:text-bc-amber transition-colors border border-bc-amber/20 hover:border-bc-amber/40 px-3 py-1.5 w-full"
            onClick={() => setBridgeItems(p => [...p, ''])}
          >+ AGGIUNGI VOCE</button>
        </div>
      </div>

      <button className="bc-btn-amber w-full py-2" onClick={handleSave} disabled={saving}>
        {saving ? 'ESECUZIONE OVERRIDE...' : saved ? '✓ OVERRIDE COMPLETATO' : 'ESEGUI OVERRIDE'}
      </button>
    </div>
  )
}
