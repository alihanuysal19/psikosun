"use client";
import { useContext, useEffect, useMemo, useState } from "react";
import AuthContext from "@/app/context/AuthContext";
import { Icon } from "@iconify/react";
import axios from "axios";
import { toast } from "react-toastify";

interface LessonEvent {
  id: number;
  title: string;
  description: string | null;
  scheduled_at: string;
  ends_at: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  platform_link: string | null;
  student: { id: string; full_name: string; avatar_url: string | null };
  teacher: { id: string; full_name: string; avatar_url: string | null };
}

interface StudentOption {
  id: string;
  full_name: string;
  assigned_teacher_id: string | null;
}

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

const statusStyle: Record<LessonEvent["status"], string> = {
  SCHEDULED: "bg-warning/10 text-warning border-l-2 border-warning",
  COMPLETED: "bg-success/10 text-success border-l-2 border-success",
  CANCELLED: "bg-error/10 text-error border-l-2 border-error line-through opacity-60",
};

const statusLabel: Record<LessonEvent["status"], string> = {
  SCHEDULED: "Planlandı",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal",
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export default function TakvimPage() {
  const { user } = useContext(AuthContext) as any;
  const role: "STUDENT" | "TEACHER" | "ADMIN" = user?.role ?? "STUDENT";
  const canCreate = role === "TEACHER" || role === "ADMIN";

  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [lessons, setLessons] = useState<LessonEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Date>(new Date());

  const [students, setStudents] = useState<StudentOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    student_id: "",
    title: "",
    description: "",
    scheduled_at: "",
    duration: "60",
    platform_link: "",
  });

  const monthStart = useMemo(() => startOfMonth(cursor), [cursor]);
  const monthEnd = useMemo(() => endOfMonth(cursor), [cursor]);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    const from = monthStart.toISOString();
    const to = monthEnd.toISOString();
    fetch(`/api/lessons?userId=${user.id}&role=${role}&from=${from}&to=${to}`)
      .then((r) => r.json())
      .then(({ data }) => setLessons(data || []))
      .finally(() => setLoading(false));
  }, [user?.id, role, monthStart, monthEnd]);

  useEffect(() => {
    if (!user?.id || !canCreate) return;
    const url =
      role === "ADMIN" ? `/api/students` : `/api/students?teacherId=${user.id}`;
    fetch(url)
      .then((r) => r.json())
      .then(({ data }) => setStudents(data || []));
  }, [user?.id, role, canCreate]);

  const grid = useMemo(() => {
    const firstDay = new Date(monthStart);
    const offset = (firstDay.getDay() + 6) % 7;
    const gridStart = new Date(firstDay);
    gridStart.setDate(firstDay.getDate() - offset);

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [monthStart]);

  const lessonsByDay = useMemo(() => {
    const map: Record<string, LessonEvent[]> = {};
    for (const l of lessons) {
      const d = new Date(l.scheduled_at);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      (map[key] ??= []).push(l);
    }
    for (const k in map) {
      map[k].sort(
        (a, b) =>
          new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
      );
    }
    return map;
  }, [lessons]);

  const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const selectedLessons = lessonsByDay[dayKey(selected)] ?? [];

  const goPrev = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const goNext = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  const goToday = () => {
    const now = new Date();
    setCursor(startOfMonth(now));
    setSelected(now);
  };

  const openFormForDay = (d: Date) => {
    const now = new Date();
    const target = new Date(d);
    if (sameDay(d, now)) {
      target.setHours(now.getHours() + 1, 0, 0, 0);
    } else {
      target.setHours(10, 0, 0, 0);
    }
    setForm((f) => ({ ...f, scheduled_at: toLocalInput(target) }));
    setShowForm(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    try {
      const start = new Date(form.scheduled_at);
      const end = new Date(start.getTime() + parseInt(form.duration) * 60000);

      let teacherId = user.id;
      if (role === "ADMIN") {
        const stu = students.find((s) => s.id === form.student_id);
        if (!stu?.assigned_teacher_id) {
          toast.error("Öğrenciye atanmış öğretmen yok, önce öğretmen atayın.");
          setSaving(false);
          return;
        }
        teacherId = stu.assigned_teacher_id;
      }

      await axios.post("/api/lessons", {
        student_id: form.student_id,
        teacher_id: teacherId,
        title: form.title,
        description: form.description || null,
        scheduled_at: start.toISOString(),
        ends_at: end.toISOString(),
        platform_link: form.platform_link || null,
      });
      toast.success("Ders oluşturuldu.");
      setShowForm(false);
      setForm({
        student_id: "",
        title: "",
        description: "",
        scheduled_at: "",
        duration: "60",
        platform_link: "",
      });
      const from = monthStart.toISOString();
      const to = monthEnd.toISOString();
      fetch(`/api/lessons?userId=${user.id}&role=${role}&from=${from}&to=${to}`)
        .then((r) => r.json())
        .then(({ data }) => setLessons(data || []));
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Ders oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  };

  const today = new Date();

  return (
    <div>
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Takvim</h1>
          <p className="text-sm text-gray-500 mt-1">
            {role === "STUDENT" && "Derslerinizi takvim üzerinde görüntüleyin"}
            {role === "TEACHER" && "Derslerinizi planlayın ve takip edin"}
            {role === "ADMIN" && "Tüm dersleri takvim üzerinde izleyin"}
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => openFormForDay(selected)}
            className="flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primaryemphasis"
          >
            <Icon icon="tabler:plus" width={16} />
            Ders Ekle
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        <div className="bg-white dark:bg-darkgray rounded-xl border border-border dark:border-darkborder overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-darkborder">
            <div className="flex items-center gap-2">
              <button
                onClick={goPrev}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Önceki ay"
              >
                <Icon icon="tabler:chevron-left" width={18} />
              </button>
              <button
                onClick={goNext}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Sonraki ay"
              >
                <Icon icon="tabler:chevron-right" width={18} />
              </button>
              <h2 className="ml-2 font-semibold text-dark dark:text-white">
                {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
              </h2>
            </div>
            <button
              onClick={goToday}
              className="text-xs px-3 py-1.5 rounded-lg border border-border dark:border-darkborder hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Bugün
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-[11px] font-medium text-gray-400 uppercase tracking-wider py-2 border-b border-border dark:border-darkborder">
            {WEEKDAYS.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-7 grid-rows-6">
              {grid.map((d, idx) => {
                const inMonth = d.getMonth() === cursor.getMonth();
                const isToday = sameDay(d, today);
                const isSelected = sameDay(d, selected);
                const dayLessons = lessonsByDay[dayKey(d)] ?? [];
                return (
                  <button
                    key={idx}
                    onClick={() => setSelected(d)}
                    className={`min-h-[56px] sm:min-h-[82px] p-1 sm:p-1.5 border-r border-b border-border dark:border-darkborder text-left transition-colors ${
                      !inMonth ? "bg-gray-50/50 dark:bg-gray-900/30 text-gray-400" : ""
                    } ${
                      isSelected
                        ? "bg-primary/5 ring-1 ring-primary/40"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                          isToday ? "bg-primary text-white" : "text-dark dark:text-white"
                        } ${!inMonth ? "text-gray-400" : ""}`}
                      >
                        {d.getDate()}
                      </span>
                      {dayLessons.length > 0 && (
                        <span className="text-[10px] text-gray-400">
                          {dayLessons.length}
                        </span>
                      )}
                    </div>
                    <div className="hidden sm:block mt-1 space-y-0.5">
                      {dayLessons.slice(0, 2).map((l) => (
                        <div
                          key={l.id}
                          className={`text-[10px] px-1.5 py-0.5 rounded truncate ${statusStyle[l.status]}`}
                          title={`${new Date(l.scheduled_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} · ${l.title}`}
                        >
                          {new Date(l.scheduled_at).toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          {l.title}
                        </div>
                      ))}
                      {dayLessons.length > 2 && (
                        <div className="text-[10px] text-gray-400 pl-1.5">
                          +{dayLessons.length - 2} daha
                        </div>
                      )}
                    </div>
                    {dayLessons.length > 0 && (
                      <div className="sm:hidden mt-0.5 flex justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <aside className="bg-white dark:bg-darkgray rounded-xl border border-border dark:border-darkborder">
          <div className="px-4 py-3 border-b border-border dark:border-darkborder">
            <p className="text-xs text-gray-400">Seçili gün</p>
            <p className="font-semibold text-dark dark:text-white">
              {selected.toLocaleDateString("tr-TR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="p-3 space-y-2 max-h-[520px] overflow-y-auto">
            {selectedLessons.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Icon icon="tabler:calendar-off" width={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Bu günde ders yok</p>
                {canCreate && (
                  <button
                    onClick={() => openFormForDay(selected)}
                    className="text-xs text-primary hover:underline mt-2"
                  >
                    Bu güne ders ekle
                  </button>
                )}
              </div>
            ) : (
              selectedLessons.map((l) => {
                const s = new Date(l.scheduled_at);
                const e = new Date(l.ends_at);
                const counterpart =
                  role === "STUDENT" ? l.teacher.full_name : l.student.full_name;
                const counterpartLabel =
                  role === "STUDENT"
                    ? "Öğretmen"
                    : role === "TEACHER"
                      ? "Öğrenci"
                      : `${l.teacher.full_name} · ${l.student.full_name}`;
                return (
                  <div
                    key={l.id}
                    className={`p-3 rounded-lg border border-border dark:border-darkborder ${statusStyle[l.status]}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium">
                        {s.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                        {" – "}
                        {e.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/60 dark:bg-black/20">
                        {statusLabel[l.status]}
                      </span>
                    </div>
                    <p className="font-semibold text-dark dark:text-white mt-1">{l.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {role === "ADMIN" ? counterpartLabel : `${counterpartLabel}: ${counterpart}`}
                    </p>
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
                );
              })
            )}
          </div>
        </aside>
      </div>

      {showForm && canCreate && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <form
            onSubmit={handleAdd}
            className="bg-white dark:bg-darkgray rounded-xl p-4 sm:p-5 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-dark dark:text-white">Yeni Ders</h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Icon icon="tabler:x" width={18} />
              </button>
            </div>
            <div className="space-y-3">
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
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Açıklama (opsiyonel)</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
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
                  <label className="text-xs text-gray-500 mb-1 block">Süre (dk)</label>
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
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Platform Linki (opsiyonel)
                </label>
                <input
                  type="url"
                  placeholder="https://zoom.us/j/1234567890"
                  pattern="https?://.+"
                  title="Link https:// veya http:// ile başlamalı. Örn: https://zoom.us/j/123"
                  value={form.platform_link}
                  onChange={(e) => {
                    const v = e.target.value;
                    e.target.setCustomValidity(
                      v && !/^https?:\/\/.+/.test(v)
                        ? 'Link "https://" veya "http://" ile başlamalı. Örn: https://meet.google.com/xxx-yyyy-zzz'
                        : "",
                    );
                    setForm({ ...form, platform_link: v });
                  }}
                  className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Zoom / Google Meet / Microsoft Teams adresini olduğu gibi yapıştır.
                  Başında <span className="font-mono">https://</span> bulunmalı.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-primary text-white text-sm px-5 py-2 rounded-lg hover:bg-primaryemphasis disabled:opacity-50"
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm px-5 py-2 rounded-lg border border-border dark:border-darkborder hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
