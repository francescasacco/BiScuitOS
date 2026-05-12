import { supabase } from '@/lib/supabaseClient'
import type { Pilot, PilotFormData } from '@/types/pilot'

export const pilotService = {
  async getAll(): Promise<Pilot[]> {
    const { data, error } = await supabase
      .from('pilots')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async create(formData: PilotFormData & { access_key: string }): Promise<Pilot> {
    const { data, error } = await supabase
      .from('pilots')
      .insert({ ...formData, role: 'pilot' })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<PilotFormData>): Promise<Pilot> {
    const { data, error } = await supabase
      .from('pilots')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('pilots').delete().eq('id', id)
    if (error) throw error
  },
}
