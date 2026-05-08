import { useState } from 'react'
import { useOSStore } from '@/store/useOSStore'
import { systemService } from '@/services/systemService'
import type { HangarItem } from '@/types/system'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { NumericStepper } from '@/components/ui/NumericStepper'

const BLANK: HangarItem = { name: '', category: 'Sistema', tec: undefined, quantity: 1, status: 'normale' }

const STATUS_COLOR: Record<HangarItem['status'], string> = {
  normale:     'text-bc-green',
  danneggiato: 'text-bc-amber',
  distrutto:   'text-bc-red',
}
const STATUS_DOT: Record<HangarItem['status'], string> = {
  normale:     'bg-bc-green shadow-[0_0_4px_var(--bc-green)]',
  danneggiato: 'bg-bc-amber shadow-[0_0_4px_var(--bc-amber)]',
  distrutto:   'bg-bc-red shadow-[0_0_4px_var(--bc-red)]',
}

export function HangarManagement() {
  const { crawlerSystem, setCrawlerSystem } = useOSStore()
  const inventory: HangarItem[] = crawlerSystem?.inventory ?? []

  const [editIndex, setEditIndex] = useState<number | 'new' | null>(null)
  const [form, setForm] = useState<HangarItem>({ ...BLANK })
  const [saving, setSaving] = useState(false)

  const save = async (items: HangarItem[]) => {
    if (!crawlerSystem) return
    setSaving(true)
    try {
      const updated = await systemService.update({ inventory: items })
      setCrawlerSystem(updated)
    } catch (err) {
      console.error('[CORE//HANGAR] Salvataggio fallito:', err)
    } finally {
      setSaving(false)
    }
  }

  const openNew = () => {
    setForm({ ...BLANK })
    setEditIndex('new')
  }

  const openEdit = (i: number) => {
    setForm({ ...inventory[i] })
    setEditIndex(i)
  }

  const cancel = () => setEditIndex(null)

  const handleSave = async () => {
    if (!form.name.trim()) return
    const item: HangarItem = { ...form, tec: form.tec || null }
    const next = editIndex === 'new'
      ? [...inventory, item]
      : inventory.map((x, i) => (i === editIndex ? item : x))
    await save(next)
    setEditIndex(null)
  }

  const handleDelete = async (i: number) => {
    await save(inventory.filter((_, idx) => idx !== i))
    if (editIndex === i) setEditIndex(null)
  }

  const f = (key: keyof HangarItem, label: string, type: 'text' | 'number' = 'text') => (
    <div>
      <label className="font-mono text-xs text-bc-amber/70 block mb-1">{label}</label>
      <input
        type={type}
        className="bc-input border-bc-amber/40 text-bc-amber focus:border-bc-amber"
        value={(form[key] as string | number) ?? ''}
        onChange={(e) => setForm((p) => ({ ...p, [key]: type === 'number' ? (Number(e.target.value) || undefined) : e.target.value }))}
      />
    </div>
  )

  return (
    <div className="bc-panel border border-bc-amber/40 border-glow-amber h-full flex flex-col">
      <div className="flex items-center justify-between p-4 pb-3 shrink-0">
        <div className="bc-section-header mb-0 pb-0 border-0" style={{ color: 'var(--bc-amber)' }}>
          ◧ // GESTIONE HANGAR
        </div>
        <button
          className="font-mono text-xs text-bc-amber/60 border border-bc-amber/30 px-2 py-0.5 hover:border-bc-amber hover:text-bc-amber transition-all"
          onClick={openNew}
        >
          + AGGIUNGI
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
      {editIndex !== null && (
        <div className="mb-4 p-3 border border-bc-amber/20 rounded-lg bg-bc-dark space-y-3">
          <p className="font-mono text-xs text-bc-amber/60 uppercase tracking-widest">
            {editIndex === 'new' ? 'NUOVO OGGETTO' : 'MODIFICA OGGETTO'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {f('name', 'NOME')}
            <div>
              <label className="font-mono text-xs text-bc-amber/70 block mb-1">CATEGORIA</label>
              <CustomSelect
                value={form.category}
                onChange={(v) => setForm((p) => ({ ...p, category: v as HangarItem['category'] }))}
                options={['Sistema', 'Modulo', 'Telaio', 'Altro']}
              />
            </div>
            <div>
              <label className="font-mono text-xs text-bc-amber/70 block mb-1">TEC</label>
              <NumericStepper
                value={form.tec}
                onChange={(v) => setForm((p) => ({ ...p, tec: v }))}
                min={1}
                nullable
              />
            </div>
            <div>
              <label className="font-mono text-xs text-bc-amber/70 block mb-1">QUANTITÀ</label>
              <NumericStepper
                value={form.quantity}
                onChange={(v) => setForm((p) => ({ ...p, quantity: v ?? 1 }))}
                min={1}
              />
            </div>
            <div className="col-span-2">
              <label className="font-mono text-xs text-bc-amber/70 block mb-1">STATO</label>
              <CustomSelect
                value={form.status}
                onChange={(v) => setForm((p) => ({ ...p, status: v as HangarItem['status'] }))}
                options={['normale', 'danneggiato', 'distrutto']}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="bc-btn-amber flex-1 py-1.5 font-mono text-xs" onClick={handleSave} disabled={saving}>
              {saving ? 'SALVATAGGIO...' : 'SALVA'}
            </button>
            <button
              className="font-mono text-xs text-bc-muted border border-bc-muted/30 px-3 py-1.5 hover:border-bc-red hover:text-bc-red transition-all"
              onClick={cancel}
            >
              ANNULLA
            </button>
          </div>
        </div>
      )}

      {/* Item list */}
      {inventory.length === 0 ? (
        <p className="font-mono text-xs text-bc-muted">Nessun oggetto nell&apos;inventario.</p>
      ) : (
        <div className="space-y-1">
          {inventory.map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-colors ${editIndex === i ? 'bg-bc-amber/5' : 'hover:bg-bc-dark'}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[item.status]}`} />
              <span className="font-sans text-sm text-bc-text flex-1 min-w-0 truncate">
                {item.name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}
              </span>
              <span className="font-mono text-xs text-bc-muted shrink-0">
                {item.category}{item.tec != null ? ` T${item.tec}` : ''}
              </span>
              <span className={`font-mono text-xs shrink-0 ${STATUS_COLOR[item.status]}`}>{item.status}</span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  className="font-mono text-xs text-bc-muted hover:text-bc-blue transition-colors px-1"
                  onClick={() => openEdit(i)}
                >✎</button>
                <button
                  className="font-mono text-xs text-bc-muted hover:text-bc-red transition-colors px-1"
                  onClick={() => handleDelete(i)}
                >✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
