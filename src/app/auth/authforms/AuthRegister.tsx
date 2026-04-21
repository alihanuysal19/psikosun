"use client";
import { Alert, Button, Label, TextInput } from "flowbite-react";
import React, { useContext, useMemo, useRef, useState } from "react";
import AuthContext from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";

const EDUCATION_OPTIONS: { value: string; label: string }[] = [
  { value: "ILKOKUL", label: "İlkokul" },
  { value: "ORTAOKUL", label: "Ortaokul" },
  { value: "LISE", label: "Lise" },
  { value: "UNIVERSITE", label: "Üniversite" },
  { value: "MEZUN", label: "Mezun" },
  { value: "DIGER", label: "Diğer" },
];

const AVATAR_MAX = 3 * 1024 * 1024;
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

function strengthLabel(score: number) {
  return ["Çok zayıf", "Zayıf", "Orta", "İyi", "Güçlü"][score] ?? "";
}

function strengthColor(score: number) {
  return (
    ["bg-error", "bg-error/70", "bg-warning", "bg-primary/70", "bg-success"][score] ??
    "bg-gray-200"
  );
}

const AuthRegister = () => {
  const router = useRouter();
  const { signup }: any = useContext(AuthContext);

  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
    password2: "",
    phone: "",
    birth_date: "",
    education_level: "",
    city: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [showExtras, setShowExtras] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof typeof form>(k: K, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const pwScore = useMemo(() => passwordStrength(form.password), [form.password]);
  const pwMatch = form.password.length > 0 && form.password === form.password2;
  const pwMismatch = form.password2.length > 0 && form.password !== form.password2;

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!AVATAR_TYPES.includes(f.type)) {
      setError("Profil fotoğrafı JPG/PNG/WebP/GIF olmalı.");
      return;
    }
    if (f.size > AVATAR_MAX) {
      setError("Profil fotoğrafı 3 MB'den küçük olmalı.");
      return;
    }
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
    setError(null);
  };

  const clearAvatar = () => {
    setAvatarFile(null);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const userName = form.userName.trim();
    const email = form.email.trim();

    if (userName.length < 2) {
      setError("Lütfen ad ve soyadınızı girin.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Geçerli bir e-posta girin.");
      return;
    }
    if (form.password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }
    if (form.password !== form.password2) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    if (form.phone && !/^[\d\s+()-]{7,}$/.test(form.phone.trim())) {
      setError("Telefon numarası geçerli görünmüyor.");
      return;
    }
    if (form.birth_date) {
      const d = new Date(form.birth_date);
      const now = new Date();
      if (d > now) {
        setError("Doğum tarihi gelecekte olamaz.");
        return;
      }
      const age = (now.getTime() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      if (age > 120) {
        setError("Doğum tarihi geçerli değil.");
        return;
      }
    }

    setLoading(true);
    try {
      const result = await signup(email, form.password, userName, {
        phone: form.phone.trim() || undefined,
        birth_date: form.birth_date || undefined,
        education_level: form.education_level || undefined,
        city: form.city.trim() || undefined,
        avatarFile,
      });
      if (result?.needsEmailConfirmation) {
        setEmailSent(email);
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
            icon={() => (
              <Icon icon="solar:info-circle-outline" className="me-3" height={20} />
            )}
          >
            {error}
          </Alert>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden ring-2 ring-primary/10">
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <Icon icon="tabler:user" className="text-gray-400" width={28} />
              )}
            </div>
            {avatarPreview && (
              <button
                type="button"
                onClick={clearAvatar}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-error text-white flex items-center justify-center"
                aria-label="Fotoğrafı kaldır"
              >
                <Icon icon="tabler:x" width={12} />
              </button>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-dark dark:text-white">
              Profil fotoğrafı
            </p>
            <p className="text-xs text-gray-500 mb-1">
              Opsiyonel · JPG/PNG/WebP · en fazla 3 MB
            </p>
            <label className="inline-flex items-center gap-1 text-xs text-primary cursor-pointer hover:underline">
              <Icon icon="tabler:upload" width={14} />
              {avatarPreview ? "Değiştir" : "Yükle"}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatar}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div>
          <Label htmlFor="userName">Ad Soyad *</Label>
          <TextInput
            id="userName"
            type="text"
            placeholder="Adınız Soyadınız"
            sizing="md"
            value={form.userName}
            onChange={(e) => set("userName", e.target.value)}
            autoComplete="name"
            required
          />
        </div>

        <div>
          <Label htmlFor="email">E-posta *</Label>
          <TextInput
            id="email"
            type="email"
            placeholder="ornek@eposta.com"
            sizing="md"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <Label htmlFor="password">Şifre *</Label>
          <div className="relative">
            <TextInput
              id="password"
              type={showPw ? "text" : "password"}
              placeholder="En az 6 karakter"
              sizing="md"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPw ? "Şifreyi gizle" : "Şifreyi göster"}
              tabIndex={-1}
            >
              <Icon icon={showPw ? "tabler:eye-off" : "tabler:eye"} width={18} />
            </button>
          </div>
          {form.password.length > 0 && (
            <div className="mt-1.5">
              <div className="flex gap-1 h-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-colors ${
                      i < pwScore ? strengthColor(pwScore) : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">{strengthLabel(pwScore)}</p>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="password2">Şifre (tekrar) *</Label>
          <TextInput
            id="password2"
            type={showPw ? "text" : "password"}
            placeholder="Şifrenizi tekrar girin"
            sizing="md"
            value={form.password2}
            onChange={(e) => set("password2", e.target.value)}
            autoComplete="new-password"
            required
            color={pwMismatch ? "failure" : pwMatch ? "success" : undefined}
          />
          {pwMismatch && (
            <p className="text-xs text-error mt-1 flex items-center gap-1">
              <Icon icon="tabler:alert-circle" width={14} />
              Şifreler eşleşmiyor.
            </p>
          )}
          {pwMatch && (
            <p className="text-xs text-success mt-1 flex items-center gap-1">
              <Icon icon="tabler:check" width={14} />
              Şifreler eşleşiyor.
            </p>
          )}
        </div>

        <div className="border border-border dark:border-darkborder rounded-lg">
          <button
            type="button"
            onClick={() => setShowExtras((s) => !s)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="flex items-center gap-2">
              <Icon icon="tabler:user-plus" width={16} className="text-primary" />
              Ek bilgiler (opsiyonel)
            </span>
            <Icon
              icon={showExtras ? "tabler:chevron-up" : "tabler:chevron-down"}
              width={16}
              className="text-gray-400"
            />
          </button>
          {showExtras && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <TextInput
                    id="phone"
                    type="tel"
                    placeholder="05XX XXX XX XX"
                    sizing="md"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <Label htmlFor="birth_date">Doğum tarihi</Label>
                  <TextInput
                    id="birth_date"
                    type="date"
                    sizing="md"
                    value={form.birth_date}
                    onChange={(e) => set("birth_date", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="education_level">Eğitim seviyesi</Label>
                  <select
                    id="education_level"
                    value={form.education_level}
                    onChange={(e) => set("education_level", e.target.value)}
                    className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2.5 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Seçim yok</option>
                    {EDUCATION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="city">Şehir</Label>
                  <TextInput
                    id="city"
                    type="text"
                    placeholder="Samsun"
                    sizing="md"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    autoComplete="address-level2"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-[11px] text-gray-400 leading-relaxed">
          Kayıt olarak{" "}
          <Link href="#kvkk" className="text-primary hover:underline">
            KVKK aydınlatma metni
          </Link>{" "}
          ve{" "}
          <Link href="#uyelik" className="text-primary hover:underline">
            üyelik sözleşmesini
          </Link>{" "}
          kabul etmiş sayılırsınız.
        </p>

        <Button
          type="submit"
          color="primary"
          className="w-full bg-primary text-white"
          disabled={loading}
        >
          {loading ? "Kaydolunuyor..." : "Kayıt Ol"}
        </Button>
      </form>
    </>
  );
};

export default AuthRegister;
