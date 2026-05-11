import { supabase } from "@/lib/supabaseClient";
import type { CrawlerSystem, SystemUpdateData } from "@/types/system";

export const systemService = {
  async get(): Promise<CrawlerSystem | null> {
    const { data, error } = await supabase
      .from("crawler_system")
      .select("*")
      .single();
    if (error) return null;
    return data;
  },

  async update(updates: SystemUpdateData): Promise<CrawlerSystem> {
    const current = await this.get();
    if (!current) throw new Error("No system record found");

    const { data, error } = await supabase
      .from("crawler_system")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", current.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async initialize(): Promise<CrawlerSystem> {
    const existing = await this.get();
    if (existing) return existing;

    const { data, error } = await supabase
      .from("crawler_system")
      .insert({
        crawler_name: "SANCTUARY",
        crawler_type: "d'Ingegneria",
        scrap: '9 T3 | 6 T4',
        engineers: 3,
        fuel: 0,
        ps_current: 20,
        ps_max: 20,
        enhancement_current: 40,
        enhancement_max: 120,
        maintenance_cost: 12,
        repair_status: "NOMINALE",
        merchant_bridge: "Modulo Scudo | Sistema Postazione di Tiro (Tec +1)",
        system_notes: "",
        inventory: [
          {
            name: "Scudo Rinforzato",
            category: "Sistema",
            tec: 2,
            quantity: 1,
            status: "normale",
          },
          {
            name: "Bengala a Reattore",
            category: "Modulo",
            tec: 1,
            quantity: 1,
            status: "normale",
          },
          {
            name: "Telaio Hussair",
            category: "Telaio",
            tec: null,
            quantity: 1,
            status: "danneggiato",
          },
          {
            name: "Antenna",
            category: "Sistema",
            tec: 2,
            quantity: 4,
            status: "normale",
          },
        ],
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
