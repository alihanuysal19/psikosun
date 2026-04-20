"use client";
import { Button, Label, Select, Spinner, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useAuth from "@/app/guards/authGuard/UseAuth";
import axios from "axios";

const EDUCATION_LEVELS = [
  { value: "", label: "Seçiniz" },
  { value: "ILKOKUL", label: "İlkokul" },
  { value: "ORTAOKUL", label: "Ortaokul" },
  { value: "LISE", label: "Lise" },
  { value: "UNIVERSITE", label: "Üniversite" },
  { value: "MEZUN", label: "Mezun" },
  { value: "DIGER", label: "Diğer" },
];

type ProfileForm = {
  full_name: string;
  phone: string;
  parent_phone: string;
  city: string;
  district: string;
  school: string;
  education_level: string;
  assigned_teacher_id: string;
};

const emptyForm: ProfileForm = {
  full_name: "",
  phone: "",
  parent_phone: "",
  city: "",
  district: "",
  school: "",
  education_level: "",
  assigned_teacher_id: "",
};

export const Profile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [email, setEmail] = useState("");
  const [teachers, setTeachers] = useState<Array<{ id: string; full_name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isStudent = user?.role === "STUDENT" || !user?.role;

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    axios
      .get(`/api/profile?id=${user.id}`)
      .then(({ data }) => {
        const p = data.data;
        setEmail(p.email ?? "");
        setForm({
          full_name: p.full_name ?? "",
          phone: p.phone ?? "",
          parent_phone: p.parent_phone ?? "",
          city: p.city ?? "",
          district: p.district ?? "",
          school: p.school ?? "",
          education_level: p.education_level ?? "",
          assigned_teacher_id: p.assigned_teacher_id ?? "",
        });
      })
      .catch(() => toast.error("Profil yüklenemedi"))
      .finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => {
    if (!isStudent) return;
    axios
      .get("/api/teachers")
      .then(({ data }) => setTeachers(data.data ?? []))
      .catch(() => {});
  }, [isStudent]);

  const update = (k: keyof ProfileForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    try {
      const payload: any = { id: user.id, ...form };
      if (!isStudent) delete payload.assigned_teacher_id;
      await axios.patch("/api/profile", payload);
      toast.success("Profil güncellendi");
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Güncelleme başarısız");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="full_name">Ad Soyad</Label>
          <TextInput
            id="full_name"
            value={form.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">E-posta</Label>
          <TextInput id="email" value={email} disabled />
        </div>
        <div>
          <Label htmlFor="phone">Telefon</Label>
          <TextInput
            id="phone"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="05xx xxx xx xx"
          />
        </div>
        {isStudent && (
          <div>
            <Label htmlFor="parent_phone">Veli Telefonu</Label>
            <TextInput
              id="parent_phone"
              value={form.parent_phone}
              onChange={(e) => update("parent_phone", e.target.value)}
              placeholder="05xx xxx xx xx"
            />
          </div>
        )}
        <div>
          <Label htmlFor="city">İl</Label>
          <TextInput id="city" value={form.city} onChange={(e) => update("city", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="district">İlçe</Label>
          <TextInput
            id="district"
            value={form.district}
            onChange={(e) => update("district", e.target.value)}
          />
        </div>
        {isStudent && (
          <>
            <div>
              <Label htmlFor="school">Okul</Label>
              <TextInput
                id="school"
                value={form.school}
                onChange={(e) => update("school", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="education_level">Eğitim Durumu</Label>
              <Select
                id="education_level"
                value={form.education_level}
                onChange={(e) => update("education_level", e.target.value)}
              >
                {EDUCATION_LEVELS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="teacher">Öğretmen</Label>
              <Select
                id="teacher"
                value={form.assigned_teacher_id}
                onChange={(e) => update("assigned_teacher_id", e.target.value)}
              >
                <option value="">Öğretmen seçiniz (opsiyonel)</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-gray-400 mt-1">
                Seçim zorunlu değildir. Seçmezseniz yönetim size bir öğretmen atar.
              </p>
            </div>
          </>
        )}
      </div>

      <Button type="submit" color="primary" disabled={saving} className="w-full">
        {saving ? <Spinner size="sm" className="mr-2" /> : null}
        Profili Güncelle
      </Button>
    </form>
  );
};
