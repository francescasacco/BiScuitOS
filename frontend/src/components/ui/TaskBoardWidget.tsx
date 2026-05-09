import { useMemo } from 'react'
import { useOSStore } from '@/store/useOSStore'
import { Diamond } from 'lucide-react'

export function TaskBoardWidget() {
  const { missions } = useOSStore()

  const priorities = useMemo(() => {
    const mission = [...missions]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .find(m => m.report?.priorities && m.report.priorities.length > 0)
    return mission?.report?.priorities ?? []
  }, [missions])

  if (priorities.length === 0) return null

  return (
    <div className="border border-bc-border/40 rounded-lg bg-bc-dark/30 px-3 py-2.5">
      <p className="font-mono text-[10px] text-bc-muted/60 uppercase tracking-widest mb-2">Cose da fare</p>
      <div className="space-y-1">
        {priorities.map((p, i) => (
          <div key={i} className="flex items-start gap-2 py-0.5">
            <Diamond size={8} strokeWidth={1.5} className="text-bc-accent/40 shrink-0 mt-1" />
            <span className="font-sans text-xs text-bc-text/70 leading-snug">{p}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
