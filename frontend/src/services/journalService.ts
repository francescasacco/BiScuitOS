import { supabase } from '@/lib/supabaseClient'
import type { JournalEntry, JournalFormData } from '@/types/journal'

export const journalService = {
  async getAll(): Promise<JournalEntry[]> {
    const { data, error } = await supabase
      .from('journal_stream')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async getRecent(limit = 10): Promise<JournalEntry[]> {
    const { data, error } = await supabase
      .from('journal_stream')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data ?? []
  },

  async create(formData: JournalFormData): Promise<JournalEntry> {
    const { data, error } = await supabase
      .from('journal_stream')
      .insert(formData)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('journal_stream').delete().eq('id', id)
    if (error) throw error
  },
}
