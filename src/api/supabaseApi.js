import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

export const api = {
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.session?.user || null;
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async register(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data.user;
  },

  async getUser() {
    const { data } = await supabase.auth.getSession();
    return data?.session?.user ?? null;
  },

  // esempio chiamata tabella targhe
  async searchPlate(plate) {
    const { data, error } = await supabase
      .from("plates")
      .select("*")
      .ilike("plate", `%${plate}%`);
    if (error) throw error;
    return data;
  },

  async insertPlate(data) {
    const { error } = await supabase.from("plates").insert(data);
    if (error) throw error;
  },
};
