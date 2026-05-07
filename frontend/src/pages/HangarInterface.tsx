import { useState } from "react";
import { useOSStore } from "@/store/useOSStore";
import { systemService } from "@/services/systemService";
import type { HangarItem } from "@/types/system";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { NumericStepper } from "@/components/ui/NumericStepper";

const DEFAULT_INVENTORY: HangarItem[] = [
  {
    name: "Scudo Rinforzato",
    category: "Sistema",
    tec: 2,
    quantity: 1,
    status: "normale",
  },
  {
    name: "Bengala a Reattore",
    category: "Modulo",
    tec: 1,
    quantity: 1,
    status: "normale",
  },
  {
    name: "Telaio Hussair",
    category: "Telaio",
    tec: null,
    quantity: 1,
    status: "danneggiato",
  },
  {
    name: "Antenna",
    category: "Sistema",
    tec: 2,
    quantity: 4,
    status: "normale",
  },
];

const CATEGORY_STYLE: Record<HangarItem["category"], string> = {
  Sistema: "text-bc-blue  border-bc-blue/40  bg-bc-blue/10",
  Modulo: "text-bc-accent border-bc-accent/40 bg-bc-accent/10",
  Telaio: "text-bc-amber border-bc-amber/40 bg-bc-amber/10",
  Altro: "text-bc-muted border-bc-muted/40 bg-bc-muted/10",
};

const STATUS_DOT: Record<HangarItem["status"], string> = {
  normale: "bg-bc-green shadow-[0_0_4px_var(--bc-green)]",
  danneggiato: "bg-bc-amber shadow-[0_0_4px_var(--bc-amber)]",
  distrutto: "bg-bc-red   shadow-[0_0_4px_var(--bc-red)]",
};
const STATUS_TEXT: Record<HangarItem["status"], string> = {
  normale: "text-bc-green",
  danneggiato: "text-bc-amber",
  distrutto: "text-bc-red",
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
  const inventory: HangarItem[] =
    crawlerSystem?.inventory && crawlerSystem.inventory.length > 0
      ? crawlerSystem.inventory
      : DEFAULT_INVENTORY;

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
    ["Sistema", "Modulo", "Telaio", "Altro"] as HangarItem["category"][]
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
            className="bc-btn-amber self-start sm:self-auto"
            onClick={() => {
              setForm({ ...BLANK_ITEM });
              setEditIndex(null);
              setShowForm(true);
            }}
          >
            + AGGIUNGI
          </button>
        )}
      </div>

      <div className="shrink-0 h-px bg-bc-track" />

      {/* Operator add/edit form */}
      {showForm && isOperator && (
        <div className="shrink-0 bg-bc-panel border border-bc-amber/40 rounded-xl p-4 border-glow-amber">
          <p className="font-mono text-xs text-bc-amber/70 uppercase tracking-widest mb-3">
            {editIndex !== null ? "MODIFICA OGGETTO" : "NUOVO OGGETTO"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="font-mono text-xs text-bc-muted block mb-1">
                NOME
              </label>
              <input
                className="bc-input border-bc-amber/40 text-bc-amber focus:border-bc-amber"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="font-mono text-xs text-bc-muted block mb-1">
                CATEGORIA
              </label>
              <CustomSelect
                value={form.category}
                onChange={(v) => setForm((p) => ({ ...p, category: v as HangarItem["category"] }))}
                options={['Sistema', 'Modulo', 'Telaio', 'Altro']}
              />
            </div>
            <div>
              <label className="font-mono text-xs text-bc-muted block mb-1">
                LIVELLO TEC
              </label>
              <NumericStepper
                value={form.tec}
                onChange={(v) => setForm((p) => ({ ...p, tec: v }))}
                min={1}
                nullable
              />
            </div>
            <div>
              <label className="font-mono text-xs text-bc-muted block mb-1">
                QUANTITÀ
              </label>
              <NumericStepper
                value={form.quantity}
                onChange={(v) => setForm((p) => ({ ...p, quantity: v ?? 1 }))}
                min={1}
              />
            </div>
            <div>
              <label className="font-mono text-xs text-bc-muted block mb-1">
                STATO
              </label>
              <CustomSelect
                value={form.status}
                onChange={(v) => setForm((p) => ({ ...p, status: v as HangarItem["status"] }))}
                options={['normale', 'danneggiato', 'distrutto']}
              />
            </div>
            <div>
              <label className="font-mono text-xs text-bc-muted block mb-1">
                NOTE
              </label>
              <input
                className="bc-input border-bc-amber/40 text-bc-amber focus:border-bc-amber"
                placeholder="—"
                value={form.notes ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="bc-btn-amber flex-1 py-1.5 font-mono text-xs"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving
                ? "SALVATAGGIO..."
                : editIndex !== null
                  ? "AGGIORNA"
                  : "AGGIUNGI"}
            </button>
            <button
              className="font-mono text-xs text-bc-muted border border-bc-muted/30 px-4 py-1.5 hover:border-bc-red hover:text-bc-red transition-all"
              onClick={() => {
                setShowForm(false);
                setEditIndex(null);
              }}
            >
              ANNULLA
            </button>
          </div>
        </div>
      )}

      {/* Inventory list grouped by category */}
      <div className="shrink-0 flex flex-col gap-4">
        {grouped.map(({ cat, items }) => (
          <div
            key={cat}
            className="bg-bc-panel border border-bc-border rounded-xl overflow-hidden"
          >
            <div className="px-4 py-2.5 border-b border-bc-border flex items-center gap-2">
              <span
                className={`font-mono text-xs uppercase tracking-widest border px-2 py-0.5 ${CATEGORY_STYLE[cat]}`}
              >
                {cat}
              </span>
              <span className="font-mono text-xs text-bc-muted">
                {items.length} oggetti
              </span>
            </div>
            <div className="divide-y divide-bc-border">
              {items.map(({ x: item, i }) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-4 py-3 group"
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[item.status]}`}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.tec != null && (
                        <span className="font-mono text-xs text-bc-muted border border-bc-muted/30 px-1.5 py-0.5 shrink-0">
                          TEC {item.tec}
                        </span>
                      )}
                      <span
                        className={`font-sans text-sm font-semibold ${item.status === "distrutto" ? "line-through text-bc-muted" : "text-bc-text"}`}
                      >
                        {item.name}
                      </span>
                      {item.quantity > 1 && (
                        <span className="font-mono text-xs text-bc-muted">
                          ×{item.quantity}
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <p className="font-mono text-xs text-bc-muted mt-0.5">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  <span
                    className={`font-mono text-xs uppercase tracking-widest shrink-0 ${STATUS_TEXT[item.status]}`}
                  >
                    {item.status}
                  </span>

                  {isOperator && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        className="font-mono text-xs text-bc-muted hover:text-bc-amber transition-colors px-1.5 py-0.5 border border-transparent hover:border-bc-amber/40"
                        onClick={() => handleStatusCycle(i)}
                        title="Cambia stato"
                      >
                        ↻
                      </button>
                      <button
                        className="font-mono text-xs text-bc-muted hover:text-bc-blue transition-colors px-1.5 py-0.5 border border-transparent hover:border-bc-blue/40"
                        onClick={() => handleEdit(i)}
                        title="Modifica"
                      >
                        ✎
                      </button>
                      <button
                        className="font-mono text-xs text-bc-muted hover:text-bc-red transition-colors px-1.5 py-0.5 border border-transparent hover:border-bc-red/40"
                        onClick={() => handleDelete(i)}
                        title="Rimuovi"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div></div>
  );
}
