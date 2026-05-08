import { useState } from 'react'
import { useOSStore } from '@/store/useOSStore'
import { taskBoardService } from '@/services/taskBoardService'
import { Check, X, Plus } from 'lucide-react'

export function TaskBoardWidget() {
  const { taskBoardItems, isOperator, addTaskBoardItem, updateTaskBoardItem, removeTaskBoardItem } = useOSStore()
  const [open, setOpen] = useState(true)
  const [newText, setNewText] = useState('')
  const [adding, setAdding] = useState(false)
  const [showInput, setShowInput] = useState(false)

  const openCount = taskBoardItems.filter(t => !t.completed).length

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      const updated = await taskBoardService.toggleCompleted(id, completed)
      updateTaskBoardItem(updated)
    } catch (err) {
      console.error('[TASK BOARD] Toggle failed:', err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await taskBoardService.delete(id)
      removeTaskBoardItem(id)
    } catch (err) {
      console.error('[TASK BOARD] Delete failed:', err)
    }
  }

  const handleAdd = async () => {
    if (!newText.trim()) return
    setAdding(true)
    try {
      const position = taskBoardItems.length
      const item = await taskBoardService.create(newText.trim(), position)
      addTaskBoardItem(item)
      setNewText('')
      setShowInput(false)
    } catch (err) {
      console.error('[TASK BOARD] Add failed:', err)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="shrink-0 bg-bc-panel border border-bc-border rounded-xl overflow-hidden">
      <button
        className="w-full px-4 py-2.5 bg-gradient-to-r from-[#ffc8d8]/15 to-transparent border-b border-bc-border flex items-center justify-between"
        onClick={() => setOpen(o => !o)}
      >
        <p className="bc-section-header !border-0 !pb-0 !mb-0">Bacheca missioni</p>
        <span className="font-mono text-[10px] text-bc-muted/60 flex items-center gap-2">
          {!open && openCount > 0 && (
            <span className="text-bc-amber">{openCount} aperti</span>
          )}
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div className="p-3 space-y-1.5">
          {taskBoardItems.length === 0 ? (
            <p className="font-mono text-xs text-bc-muted/60">Nessun obiettivo registrato.</p>
          ) : (
            taskBoardItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-2 py-1.5 border-b border-bc-border/30 last:border-0 group ${item.completed ? 'opacity-50' : ''}`}
              >
                <button
                  className={`mt-0.5 w-3.5 h-3.5 shrink-0 border rounded-sm flex items-center justify-center transition-colors ${
                    item.completed
                      ? 'bg-bc-green/20 border-bc-green/60'
                      : 'border-bc-muted/40 hover:border-bc-green/60'
                  }`}
                  onClick={() => handleToggle(item.id, !item.completed)}
                >
                  {item.completed && <Check size={9} strokeWidth={3} className="text-bc-green" />}
                </button>
                <span className={`font-sans text-xs flex-1 leading-snug ${item.completed ? 'line-through text-bc-muted/50' : 'text-bc-text/90'}`}>
                  {item.text}
                </span>
                {isOperator && (
                  <button
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(item.id)}
                  >
                    <X size={11} strokeWidth={2.5} className="text-bc-muted/50 hover:text-bc-red transition-colors" />
                  </button>
                )}
              </div>
            ))
          )}

          {isOperator && (
            <div className="pt-1">
              {showInput ? (
                <div className="flex gap-1.5 mt-1">
                  <input
                    autoFocus
                    className="bc-input text-xs flex-1 py-1"
                    placeholder="Nuovo obiettivo..."
                    value={newText}
                    onChange={e => setNewText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAdd()
                      if (e.key === 'Escape') { setShowInput(false); setNewText('') }
                    }}
                  />
                  <button
                    className="bc-btn-amber py-1 px-2 text-xs"
                    onClick={handleAdd}
                    disabled={adding || !newText.trim()}
                  >
                    {adding ? '...' : 'OK'}
                  </button>
                  <button
                    className="font-mono text-xs text-bc-muted hover:text-bc-red transition-colors px-1"
                    onClick={() => { setShowInput(false); setNewText('') }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  className="flex items-center gap-1 font-mono text-[10px] text-bc-muted/50 hover:text-bc-amber transition-colors mt-1"
                  onClick={() => setShowInput(true)}
                >
                  <Plus size={10} strokeWidth={2.5} />
                  AGGIUNGI OBIETTIVO
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
