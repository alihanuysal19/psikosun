"use client";
import { useContext, useEffect, useState } from "react";
import AuthContext from "@/app/context/AuthContext";
import { Icon } from "@iconify/react";
import axios from "axios";
import { toast } from "react-toastify";

interface Lesson {
  id: number;
  title: string;
  description: string | null;
  scheduled_at: string;
  ends_at: string;
  status: string;
  platform_link: string | null;
  student: { id: string; full_name: string; email: string };
  user_package: { remaining: number; package: { name: string } } | null;
}

interface Student {
  id: string;
  full_name: string;
  user_packages: { id: number; remaining: number; package: { name: string } }[];
}

const statusLabel: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: "Planlandı", color: "bg-warning/10 text-warning" },
  COMPLETED: { label: "Tamamlandı", color: "bg-success/10 text-success" },
  CANCELLED: { label: "İptal", color: "bg-error/10 text-error" },
};

const emptyForm = {
  student_id: "",
  title: "",
  description: "",
  scheduled_at: "",
  duration: "60",
  platform_link: "",
};

export default function OgretmenDerslerPage() {
  const { user } = useContext(AuthContext);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("SCHEDULED");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchLessons = () => {
    if (!user?.id) return;
    fetch(`/api/lessons?userId=${user.id}&role=TEACHER`)
      .then((r) => r.json())
      .then(({ data }) => {
        setLessons(data || []);
        setLoading(false);
      });
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
      toast.error("İşlem başarısız.");
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Bu dersi iptal etmek istediğinize emin misiniz?")) return;
    try {
      await axios.delete(`/api/lessons/${id}`);
      toast.success("Ders iptal edildi.");
      fetchLessons();
    } catch {
      toast.error("İptal edilemedi.");
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    try {
      const start = new Date(form.scheduled_at);
      const end = new Date(start.getTime() + parseInt(form.duration) * 60000);
      await axios.post("/api/lessons", {
        student_id: form.student_id,
        teacher_id: user.id,
        title: form.title,
        description: form.description || null,
        scheduled_at: start.toISOString(),
        ends_at: end.toISOString(),
        platform_link: form.platform_link || null,
      });
      toast.success("Ders oluşturuldu.");
      setShowForm(false);
      setForm(emptyForm);
      fetchLessons();
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Ders oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = filter === "ALL" ? lessons : lessons.filter((l) => l.status === filter);

  const groupedByDate = filtered.reduce<Record<string, Lesson[]>>((acc, l) => {
    const key = new Date(l.scheduled_at).toLocaleDateString("tr-TR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    (acc[key] ??= []).push(l);
    return acc;
  }, {});

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

      {showForm && (
        <form
          onSubmit={handleAddLesson}
          className="bg-white dark:bg-darkgray rounded-xl p-5 shadow-sm border border-primary mb-5"
        >
          <h3 className="font-semibold text-dark dark:text-white mb-4">Yeni Ders</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Öğrenci</label>
              <select
                required
                value={form.student_id}
                onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Öğrenci seçin</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Ders Konusu</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Örn. Sınav kaygısı seansı"
                className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Açıklama / İçerik (opsiyonel)</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Başlangıç</label>
              <input
                type="datetime-local"
                required
                value={form.scheduled_at}
                onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Süre (dakika)</label>
              <select
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="30">30 dk</option>
                <option value="45">45 dk</option>
                <option value="60">60 dk</option>
                <option value="90">90 dk</option>
                <option value="120">120 dk</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Platform Linki (Zoom / Meet)</label>
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
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-white text-sm px-5 py-2 rounded-lg hover:bg-primaryemphasis disabled:opacity-50"
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm);
              }}
              className="text-sm px-5 py-2 rounded-lg border border-border dark:border-darkborder hover:bg-gray-50"
            >
              İptal
            </button>
          </div>
        </form>
      )}

      <div className="flex gap-2 mb-5">
        {[
          ["SCHEDULED", "Planlı"],
          ["COMPLETED", "Tamamlanan"],
          ["CANCELLED", "İptal"],
          ["ALL", "Tümü"],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`text-sm px-4 py-2 rounded-lg transition-colors ${
              filter === val
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white dark:bg-darkgray rounded-xl border border-border dark:border-darkborder">
          <Icon icon="tabler:calendar-off" width={40} className="mx-auto mb-2 opacity-40" />
          <p>Ders bulunamadı.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([dateKey, items]) => (
            <div key={dateKey}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {dateKey}
              </h3>
              <div className="bg-white dark:bg-darkgray rounded-xl border border-border dark:border-darkborder divide-y divide-border dark:divide-darkborder overflow-hidden">
                {items.map((l) => {
                  const st = statusLabel[l.status];
                  const start = new Date(l.scheduled_at);
                  const end = new Date(l.ends_at);
                  return (
                    <div
                      key={l.id}
                      className="p-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="text-center w-16 flex-shrink-0">
                        <p className="text-xs text-gray-400">
                          {start.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="text-xs text-gray-300">
                          {end.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-dark dark:text-white">{l.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>
                            {st.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{l.student.full_name}</p>
                        {l.description && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{l.description}</p>
                        )}
                        {l.platform_link && l.status === "SCHEDULED" && (
                          <a
                            href={l.platform_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                          >
                            <Icon icon="tabler:video" width={13} />
                            Derse katıl
                          </a>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {l.status === "SCHEDULED" && (
                          <>
                            <button
                              onClick={() => handleComplete(l.id)}
                              className="text-xs bg-success text-white px-3 py-1.5 rounded-lg hover:bg-success/90"
                            >
                              Tamamla
                            </button>
                            <button
                              onClick={() => handleCancel(l.id)}
                              className="text-xs text-error hover:underline"
                            >
                              İptal Et
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
