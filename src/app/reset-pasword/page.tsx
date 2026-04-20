"use client";

import { useState } from "react";
import { supabase } from "@/app/guards/supabase/supabaseClient";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleUpdate = async (e: any) => {
    e.preventDefault();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Şifre başarıyla güncellendi!");
    }
  };

  return (
    <form onSubmit={handleUpdate}>
      <input
        type="password"
        placeholder="Yeni şifre"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Şifreyi Güncelle</button>
      <p>{message}</p>
    </form>
  );
}
