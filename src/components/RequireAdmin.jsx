import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Navigate } from "react-router-dom";

export default function RequireAdmin({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) {
    return <p>Loading...</p>; // fallback while checking auth
  }

  if (!user) {
    // Redirect to login with query param so user returns to admin after login
    return <Navigate to="/login?from=admin" replace />;
  }

  if (user?.user_metadata?.role !== "admin") {
    return <p>Access denied. You do not have admin privileges.</p>;
  }

  return children;
}
