'use client';
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import Spinner from "@/app/components/shared/spinner/Spinner";
import { supabase } from "@/app/guards/supabase/supabaseClient";

const AuthGuard = ({ children }: any) => {
  const router = useRouter();
  const [checked, setChecked] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setChecked(true);
      } else {
        setChecked(false);
        router.replace('/auth/login');
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setChecked(true);
      } else {
        setChecked(false);
        router.replace('/auth/login');
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  if (checked === null || checked === false) return <Spinner />;
  return children;
};

export default AuthGuard;
