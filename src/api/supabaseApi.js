import { createClient } from "@supabase/supabase-js";

// Inizializza client Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

export const api = {
  // 🔹 Registrazione nuovo utente
  async register(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  // 🔹 Login utente
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // 🔹 Logout utente
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // 🔹 Recupera utente attuale
  async currentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },

  // 🔹 Inserisce nuovo report (annuncio)
  async createReport(data) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Utente non loggato:", userError?.message);
      throw new Error("Devi essere loggato per creare un annuncio");
    }

    const { error } = await supabase.from("reports").insert([
      {
        title: data.title,
        plate: data.plate,
        description: data.description,
        reporter_id: user.id, // collegamento FK
      },
    ]);

    if (error) {
      console.error("Errore insert report:", error.message);
      throw error;
    }
  },

  // 🔹 Cerca targa
  async searchPlate(plate) {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .ilike("plate", `%${plate}%`);

    if (error) {
      console.error("Errore searchPlate:", error.message);
      return [];
    }
    return data || [];
  },

  // 🔹 Elenco report
  async getReports() {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
};
