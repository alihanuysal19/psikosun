import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik & Çerez Politikası",
  description: "PSIKOSUN gizlilik ve çerez politikası",
};

export default function GizlilikPage() {
  return (
    <article className="prose prose-sm sm:prose max-w-none dark:prose-invert">
      <h1>Gizlilik &amp; Çerez Politikası</h1>
      <p className="text-sm text-gray-400">Son güncelleme: Ocak 2026</p>

      <p>
        Bu politika, PSIKOSUN (&quot;biz&quot;, &quot;platform&quot;) olarak{" "}
        <strong>psikosun.com</strong> üzerinden topladığımız bilgileri nasıl
        kullandığımızı ve koruduğumuzu açıklar.
      </p>

      <h2>1. Topladığımız Bilgiler</h2>
      <h3>a) Doğrudan Sağlanan Bilgiler</h3>
      <p>
        Kayıt olurken, paket satın alırken veya destek talebi oluştururken
        bize verdiğiniz ad, e-posta, telefon ve eğitim bilgileri.
      </p>
      <h3>b) Otomatik Toplanan Bilgiler</h3>
      <p>
        IP adresi, tarayıcı türü, işletim sistemi, ziyaret ettiğiniz sayfalar
        ve oturum süresi gibi teknik veriler sunucu loglarına kaydedilir.
      </p>
      <h3>c) Çerezler</h3>
      <p>
        Platformun çalışabilmesi için zorunlu çerezler; oturum yönetimi ve
        kimlik doğrulama için Supabase altyapısı kullanılır.
      </p>

      <h2>2. Çerez Türleri</h2>
      <table>
        <thead>
          <tr>
            <th>Çerez Türü</th>
            <th>Amaç</th>
            <th>Süre</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Zorunlu</td>
            <td>Oturum yönetimi, güvenlik</td>
            <td>Oturum bitişi</td>
          </tr>
          <tr>
            <td>İşlevsel</td>
            <td>Tercih hatırlama (tema, dil)</td>
            <td>1 yıl</td>
          </tr>
          <tr>
            <td>Analitik</td>
            <td>Google Analytics — anonim kullanım istatistikleri</td>
            <td>2 yıl</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Çerezleri Yönetme</h2>
      <p>
        Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz. Zorunlu
        çerezlerin kapatılması platformun düzgün çalışmamasına yol açabilir.
        Google Analytics takibini devre dışı bırakmak için{" "}
        <a
          href="https://tools.google.com/dlpage/gaoptout"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Analytics Opt-out eklentisini
        </a>{" "}
        kullanabilirsiniz.
      </p>

      <h2>4. Google Analytics</h2>
      <p>
        Platform, kullanıcı deneyimini iyileştirmek amacıyla Google Analytics
        kullanmaktadır. Bu araç, anonimleştirilmiş ziyaretçi istatistiklerini
        toplar. Google&apos;ın gizlilik politikasına{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
        >
          buradan
        </a>{" "}
        ulaşabilirsiniz.
      </p>

      <h2>5. Veri Güvenliği</h2>
      <p>
        Tüm veriler SSL/TLS şifrelemesiyle iletilir. Supabase altyapısı
        SOC 2 Type II sertifikalıdır. Şifre verileri bcrypt ile hashlenir.
      </p>

      <h2>6. Üçüncü Taraf Bağlantılar</h2>
      <p>
        Platformda yer alan sosyal medya ve harici bağlantılar bu gizlilik
        politikası kapsamında değildir. İlgili platformların kendi politikalarını
        incelemenizi öneririz.
      </p>

      <h2>7. Değişiklikler</h2>
      <p>
        Bu politika gerektiğinde güncellenebilir. Önemli değişiklikler
        platformda duyurulacaktır.
      </p>

      <h2>8. İletişim</h2>
      <p>
        Sorularınız için:{" "}
        <a href="mailto:info@psikosun.com">info@psikosun.com</a>
      </p>
    </article>
  );
}
