import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Üyelik Sözleşmesi",
  description: "PSIKOSUN üyelik şartları ve koşulları",
};

export default function UyelikPage() {
  return (
    <article className="prose prose-sm sm:prose max-w-none dark:prose-invert">
      <h1>Üyelik Sözleşmesi</h1>
      <p className="text-sm text-gray-400">Son güncelleme: Ocak 2026</p>

      <p>
        Bu sözleşme, <strong>PSIKOSUN</strong> (&quot;Platform&quot;) ile platformu
        kullanan gerçek kişi (&quot;Üye&quot;) arasındaki hak ve yükümlülükleri
        düzenlemektedir. Platforma kayıt olarak bu sözleşmeyi kabul etmiş
        sayılırsınız.
      </p>

      <h2>1. Üyelik Koşulları</h2>
      <ul>
        <li>Üye olmak için 18 yaşını doldurmuş olmak ya da ebeveyn / veli onayına sahip olmak gereklidir.</li>
        <li>Her gerçek kişi yalnızca bir hesap açabilir.</li>
        <li>Kayıt sırasında doğru ve güncel bilgi verilmesi zorunludur.</li>
        <li>Hesap güvenliğinizden siz sorumlusunuz; şifrenizi kimseyle paylaşmayın.</li>
      </ul>

      <h2>2. Platformun Sunduğu Hizmetler</h2>
      <ul>
        <li>Öğrenciler için paket satın alma ve ders hakkı yönetimi</li>
        <li>Öğretmen — öğrenci eşleştirme sistemi</li>
        <li>Canlı ders planlaması (takvim)</li>
        <li>Not defteri ve mesajlaşma araçları</li>
      </ul>

      <h2>3. Kullanıcı Yükümlülükleri</h2>
      <ul>
        <li>Platform yalnızca eğitim amaçlı kullanılabilir.</li>
        <li>Diğer kullanıcılara yönelik taciz, hakaret ve zararlı içerik paylaşımı yasaktır.</li>
        <li>Platform altyapısına zarar vermeye yönelik eylemler yasaktır.</li>
        <li>Başkalarının hesabına yetkisiz erişim girişimleri yasaktır.</li>
        <li>Fikri mülkiyet haklarına saygı gösterilmesi zorunludur.</li>
      </ul>

      <h2>4. Ders Hakkı ve Paket Kullanımı</h2>
      <ul>
        <li>Satın alınan paketler aktivasyon tarihinden itibaren tanımlanan süre için geçerlidir.</li>
        <li>Her ders tamamlandığında paketten ilgili süre otomatik düşülür.</li>
        <li>Kalan ders hakkı hesap panosundan canlı olarak takip edilebilir.</li>
        <li>Paket iptali ve iade koşulları için Mesafeli Satış Sözleşmesi&apos;ni inceleyin.</li>
      </ul>

      <h2>5. Ders Planlama Kuralları</h2>
      <ul>
        <li>Dersler bire bir gerçekleşir; grup dersleri mevcut değildir.</li>
        <li>Aynı öğretmen aynı anda yalnızca bir öğrenciye ders verebilir.</li>
        <li>İptal edilen ders slotları 24 saat öncesine kadar serbest bırakılabilir.</li>
      </ul>

      <h2>6. Hesap Askıya Alma ve Sonlandırma</h2>
      <p>
        Platform, bu sözleşmeye aykırı davranan üyelerin hesabını uyarı
        vermeksizin askıya alma veya sonlandırma hakkını saklı tutar.
        Haksız sonlandırma iddiasında iletişim adresimize başvurabilirsiniz.
      </p>

      <h2>7. Gizlilik</h2>
      <p>
        Üyelik işlemleri kapsamında toplanan kişisel veriler{" "}
        <a href="/kvkk">KVKK Aydınlatma Metni</a> ve{" "}
        <a href="/gizlilik">Gizlilik Politikası</a> çerçevesinde işlenir.
      </p>

      <h2>8. Sözleşme Değişiklikleri</h2>
      <p>
        Platform bu sözleşmeyi önceden bildirmeksizin güncelleyebilir.
        Değişiklikler yayınlandıktan sonra platformu kullanmaya devam
        etmeniz değişiklikleri kabul ettiğiniz anlamına gelir.
      </p>

      <h2>9. Uygulanacak Hukuk ve Yetki</h2>
      <p>
        Bu sözleşme Türk hukukuna tabidir. Anlaşmazlıklarda Samsun Mahkemeleri
        ve İcra Daireleri yetkilidir.
      </p>

      <h2>10. İletişim</h2>
      <p>
        <a href="mailto:info@psikosun.com">info@psikosun.com</a> —
        Gökçeağaç Mh. Merkez Sk. No:51, Bafra / Samsun
      </p>
    </article>
  );
}
