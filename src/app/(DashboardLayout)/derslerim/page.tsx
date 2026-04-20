"use client";
import { useContext, useEffect, useState } from "react";
import AuthContext from "@/app/context/AuthContext";
import { Icon } from "@iconify/react";

interface Lesson {
  id: number;
  scheduled_at: string;
  status: string;
  platform_link: string | null;
  teacher: { full_name: string };
  user_package: { package: { name: string } } | null;
}

const statusLabel: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: "Planlandı", color: "bg-warning/10 text-warning" },
  COMPLETED: { label: "Tamamlandı", color: "bg-success/10 text-success" },
  CANCELLED: { label: "İptal", color: "bg-error/10 text-error" },
};

export default function DerslerimPage() {
  const { user } = useContext(AuthContext);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/lessons?userId=${user.id}&role=STUDENT`)
      .then((r) => r.json())
      .then(({ data }) => { setLessons(data || []); setLoading(false); });
  }, [user?.id]);

  const filtered = filter === "ALL" ? lessons : lessons.filter((l) => l.status === filter);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark dark:text-white">Derslerim</h1>
        <p className="text-sm text-gray-500 mt-1">Tüm ders geçmişiniz ve planlanmış dersleriniz</p>
      </div>

      {/* Filtre */}
      <div className="flex gap-2 mb-5">
        {[["ALL", "Tümü"], ["SCHEDULED", "Yaklaşan"], ["COMPLETED", "Tamamlanan"], ["CANCELLED", "İptal"]].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`text-sm px-4 py-2 rounded-lg transition-colors ${
              filter === val ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
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
                <th className="px-5 py-3 text-left">Öğretmen</th>
                <th className="px-5 py-3 text-left">Tarih & Saat</th>
                <th className="px-5 py-3 text-left">Paket</th>
                <th className="px-5 py-3 text-left">Durum</th>
                <th className="px-5 py-3 text-left">Bağlantı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-darkborder">
              {filtered.map((lesson) => {
                const st = statusLabel[lesson.status];
                return (
                  <tr key={lesson.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-5 py-4 font-medium text-dark dark:text-white">{lesson.teacher.full_name}</td>
                    <td className="px-5 py-4 text-gray-500">
                      {new Date(lesson.scheduled_at).toLocaleString("tr-TR", {
                        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-4 text-gray-500">{lesson.user_package?.package.name ?? "-"}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-5 py-4">
                      {lesson.platform_link ? (
                        <a href={lesson.platform_link} target="_blank" rel="noreferrer"
                          className="text-primary text-xs flex items-center gap-1 hover:underline">
                          <Icon icon="tabler:external-link" width={14} /> Katıl
                        </a>
                      ) : <span className="text-gray-300">—</span>}
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
