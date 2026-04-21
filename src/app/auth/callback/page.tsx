"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/guards/supabase/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.log(error);
        return;
      }

      const hash = window.location.hash;

      if (hash.includes("type=recovery")) {
        // 🔥 BURASI ÖNEMLİ
        router.push("/auth/reset-password");
        return;
      }

      if (data.session) {
        router.push("/");
      }
    };

    handleAuth();
  }, [router]);

  return <p className="text-center p-10 text-gray-500">Yükleniyor...</p>;
}
