import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { User, onAuthStateChanged } from "firebase/auth";

interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState({
        user,
        loading: false
      });
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return state;
} 