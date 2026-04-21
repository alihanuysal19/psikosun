"use client";
import { Alert, Button, Label, TextInput } from "flowbite-react";
import React, { useContext, useState } from "react";
import AuthContext from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";

const AuthRegister = () => {
  const [email, setEmail] = useState("");
  const [userName, setuserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState<string | null>(null);

  const router = useRouter();
  const { signup }: any = useContext(AuthContext);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (userName.trim().length < 2) {
      setError("Lütfen ad ve soyadınızı girin.");
      return;
    }
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }

    setLoading(true);
    try {
      const result = await signup(email.trim(), password, userName.trim());
      if (result?.needsEmailConfirmation) {
        setEmailSent(email.trim());
      } else {
        router.push("/panel");
      }
    } catch (err: any) {
      setError(err.message || "Kayıt sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
          <Icon icon="tabler:mail-check" className="text-success" width={24} />
        </div>
        <p className="font-medium text-dark dark:text-white mb-1">
          Onay e-postası gönderildi
        </p>
        <p className="text-sm text-gray-500 mb-4">
          <span className="font-medium">{emailSent}</span> adresine gelen kutunuzu kontrol
          edin ve bağlantıya tıklayarak hesabınızı doğrulayın.
        </p>
        <Link
          href="/auth/login"
          className="text-primary text-sm font-medium hover:underline"
        >
          Giriş sayfasına dön
        </Link>
      </div>
    );
  }

  return (
    <>
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
      <form onSubmit={handleRegister}>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="name">Ad Soyad</Label>
          </div>
          <TextInput
            id="name"
            type="text"
            sizing="md"
            placeholder="Adınız Soyadınız"
            value={userName}
            onChange={(e) => setuserName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="email">E-posta Adresi</Label>
          </div>
          <TextInput
            id="email"
            type="email"
            sizing="md"
            placeholder="ornek@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <div className="mb-2 block">
            <Label htmlFor="password">Şifre</Label>
          </div>
          <TextInput
            id="password"
            type="password"
            sizing="md"
            placeholder="En az 6 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        <Button
          color="primary"
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primaryemphasis text-white rounded-md w-full"
        >
          {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
        </Button>
      </form>
    </>
  );
};

export default AuthRegister;
