import { useState } from "react";
import { useOSStore } from "@/store/useOSStore";
import { systemService } from "@/services/systemService";
import type { HangarItem } from "@/types/system";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { NumericStepper } from "@/components/ui/NumericStepper";
import { RefreshCw, Pencil, X, Plus } from 'lucide-react'
import { TradeBoardWidget } from "@/components/ui/TradeBoardWidget";



const CATEGORY_STYLE: Record<HangarItem["category"], string> = {
  Sistema:  "text-bc-blue  border-bc-blue/40  bg-bc-blue/10",
  Modulo:   "text-bc-accent border-bc-accent/40 bg-bc-accent/10",
  Batteria: "text-bc-blue  border-bc-blue/40  bg-bc-blue/10",
  Mech:     "text-bc-muted border-bc-muted/40 bg-bc-muted/10",
  Telaio:   "text-bc-amber border-bc-amber/40 bg-bc-amber/10",
  Altro:    "text-bc-muted border-bc-muted/40 bg-bc-muted/10",
};

const STATUS_DOT: Record<HangarItem["status"], string> = {
  normale: "bg-bc-green shadow-[0_0_4px_var(--bc-green)]",
  danneggiato: "bg-bc-amber shadow-[0_0_4px_var(--bc-amber)]",
  distrutto: "bg-bc-red   shadow-[0_0_4px_var(--bc-red)]",
};
const STATUS_TEXT: Record<HangarItem["status"], string> = {
  normale:     "text-bc-green border-bc-green/30",
  danneggiato: "text-bc-amber border-bc-amber/30",
  distrutto:   "text-bc-red border-bc-red/30",
};

const BLANK_ITEM: HangarItem = {
  name: "",
  category: "Sistema",
  tec: undefined,
  quantity: 1,
  status: "normale",
};

