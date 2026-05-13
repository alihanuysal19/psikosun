import type { Metadata } from "next";
import LegalPage from "../LegalPage";

export const metadata: Metadata = {
  title: "Gizlilik & Çerez Politikası",
  description: "PSIKOSUN gizlilik ve çerez politikası",
};

export default function GizlilikPage() {
  return (
    <LegalPage
      title="Gizlilik & Çerez Politikası"
      updatedAt="Son güncelleme: Ocak 2026"
      intro="Bu politika, psikosun.com üzerinden topladığımız bilgileri nasıl kullandığımızı ve koruduğumuzu açıklar."
      sections={[
        {
          title: "1. Topladığımız Bilgiler",
          content: (
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-dark dark:text-white mb-1">a) Doğrudan Sağlanan Bilgiler</p>
                <p>Kayıt, paket satın alma veya destek talebi sırasında verdiğiniz ad, e-posta, telefon ve eğitim bilgileri.</p>
              </div>
              <div>
                <p className="font-semibold text-dark dark:text-white mb-1">b) Otomatik Toplanan Bilgiler</p>
                <p>IP adresi, tarayıcı türü, işletim sistemi, ziyaret edilen sayfalar ve oturum süresi gibi teknik veriler.</p>
              </div>
              <div>
                <p className="font-semibold text-dark dark:text-white mb-1">c) Çerezler</p>
                <p>Platformun çalışabilmesi için zorunlu çerezler; oturum ve kimlik doğrulama için Supabase altyapısı kullanılır.</p>
              </div>
            </div>
          ),
        },
        {
          title: "2. Çerez Türleri",
          content: (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border dark:border-darkborder">
                    <th className="text-left py-2 pr-4 font-semibold text-dark dark:text-white">Çerez Türü</th>
                    <th className="text-left py-2 pr-4 font-semibold text-dark dark:text-white">Amaç</th>
                    <th className="text-left py-2 font-semibold text-dark dark:text-white">Süre</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-darkborder">
                  {[
                    ["Zorunlu", "Oturum yönetimi, güvenlik", "Oturum bitişi"],
                    ["İşlevsel", "Tercih hatırlama (tema, dil)", "1 yıl"],
                    ["Analitik", "Google Analytics — anonim istatistik", "2 yıl"],
                  ].map(([type, purpose, duration]) => (
                    <tr key={type}>
                      <td className="py-2 pr-4">{type}</td>
                      <td className="py-2 pr-4">{purpose}</td>
                      <td className="py-2">{duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ),
        },
        {
          title: "3. Çerezleri Yönetme",
          content: (
            <p>
              Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz. Zorunlu çerezlerin kapatılması platformun düzgün çalışmamasına neden olabilir. Google Analytics&apos;i devre dışı bırakmak için{" "}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Google Analytics Opt-out eklentisini
              </a>{" "}
              kullanabilirsiniz.
            </p>
          ),
        },
        {
          title: "4. Google Analytics",
          content: (
            <p>
              Platform, kullanıcı deneyimini iyileştirmek amacıyla Google Analytics kullanmaktadır. Bu araç anonimleştirilmiş ziyaretçi istatistiklerini toplar. Google&apos;ın gizlilik politikasına{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                buradan
              </a>{" "}
              ulaşabilirsiniz.
            </p>
          ),
        },
        {
          title: "5. Veri Güvenliği",
          content: (
            <p>
              Tüm veriler SSL/TLS şifrelemesiyle iletilir. Supabase altyapısı SOC 2 Type II sertifikalıdır. Şifre verileri bcrypt ile hashlenir, düz metin olarak saklanmaz.
            </p>
          ),
        },
        {
          title: "6. İletişim",
          content: (
            <p>
              Sorularınız için:{" "}
              <a href="mailto:info@psikosun.com" className="text-primary hover:underline font-medium">
                info@psikosun.com
              </a>
            </p>
          ),
        },
      ]}
    />
  );
}
