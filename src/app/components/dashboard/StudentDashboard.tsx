"use client";
import { useContext, useEffect, useState } from "react";
import AuthContext from "@/app/context/AuthContext";
import { Icon } from "@iconify/react";
import Link from "next/link";

interface UserPackage {
  id: number;
  remaining: number;
  total: number;
  expires_at: string | null;
  package: { name: string; lesson_count: number };
}

interface Lesson {
  id: number;
  scheduled_at: string;
  status: string;
  platform_link: string | null;
  teacher: { full_name: string };
}

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const [packages, setPackages] = useState<UserPackage[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      fetch(`/api/profile?id=${user.id}`).then((r) => r.json()),
      fetch(`/api/lessons?userId=${user.id}&role=STUDENT`).then((r) => r.json()),
    ]).then(([profileData, lessonData]) => {
      setPackages(profileData.data?.user_packages || []);
      setLessons(lessonData.data || []);
      setLoading(false);
    });
  }, [user?.id]);

  const activePackage = packages[0];
  const upcomingLessons = lessons.filter((l) => l.status === "SCHEDULED").slice(0, 3);
  const completedCount = lessons.filter((l) => l.status === "COMPLETED").length;

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
              <Icon icon="tabler:book" className="text-primary" width={20} />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Kalan Ders</span>
          </div>
          <p className="text-3xl font-bold text-dark dark:text-white">
            {activePackage?.remaining ?? 0}
          </p>
          {activePackage && (
            <p className="text-xs text-gray-400 mt-1">
              Toplam {activePackage.total} dersten
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-darkgray rounded-xl p-5 shadow-sm border border-border dark:border-darkborder">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Icon icon="tabler:check" className="text-success" width={20} />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tamamlanan</span>
          </div>
          <p className="text-3xl font-bold text-dark dark:text-white">{completedCount}</p>
          <p className="text-xs text-gray-400 mt-1">Toplam ders</p>
        </div>

        <div className="bg-white dark:bg-darkgray rounded-xl p-5 shadow-sm border border-border dark:border-darkborder">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Icon icon="tabler:calendar" className="text-warning" width={20} />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Yaklaşan</span>
          </div>
          <p className="text-3xl font-bold text-dark dark:text-white">{upcomingLessons.length}</p>
          <p className="text-xs text-gray-400 mt-1">Planlanmış ders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Aktif Paket */}
        <div className="bg-white dark:bg-darkgray rounded-xl p-5 shadow-sm border border-border dark:border-darkborder">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark dark:text-white">Aktif Paket</h3>
            <Link href="/paketim" className="text-xs text-primary hover:underline">Detay</Link>
          </div>
          {activePackage ? (
            <>
              <p className="font-medium text-dark dark:text-white mb-3">{activePackage.package.name}</p>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(activePackage.remaining / activePackage.total) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">
                {activePackage.remaining} / {activePackage.total} ders kaldı
              </p>
              {activePackage.expires_at && (
                <p className="text-xs text-gray-400 mt-1">
                  Son: {new Date(activePackage.expires_at).toLocaleDateString("tr-TR")}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400">Aktif paket yok.</p>
          )}
        </div>

        {/* Yaklaşan Dersler */}
        <div className="bg-white dark:bg-darkgray rounded-xl p-5 shadow-sm border border-border dark:border-darkborder">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark dark:text-white">Yaklaşan Dersler</h3>
            <Link href="/derslerim" className="text-xs text-primary hover:underline">Tümü</Link>
          </div>
          {upcomingLessons.length > 0 ? (
            <ul className="space-y-3">
              {upcomingLessons.map((lesson) => (
                <li key={lesson.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon icon="tabler:video" className="text-primary" width={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark dark:text-white truncate">
                      {lesson.teacher.full_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(lesson.scheduled_at).toLocaleString("tr-TR", {
                        day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {lesson.platform_link && (
                    <a
                      href={lesson.platform_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary border border-primary px-2 py-1 rounded hover:bg-primary/5"
                    >
                      Katıl
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">Yaklaşan ders yok.</p>
          )}
        </div>
      </div>
    </div>
  );
}
