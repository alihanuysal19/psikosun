"use client";
import { useContext, useEffect, useState } from "react";
import AuthContext from "@/app/context/AuthContext";
import { Icon } from "@iconify/react";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-toastify";

interface Student {
  id: string;
  full_name: string;
  email: string;
  user_packages: { remaining: number; total: number; package: { name: string } }[];
  student_lessons: { scheduled_at: string }[];
}

const EDUCATION_OPTIONS: [string, string][] = [
  ["ILKOKUL", "İlkokul"],
  ["ORTAOKUL", "Ortaokul"],
  ["LISE", "Lise"],
  ["UNIVERSITE", "Üniversite"],
  ["MEZUN", "Mezun"],
  ["DIGER", "Diğer"],
];

const emptyNewStudent = {
  email: "",
  full_name: "",
  phone: "",
  city: "",
  education_level: "",
  password: "",
};

export default function OgretmenOgrencilerPage() {
  const { user } = useContext(AuthContext) as any;
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyNewStudent);
  const [creating, setCreating] = useState(false);
  const [createdInfo, setCreatedInfo] = useState<{ email: string; password: string } | null>(null);

  const load = () => {
    if (!user?.id) return;
    fetch(`/api/students?teacherId=${user.id}`)
      .then((r) => r.json())
      .then(({ data }) => {
        setStudents(data || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    const email = createForm.email.trim();
    const full_name = createForm.full_name.trim();
    if (full_name.length < 2) return toast.error("Ad soyad girin.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return toast.error("Geçerli bir e-posta girin.");
    if (createForm.password && createForm.password.length < 6)
      return toast.error("Şifre en az 6 karakter olmalı.");

    setCreating(true);
    try {
      const res = await axios.post("/api/users/create-student", {
        caller_id: user.id,
        email,
        full_name,
        phone: createForm.phone.trim() || undefined,
        city: createForm.city.trim() || undefined,
        education_level: createForm.education_level || undefined,
        password: createForm.password || undefined,
      });
      const tempPw = res.data.data.temp_password as string;
      setCreatedInfo({ email, password: tempPw });
      setCreateForm(emptyNewStudent);
      toast.success("Öğrenci oluşturuldu ve size atandı.");
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Oluşturulamadı.");
    } finally {
      setCreating(false);
    }
  };

  const filtered = students.filter((s) =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Öğrencilerim</h1>
          <p className="text-sm text-gray-500 mt-1">{students.length} öğrenci</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primaryemphasis transition-colors"
        >
          <Icon icon="tabler:user-plus" width={16} />
          Öğrenci Ekle
        </button>
      </div>

      {/* Arama */}
      <div className="relative mb-5">
        <Icon icon="tabler:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width={16} />
        <input
          type="text"
          placeholder="İsim veya e-posta ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-border dark:border-darkborder rounded-lg bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="bg-white dark:bg-darkgray rounded-xl shadow-sm border border-border dark:border-darkborder overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Icon icon="tabler:users-off" width={40} className="mx-auto mb-2 opacity-40" />
            <p>Öğrenci bulunamadı.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Öğrenci</th>
                <th className="px-5 py-3 text-left">Paket</th>
                <th className="px-5 py-3 text-left">Kalan Ders</th>
                <th className="px-5 py-3 text-left">Sonraki Ders</th>
                <th className="px-5 py-3 text-left">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-darkborder">
              {filtered.map((s) => {
                const pkg = s.user_packages[0];
                const nextLesson = s.student_lessons[0];
                const pct = pkg ? (pkg.remaining / pkg.total) * 100 : 0;
                return (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon icon="tabler:user" className="text-primary" width={15} />
                        </div>
                        <div>
                          <p className="font-medium text-dark dark:text-white">{s.full_name}</p>
                          <p className="text-xs text-gray-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{pkg?.package.name ?? <span className="text-gray-300">—</span>}</td>
                    <td className="px-5 py-4">
                      {pkg ? (
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            pct > 50 ? "bg-success/10 text-success" :
                            pct > 20 ? "bg-warning/10 text-warning" :
                            "bg-error/10 text-error"
                          }`}>
                            {pkg.remaining} ders
                          </span>
                        </div>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      {nextLesson
                        ? new Date(nextLesson.scheduled_at).toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/ogretmen/ogrenciler/${s.id}`}
                        className="text-xs text-primary border border-primary px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
                        Detay
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {createOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !creating) {
              setCreateOpen(false);
              setCreatedInfo(null);
            }
          }}
        >
          <div className="bg-white dark:bg-darkgray rounded-xl p-4 sm:p-6 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-dark dark:text-white">
                {createdInfo ? "Öğrenci Oluşturuldu" : "Yeni Öğrenci"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setCreateOpen(false);
                  setCreatedInfo(null);
                }}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Icon icon="tabler:x" width={18} />
              </button>
            </div>

            {createdInfo ? (
              <div className="space-y-4">
                <div className="bg-success/10 border border-success/30 rounded-lg p-4">
                  <p className="text-sm font-medium text-success flex items-center gap-2">
                    <Icon icon="tabler:check" width={18} />
                    Hesap oluşturuldu ve size atandı
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                    Bilgileri öğrencinize iletin. İlk girişten sonra şifresini değiştirebilir.
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">E-posta</p>
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                      <span className="font-mono break-all">{createdInfo.email}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(createdInfo.email);
                          toast.success("E-posta kopyalandı");
                        }}
                        className="text-primary hover:text-primaryemphasis flex-shrink-0 ml-2"
                      >
                        <Icon icon="tabler:copy" width={16} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Geçici Şifre</p>
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                      <span className="font-mono">{createdInfo.password}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(createdInfo.password);
                          toast.success("Şifre kopyalandı");
                        }}
                        className="text-primary hover:text-primaryemphasis flex-shrink-0 ml-2"
                      >
                        <Icon icon="tabler:copy" width={16} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreatedInfo(null)}
                    className="flex-1 bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primaryemphasis"
                  >
                    Başka öğrenci ekle
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreateOpen(false);
                      setCreatedInfo(null);
                    }}
                    className="text-sm px-4 py-2 rounded-lg border border-border dark:border-darkborder hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 text-xs text-gray-600 dark:text-gray-300">
                  <Icon icon="tabler:info-circle" width={14} className="inline mr-1" />
                  Eklediğiniz öğrenci otomatik olarak size atanacak.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">Ad Soyad *</label>
                    <input
                      required
                      value={createForm.full_name}
                      onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                      className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">E-posta *</label>
                    <input
                      type="email"
                      required
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Telefon</label>
                    <input
                      type="tel"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                      className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Şehir</label>
                    <input
                      value={createForm.city}
                      onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                      className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">Eğitim Seviyesi</label>
                    <select
                      value={createForm.education_level}
                      onChange={(e) => setCreateForm({ ...createForm, education_level: e.target.value })}
                      className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="">Seçim yok</option>
                      {EDUCATION_OPTIONS.map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">
                      Şifre (boş bırakırsan otomatik üretilir)
                    </label>
                    <input
                      type="text"
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      placeholder="En az 6 karakter, boş bırak → otomatik"
                      className="w-full text-sm font-mono border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-3">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-primary text-white text-sm px-5 py-2 rounded-lg hover:bg-primaryemphasis disabled:opacity-50"
                  >
                    {creating ? "Oluşturuluyor..." : "Öğrenciyi Oluştur"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreateOpen(false);
                      setCreateForm(emptyNewStudent);
                    }}
                    disabled={creating}
                    className="text-sm px-5 py-2 rounded-lg border border-border dark:border-darkborder hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    İptal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
