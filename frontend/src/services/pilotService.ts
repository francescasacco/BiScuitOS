import { supabase } from '@/lib/supabaseClient'
import type { Pilot, PilotFormData } from '@/types/pilot'
import { journalService } from './journalService'

export const pilotService = {
  async getAll(): Promise<Pilot[]> {
    const { data, error } = await supabase
      .from('pilots')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async getById(id: string): Promise<Pilot | null> {
    const { data, error } = await supabase
      .from('pilots')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async create(formData: PilotFormData): Promise<Pilot> {
    const { data, error } = await supabase
      .from('pilots')
      .insert({ ...formData, role: 'pilot' })
      .select()
      .single()
    if (error) throw error

    // Auto-generate journal event on pilot creation
    await journalService.create({
      title: `PILOT_REGISTRATION // ${formData.identificativo}`,
      content: `New pilot node injected into BC-OS network.\nIdentificativo: ${formData.identificativo}\nClasse: ${formData.classe}\nMech: ${formData.mech_nome || 'UNASSIGNED'}\nSystem synchronization complete. Node assigned.`,
      type: 'pilot_registration',
      author: 'BISCUIT//CORE',
    })

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
