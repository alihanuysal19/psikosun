import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string | any = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey: string | any =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const REMEMBER_KEY = "psikosun.remember_me";

// Dinamik storage: "Beni hatırla" işaretliyse localStorage (kalıcı),
// değilse sessionStorage (tab kapanınca session biter). Default kalıcı.
const dynamicStorage = {
  getItem(key: string) {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  },
  setItem(key: string, value: string) {
    if (typeof window === "undefined") return;
    const remember = localStorage.getItem(REMEMBER_KEY) !== "false";
    if (remember) {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
      localStorage.removeItem(key);
    }
  },
  removeItem(key: string) {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? dynamicStorage : undefined,
    storageKey: "psikosun-auth",
    flowType: "pkce",
  },
});

export function setRememberMe(remember: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(REMEMBER_KEY, remember ? "true" : "false");
}

export function getRememberMe(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(REMEMBER_KEY) !== "false";
}
