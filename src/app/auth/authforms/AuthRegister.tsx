
"use client"
import { Alert, Button, Label, TextInput } from "flowbite-react";
import React, { useContext, useState } from "react";
import AuthContext from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";

const AuthRegister = () => {
  const [email, setEmail] = useState("");
  const [userName, setuserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { signup }: any = useContext(AuthContext);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup(email, password, userName);
      router.push("/auth/login");
    } catch (err: any) {
      setError(err.message || "Kayıt sırasında bir hata oluştu.");
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
          {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
        </Button>
      </form>
    </>
  );
};

export default AuthRegister;
