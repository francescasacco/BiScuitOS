import type { MissionFormData, MissionStatus } from '@/types/mission'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { STATUS_LABELS } from './missionConstants'

interface MissionFormProps {
  form: MissionFormData
  setForm: React.Dispatch<React.SetStateAction<MissionFormData>>
  onSubmit: () => void
  loading: boolean
}

export function MissionForm({ form, setForm, onSubmit, loading }: MissionFormProps) {
  return (
    <div className="shrink-0 p-4 space-y-2 border-b border-bc-amber/20 bg-bc-dark">
      <div className="bc-section-header" style={{ color: 'var(--bc-amber)' }}>NUOVA MISSIONE</div>
      <input
        className="bc-input"
        placeholder="TITOLO MISSIONE..."
        value={form.title}
        onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
      />
      <CustomSelect
        value={form.status}
        onChange={(v) => setForm(p => ({ ...p, status: v as MissionStatus }))}
        options={['active', 'pending', 'classified']}
        getLabel={(v) => STATUS_LABELS[v as MissionStatus]}
      />
      <textarea
        className="bc-textarea"
        rows={2}
        placeholder="SOMMARIO MISSIONE..."
        value={form.summary ?? ''}
        onChange={(e) => setForm(p => ({ ...p, summary: e.target.value }))}
      />
      <input
        className="bc-input"
        placeholder="RICOMPENSA..."
        value={form.reward ?? ''}
        onChange={(e) => setForm(p => ({ ...p, reward: e.target.value }))}
      />
      <button
        className="bc-btn-amber w-full"
        onClick={onSubmit}
        disabled={loading || !form.title.trim()}
      >
        {loading ? 'CREAZIONE...' : 'CREA MISSIONE'}
      </button>
    </div>
  )
}
