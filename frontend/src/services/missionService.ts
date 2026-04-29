import { supabase } from '@/lib/supabaseClient'
import type { Mission, MissionFormData } from '@/types/mission'

export const missionService = {
  async getAll(): Promise<Mission[]> {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async create(formData: MissionFormData): Promise<Mission> {
    const { data, error } = await supabase
      .from('missions')
      .insert(formData)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateStatus(id: string, status: Mission['status']): Promise<Mission> {
    const { data, error } = await supabase
      .from('missions')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('missions').delete().eq('id', id)
    if (error) throw error
  },
}
