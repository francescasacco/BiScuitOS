import { useState } from 'react'

interface MechItemListProps {
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
}

export function MechItemList({ items, onChange, placeholder }: MechItemListProps) {
  const [input, setInput] = useState('')

  const add = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    onChange([...items, trimmed])
    setInput('')
  }

  return (
    <div className="space-y-2">
      {items.length > 0 && (
        <div className="space-y-1">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 bg-bc-dark border border-bc-border rounded-md group">
              <span className="w-1.5 h-1.5 rounded-full bg-bc-blue/60 shrink-0" />
              <span className="font-mono text-xs text-bc-text flex-1">{item}</span>
              <button
                type="button"
                className="font-mono text-xs text-bc-muted/0 group-hover:text-bc-muted hover:!text-bc-red transition-colors shrink-0"
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              >✕</button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          className="bc-input flex-1"
          placeholder={placeholder ?? 'Aggiungi elemento...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
        />
        <button
          type="button"
          className="font-mono text-xs text-bc-blue border border-bc-blue/40 px-3 hover:border-bc-blue hover:bg-bc-blue/10 transition-all shrink-0"
          onClick={add}
        >+</button>
      </div>
    </div>
  )
}