export function HangarInterface() {
  const { crawlerSystem, setCrawlerSystem, isOperator } = useOSStore();
  const inventory: HangarItem[] = crawlerSystem?.inventory ?? [];

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<HangarItem>({ ...BLANK_ITEM });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const saveInventory = async (items: HangarItem[]) => {
    if (!crawlerSystem) return;
    setSaving(true);
    try {
      const updated = await systemService.update({ inventory: items });
      setCrawlerSystem(updated);
    } catch (err) {
      console.error("[HANGAR] Salvataggio fallito:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    const item: HangarItem = { ...form, tec: form.tec || null };
    const next =
      editIndex !== null
        ? inventory.map((x, i) => (i === editIndex ? item : x))
        : [...inventory, item];
    await saveInventory(next);
    setShowForm(false);
    setEditIndex(null);
    setForm({ ...BLANK_ITEM });
  };

  const handleEdit = (i: number) => {
    setForm({ ...inventory[i] });
    setEditIndex(i);
    setShowForm(true);
  };

  const handleDelete = async (i: number) => {
    await saveInventory(inventory.filter((_, idx) => idx !== i));
  };

  const handleStatusCycle = async (i: number) => {
    const order: HangarItem["status"][] = [
      "normale",
      "danneggiato",
      "distrutto",
    ];
    const cur = inventory[i].status;
    const next = order[(order.indexOf(cur) + 1) % order.length];
    const items = inventory.map((x, idx) =>
      idx === i ? { ...x, status: next } : x,
    );
    await saveInventory(items);
  };

  const grouped = (
    ["Sistema", "Modulo", "Mech", "Telaio", "Batteria", "Altro"] as HangarItem["category"][]
  )
    .map((cat) => ({
      cat,
      items: inventory
        .map((x, i) => ({ x, i }))
        .filter(({ x }) => x.category === cat),
    }))
    .filter(({ items }) => items.length > 0);

  return (
    <div className="h-full overflow-y-auto p-3"><div className="space-y-3 animate-boot-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-bc-border pb-3">
        <div>
          <h1 className="font-display text-lg font-bold text-bc-green text-glow tracking-widest">
            HANGAR // INVENTARIO
          </h1>
          <p className="font-mono text-xs text-bc-muted mt-0.5">
            {inventory.length} oggetti registrati
          </p>
        </div>
        {isOperator && (
          <button
            className="bc-btn bc-btn-amber self-end sm:self-auto flex items-center gap-1.5"
            onClick={() => {
              setForm({ ...BLANK_ITEM });
              setEditIndex(null);
              setShowForm(true);
            }}
          >
            <Plus size={12} strokeWidth={2.5} /> AGGIUNGI
          </button>
        )}
      </div>

      <div className="shrink-0 h-px bg-bc-track" />

      <div className="flex flex-col lg:flex-row gap-3 lg:items-start">

        <div className="flex flex-col gap-3 lg:flex-[3] min-w-0">
          {showForm && isOperator && (
            <div className="shrink-0 bg-bc-panel border border-bc-amber/40 rounded-xl p-4 border-glow-amber">
              <p className="font-mono text-xs text-bc-amber/70 uppercase tracking-widest mb-3">
                {editIndex !== null ? "MODIFICA OGGETTO" : "NUOVO OGGETTO"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="font-mono text-xs text-bc-muted block mb-1">NOME</label>
                  <input
                    className="bc-input border-bc-amber/40 text-bc-amber focus:border-bc-amber"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-bc-muted block mb-1">CATEGORIA</label>
                  <CustomSelect
                    value={form.category}
                    onChange={(v) => setForm((p) => ({ ...p, category: v as HangarItem["category"] }))}
                    options={['Sistema', 'Modulo', 'Batteria', 'Mech', 'Telaio', 'Altro']}
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-bc-muted block mb-1">LIVELLO TEC</label>
                  <NumericStepper
                    value={form.tec}
                    onChange={(v) => setForm((p) => ({ ...p, tec: v }))}
                    min={1}
                    nullable
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-bc-muted block mb-1">QUANTITÀ</label>
                  <NumericStepper
                    value={form.quantity}
                    onChange={(v) => setForm((p) => ({ ...p, quantity: v ?? 1 }))}
                    min={1}
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-bc-muted block mb-1">STATO</label>
                  <CustomSelect
                    value={form.status}
                    onChange={(v) => setForm((p) => ({ ...p, status: v as HangarItem["status"] }))}
                    options={['normale', 'danneggiato', 'distrutto']}
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-bc-muted block mb-1">NOTE</label>
                  <input
                    className="bc-input border-bc-amber/40 text-bc-amber focus:border-bc-amber"
                    placeholder="—"
                    value={form.notes ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="bc-btn-amber flex-1 py-1.5 font-mono text-xs"
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? "SALVATAGGIO..." : editIndex !== null ? "AGGIORNA" : "AGGIUNGI"}
                </button>
                <button
                  className="font-mono text-xs text-bc-muted border border-bc-muted/30 px-4 py-1.5 hover:border-bc-red hover:text-bc-red transition-all"
                  onClick={() => { setShowForm(false); setEditIndex(null); }}
                >
                  ANNULLA
                </button>
              </div>
            </div>
          )}

          <style>{`@media(min-width:768px){.hangar-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`}</style>
          {grouped.length === 0 ? (
            <p className="font-mono text-xs text-bc-muted">Nessuna voce nell'hangar.</p>
          ) : (
            <div className="hangar-grid grid grid-cols-1 sm:grid-cols-2 gap-3">
              {grouped.map(({ cat, items }) => (
                <div key={cat} className="bg-bc-panel border border-bc-border rounded-xl overflow-hidden flex flex-col sm:min-h-[200px]">
                  <div className="px-3 py-2.5 border-b border-bc-border flex items-center gap-2 bg-gradient-to-r from-bc-amber/20 via-bc-amber/8 to-transparent">
                    <span className={`font-mono text-xs font-bold uppercase tracking-widest border px-1.5 py-0.5 ${CATEGORY_STYLE[cat]}`}>{cat}</span>
                    <span className="font-mono text-xs text-bc-muted">{items.length}</span>
                  </div>
                  <div className="divide-y divide-bc-border flex-1">
                    {items.map(({ x: item, i }) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2.5 group">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[item.status]}`} />
                        <div className="flex-1 min-w-0">
                          <span className={`font-sans text-sm font-semibold leading-snug ${item.status === 'distrutto' ? 'line-through text-bc-muted' : 'text-bc-text'}`}>
                            {item.name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}
                          </span>
                          {item.notes && <p className="font-mono text-xs text-bc-muted mt-0.5 leading-snug">{item.notes}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {item.status !== 'normale' && (
                            <span className={`font-mono text-xs border px-1 ${STATUS_TEXT[item.status]}`}>{item.status.toUpperCase()}</span>
                          )}
                          {item.tec != null && (
                            <span className="font-mono text-xs text-bc-muted border border-bc-muted/30 px-1">T{item.tec}</span>
                          )}
                          {isOperator && (
                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="text-bc-muted hover:text-bc-amber p-0.5" onClick={() => handleStatusCycle(i)}><RefreshCw size={10} strokeWidth={2} /></button>
                              <button className="text-bc-muted hover:text-bc-blue p-0.5" onClick={() => handleEdit(i)}><Pencil size={10} strokeWidth={2} /></button>
                              <button className="text-bc-muted hover:text-bc-red p-0.5" onClick={() => handleDelete(i)}><X size={10} strokeWidth={2} /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:w-[47%] shrink-0 lg:sticky lg:top-0">
          <TradeBoardWidget /></div>

      </div>
    </div></div>
  );
}
