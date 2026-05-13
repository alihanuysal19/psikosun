import type { Metadata } from "next";
import LegalPage from "../LegalPage";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi",
  description: "PSIKOSUN mesafeli satış sözleşmesi",
};

export default function MesafeliPage() {
  return (
    <LegalPage
      title="Mesafeli Satış Sözleşmesi"
      updatedAt="Son güncelleme: Ocak 2026"
      intro="Bu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamında PSIKOSUN ile ders paketi satın alan kullanıcı arasında akdedilmiştir."
      sections={[
        {
          title: "1. Taraflar",
          content: (
            <div className="space-y-1.5">
              {[
                ["Satıcı:", "PSIKOSUN — Gökçeağaç Mh. Merkez Sk. No:51, Bafra / Samsun"],
                ["E-posta:", "info@psikosun.com"],
                ["Alıcı:", "Kayıt sırasında belirtilen ad / e-posta sahibi kullanıcı"],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-2 flex-wrap">
                  <span className="font-semibold text-dark dark:text-white whitespace-nowrap">{label}</span>
                  <span>{val}</span>
                </div>
              ))}
            </div>
          ),
        },
        {
          title: "2. Sözleşmenin Konusu",
          content: (
            <p>
              Bu sözleşme, psikosun.com üzerinden online ders paketi satın alınmasına ilişkin koşulları düzenler. Ürün türü dijital hizmettir; fiziksel teslimat söz konusu değildir.
            </p>
          ),
        },
        {
          title: "3. Ödeme Koşulları",
          content: (
            <ul className="list-disc list-inside space-y-1">
              <li>Ödeme sipariş sırasında tam olarak tahsil edilir.</li>
              <li>Fiyatlar Türk Lirası (TL) cinsinden KDV dahil gösterilir.</li>
              <li>Kabul edilen ödeme yöntemleri sipariş sayfasında belirtilir.</li>
            </ul>
          ),
        },
        {
          title: "4. Hizmetin İfası",
          content: (
            <p>
              Ödeme onaylandıktan sonra ders hakkı hesabınıza otomatik tanımlanır ve anında kullanıma hazır hâle gelir. Hizmet, paketin aktivasyonuyla başlamış sayılır.
            </p>
          ),
        },
        {
          title: "5. Cayma Hakkı",
          content: (
            <>
              <p className="mb-2">
                Tüketici, sözleşmenin kurulduğu tarihten itibaren{" "}
                <strong className="font-semibold text-dark dark:text-white">14 (on dört) gün</strong>{" "}
                içinde herhangi bir gerekçe göstermeksizin cayma hakkını kullanabilir.
              </p>
              <div
                className="rounded-xl p-3 text-xs"
                style={{
                  background: "rgba(124,58,237,0.06)",
                  border: "1px solid rgba(124,58,237,0.2)",
                }}
              >
                <strong className="font-semibold" style={{ color: "#7c3aed" }}>İstisna:</strong> Cayma süresi dolmadan Alıcı&apos;nın onayıyla dijital içerik ifasına başlanmışsa (ders hakkı kullanılmaya başlandıysa) cayma hakkı sona erer. Bu durum satın alma sırasında onaylanır.
              </div>
              <p className="mt-2">
                Talebinizi{" "}
                <a href="mailto:info@psikosun.com" className="text-primary hover:underline">info@psikosun.com</a>&apos;a iletebilirsiniz.
              </p>
            </>
          ),
        },
        {
          title: "6. İade Koşulları",
          content: (
            <ul className="list-disc list-inside space-y-1">
              <li>Cayma hakkı kapsamındaki iadeler 14 gün içinde işleme alınır.</li>
              <li>Kullanılan ders saatleri için orantılı kesinti uygulanır.</li>
              <li>İade, ödemenin yapıldığı yöntemle gerçekleştirilir.</li>
            </ul>
          ),
        },
        {
          title: "7. Uyuşmazlık Çözümü",
          content: (
            <p>
              Tüketici şikayetlerinizi Tüketici Hakem Heyeti&apos;ne veya Tüketici Mahkemesi&apos;ne iletebilirsiniz. <strong className="font-semibold text-dark dark:text-white">Samsun İli</strong> sınırları içindeki merciler yetkilidir.
            </p>
          ),
        },
        {
          title: "8. Yürürlük",
          content: (
            <p>
              Bu sözleşme, Alıcı&apos;nın &quot;Satın Al&quot; butonuna tıklayarak siparişi onaylamasıyla yürürlüğe girer.
            </p>
          ),
        },
      ]}
    />
  );
}
