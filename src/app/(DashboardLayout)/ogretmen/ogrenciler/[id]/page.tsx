"use client";
import { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  platform_link: string | null;
  teacher: { id: string; full_name: string };
}

interface Note {
  id: number;
  content: string;
  created_at: string;
  teacher: { id: string; full_name: string };
}

interface UserPackage {
  id: number;
  remaining: number;
  total: number;
  purchased_at: string;
  expires_at: string | null;
  package: { id: number; name: string; lesson_count: number; price: string };
}

interface Student {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  parent_phone: string | null;
  city: string | null;
  district: string | null;
  school: string | null;
  education_level: string | null;
  birth_date: string | null;
  avatar_url: string | null;
  assigned_teacher_id: string | null;
  assigned_teacher: { id: string; full_name: string; email: string } | null;
  created_at: string;
  user_packages: UserPackage[];
  student_lessons: Lesson[];
  student_notes: Note[];
}

const educationLabels: Record<string, string> = {
  ILKOKUL: "İlkokul",
  ORTAOKUL: "Ortaokul",
  LISE: "Lise",
  UNIVERSITE: "Üniversite",
  MEZUN: "Mezun",
  DIGER: "Diğer",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function statusBadge(s: Lesson["status"]) {
  if (s === "COMPLETED") return { label: "Tamamlandı", color: "bg-success/10 text-success" };
  if (s === "CANCELLED") return { label: "İptal", color: "bg-error/10 text-error" };
  return { label: "Planlandı", color: "bg-primary/10 text-primary" };
}

export default function OgrenciDetayPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useContext(AuthContext) as any;
  const studentId = String(params?.id ?? "");

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dersler" | "notlar" | "paketler">("dersler");

  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (!studentId || !user?.id) return;
    setLoading(true);
    setError(null);
    fetch(`/api/students/${studentId}?teacherId=${user.id}`)
      .then(async (r) => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.error || "Yüklenemedi");
        }
        return r.json();
      })
      .then(({ data }) => setStudent(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [studentId, user?.id]);

  const stats = useMemo(() => {
    if (!student) return { upcoming: 0, completed: 0, totalRemaining: 0 };
    const upcoming = student.student_lessons.filter((l) => l.status === "SCHEDULED").length;
    const completed = student.student_lessons.filter((l) => l.status === "COMPLETED").length;
    const totalRemaining = student.user_packages.reduce((s, p) => s + p.remaining, 0);
    return { upcoming, completed, totalRemaining };
  }, [student]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !user?.id || !student) return;
    setSavingNote(true);
    try {
      const { data } = await axios.post("/api/notes", {
        student_id: student.id,
        teacher_id: user.id,
        content: newNote.trim(),
      });
      setStudent({
        ...student,
        student_notes: [
          {
            id: data.data.id,
            content: data.data.content,
            created_at: data.data.created_at,
            teacher: { id: user.id, full_name: user.full_name ?? "Sen" },
          },
          ...student.student_notes,
        ],
      });
      setNewNote("");
      toast.success("Not eklendi.");
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Eklenemedi.");
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Icon icon="tabler:alert-triangle" width={40} className="mx-auto mb-3 text-error" />
        <p className="text-gray-500 mb-4">{error ?? "Öğrenci bulunamadı."}</p>
        <button
          onClick={() => router.push("/ogretmen/ogrenciler")}
          className="text-primary text-sm hover:underline"
        >
          Öğrenci listesine dön
        </button>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/ogretmen/ogrenciler"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4"
      >
        <Icon icon="tabler:arrow-left" width={16} />
        Öğrencilerim
      </Link>

      {/* Profil kartı */}
      <div className="bg-white dark:bg-darkgray rounded-xl border border-border dark:border-darkborder p-5 sm:p-6 mb-5">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden text-primary text-2xl font-semibold flex-shrink-0">
            {student.avatar_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={student.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              student.full_name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-dark dark:text-white">
              {student.full_name}
            </h1>
            <p className="text-sm text-gray-500">{student.email}</p>
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
              {student.phone && (
                <span className="inline-flex items-center gap-1">
                  <Icon icon="tabler:phone" width={13} />
                  {student.phone}
                </span>
              )}
              {student.parent_phone && (
                <span className="inline-flex items-center gap-1">
                  <Icon icon="tabler:user" width={13} />
                  Veli: {student.parent_phone}
                </span>
              )}
              {(student.city || student.district) && (
                <span className="inline-flex items-center gap-1">
                  <Icon icon="tabler:map-pin" width={13} />
                  {[student.district, student.city].filter(Boolean).join(", ")}
                </span>
              )}
              {student.school && (
                <span className="inline-flex items-center gap-1">
                  <Icon icon="tabler:school" width={13} />
                  {student.school}
                </span>
              )}
              {student.education_level && (
                <span className="inline-flex items-center gap-1">
                  <Icon icon="tabler:book" width={13} />
                  {educationLabels[student.education_level] ?? student.education_level}
                </span>
              )}
              {student.birth_date && (
                <span className="inline-flex items-center gap-1">
                  <Icon icon="tabler:cake" width={13} />
                  {formatDate(student.birth_date)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border dark:border-darkborder">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.totalRemaining}</p>
            <p className="text-xs text-gray-500 mt-1">Kalan ders</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">{stats.upcoming}</p>
            <p className="text-xs text-gray-500 mt-1">Yaklaşan ders</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{stats.completed}</p>
            <p className="text-xs text-gray-500 mt-1">Tamamlanan</p>
          </div>
        </div>
      </div>

      {/* Sekmeler */}
      <div className="flex items-center gap-1 mb-4 border-b border-border dark:border-darkborder">
        {(
          [
            { key: "dersler", label: "Dersler", icon: "tabler:calendar" },
            { key: "notlar", label: "Notlar", icon: "tabler:notes" },
            { key: "paketler", label: "Paketler", icon: "tabler:package" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-dark dark:hover:text-white"
            }`}
          >
            <Icon icon={t.icon} width={15} />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "dersler" && (
        <div className="bg-white dark:bg-darkgray rounded-xl border border-border dark:border-darkborder p-5">
          {student.student_lessons.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-10">Henüz ders yok.</p>
          ) : (
            <div className="space-y-3">
              {student.student_lessons.map((l) => {
                const badge = statusBadge(l.status);
                return (
                  <div
                    key={l.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border dark:border-darkborder"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                      <Icon icon="tabler:calendar" width={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-dark dark:text-white">{l.title}</p>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDateTime(l.scheduled_at)}
                      </p>
                      {l.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1.5 whitespace-pre-wrap">
                          {l.description}
                        </p>
                      )}
                      {l.platform_link && (
                        <a
                          href={l.platform_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1.5"
                        >
                          <Icon icon="tabler:video" width={12} />
                          Ders linki
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "notlar" && (
        <div className="bg-white dark:bg-darkgray rounded-xl border border-border dark:border-darkborder p-5">
          <form onSubmit={handleAddNote} className="mb-5">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Öğrenci hakkında bir not yaz..."
              rows={3}
              className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={savingNote || !newNote.trim()}
                className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primaryemphasis disabled:opacity-50"
              >
                {savingNote ? "Kaydediliyor..." : "Not Ekle"}
              </button>
            </div>
          </form>

          {student.student_notes.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">Henüz not yok.</p>
          ) : (
            <div className="space-y-3">
              {student.student_notes.map((n) => (
                <div
                  key={n.id}
                  className="border-l-4 border-primary/40 bg-gray-50 dark:bg-gray-800 rounded-r-lg p-3"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-xs font-medium text-dark dark:text-white">
                      {n.teacher.full_name}
                    </p>
                    <p className="text-[10px] text-gray-400">{formatDateTime(n.created_at)}</p>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                    {n.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "paketler" && (
        <div className="bg-white dark:bg-darkgray rounded-xl border border-border dark:border-darkborder p-5">
          {student.user_packages.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-10">Henüz paket atanmamış.</p>
          ) : (
            <div className="space-y-3">
              {student.user_packages.map((up) => {
                const pct = up.total > 0 ? (up.remaining / up.total) * 100 : 0;
                return (
                  <div
                    key={up.id}
                    className="border border-border dark:border-darkborder rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-sm font-medium text-dark dark:text-white">
                          {up.package.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDate(up.purchased_at)} satın alındı
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-primary">
                        {up.remaining}/{up.total} ders
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct > 50 ? "bg-success" : pct > 20 ? "bg-warning" : "bg-error"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {up.expires_at && (
                      <p className="text-[11px] text-gray-400 mt-2">
                        Bitiş: {formatDate(up.expires_at)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
