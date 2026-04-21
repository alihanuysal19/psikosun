"use client";
import { useContext, useEffect, useState } from "react";
import AuthContext from "@/app/context/AuthContext";
import { Icon } from "@iconify/react";
import { formatMoney, toNumberSafe } from "@/utils/format";

interface Purchase {
  id: number;
  amount: string | number;
  created_at: string;
  package: { name: string; lesson_count: number };
}

export default function SatinAlmaGecmisiPage() {
  const { user } = useContext(AuthContext);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/profile?id=${user.id}`)
      .then((r) => r.json())
      .then(({ data }) => { setPurchases(data?.purchases || []); setLoading(false); });
  }, [user?.id]);

  const total = purchases.reduce((sum, p) => sum + toNumberSafe(p.amount), 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark dark:text-white">Satın Alma Geçmişi</h1>
        <p className="text-sm text-gray-500 mt-1">Tüm paket satın alımlarınız</p>
      </div>

      {purchases.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-5 flex items-center gap-3">
          <Icon icon="tabler:coin" className="text-primary" width={24} />
          <div>
            <p className="text-sm text-gray-500">Toplam Harcama</p>
            <p className="font-bold text-dark dark:text-white">{formatMoney(total)}</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-darkgray rounded-xl shadow-sm border border-border dark:border-darkborder overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Icon icon="tabler:receipt-off" width={40} className="mx-auto mb-2 opacity-40" />
            <p>Henüz satın alma işlemi yok.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Paket</th>
                <th className="px-5 py-3 text-left">Ders Sayısı</th>
                <th className="px-5 py-3 text-left">Tarih</th>
                <th className="px-5 py-3 text-right">Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-darkborder">
              {purchases.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-5 py-4 font-medium text-dark dark:text-white">{p.package.name}</td>
                  <td className="px-5 py-4 text-gray-500">{p.package.lesson_count} ders</td>
                  <td className="px-5 py-4 text-gray-500">
                    {new Date(p.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-dark dark:text-white">
                    {formatMoney(p.amount)}
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
