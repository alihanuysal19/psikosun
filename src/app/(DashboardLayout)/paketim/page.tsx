"use client";
import { useContext, useEffect, useState } from "react";
import AuthContext from "@/app/context/AuthContext";
import { Icon } from "@iconify/react";

interface UserPackage {
  id: number;
  remaining: number;
  total: number;
  purchased_at: string;
  expires_at: string | null;
  package: { name: string; description: string | null; lesson_count: number; price: string };
}

export default function PaketimPage() {
  const { user } = useContext(AuthContext);
  const [packages, setPackages] = useState<UserPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/profile?id=${user.id}`)
      .then((r) => r.json())
      .then(({ data }) => { setPackages(data?.user_packages || []); setLoading(false); });
  }, [user?.id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark dark:text-white">Paketim</h1>
        <p className="text-sm text-gray-500 mt-1">Satın aldığınız paketler ve ders kotanız</p>
      </div>

      {packages.length === 0 ? (
        <div className="bg-white dark:bg-darkgray rounded-xl p-12 text-center shadow-sm border border-border dark:border-darkborder">
          <Icon icon="tabler:package-off" width={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">Henüz aktif paketiniz yok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {packages.map((pkg, i) => {
            const pct = Math.round((pkg.remaining / pkg.total) * 100);
            const isActive = pkg.remaining > 0;
            return (
              <div key={pkg.id} className={`bg-white dark:bg-darkgray rounded-xl p-6 shadow-sm border ${
                i === 0 ? "border-primary" : "border-border dark:border-darkborder"
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-dark dark:text-white">{pkg.package.name}</h3>
                      {i === 0 && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Aktif</span>}
                    </div>
                    {pkg.package.description && (
                      <p className="text-xs text-gray-400 mt-1">{pkg.package.description}</p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon icon="tabler:package" className="text-primary" width={20} />
                  </div>
                </div>

                {/* Kota barı */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-500">Kalan Ders</span>
                    <span className="font-semibold text-dark dark:text-white">{pkg.remaining} / {pkg.total}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        pct > 50 ? "bg-success" : pct > 20 ? "bg-warning" : "bg-error"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">%{pct} kaldı</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Satın Alma</p>
                    <p className="font-medium text-dark dark:text-white">
                      {new Date(pkg.purchased_at).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Son Tarih</p>
                    <p className="font-medium text-dark dark:text-white">
                      {pkg.expires_at ? new Date(pkg.expires_at).toLocaleDateString("tr-TR") : "Süresiz"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
