import { useState } from 'react'
import { systemService } from '@/services/systemService'
import { journalService } from '@/services/journalService'
import { useOSStore } from '@/store/useOSStore'
import type { CrawlerSection } from '@/types/system'

const EMPTY_SECTION: CrawlerSection = { name: '', detail: '', status: 'active' }

export function OverrideConsole() {
  const { crawlerSystem, setCrawlerSystem, addJournalEntry } = useOSStore()
  const [form, setForm] = useState({
    crawler_name:         crawlerSystem?.crawler_name         ?? 'SANCTUARY',
    crawler_type:         crawlerSystem?.crawler_type         ?? "d'Ingegneria",
    scrap:                String(crawlerSystem?.scrap         ?? 0),
    engineers:            String(crawlerSystem?.engineers     ?? 0),
    ps_current:           String(crawlerSystem?.ps_current    ?? 0),
    ps_max:               String(crawlerSystem?.ps_max        ?? 0),
    enhancement_current:  String(crawlerSystem?.enhancement_current ?? 0),
    enhancement_max:      String(crawlerSystem?.enhancement_max     ?? 0),
    maintenance_cost:     String(crawlerSystem?.maintenance_cost    ?? 0),
    repair_status:        crawlerSystem?.repair_status   ?? 'NOMINALE',
    merchant_bridge:      crawlerSystem?.merchant_bridge ?? '',
  })
  const [sections, setSections] = useState<CrawlerSection[]>(
    crawlerSystem?.sections ?? []
  )
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  const num = (k: string) => parseInt(form[k as keyof typeof form] as string) || 0

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await systemService.update({
        crawler_name:        form.crawler_name,
        crawler_type:        form.crawler_type,
        scrap:               num('scrap'),
        engineers:           num('engineers'),
        ps_current:          num('ps_current'),
        ps_max:              num('ps_max'),
        enhancement_current: num('enhancement_current'),
        enhancement_max:     num('enhancement_max'),
        maintenance_cost:    num('maintenance_cost'),
        repair_status:       form.repair_status,
        merchant_bridge:     form.merchant_bridge,
        sections:            sections.filter((s) => s.name.trim() !== ''),
      })
      setCrawlerSystem(updated)
      const entry = await journalService.create({
        title: 'OVERRIDE SISTEMA // STATO CRAWLER AGGIORNATO',
        content: `Override eseguito. ROTTAMI: ${form.scrap} | INGEGNERI: ${form.engineers} | PS: ${form.ps_current}/${form.ps_max} | POT: ${form.enhancement_current}/${form.enhancement_max} | STATO: ${form.repair_status}`,
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

  const inp = (key: string, label: string, type: 'text' | 'number' = 'text') => (
    <div>
      <label className="font-mono text-xs text-bc-amber/70 block mb-1">{label}</label>
      <input
        type={type}
        className="bc-input border-bc-amber/40 text-bc-amber focus:border-bc-amber"
        value={form[key as keyof typeof form]}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
      />
    </div>
  )

  const updateSection = (i: number, field: keyof CrawlerSection, value: string) => {
    setSections((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  return (
    <div className="bc-panel border border-bc-amber/40 p-4 border-glow-amber overflow-hidden">
      <div className="bc-section-header" style={{ color: 'var(--bc-amber)' }}>
        ⚠ // CONSOLE OVERRIDE — STATO CRAWLER
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {inp('crawler_name', 'NOME CRAWLER')}
        {inp('crawler_type', 'TIPOLOGIA')}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {inp('scrap',     'ROTTAMI',    'number')}
        {inp('engineers', 'INGEGNERI',  'number')}
        {inp('maintenance_cost', 'MANUTENZIONE', 'number')}
        {inp('repair_status', 'STATO')}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {inp('ps_current', 'PS CORRENTI', 'number')}
        {inp('ps_max',     'PS MAX',      'number')}
        {inp('enhancement_current', 'POTENZIAMENTO', 'number')}
        {inp('enhancement_max',     'POT. MAX',      'number')}
      </div>

      <div className="mb-4">
        <label className="font-mono text-xs text-bc-amber/70 block mb-1">PONTE MERCANTE</label>
        <input
          className="bc-input border-bc-amber/40 text-bc-amber focus:border-bc-amber"
          value={form.merchant_bridge}
          onChange={(e) => setForm((p) => ({ ...p, merchant_bridge: e.target.value }))}
        />
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="font-mono text-xs text-bc-amber/70">SEZIONI</label>
          <button
            className="font-mono text-xs text-bc-amber/60 border border-bc-amber/30 px-2 py-0.5 hover:border-bc-amber hover:text-bc-amber transition-all"
            onClick={() => setSections((p) => [...p, { ...EMPTY_SECTION }])}
          >
            + AGGIUNGI
          </button>
        </div>
        <div className="space-y-2">
          {sections.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                className="bc-input border-bc-amber/40 text-bc-amber focus:border-bc-amber w-28 shrink-0 text-xs"
                value={s.status}
                onChange={(e) => updateSection(i, 'status', e.target.value)}
              >
                <option value="active">ATTIVA</option>
                <option value="empty">VUOTA</option>
                <option value="damaged">DANNEG.</option>
              </select>
              <input
                className="bc-input border-bc-amber/40 text-bc-amber focus:border-bc-amber flex-1 min-w-0"
                placeholder="Nome sezione"
                value={s.name}
                onChange={(e) => updateSection(i, 'name', e.target.value)}
              />
              <input
                className="bc-input border-bc-amber/40 text-bc-amber focus:border-bc-amber flex-1 min-w-0"
                placeholder="Dettaglio"
                value={s.detail ?? ''}
                onChange={(e) => updateSection(i, 'detail', e.target.value)}
              />
              <button
                className="font-mono text-xs text-bc-muted hover:text-bc-red transition-colors shrink-0 px-1"
                onClick={() => setSections((p) => p.filter((_, idx) => idx !== i))}
              >✕</button>
            </div>
          ))}
        </div>
      </div>

      <button className="bc-btn-amber w-full py-2" onClick={handleSave} disabled={saving}>
        {saving ? 'ESECUZIONE OVERRIDE...' : saved ? '✓ OVERRIDE COMPLETATO' : 'ESEGUI OVERRIDE'}
      </button>
    </div>
  )
}
