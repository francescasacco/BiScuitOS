import { useState, useEffect, useRef } from 'react'
import { Minus, Plus } from 'lucide-react'

interface NumericStepperProps {
  value: number | undefined | null
  onChange: (v: number | undefined) => void
  min?: number
  max?: number
  nullable?: boolean
  colorClass?: string
}

export function NumericStepper({
  value,
  onChange,
  min = 1,
  max,
  nullable = false,
  colorClass = 'border-bc-amber/40 text-bc-amber',
}: NumericStepperProps) {
  const [raw, setRaw] = useState(value != null ? String(value) : '')
  const [error, setError] = useState<string | null>(null)
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setRaw(value != null ? String(value) : '')
  }, [value])

  const showError = (msg: string) => {
    setError(msg)
    if (errorTimer.current) clearTimeout(errorTimer.current)
    errorTimer.current = setTimeout(() => setError(null), 3000)
  }

  const decrement = () => {
    const cur = value ?? min
    const next = cur - 1
    if (next < min) {
      if (nullable) { onChange(undefined); setRaw('') }
    } else {
      onChange(next)
    }
  }

  const increment = () => {
    const cur = value ?? min - 1
    const next = cur + 1
    if (max == null || next <= max) onChange(next)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const original = e.target.value
    const str = original.replace(/[^0-9]/g, '')
    if (str !== original) showError('Sono consentiti solo valori numerici.')
    setRaw(str)
    if (str === '' && nullable) { onChange(undefined); return }
    const n = parseInt(str, 10)
    if (!isNaN(n) && n >= min && (max == null || n <= max)) onChange(n)
  }

  const handleBlur = () => {
    if (raw === '' && nullable) { setRaw(''); return }
    const n = parseInt(raw, 10)
    if (isNaN(n) || n < min) {
      if (nullable) { onChange(undefined); setRaw('') }
      else { onChange(min); setRaw(String(min)) }
    } else if (max != null && n > max) {
      onChange(max); setRaw(String(max))
    }
  }

  const textColor = colorClass.split(' ').find(c => c.startsWith('text-')) ?? 'text-bc-amber'
  const borderColor = colorClass.split(' ').find(c => c.startsWith('border-')) ?? 'border-bc-amber/40'
  const activeBorder = error ? 'border-bc-red' : borderColor
  const btnClass = `w-10 h-9 shrink-0 flex items-center justify-center border-l ${error ? 'border-bc-red' : borderColor} ${textColor} hover:bg-white/5 active:bg-white/10 transition-colors`

  return (
    <div>
      <div className={`flex items-center border rounded overflow-hidden ${activeBorder}`}>
        <input
          type="text"
          inputMode="numeric"
          value={raw}
          placeholder="—"
          onChange={handleInput}
          onKeyDown={(e) => {
            if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(e.key) && !e.ctrlKey && !e.metaKey) {
              e.preventDefault()
              showError('Sono consentiti solo valori numerici.')
            }
          }}
          onBlur={handleBlur}
          className={`flex-1 min-w-0 bg-transparent font-mono text-sm py-1.5 px-3 outline-none placeholder:text-current/40 ${error ? 'text-bc-red' : textColor}`}
        />
        <button type="button" onClick={decrement} className={btnClass}><Minus size={12} strokeWidth={2} /></button>
        <button type="button" onClick={increment} className={btnClass}><Plus size={12} strokeWidth={2} /></button>
      </div>
      {error && (
        <p className="font-mono text-xs text-bc-red mt-1 italic">{error}</p>
      )}
    </div>
  )
}
