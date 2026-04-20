"use client";
import { useContext, useEffect, useState } from "react";
import AuthContext from "@/app/context/AuthContext";
import { Icon } from "@iconify/react";

interface Lesson {
  id: number;
  title: string;
  description: string | null;
  scheduled_at: string;
  ends_at: string;
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
      .then(({ data }) => {
        setLessons(data || []);
        setLoading(false);
      });
  }, [user?.id]);

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark dark:text-white">Derslerim</h1>
        <p className="text-sm text-gray-500 mt-1">Tüm ders geçmişiniz ve planlanmış dersleriniz</p>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          ["ALL", "Tümü"],
          ["SCHEDULED", "Yaklaşan"],
          ["COMPLETED", "Tamamlanan"],
          ["CANCELLED", "İptal"],
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
                        <p className="text-sm text-gray-500 mt-0.5">{l.teacher.full_name}</p>
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
