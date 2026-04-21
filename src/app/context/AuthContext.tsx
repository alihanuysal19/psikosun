"use client";
import { createContext, useEffect, useReducer, ReactNode } from 'react';
import { supabase } from '@/app/guards/supabase/supabaseClient';

interface UserState {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | null;
}

interface InitialStateType {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: UserState | null;
}

const initialState: InitialStateType = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

const reducer = (state: InitialStateType, action: any) => {
  switch (action.type) {
    case 'AUTH_STATE_CHANGED':
      return { ...state, ...action.payload, isInitialized: true };
    default:
      return state;
  }
};

const AuthContext = createContext<any | null>({
  ...initialState,
  signup: () => Promise.resolve(),
  signin: () => Promise.resolve(),
  logout: () => Promise.resolve(),
});

function translateAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("user already registered") || m.includes("already registered"))
    return "Bu e-posta ile zaten kayıtlı bir hesap var.";
  if (m.includes("invalid login credentials"))
    return "E-posta veya şifre hatalı.";
  if (m.includes("email not confirmed"))
    return "E-postanız henüz onaylanmadı. Gelen kutunuzdaki onay bağlantısına tıklayın.";
  if (m.includes("password should be at least") || m.includes("weak password"))
    return "Şifre en az 6 karakter olmalı.";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "Geçersiz e-posta adresi.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Çok fazla deneme yapıldı. Lütfen birkaç dakika bekleyin.";
  if (m.includes("sending confirmation email") || m.includes("smtp"))
    return "Doğrulama e-postası gönderilemedi. Lütfen yöneticiyle iletişime geçin.";
  return msg;
}

async function fetchOrCreateProfile(id: string, email: string, fullName: string) {
  try {
    const res = await fetch(`/api/profile?id=${id}`);
    if (res.ok) {
      const { data } = await res.json();
      return data;
    }
    const createRes = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, email, full_name: fullName }),
    });
    if (createRes.ok) {
      const { data } = await createRes.json();
      return data;
    }
  } catch (e) {
    console.error('Profil yüklenemedi', e);
  }
  return null;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setUser = async (session: any) => {
    if (!session?.user) {
      dispatch({ type: 'AUTH_STATE_CHANGED', payload: { isAuthenticated: false, user: null } });
      return;
    }
    const { id, email, user_metadata } = session.user;
    const fullName = user_metadata?.full_name || email;
    const profile = await fetchOrCreateProfile(id, email, fullName);

    if (profile && profile.is_active === false) {
      await supabase.auth.signOut();
      dispatch({ type: 'AUTH_STATE_CHANGED', payload: { isAuthenticated: false, user: null } });
      if (typeof window !== 'undefined') {
        alert('Hesabınız devre dışı bırakılmış. Lütfen yönetici ile iletişime geçin.');
      }
      return;
    }

    dispatch({
      type: 'AUTH_STATE_CHANGED',
      payload: {
        isAuthenticated: true,
        user: {
          id,
          email,
          displayName: profile?.full_name || fullName,
          avatar: profile?.avatar_url || user_metadata?.avatar || '',
          role: profile?.role || 'STUDENT',
        },
      },
    });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session);
    });
    return () => authListener?.subscription?.unsubscribe();
  }, []);

  const signup = async (
    email: string,
    password: string,
    userName: string,
    extra?: {
      phone?: string;
      birth_date?: string;
      education_level?: string;
      city?: string;
      avatarFile?: File | null;
    },
  ) => {
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: userName }, emailRedirectTo: redirectTo },
    });
    if (error) throw new Error(translateAuthError(error.message));

    if (data.user?.id && extra) {
      const { avatarFile, ...profileExtras } = extra;
      const cleaned: Record<string, any> = {};
      for (const [k, v] of Object.entries(profileExtras)) {
        if (v !== undefined && v !== null && v !== "") cleaned[k] = v;
      }

      try {
        await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: data.user.id,
            email,
            full_name: userName,
            ...cleaned,
          }),
        });
      } catch (e) {
        console.warn("profile extras post failed:", e);
      }

      if (avatarFile) {
        try {
          const fd = new FormData();
          fd.append("user_id", data.user.id);
          fd.append("file", avatarFile);
          await fetch("/api/profile/avatar", { method: "POST", body: fd });
        } catch (e) {
          console.warn("avatar upload failed:", e);
        }
      }
    }

    return { needsEmailConfirmation: !data.session, user: data.user };
  };

  const signin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(translateAuthError(error.message));
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ ...state, signup, signin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
