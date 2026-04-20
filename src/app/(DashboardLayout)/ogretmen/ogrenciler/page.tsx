"use client";
import { useContext, useEffect, useState } from "react";
import AuthContext from "@/app/context/AuthContext";
import { Icon } from "@iconify/react";
import Link from "next/link";

interface Student {
  id: string;
  full_name: string;
  email: string;
  user_packages: { remaining: number; total: number; package: { name: string } }[];
  student_lessons: { scheduled_at: string }[];
}

export default function OgretmenOgrencilerPage() {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/students?teacherId=${user.id}`)
      .then((r) => r.json())
      .then(({ data }) => { setStudents(data || []); setLoading(false); });
  }, [user?.id]);

  const filtered = students.filter((s) =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Öğrencilerim</h1>
          <p className="text-sm text-gray-500 mt-1">{students.length} öğrenci</p>
        </div>
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
    </div>
  );
}
