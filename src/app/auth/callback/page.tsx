"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/guards/supabase/supabaseClient";
import Spinner from "@/app/components/shared/spinner/Spinner";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", ""));
    const type = params.get("type");

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        console.log("No session found");
        router.push("/auth/login");
        return;
      }

      if (type === "recovery") {
        router.push("/auth/reset-password");
      } else {
        router.push("/");
      }
    });
  }, [router]);

  return <Spinner />;
}
