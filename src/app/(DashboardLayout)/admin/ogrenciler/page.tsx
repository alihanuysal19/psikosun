"use client";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { toast } from "react-toastify";

interface UserPackage {
  id: number;
  remaining: number;
  total: number;
  expires_at: string | null;
  package: { id: number; name: string; lesson_count: number };
}

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
  user_packages: UserPackage[];
}

interface Teacher {
  id: string;
  full_name: string;
}

interface Package {
  id: number;
  name: string;
  lesson_count: number;
  price: string | number;
  is_active: boolean;
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
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTeacher, setFilterTeacher] = useState<string>("ALL");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [packageModalStudent, setPackageModalStudent] = useState<Student | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [s, t, p] = await Promise.all([
        axios.get("/api/students"),
        axios.get("/api/teachers"),
        axios.get("/api/packages"),
      ]);
      setStudents(s.data.data ?? []);
      setTeachers(t.data.data ?? []);
      setPackages(p.data.data ?? []);
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

  const handleDeleteStudent = async (s: Student) => {
    if (!confirm(`${s.full_name} hesabını pasifleştirmek istediğinize emin misiniz?`)) return;
    try {
      await axios.delete(`/api/admin/students/${s.id}`);
      toast.success("Öğrenci pasifleştirildi.");
      setStudents((prev) => prev.filter((x) => x.id !== s.id));
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Silinemedi.");
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
            <table className="w-full text-sm min-w-[1000px]">
              <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Öğrenci</th>
                  <th className="px-5 py-3 text-left">İletişim</th>
                  <th className="px-5 py-3 text-left">Eğitim</th>
                  <th className="px-5 py-3 text-left">Paket</th>
                  <th className="px-5 py-3 text-left">Atanmış Öğretmen</th>
                  <th className="px-5 py-3 text-right">İşlem</th>
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
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setPackageModalStudent(s)}
                            className="text-xs inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            <Icon icon="tabler:package" width={13} />
                            Paket
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(s)}
                            className="text-xs inline-flex items-center gap-1 text-error hover:underline"
                          >
                            <Icon icon="tabler:trash" width={13} />
                            Sil
                          </button>
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

      {packageModalStudent && (
        <PackageModal
          student={packageModalStudent}
          packages={packages}
          onClose={() => setPackageModalStudent(null)}
          onChanged={(updated) => {
            setStudents((prev) =>
              prev.map((x) => (x.id === updated.id ? updated : x)),
            );
          }}
        />
      )}
    </div>
  );
}

function PackageModal({
  student,
  packages,
  onClose,
  onChanged,
}: {
  student: Student;
  packages: Package[];
  onClose: () => void;
  onChanged: (s: Student) => void;
}) {
  const [items, setItems] = useState<UserPackage[]>(student.user_packages);
  const [selectedPkg, setSelectedPkg] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const refreshStudent = async () => {
    const { data } = await axios.get(`/api/admin/students/${student.id}`);
    const updated: Student = {
      ...student,
      user_packages: data.data.user_packages ?? [],
    };
    setItems(updated.user_packages);
    onChanged(updated);
  };

  const handleAssign = async () => {
    if (!selectedPkg) return;
    setBusy(true);
    try {
      await axios.post("/api/packages/assign", {
        user_id: student.id,
        package_id: parseInt(selectedPkg),
      });
      toast.success("Paket atandı.");
      setSelectedPkg("");
      await refreshStudent();
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Atama başarısız.");
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateRemaining = async (up: UserPackage, newRemaining: number) => {
    if (newRemaining < 0 || newRemaining > up.total) return;
    try {
      await axios.patch(`/api/admin/user-packages/${up.id}`, { remaining: newRemaining });
      setItems((prev) =>
        prev.map((x) => (x.id === up.id ? { ...x, remaining: newRemaining } : x)),
      );
      onChanged({
        ...student,
        user_packages: items.map((x) =>
          x.id === up.id ? { ...x, remaining: newRemaining } : x,
        ),
      });
    } catch {
      toast.error("Kota güncellenemedi.");
    }
  };

  const handleDelete = async (up: UserPackage) => {
    if (!confirm(`${up.package.name} paketini silmek istediğinize emin misiniz?`)) return;
    try {
      await axios.delete(`/api/admin/user-packages/${up.id}`);
      toast.success("Paket silindi.");
      await refreshStudent();
    } catch {
      toast.error("Silinemedi.");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-darkgray rounded-2xl shadow-2xl max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-dark dark:text-white">
              Paket Yönetimi
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">{student.full_name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-dark dark:hover:text-white">
            <Icon icon="tabler:x" width={20} />
          </button>
        </div>

        {/* Paket atama */}
        <div className="flex gap-2 mb-5 pb-5 border-b border-border dark:border-darkborder">
          <select
            value={selectedPkg}
            onChange={(e) => setSelectedPkg(e.target.value)}
            className="flex-1 text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Paket seç...</option>
            {packages
              .filter((p) => p.is_active)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.lesson_count} ders · {p.price} ₺
                </option>
              ))}
          </select>
          <button
            onClick={handleAssign}
            disabled={!selectedPkg || busy}
            className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primaryemphasis disabled:opacity-50"
          >
            Ata
          </button>
        </div>

        {/* Mevcut paketler */}
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Mevcut Paketler</h4>
        {items.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Henüz paket atanmamış.</p>
        ) : (
          <div className="space-y-2">
            {items.map((up) => (
              <div
                key={up.id}
                className="border border-border dark:border-darkborder rounded-xl p-3 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon icon="tabler:package" className="text-primary" width={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark dark:text-white truncate">
                    {up.package.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {up.remaining}/{up.total} ders kaldı
                  </p>
                </div>
                <input
                  type="number"
                  min={0}
                  max={up.total}
                  defaultValue={up.remaining}
                  onBlur={(e) => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v) && v !== up.remaining) handleUpdateRemaining(up, v);
                  }}
                  className="w-16 text-sm text-center border border-border dark:border-darkborder rounded-lg py-1 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={() => handleDelete(up)}
                  className="text-gray-400 hover:text-error"
                  aria-label="Sil"
                >
                  <Icon icon="tabler:trash" width={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
