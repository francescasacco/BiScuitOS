import { NumericStepper } from '@/components/ui/NumericStepper'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { X } from 'lucide-react'

const labelCls = 'font-mono text-xs text-bc-amber/70 block mb-1'
const inputCls = 'bc-input border-bc-amber/40 text-bc-amber focus:border-bc-amber'

export function CoreLabel({ children }: { children: React.ReactNode }) {
  return <label className={labelCls}>{children}</label>
}

export function CoreFieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="font-mono text-xs text-bc-red mt-1 italic">{msg}</p>
}

export function CoreInp({ label, value, onChange, placeholder = '', error, onBlur }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; error?: string; onBlur?: () => void
}) {
  return (
    <div>
      <CoreLabel>{label}</CoreLabel>
      <input
        className={`${inputCls} text-xs${error ? ' border-bc-red focus:border-bc-red' : ''}`}
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} onBlur={onBlur}
      />
      <CoreFieldError msg={error} />
    </div>
  )
}

export function CoreTextarea({ label, value, onChange, rows = 2 }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number
}) {
  return (
    <div>
      <CoreLabel>{label}</CoreLabel>
      <textarea rows={rows} className="bc-textarea border-bc-amber/40 text-bc-amber focus:border-bc-amber text-xs" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

export function CoreNumInp({ label, value, onChange, min = 0 }: {
  label: string; value: number; onChange: (v: number | undefined) => void; min?: number
}) {
  return (
    <div>
      <CoreLabel>{label}</CoreLabel>
      <NumericStepper value={value} onChange={onChange} min={min} />
    </div>
  )
}

export function CoreSelect({ label, value, onChange, options, getLabel }: {
  label: string; value: string; onChange: (v: string) => void
  options: string[]; getLabel?: (v: string) => string
}) {
  return (
    <div>
      <CoreLabel>{label}</CoreLabel>
      <CustomSelect value={value} onChange={onChange} options={options} getLabel={getLabel} />
    </div>
  )
}

export function CoreListEditor({ label, items, onChange }: {
  label: string; items: string[]; onChange: (v: string[]) => void
}) {
  return (
    <div>
      <CoreLabel>{label}</CoreLabel>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input className={`${inputCls} flex-1 text-xs`} value={item}
              onChange={e => onChange(items.map((v, j) => j === i ? e.target.value : v))} />
            <CoreRemoveBtn onClick={() => onChange(items.filter((_, j) => j !== i))} />
          </div>
        ))}
        <CoreAddBtn label="AGGIUNGI" onClick={() => onChange([...items, ''])} />
      </div>
    </div>
  )
}

export function CoreAddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button"
      className="font-mono text-xs text-bc-amber/60 hover:text-bc-amber border border-bc-amber/20 hover:border-bc-amber/40 px-3 py-1 w-full transition-colors"
      onClick={onClick}>
      + {label}
    </button>
  )
}

export function CoreRemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button"
      className="font-mono text-xs text-bc-muted hover:text-bc-red px-2 border border-bc-muted/30 hover:border-bc-red/40 transition-colors shrink-0 flex items-center"
      onClick={onClick}><X size={11} strokeWidth={2} /></button>
  )
}

export function CoreCancelBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button"
      className="font-mono text-xs px-3 py-1 border border-bc-muted/30 text-bc-muted hover:border-bc-text hover:text-bc-text transition-all"
      onClick={onClick}>ANNULLA</button>
  )
}
