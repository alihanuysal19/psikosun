"use client";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { toast } from "react-toastify";

interface Package {
  id: number;
  name: string;
  description: string | null;
  lesson_count: number;
  price: string;
  is_active: boolean;
}

export default function AdminPaketlerPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", lesson_count: "", price: "" });

  const fetchPackages = () => {
    fetch("/api/packages")
      .then((r) => r.json())
      .then(({ data }) => { setPackages(data || []); setLoading(false); });
  };

  useEffect(() => { fetchPackages(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/packages", form);
      toast.success("Paket eklendi.");
      setShowForm(false);
      setForm({ name: "", description: "", lesson_count: "", price: "" });
      fetchPackages();
    } catch {
      toast.error("Paket eklenemedi.");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Paket Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-1">Ders paketlerini oluşturun ve yönetin</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primaryemphasis transition-colors">
          <Icon icon="tabler:plus" width={16} />
          Paket Ekle
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-darkgray rounded-xl p-5 shadow-sm border border-primary mb-5">
          <h3 className="font-semibold text-dark dark:text-white mb-4">Yeni Paket</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Paket Adı</label>
              <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Açıklama</label>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Ders Sayısı</label>
              <input required type="number" min="1" value={form.lesson_count} onChange={(e) => setForm({ ...form, lesson_count: e.target.value })}
                className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Fiyat (₺)</label>
              <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-primary text-white text-sm px-5 py-2 rounded-lg">Kaydet</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm px-5 py-2 rounded-lg border border-border hover:bg-gray-50">İptal</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : packages.length === 0 ? (
          <div className="col-span-3 bg-white dark:bg-darkgray rounded-xl p-12 text-center shadow-sm border border-border">
            <Icon icon="tabler:package-off" width={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400">Henüz paket yok.</p>
          </div>
        ) : packages.map((pkg) => (
          <div key={pkg.id} className="bg-white dark:bg-darkgray rounded-xl p-5 shadow-sm border border-border dark:border-darkborder">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon icon="tabler:package" className="text-primary" width={20} />
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${pkg.is_active ? "bg-success/10 text-success" : "bg-gray-100 text-gray-400"}`}>
                {pkg.is_active ? "Aktif" : "Pasif"}
              </span>
            </div>
            <h3 className="font-semibold text-dark dark:text-white mb-1">{pkg.name}</h3>
            {pkg.description && <p className="text-xs text-gray-400 mb-3">{pkg.description}</p>}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{pkg.lesson_count} ders</span>
              <span className="font-bold text-dark dark:text-white">{parseFloat(pkg.price).toLocaleString("tr-TR")} ₺</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
