"use client";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import Spinner from "@/app/components/shared/spinner/Spinner";
import AuthContext from "@/app/context/AuthContext";

const AuthGuard = ({ children }: any) => {
  const router = useRouter();
  const { isInitialized, isAuthenticated, user } = useContext(AuthContext) as any;

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated || !user) {
      router.replace("/auth/login");
    }
  }, [isInitialized, isAuthenticated, user, router]);

  // AuthContext henüz session'ı initialize etmediyse spinner göster
  // (getSession() + profile fetch bitene kadar race olmasın — kullanıcı
  // landing'e gidip gelince AuthContext yeniden mount olmaz, isInitialized
  // true kalır, dolayısıyla flicker/redirect yaşanmaz)
  if (!isInitialized) return <Spinner />;
  if (!isAuthenticated) return <Spinner />;

  return children;
};

export default AuthGuard;
