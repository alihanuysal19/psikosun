"use client";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { toast } from "react-toastify";

interface Student {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  district: string | null;
  school: string | null;
  education_level: string | null;
  assigned_teacher_id: string | null;
  assigned_teacher: { id: string; full_name: string } | null;
  user_packages: { remaining: number; total: number; package: { name: string } }[];
}

interface Teacher {
  id: string;
  full_name: string;
}

const educationLabels: Record<string, string> = {
  ILKOKUL: "İlkokul",
  ORTAOKUL: "Ortaokul",
  LISE: "Lise",
  UNIVERSITE: "Üniversite",
  MEZUN: "Mezun",
  DIGER: "Diğer",
};

export default function AdminOgrencilerPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTeacher, setFilterTeacher] = useState<string>("ALL");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([
        axios.get("/api/students"),
        axios.get("/api/teachers"),
      ]);
      setStudents(s.data.data ?? []);
      setTeachers(t.data.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAssign = async (studentId: string, teacherId: string) => {
    setSavingId(studentId);
    try {
      await axios.patch("/api/students", {
        student_id: studentId,
        teacher_id: teacherId || null,
      });
      const tName = teachers.find((t) => t.id === teacherId)?.full_name;
      toast.success(teacherId ? `${tName} atandı` : "Öğretmen ataması kaldırıldı");
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? {
                ...s,
                assigned_teacher_id: teacherId || null,
                assigned_teacher: teacherId
                  ? { id: teacherId, full_name: tName ?? "" }
                  : null,
              }
            : s,
        ),
      );
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Atama başarısız");
    } finally {
      setSavingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (filterTeacher === "NONE" && s.assigned_teacher_id) return false;
      if (filterTeacher !== "ALL" && filterTeacher !== "NONE" && s.assigned_teacher_id !== filterTeacher)
        return false;
      if (!q) return true;
      return (
        s.full_name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.school ?? "").toLowerCase().includes(q) ||
        (s.city ?? "").toLowerCase().includes(q)
      );
    });
  }, [students, search, filterTeacher]);

  const stats = useMemo(() => {
    const total = students.length;
    const unassigned = students.filter((s) => !s.assigned_teacher_id).length;
    return { total, unassigned };
  }, [students]);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Öğrenciler</h1>
          <p className="text-sm text-gray-500 mt-1">
            {stats.total} öğrenci · {stats.unassigned} atanmamış
          </p>
        </div>
      </div>

      {/* Filtre çubuğu */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Icon
            icon="tabler:search"
            width={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ad, e-posta, okul, il ara..."
            className="w-full text-sm border border-border dark:border-darkborder rounded-lg pl-9 pr-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={filterTeacher}
          onChange={(e) => setFilterTeacher(e.target.value)}
          className="text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="ALL">Tüm öğrenciler</option>
          <option value="NONE">Atanmamış</option>
          <optgroup label="Öğretmene göre">
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      <div className="bg-white dark:bg-darkgray rounded-xl shadow-sm border border-border dark:border-darkborder overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Icon icon="tabler:user-off" width={40} className="mx-auto mb-2 opacity-40" />
            <p>Öğrenci bulunamadı.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Öğrenci</th>
                  <th className="px-5 py-3 text-left">İletişim</th>
                  <th className="px-5 py-3 text-left">Eğitim</th>
                  <th className="px-5 py-3 text-left">Paket</th>
                  <th className="px-5 py-3 text-left">Atanmış Öğretmen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-darkborder">
                {filtered.map((s) => {
                  const pkg = s.user_packages[0];
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon icon="tabler:user" className="text-primary" width={15} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-dark dark:text-white truncate">
                              {s.full_name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        <div className="space-y-0.5">
                          {s.phone && (
                            <p className="flex items-center gap-1 text-xs">
                              <Icon icon="tabler:phone" width={12} /> {s.phone}
                            </p>
                          )}
                          {(s.city || s.district) && (
                            <p className="flex items-center gap-1 text-xs">
                              <Icon icon="tabler:map-pin" width={12} />
                              {[s.district, s.city].filter(Boolean).join(", ")}
                            </p>
                          )}
                          {!s.phone && !s.city && <span className="text-gray-300">—</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        <div className="space-y-0.5">
                          {s.school && <p className="text-xs">{s.school}</p>}
                          {s.education_level && (
                            <p className="text-xs text-gray-400">
                              {educationLabels[s.education_level] ?? s.education_level}
                            </p>
                          )}
                          {!s.school && !s.education_level && (
                            <span className="text-gray-300">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {pkg ? (
                          <div>
                            <p className="text-xs font-medium text-dark dark:text-white">
                              {pkg.package.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {pkg.remaining}/{pkg.total} ders
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">Paket yok</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            disabled={savingId === s.id}
                            value={s.assigned_teacher_id ?? ""}
                            onChange={(e) => handleAssign(s.id, e.target.value)}
                            className={`text-xs border rounded-lg px-2 py-1.5 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[180px] ${
                              s.assigned_teacher_id
                                ? "border-border dark:border-darkborder"
                                : "border-warning text-warning"
                            }`}
                          >
                            <option value="">— Atama yok —</option>
                            {teachers.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.full_name}
                              </option>
                            ))}
                          </select>
                          {savingId === s.id && (
                            <Icon
                              icon="tabler:loader-2"
                              width={14}
                              className="text-primary animate-spin"
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
