"use client"

import { Icon } from "@iconify/react/dist/iconify.js";
import { Alert, Button, Label, TextInput } from "flowbite-react";
import React, { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import AuthContext from "@/app/context/AuthContext";

const AuthLogin = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  const { signin } = useContext(AuthContext);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signin(email, password);
      router.push("/panel");
    } catch (err: any) {
      setError("E-posta veya şifre hatalı. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-4">
          <Alert
            color="failure"
            icon={() => (
              <Icon icon="solar:info-circle-outline" className="me-3" height={20} />
            )}
          >
            {error}
          </Alert>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="email">E-posta</Label>
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button
          color="primary"
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primaryemphasis text-white rounded-md w-full"
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Button>
      </form>
    </>
  );
};

export default AuthLogin;
