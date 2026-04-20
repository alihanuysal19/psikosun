"use client";
import { useContext, useEffect, useState } from "react";
import AuthContext from "@/app/context/AuthContext";
import { Icon } from "@iconify/react";
import Link from "next/link";
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
  email: string;
  user_packages: { remaining: number; total: number; package: { name: string } }[];
}

export default function TeacherDashboard() {
  const { user } = useContext(AuthContext);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    if (!user?.id) return;
    Promise.all([
      fetch(`/api/lessons?userId=${user.id}&role=TEACHER`).then((r) => r.json()),
      fetch(`/api/students`).then((r) => r.json()),
    ]).then(([lessonData, studentData]) => {
      setLessons(lessonData.data || []);
      setStudents(studentData.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, [user?.id]);

  const handleComplete = async (lessonId: number) => {
    try {
      await axios.post(`/api/lessons/${lessonId}/complete`);
      toast.success("Ders tamamlandı, kota düşüldü.");
      fetchData();
    } catch {
      toast.error("Bir hata oluştu.");
    }
  };

  const scheduledLessons = lessons.filter((l) => l.status === "SCHEDULED");
  const completedToday = lessons.filter((l) => {
    if (l.status !== "COMPLETED") return false;
    const today = new Date().toDateString();
    return new Date(l.scheduled_at).toDateString() === today;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Üst kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-darkgray rounded-xl p-5 shadow-sm border border-border dark:border-darkborder">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon icon="tabler:users" className="text-primary" width={20} />
            </div>
            <span className="text-sm font-medium text-gray-500">Toplam Öğrenci</span>
          </div>
          <p className="text-3xl font-bold text-dark dark:text-white">{students.length}</p>
        </div>

        <div className="bg-white dark:bg-darkgray rounded-xl p-5 shadow-sm border border-border dark:border-darkborder">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Icon icon="tabler:calendar-event" className="text-warning" width={20} />
            </div>
            <span className="text-sm font-medium text-gray-500">Bekleyen Ders</span>
          </div>
          <p className="text-3xl font-bold text-dark dark:text-white">{scheduledLessons.length}</p>
        </div>

        <div className="bg-white dark:bg-darkgray rounded-xl p-5 shadow-sm border border-border dark:border-darkborder">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Icon icon="tabler:check" className="text-success" width={20} />
            </div>
            <span className="text-sm font-medium text-gray-500">Bugün Tamamlanan</span>
          </div>
          <p className="text-3xl font-bold text-dark dark:text-white">{completedToday.length}</p>
        </div>
      </div>

      {/* Bekleyen Dersler */}
      <div className="bg-white dark:bg-darkgray rounded-xl shadow-sm border border-border dark:border-darkborder">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border dark:border-darkborder">
          <h3 className="font-semibold text-dark dark:text-white">Bekleyen Dersler</h3>
          <Link href="/ogretmen/dersler" className="text-xs text-primary hover:underline">Tümü</Link>
        </div>
        <div className="p-5">
          {scheduledLessons.length > 0 ? (
            <div className="space-y-3">
              {scheduledLessons.slice(0, 5).map((lesson) => (
                <div key={lesson.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon icon="tabler:user" className="text-primary" width={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark dark:text-white">{lesson.student.full_name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(lesson.scheduled_at).toLocaleString("tr-TR", {
                        day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {lesson.user_package && (
                    <span className="text-xs text-gray-400 hidden sm:block">
                      {lesson.user_package.remaining} ders kaldı
                    </span>
                  )}
                  <button
                    onClick={() => handleComplete(lesson.id)}
                    className="text-xs bg-success text-white px-3 py-1.5 rounded-lg hover:bg-success/90 transition-colors flex-shrink-0"
                  >
                    Tamamla
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Bekleyen ders yok.</p>
          )}
        </div>
      </div>

      {/* Öğrenci Listesi */}
      <div className="bg-white dark:bg-darkgray rounded-xl shadow-sm border border-border dark:border-darkborder">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border dark:border-darkborder">
          <h3 className="font-semibold text-dark dark:text-white">Öğrenciler</h3>
          <Link href="/ogretmen/ogrenciler" className="text-xs text-primary hover:underline">Tümü</Link>
        </div>
        <div className="p-5">
          {students.length > 0 ? (
            <div className="space-y-3">
              {students.slice(0, 5).map((student) => {
                const pkg = student.user_packages[0];
                return (
                  <div key={student.id} className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon icon="tabler:user" className="text-primary" width={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark dark:text-white truncate">{student.full_name}</p>
                      <p className="text-xs text-gray-400 truncate">{student.email}</p>
                    </div>
                    {pkg ? (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        pkg.remaining > 3 ? "bg-success/10 text-success" :
                        pkg.remaining > 0 ? "bg-warning/10 text-warning" :
                        "bg-error/10 text-error"
                      }`}>
                        {pkg.remaining} ders
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Paket yok</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Henüz öğrenci yok.</p>
          )}
        </div>
      </div>
    </div>
  );
}
