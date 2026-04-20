"use client";
import { useContext, useEffect, useState } from "react";
import AuthContext from "@/app/context/AuthContext";
import { Icon } from "@iconify/react";
import axios from "axios";
import { toast } from "react-toastify";

interface Lesson {
  id: number;
  scheduled_at: string;
  status: string;
  platform_link: string | null;
  deducted: boolean;
  student: { id: string; full_name: string; email: string };
  user_package: { remaining: number; total: number; package: { name: string } } | null;
}

interface Student {
  id: string;
  full_name: string;
  user_packages: { id: number; remaining: number; package: { name: string } }[];
}

const statusLabel: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: "Bekliyor", color: "bg-warning/10 text-warning" },
  COMPLETED: { label: "Tamamlandı", color: "bg-success/10 text-success" },
  CANCELLED: { label: "İptal", color: "bg-error/10 text-error" },
};

export default function OgretmenDerslerPage() {
  const { user } = useContext(AuthContext);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("SCHEDULED");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ student_id: "", user_package_id: "", scheduled_at: "", platform_link: "" });

  const fetchLessons = () => {
    if (!user?.id) return;
    fetch(`/api/lessons?userId=${user.id}&role=TEACHER`)
      .then((r) => r.json())
      .then(({ data }) => { setLessons(data || []); setLoading(false); });
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchLessons();
    fetch(`/api/students?teacherId=${user.id}`)
      .then((r) => r.json())
      .then(({ data }) => setStudents(data || []));
  }, [user?.id]);

  const handleComplete = async (id: number) => {
    try {
      await axios.post(`/api/lessons/${id}/complete`);
      toast.success("Ders tamamlandı, kota düşüldü.");
      fetchLessons();
    } catch {
      toast.error("Bir hata oluştu.");
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/lessons", {
        student_id: form.student_id,
        teacher_id: user?.id,
        user_package_id: form.user_package_id ? parseInt(form.user_package_id) : null,
        scheduled_at: form.scheduled_at,
        platform_link: form.platform_link || null,
      });
      toast.success("Ders eklendi.");
      setShowForm(false);
      setForm({ student_id: "", user_package_id: "", scheduled_at: "", platform_link: "" });
      fetchLessons();
    } catch {
      toast.error("Ders eklenemedi.");
    }
  };

  const selectedStudentPackages = students.find((s) => s.id === form.student_id)?.user_packages || [];
  const filtered = filter === "ALL" ? lessons : lessons.filter((l) => l.status === filter);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Ders Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-1">Dersleri planlayın ve yönetin</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primaryemphasis transition-colors"
        >
          <Icon icon="tabler:plus" width={16} />
          Ders Ekle
        </button>
      </div>

      {/* Ders Ekleme Formu */}
      {showForm && (
        <form onSubmit={handleAddLesson} className="bg-white dark:bg-darkgray rounded-xl p-5 shadow-sm border border-primary mb-5">
          <h3 className="font-semibold text-dark dark:text-white mb-4">Yeni Ders</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Öğrenci</label>
              <select
                required
                value={form.student_id}
                onChange={(e) => setForm({ ...form, student_id: e.target.value, user_package_id: "" })}
                className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Öğrenci seçin</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Paket (opsiyonel)</label>
              <select
                value={form.user_package_id}
                onChange={(e) => setForm({ ...form, user_package_id: e.target.value })}
                className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Paket seçin</option>
                {selectedStudentPackages.map((p) => (
                  <option key={p.id} value={p.id}>{p.package.name} ({p.remaining} ders kaldı)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tarih & Saat</label>
              <input
                type="datetime-local"
                required
                value={form.scheduled_at}
                onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Platform Linki (Zoom vb.)</label>
              <input
                type="url"
                placeholder="https://zoom.us/j/..."
                value={form.platform_link}
                onChange={(e) => setForm({ ...form, platform_link: e.target.value })}
                className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-primary text-white text-sm px-5 py-2 rounded-lg hover:bg-primaryemphasis">Kaydet</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm px-5 py-2 rounded-lg border border-border dark:border-darkborder hover:bg-gray-50">İptal</button>
          </div>
        </form>
      )}

      {/* Filtre */}
      <div className="flex gap-2 mb-5">
        {[["SCHEDULED", "Bekleyen"], ["COMPLETED", "Tamamlanan"], ["ALL", "Tümü"]].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`text-sm px-4 py-2 rounded-lg transition-colors ${
              filter === val ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
            }`}>
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-darkgray rounded-xl shadow-sm border border-border dark:border-darkborder overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Icon icon="tabler:calendar-off" width={40} className="mx-auto mb-2 opacity-40" />
            <p>Ders bulunamadı.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Öğrenci</th>
                <th className="px-5 py-3 text-left">Tarih & Saat</th>
                <th className="px-5 py-3 text-left">Paket</th>
                <th className="px-5 py-3 text-left">Durum</th>
                <th className="px-5 py-3 text-left">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-darkborder">
              {filtered.map((l) => {
                const st = statusLabel[l.status];
                return (
                  <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-dark dark:text-white">{l.student.full_name}</p>
                      <p className="text-xs text-gray-400">{l.student.email}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {new Date(l.scheduled_at).toLocaleString("tr-TR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {l.user_package ? `${l.user_package.package.name} (${l.user_package.remaining} kaldı)` : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-5 py-4">
                      {l.status === "SCHEDULED" && (
                        <button
                          onClick={() => handleComplete(l.id)}
                          className="text-xs bg-success text-white px-3 py-1.5 rounded-lg hover:bg-success/90 transition-colors"
                        >
                          Tamamla
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
