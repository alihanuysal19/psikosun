import type { Metadata } from "next";
import LegalPage from "../LegalPage";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description: "PSIKOSUN kişisel verilerin korunması kanunu aydınlatma metni",
};

export default function KvkkPage() {
  return (
    <LegalPage
      title="KVKK Aydınlatma Metni"
      updatedAt="Son güncelleme: Ocak 2026"
      intro="PSIKOSUN olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında kişisel verilerinizi nasıl işlediğimizi ve haklarınızı aşağıda açıklıyoruz."
      sections={[
        {
          title: "1. Veri Sorumlusu",
          content: (
            <p>
              Veri sorumlusu sıfatıyla <strong className="font-semibold text-dark dark:text-white">PSIKOSUN</strong>, Gökçeağaç Mh. Merkez Sk. No:51, Bafra / Samsun adresinde faaliyet göstermektedir.
            </p>
          ),
        },
        {
          title: "2. İşlenen Kişisel Veriler",
          content: (
            <ul className="space-y-1.5">
              {[
                ["Kimlik verileri:", "Ad, soyad"],
                ["İletişim verileri:", "E-posta adresi, telefon numarası"],
                ["Konum verileri:", "İl / ilçe bilgisi"],
                ["Eğitim verileri:", "Okul, eğitim durumu"],
                ["İşlem verileri:", "Satın alınan paket, ders geçmişi, kalan ders hakkı"],
                ["Teknik veriler:", "IP adresi, tarayıcı bilgisi, oturum logları"],
              ].map(([label, val]) => (
                <li key={label} className="flex gap-2">
                  <span className="font-semibold text-dark dark:text-white whitespace-nowrap">{label}</span>
                  <span>{val}</span>
                </li>
              ))}
            </ul>
          ),
        },
        {
          title: "3. İşlenme Amaçları",
          content: (
            <ul className="list-disc list-inside space-y-1">
              {[
                "Üyelik hesabı oluşturulması ve yönetimi",
                "Eğitim hizmetlerinin sunulması ve ders takibi",
                "Öğretmen – öğrenci eşleştirme",
                "Paket satın alma işlemlerinin gerçekleştirilmesi",
                "Platform güvenliğinin sağlanması",
                "Yasal yükümlülüklerin yerine getirilmesi",
                "Müşteri hizmetleri ve destek",
              ].map((item) => <li key={item}>{item}</li>)}
            </ul>
          ),
        },
        {
          title: "4. Hukuki Dayanak",
          content: (
            <p>
              Kişisel verileriniz; sözleşmenin ifası (KVKK md. 5/2-c), meşru menfaat (KVKK md. 5/2-f) ve açık rıza (KVKK md. 5/1) hukuki dayanakları çerçevesinde işlenmektedir.
            </p>
          ),
        },
        {
          title: "5. Veri Güvenliği",
          content: (
            <p>
              Verileriniz Supabase altyapısında şifreli olarak saklanmaktadır. Şifreler hiçbir zaman düz metin olarak tutulmaz; endüstri standardı hash algoritmaları kullanılır. SSL/TLS şifrelemesi tüm veri iletiminde aktiftir.
            </p>
          ),
        },
        {
          title: "6. Veri Paylaşımı",
          content: (
            <p>
              Kişisel verileriniz yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz, satılmaz veya kiralanmaz. Hizmet sunumu kapsamında yalnızca Supabase (veri tabanı ve kimlik doğrulama) ile çalışılmaktadır.
            </p>
          ),
        },
        {
          title: "7. Saklama Süresi",
          content: (
            <p>
              Verileriniz üyelik hesabınız aktif olduğu sürece ve ilgili yasal saklama sürelerince tutulur. Hesap silinmesi durumunda veriler 30 gün içinde anonimleştirilir veya silinir.
            </p>
          ),
        },
        {
          title: "8. KVKK Kapsamındaki Haklarınız",
          content: (
            <>
              <ul className="list-disc list-inside space-y-1 mb-3">
                {[
                  "Verilerinizin işlenip işlenmediğini öğrenme",
                  "İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme",
                  "Yurt içi/yurt dışında aktarıldığı üçüncü kişileri bilme",
                  "Eksik veya yanlış işlenmesi hâlinde düzeltilmesini isteme",
                  "Verilerin silinmesini veya yok edilmesini isteme",
                  "Kanuna aykırı işleme nedeniyle zararın giderilmesini talep etme",
                ].map((item) => <li key={item}>{item}</li>)}
              </ul>
              <p>
                Başvurularınızı{" "}
                <a href="mailto:info@psikosun.com" className="text-primary hover:underline font-medium">
                  info@psikosun.com
                </a>{" "}
                adresine iletebilirsiniz. Başvurular 30 gün içinde yanıtlanır.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
