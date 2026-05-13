import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description: "PSIKOSUN kişisel verilerin korunması kanunu aydınlatma metni",
};

export default function KvkkPage() {
  return (
    <article className="prose prose-sm sm:prose max-w-none dark:prose-invert">
      <h1>KVKK Aydınlatma Metni</h1>
      <p className="text-sm text-gray-400">Son güncelleme: Ocak 2026</p>

      <p>
        PSIKOSUN olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;)
        kapsamında kişisel verilerinizi nasıl işlediğimizi ve haklarınızı aşağıda
        açıklıyoruz.
      </p>

      <h2>1. Veri Sorumlusu</h2>
      <p>
        Veri sorumlusu sıfatıyla <strong>PSIKOSUN</strong> (bundan böyle &quot;Platform&quot;
        olarak anılacaktır), Gökçeağaç Mh. Merkez Sk. No:51, Bafra / Samsun
        adresinde faaliyet göstermektedir.
      </p>

      <h2>2. İşlenen Kişisel Veriler</h2>
      <ul>
        <li><strong>Kimlik verileri:</strong> Ad, soyad</li>
        <li><strong>İletişim verileri:</strong> E-posta adresi, telefon numarası</li>
        <li><strong>Konum verileri:</strong> İl / ilçe bilgisi</li>
        <li><strong>Eğitim verileri:</strong> Okul, eğitim durumu</li>
        <li><strong>İşlem verileri:</strong> Satın alınan paket, ders geçmişi, kalan ders hakkı</li>
        <li><strong>Teknik veriler:</strong> IP adresi, tarayıcı bilgisi, oturum logları</li>
      </ul>

      <h2>3. Kişisel Verilerin İşlenme Amaçları</h2>
      <ul>
        <li>Üyelik hesabı oluşturulması ve yönetimi</li>
        <li>Eğitim hizmetlerinin sunulması ve ders takibi</li>
        <li>Öğretmen – öğrenci eşleştirme</li>
        <li>Paket satın alma işlemlerinin gerçekleştirilmesi</li>
        <li>Platform güvenliğinin sağlanması</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi</li>
        <li>Müşteri hizmetleri ve destek</li>
      </ul>

      <h2>4. Hukuki Dayanak</h2>
      <p>
        Kişisel verileriniz; sözleşmenin ifası (KVKK md. 5/2-c), meşru menfaat
        (KVKK md. 5/2-f) ve açık rıza (KVKK md. 5/1) hukuki dayanakları
        çerçevesinde işlenmektedir.
      </p>

      <h2>5. Veri Güvenliği</h2>
      <p>
        Verileriniz Supabase altyapısında şifreli olarak saklanmaktadır. Şifreler
        hiçbir zaman düz metin olarak tutulmaz; endüstri standardı hash algoritmaları
        kullanılır. SSL/TLS şifrelemesi tüm veri iletiminde aktif durumdadır.
      </p>

      <h2>6. Veri Paylaşımı</h2>
      <p>
        Kişisel verileriniz; yasal zorunluluklar dışında üçüncü taraflarla
        paylaşılmaz, satılmaz veya kiralanmaz. Hizmet sunumu kapsamında yalnızca
        Supabase (veri tabanı ve kimlik doğrulama) ile çalışılmaktadır.
      </p>

      <h2>7. Saklama Süresi</h2>
      <p>
        Verileriniz, üyelik hesabınız aktif olduğu sürece ve ilgili yasal saklama
        sürelerince tutulur. Hesap silinmesi durumunda veriler 30 gün içinde
        anonimleştirilir veya silinir.
      </p>

      <h2>8. KVKK Kapsamındaki Haklarınız</h2>
      <p>KVKK 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
      <ul>
        <li>Verilerinizin işlenip işlenmediğini öğrenme</li>
        <li>İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme</li>
        <li>Yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri bilme</li>
        <li>Verilerin eksik veya yanlış işlenmesi hâlinde düzeltilmesini isteme</li>
        <li>Verilerin silinmesini veya yok edilmesini isteme</li>
        <li>Verilerin aktarıldığı kişilere düzeltme / silme bildirilmesini talep etme</li>
        <li>İşlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize sonuç çıkmasına itiraz etme</li>
        <li>Kanuna aykırı işleme nedeniyle uğranılan zararın giderilmesini talep etme</li>
      </ul>
      <p>
        Başvurularınızı <a href="mailto:info@psikosun.com">info@psikosun.com</a> adresine
        iletebilirsiniz. Başvurular 30 gün içinde yanıtlanır.
      </p>
    </article>
  );
}
