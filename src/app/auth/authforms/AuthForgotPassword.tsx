"use client";

import { Button, Label, TextInput } from "flowbite-react";
import React, { useState } from "react";
import { supabase } from "@/app/guards/supabase/supabaseClient";

const AuthForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Şifre sıfırlama bağlantısı e-posta adresine gönderildi.");
    }

    setLoading(false);
  };

  return (
    <form className="mt-6" onSubmit={handleForgotPassword}>
      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="emadd">Email Address</Label>
        </div>
        <TextInput
          id="emadd"
          type="email"
          sizing="md"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <Button
        type="submit"
        color={"primary"}
        className="w-full rounded-md"
        disabled={loading}
      >
        {loading ? "Sending..." : "Forgot Password"}
      </Button>

      {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </form>
  );
};

export default AuthForgotPassword;
