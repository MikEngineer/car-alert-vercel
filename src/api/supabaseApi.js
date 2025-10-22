import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const api = {
  // === AUTENTICAZIONE ===
  async register(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data.user;
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
  },

  // === REPORTS ===
  async getReports() {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async addReport({ plate, make, model, color, notes }) {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) throw new Error("Utente non autenticato.");

    const { data, error } = await supabase
      .from("reports")
      .insert([{ plate, make, model, color, notes, reporter_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteReport(id) {
    const { error } = await supabase.from("reports").delete().eq("id", id);
    if (error) throw error;
  },

  async verifyReport(id) {
    const { error } = await supabase.from("reports").update({ verified: true }).eq("id", id);
    if (error) throw error;
  },

  async getUserReports(userId) {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("reporter_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

    async searchPlate(plate) {
    // ricerca case-insensitive per targa
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .ilike("plate", `%${plate}%`);

    if (error) throw error;
    return data;
  },

};
