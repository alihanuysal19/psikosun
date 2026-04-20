"use client";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { toast } from "react-toastify";

interface Teacher {
  id: string;
  full_name: string;
  email: string;
  my_students: { id: string }[];
  created_at: string;
}

export default function AdminOgretmenlerPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: "", full_name: "", password: "" });

  const fetchTeachers = () => {
    fetch("/api/admin/teachers")
      .then((r) => r.json())
      .then(({ data }) => { setTeachers(data || []); setLoading(false); });
  };

  useEffect(() => { fetchTeachers(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/admin/teachers", form);
      toast.success("Öğretmen eklendi.");
      setShowForm(false);
      setForm({ email: "", full_name: "", password: "" });
      fetchTeachers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Bir hata oluştu.");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Öğretmenler</h1>
          <p className="text-sm text-gray-500 mt-1">{teachers.length} öğretmen</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primaryemphasis transition-colors">
          <Icon icon="tabler:plus" width={16} />
          Öğretmen Ekle
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-darkgray rounded-xl p-5 shadow-sm border border-primary mb-5">
          <h3 className="font-semibold text-dark dark:text-white mb-4">Yeni Öğretmen</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Ad Soyad</label>
              <input required type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">E-posta</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Şifre</label>
              <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-primary text-white text-sm px-5 py-2 rounded-lg">Kaydet</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm px-5 py-2 rounded-lg border border-border hover:bg-gray-50">İptal</button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-darkgray rounded-xl shadow-sm border border-border dark:border-darkborder overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Icon icon="tabler:school-off" width={40} className="mx-auto mb-2 opacity-40" />
            <p>Henüz öğretmen yok.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Öğretmen</th>
                <th className="px-5 py-3 text-left">Öğrenci Sayısı</th>
                <th className="px-5 py-3 text-left">Kayıt Tarihi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-darkborder">
              {teachers.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon icon="tabler:school" className="text-primary" width={15} />
                      </div>
                      <div>
                        <p className="font-medium text-dark dark:text-white">{t.full_name}</p>
                        <p className="text-xs text-gray-400">{t.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {t.my_students?.length ?? 0} öğrenci
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    {new Date(t.created_at).toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
