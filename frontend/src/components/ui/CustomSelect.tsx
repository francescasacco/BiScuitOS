import { useState, useRef, useEffect } from 'react'

interface CustomSelectProps {
  value: string
  onChange: (v: string) => void
  options: readonly string[]
  placeholder?: string
  hasError?: boolean
  getLabel?: (v: string) => string
}

export function CustomSelect({ value, onChange, options, placeholder, hasError, getLabel }: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={`bc-input flex items-center justify-between gap-2 cursor-pointer text-left${hasError ? ' border-bc-red focus:border-bc-red' : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={value ? 'text-bc-text' : 'text-bc-muted/70'}>
          {value ? (getLabel ? getLabel(value) : value.toUpperCase()) : (placeholder ?? 'SELEZIONA...')}
        </span>
        <span className={`text-bc-accent text-xs transition-transform duration-150 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-bc-dark border border-bc-border rounded-md overflow-hidden shadow-xl">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`w-full text-left px-3 py-2 font-mono text-xs transition-colors ${
                opt === value
                  ? 'text-bc-accent bg-bc-accent/10'
                  : 'text-bc-text hover:bg-bc-panel'
              }`}
              onClick={() => { onChange(opt); setOpen(false) }}
            >
              {getLabel ? getLabel(opt) : opt.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
