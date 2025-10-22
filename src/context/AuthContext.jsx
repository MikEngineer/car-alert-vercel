import { createContext, useEffect, useState } from "react";
import { supabase } from "../api/supabaseApi";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (mounted) {
        setUser(data?.user || null);
        setLoading(false);
      }
    };
    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (mounted) {
        setUser(session?.user || null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
