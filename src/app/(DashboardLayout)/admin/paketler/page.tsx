"use client";
import { useContext, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { toast } from "react-toastify";
import { formatMoney } from "@/utils/format";
import AuthContext from "@/app/context/AuthContext";

interface Package {
  id: number;
  name: string;
  description: string | null;
  lesson_count: number;
  price: string | number;
  is_active: boolean;
}

const emptyForm = { name: "", description: "", lesson_count: "", price: "" };

export default function AdminPaketlerPage() {
  const { user } = useContext(AuthContext) as any;
  const adminId: string | undefined = user?.id;
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Package | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const fetchPackages = () => {
    if (!adminId) return;
    setLoading(true);
    fetch(`/api/packages?includeInactive=1&adminId=${adminId}`)
      .then((r) => r.json())
      .then(({ data }) => {
        setPackages(data || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (adminId) fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminId]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (pkg: Package) => {
    setEditing(pkg);
    setForm({
      name: pkg.name,
      description: pkg.description ?? "",
      lesson_count: String(pkg.lesson_count),
      price: String(pkg.price),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Paket adı zorunlu.");
    if (!form.lesson_count || parseInt(form.lesson_count) < 1)
      return toast.error("Geçerli ders sayısı girin.");
    if (!form.price || parseFloat(form.price) < 0)
      return toast.error("Geçerli fiyat girin.");

    setSaving(true);
    try {
      if (editing) {
        await axios.patch(`/api/packages/${editing.id}`, { ...form, caller_id: adminId });
        toast.success("Paket güncellendi.");
      } else {
        await axios.post("/api/packages", { ...form, caller_id: adminId });
        toast.success("Paket eklendi.");
      }
      closeForm();
      fetchPackages();
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (pkg: Package) => {
    setBusyId(pkg.id);
    try {
      await axios.patch(`/api/packages/${pkg.id}`, {
        is_active: !pkg.is_active,
        caller_id: adminId,
      });
      setPackages((prev) =>
        prev.map((p) => (p.id === pkg.id ? { ...p, is_active: !pkg.is_active } : p)),
      );
      toast.success(pkg.is_active ? "Pakete pasifleştirildi." : "Paket aktifleştirildi.");
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "İşlem başarısız.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (pkg: Package) => {
    if (
      !confirm(
        `${pkg.name} paketini silmek istediğinize emin misiniz? Öğrenciye atanmış paketler varsa pasifleştirilir.`,
      )
    )
      return;
    setBusyId(pkg.id);
    try {
      const res = await axios.delete(`/api/packages/${pkg.id}?callerId=${adminId}`);
      if (res.data.soft) {
        toast.info(res.data.message);
      } else {
        toast.success("Paket silindi.");
      }
      fetchPackages();
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Silinemedi.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Paket Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-1">
            Aktif paketler landing sayfasında otomatik gösterilir. {packages.length} paket
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primaryemphasis transition-colors"
        >
          <Icon icon="tabler:plus" width={16} />
          Paket Ekle
        </button>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 mb-5 text-sm text-gray-600 dark:text-gray-300">
        <Icon icon="tabler:info-circle" width={16} className="inline mr-2 text-primary" />
        Açıklama alanına satır başına bir özellik yazın (örn: <em>🗓️ Haftada 1 birebir görüşme</em>) — landing
        sayfasında bullet listesi olarak görünür.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : packages.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-darkgray rounded-xl p-12 text-center shadow-sm border border-border dark:border-darkborder">
            <Icon icon="tabler:package-off" width={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400 mb-4">Henüz paket yok.</p>
            <button
              onClick={openCreate}
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              <Icon icon="tabler:plus" width={14} />
              İlk paketi oluştur
            </button>
          </div>
        ) : (
          packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white dark:bg-darkgray rounded-xl p-5 shadow-sm border ${
                pkg.is_active ? "border-border dark:border-darkborder" : "border-gray-200 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon icon="tabler:package" className="text-primary" width={20} />
                </div>
                <button
                  onClick={() => toggleActive(pkg)}
                  disabled={busyId === pkg.id}
                  className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                    pkg.is_active
                      ? "bg-success/10 text-success hover:bg-success/20"
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  } disabled:opacity-50`}
                  title={pkg.is_active ? "Pasifleştir" : "Aktifleştir"}
                >
                  {pkg.is_active ? "Aktif" : "Pasif"}
                </button>
              </div>
              <h3 className="font-semibold text-dark dark:text-white mb-1">{pkg.name}</h3>
              {pkg.description && (
                <p className="text-xs text-gray-500 mb-3 whitespace-pre-line line-clamp-4">
                  {pkg.description}
                </p>
              )}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-border dark:border-darkborder">
                <span className="text-sm text-gray-500">{pkg.lesson_count} ders</span>
                <span className="font-bold text-dark dark:text-white">{formatMoney(pkg.price)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(pkg)}
                  className="flex-1 text-xs flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-border dark:border-darkborder hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Icon icon="tabler:pencil" width={13} />
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(pkg)}
                  disabled={busyId === pkg.id}
                  className="text-xs flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-error/30 text-error hover:bg-error/5 disabled:opacity-50"
                >
                  <Icon icon="tabler:trash" width={13} />
                  Sil
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !saving) closeForm();
          }}
        >
          <div className="bg-white dark:bg-darkgray rounded-xl p-5 sm:p-6 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-dark dark:text-white">
                {editing ? "Paketi Düzenle" : "Yeni Paket"}
              </h3>
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Icon icon="tabler:x" width={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Paket Adı *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="ör. Hızlı Başlangıç Paketi"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Açıklama (her satır bir özellik)
                </label>
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                  placeholder={
                    "🗓️ Haftada 1 birebir görüşme\n🎯 Başlangıç hedef analizi\n🧭 Temel yönlendirme ve yol haritası\n✨ Rehberlik sürecine sağlam giriş"
                  }
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Landing sayfasında her satır ayrı bir madde olarak görünür.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Ders Sayısı *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.lesson_count}
                    onChange={(e) => setForm({ ...form, lesson_count: e.target.value })}
                    className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Fiyat (₺) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary text-white text-sm px-5 py-2 rounded-lg hover:bg-primaryemphasis disabled:opacity-50"
                >
                  {saving ? "Kaydediliyor..." : editing ? "Güncelle" : "Oluştur"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="text-sm px-5 py-2 rounded-lg border border-border dark:border-darkborder hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
