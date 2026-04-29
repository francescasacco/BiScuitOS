import { useState } from 'react'
import { systemService } from '@/services/systemService'
import { journalService } from '@/services/journalService'
import { useOSStore } from '@/store/useOSStore'

export function OverrideConsole() {
  const { crawlerSystem, setCrawlerSystem, addJournalEntry } = useOSStore()
  const [form, setForm] = useState({
    scrap: String(crawlerSystem?.scrap ?? 0),
    fuel: String(crawlerSystem?.fuel ?? 0),
    engineers: String(crawlerSystem?.engineers ?? 0),
    repair_status: crawlerSystem?.repair_status ?? 'NOMINAL',
    active_alerts: crawlerSystem?.active_alerts ?? 'NONE',
    system_notes: crawlerSystem?.system_notes ?? '',
    merchant_bridge: crawlerSystem?.merchant_bridge ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await systemService.update({
        scrap: parseInt(form.scrap) || 0,
        fuel: parseInt(form.fuel) || 0,
        engineers: parseInt(form.engineers) || 0,
        repair_status: form.repair_status,
        active_alerts: form.active_alerts,
        system_notes: form.system_notes,
        merchant_bridge: form.merchant_bridge,
      })
      setCrawlerSystem(updated)

      const entry = await journalService.create({
        title: 'OVERRIDE SISTEMA // STATO CRAWLER AGGIORNATO',
        content: `Operatore ha eseguito override. Stato crawler sincronizzato.\nROTTAMI: ${form.scrap} | CARBURANTE: ${form.fuel} | INGEGNERI: ${form.engineers}\nRIPARAZIONE: ${form.repair_status} | ALERT: ${form.active_alerts}`,
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

  const FIELD_LABELS: Record<string, string> = {
    scrap: 'ROTTAMI',
    fuel: 'CARBURANTE',
    engineers: 'INGEGNERI',
  }

  return (
    <div className="bc-panel border border-bc-amber/40 p-4 border-glow-amber">
      <div className="bc-section-header" style={{ color: 'var(--bc-amber)' }}>
        ⚠ // CONSOLE OVERRIDE — STATO CRAWLER
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {['scrap', 'fuel', 'engineers'].map((field) => (
          <div key={field}>
            <label className="font-mono text-xs text-bc-amber/70 block mb-1">
              {FIELD_LABELS[field]}
            </label>
            <input
              type="number"
              className="bc-input border-bc-amber/40 text-bc-amber focus:border-bc-amber"
              value={form[field as keyof typeof form]}
              onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="font-mono text-xs text-bc-amber/70 block mb-1">STATO RIPARAZIONE</label>
          <input
            className="bc-input border-bc-amber/40 text-bc-amber focus:border-bc-amber"
            value={form.repair_status}
            onChange={(e) => setForm((p) => ({ ...p, repair_status: e.target.value }))}
          />
        </div>
        <div>
          <label className="font-mono text-xs text-bc-amber/70 block mb-1">PONTE MERCANTE</label>
          <input
            className="bc-input border-bc-amber/40 text-bc-amber focus:border-bc-amber"
            value={form.merchant_bridge}
            onChange={(e) => setForm((p) => ({ ...p, merchant_bridge: e.target.value }))}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="font-mono text-xs text-bc-amber/70 block mb-1">ALERT ATTIVI</label>
        <input
          className="bc-input border-bc-amber/40 text-bc-amber focus:border-bc-amber"
          value={form.active_alerts}
          onChange={(e) => setForm((p) => ({ ...p, active_alerts: e.target.value }))}
        />
      </div>

      <div className="mb-4">
        <label className="font-mono text-xs text-bc-amber/70 block mb-1">NOTE DI SISTEMA</label>
        <textarea
          className="bc-textarea border-bc-amber/40 text-bc-amber focus:border-bc-amber"
          rows={3}
          value={form.system_notes}
          onChange={(e) => setForm((p) => ({ ...p, system_notes: e.target.value }))}
        />
      </div>

      <button
        className="bc-btn-amber w-full py-2"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'ESECUZIONE OVERRIDE...' : saved ? '✓ OVERRIDE COMPLETATO' : 'ESEGUI OVERRIDE'}
      </button>
    </div>
  )
}
