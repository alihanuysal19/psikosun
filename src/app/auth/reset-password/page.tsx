"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Label, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import AuthShell from "@/app/components/shared/AuthShell";
import { supabase } from "@/app/guards/supabase/supabaseClient";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionReady(!!session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setSessionReady(true);
    });
    return () => listener?.subscription?.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }
    if (password !== confirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/auth/login"), 2000);
  };

  if (success) {
    return (
      <AuthShell title="Şifre Güncellendi" subtitle="Yeni şifrenizle giriş yapabilirsiniz.">
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
            <Icon icon="tabler:circle-check" className="text-success" width={24} />
          </div>
          <p className="font-medium text-dark dark:text-white mb-1">Şifreniz başarıyla güncellendi</p>
          <p className="text-sm text-gray-500">Giriş sayfasına yönlendiriliyorsunuz...</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Şifreyi Sıfırla"
      subtitle="Yeni şifrenizi belirleyin."
      footer={
        <div className="flex gap-2 items-center justify-center">
          <Link href="/auth/login" className="font-semibold text-primary hover:underline">
            Giriş sayfasına dön
          </Link>
        </div>
      }
    >
      {!sessionReady && (
        <div className="mb-4">
          <Alert
            color="warning"
            icon={() => <Icon icon="solar:info-circle-outline" className="me-3" height={20} />}
          >
            Sıfırlama bağlantısı doğrulanıyor. E-postanızdaki bağlantıyı kullanarak bu sayfaya ulaştığınızdan emin olun.
          </Alert>
        </div>
      )}
      {error && (
        <div className="mb-4">
          <Alert
            color="failure"
            icon={() => <Icon icon="solar:info-circle-outline" className="me-3" height={20} />}
          >
            {error}
          </Alert>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="password">Yeni Şifre</Label>
          </div>
          <TextInput
            id="password"
            type="password"
            sizing="md"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <div className="mb-2 block">
            <Label htmlFor="confirm">Yeni Şifre (Tekrar)</Label>
          </div>
          <TextInput
            id="confirm"
            type="password"
            sizing="md"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        <Button
          color="primary"
          type="submit"
          disabled={loading || !sessionReady}
          className="bg-primary hover:bg-primaryemphasis text-white rounded-md w-full"
        >
          {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
        </Button>
      </form>
    </AuthShell>
  );
}
