"use client";
import { Button, Label, TextInput, Alert } from "flowbite-react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import React, { useState } from "react";

const AuthForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
    } catch {
      setError("Bir hata oluştu. E-posta adresinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
          <Icon icon="tabler:mail-check" className="text-success" width={24} />
        </div>
        <p className="font-medium text-dark dark:text-white mb-1">E-posta gönderildi</p>
        <p className="text-sm text-gray-500">Gelen kutunuzu kontrol edin. Bağlantı 1 saat geçerlidir.</p>
        <Link href="/auth/login" className="text-primary text-sm font-medium mt-4 block hover:underline">Giriş sayfasına dön</Link>
      </div>
    );
  }

  return (
    <form className="mt-6" onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4">
          <Alert color="failure" icon={() => <Icon icon="solar:info-circle-outline" className="me-3" height={20} />}>
            {error}
          </Alert>
        </div>
      )}
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
          className="form-control"
        />
      </div>
      <Button color="primary" type="submit" disabled={loading} className="w-full rounded-md bg-primary hover:bg-primaryemphasis text-white">
        {loading ? "Gönderiliyor..." : "Şifremi Sıfırla"}
      </Button>
      <div className="text-center mt-4">
        <Link href="/auth/login" className="text-sm text-gray-500 hover:text-primary">Giriş sayfasına dön</Link>
      </div>
    </form>
  );
};

export default AuthForgotPassword;
