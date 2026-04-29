import { supabase } from '@/lib/supabaseClient'
import type { CrawlerSystem, SystemUpdateData } from '@/types/system'

export const systemService = {
  async get(): Promise<CrawlerSystem | null> {
    const { data, error } = await supabase
      .from('crawler_system')
      .select('*')
      .single()
    if (error) return null
    return data
  },

  async update(updates: SystemUpdateData): Promise<CrawlerSystem> {
    // Get current record id first
    const current = await this.get()
    if (!current) throw new Error('No system record found')

    const { data, error } = await supabase
      .from('crawler_system')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', current.id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async initialize(): Promise<CrawlerSystem> {
    const existing = await this.get()
    if (existing) return existing

    const { data, error } = await supabase
      .from('crawler_system')
      .insert({
        scrap: 0,
        engineers: 0,
        fuel: 0,
        repair_status: 'NOMINAL',
        active_alerts: 'NONE',
        system_notes: 'BC-OS initialized. All systems nominal.',
      })
      .select()
      .single()
    if (error) throw error
    return data
  },
}
