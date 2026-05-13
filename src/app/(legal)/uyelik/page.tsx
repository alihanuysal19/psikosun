import type { Metadata } from "next";
import LegalPage from "../LegalPage";

export const metadata: Metadata = {
  title: "Üyelik Sözleşmesi",
  description: "PSIKOSUN üyelik şartları ve koşulları",
};

const listItems = (items: string[]) => (
  <ul className="list-disc list-inside space-y-1">
    {items.map((item) => <li key={item}>{item}</li>)}
  </ul>
);

export default function UyelikPage() {
  return (
    <LegalPage
      title="Üyelik Sözleşmesi"
      updatedAt="Son güncelleme: Ocak 2026"
      intro="Bu sözleşme, PSIKOSUN ile platformu kullanan gerçek kişi arasındaki hak ve yükümlülükleri düzenlemektedir. Platforma kayıt olarak bu sözleşmeyi kabul etmiş sayılırsınız."
      sections={[
        {
          title: "1. Üyelik Koşulları",
          content: listItems([
            "Üye olmak için 18 yaşını doldurmuş olmak ya da ebeveyn / veli onayına sahip olmak gereklidir.",
            "Her gerçek kişi yalnızca bir hesap açabilir.",
            "Kayıt sırasında doğru ve güncel bilgi verilmesi zorunludur.",
            "Hesap güvenliğinizden siz sorumlusunuz; şifrenizi kimseyle paylaşmayın.",
          ]),
        },
        {
          title: "2. Platformun Sunduğu Hizmetler",
          content: listItems([
            "Öğrenciler için paket satın alma ve ders hakkı yönetimi",
            "Öğretmen — öğrenci eşleştirme sistemi",
            "Canlı ders planlaması (takvim)",
            "Not defteri ve mesajlaşma araçları",
          ]),
        },
        {
          title: "3. Kullanıcı Yükümlülükleri",
          content: listItems([
            "Platform yalnızca eğitim amaçlı kullanılabilir.",
            "Diğer kullanıcılara yönelik taciz, hakaret ve zararlı içerik paylaşımı yasaktır.",
            "Platform altyapısına zarar vermeye yönelik eylemler yasaktır.",
            "Fikri mülkiyet haklarına saygı gösterilmesi zorunludur.",
          ]),
        },
        {
          title: "4. Ders Hakkı ve Paket Kullanımı",
          content: listItems([
            "Satın alınan paketler aktivasyon tarihinden itibaren tanımlanan süre için geçerlidir.",
            "Her ders tamamlandığında paketten ilgili süre otomatik düşülür.",
            "Kalan ders hakkı hesap panosundan canlı olarak takip edilebilir.",
            "İade koşulları için Mesafeli Satış Sözleşmesi'ni inceleyin.",
          ]),
        },
        {
          title: "5. Ders Planlama Kuralları",
          content: listItems([
            "Dersler bire bir gerçekleşir; grup dersleri mevcut değildir.",
            "Aynı öğretmen aynı anda yalnızca bir öğrenciye ders verebilir.",
            "İptal edilen ders slotları 24 saat öncesine kadar serbest bırakılabilir.",
          ]),
        },
        {
          title: "6. Hesap Askıya Alma ve Sonlandırma",
          content: (
            <p>
              Platform, bu sözleşmeye aykırı davranan üyelerin hesabını uyarı vermeksizin askıya alma veya sonlandırma hakkını saklı tutar. Haksız sonlandırma iddiasında{" "}
              <a href="mailto:info@psikosun.com" className="text-primary hover:underline">info@psikosun.com</a>&apos;a başvurabilirsiniz.
            </p>
          ),
        },
        {
          title: "7. Uygulanacak Hukuk",
          content: (
            <p>
              Bu sözleşme Türk hukukuna tabidir. Anlaşmazlıklarda <strong className="font-semibold text-dark dark:text-white">Samsun Mahkemeleri ve İcra Daireleri</strong> yetkilidir.
            </p>
          ),
        },
        {
          title: "8. İletişim",
          content: (
            <p>
              <a href="mailto:info@psikosun.com" className="text-primary hover:underline font-medium">info@psikosun.com</a>
              {" "}— Gökçeağaç Mh. Merkez Sk. No:51, Bafra / Samsun
            </p>
          ),
        },
      ]}
    />
  );
}
