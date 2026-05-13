import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi",
  description: "PSIKOSUN mesafeli satış sözleşmesi",
};

export default function MesafeliPage() {
  return (
    <article className="prose prose-sm sm:prose max-w-none dark:prose-invert">
      <h1>Mesafeli Satış Sözleşmesi</h1>
      <p className="text-sm text-gray-400">Son güncelleme: Ocak 2026</p>

      <p>
        Bu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve
        Mesafeli Sözleşmeler Yönetmeliği kapsamında{" "}
        <strong>PSIKOSUN</strong> (&quot;Satıcı&quot;) ile ders paketi satın alan
        kullanıcı (&quot;Alıcı&quot;) arasında akdedilmiştir.
      </p>

      <h2>1. Taraflar</h2>
      <table>
        <tbody>
          <tr>
            <td><strong>Satıcı</strong></td>
            <td>PSIKOSUN — Gökçeağaç Mh. Merkez Sk. No:51, Bafra / Samsun</td>
          </tr>
          <tr>
            <td><strong>E-posta</strong></td>
            <td>info@psikosun.com</td>
          </tr>
          <tr>
            <td><strong>Alıcı</strong></td>
            <td>Kayıt sırasında belirtilen ad / e-posta sahibi kullanıcı</td>
          </tr>
        </tbody>
      </table>

      <h2>2. Sözleşmenin Konusu</h2>
      <p>
        Bu sözleşme, Alıcı&apos;nın psikosun.com üzerinden online ders paketi
        satın almasına ilişkin koşulları düzenler. Ürün türü dijital hizmettir;
        fiziksel bir teslimat söz konusu değildir.
      </p>

      <h2>3. Satışa Konu Hizmet</h2>
      <p>
        Platform üzerinde sunulan çeşitli ders paketleri; paket adı, ders saati
        sayısı ve ücreti satın alma ekranında görüntülenir. Alıcı, sipariş
        tamamlamadan önce paket detaylarını onaylar.
      </p>

      <h2>4. Ödeme Koşulları</h2>
      <ul>
        <li>Ödeme, sipariş sırasında tam olarak tahsil edilir.</li>
        <li>Fiyatlar Türk Lirası (TL) cinsinden KDV dahil gösterilir.</li>
        <li>Kabul edilen ödeme yöntemleri sipariş sayfasında belirtilir.</li>
      </ul>

      <h2>5. Hizmetin İfası</h2>
      <p>
        Ödeme onaylandıktan sonra ders hakkı hesabınıza otomatik olarak
        tanımlanır ve anında kullanıma hazır hâle gelir. Hizmet, ders
        paketinin aktivasyonuyla başlamış sayılır.
      </p>

      <h2>6. Cayma Hakkı</h2>
      <p>
        Tüketici, sözleşmenin kurulduğu tarihten itibaren <strong>14 (on dört) gün</strong>{" "}
        içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin
        cayma hakkını kullanabilir.
      </p>
      <p>
        <strong>İstisnalar:</strong> Cayma süresi dolmadan Alıcı&apos;nın onayıyla
        dijital içeriğin ifasına başlanmışsa (yani ders hakkı kullanılmaya
        başlandıysa) cayma hakkı sona erer. Bu durum, satın alma sırasında
        Alıcı tarafından onaylanır.
      </p>
      <p>
        Cayma talebinizi <a href="mailto:info@psikosun.com">info@psikosun.com</a>{" "}
        adresine iletebilirsiniz.
      </p>

      <h2>7. İade Koşulları</h2>
      <ul>
        <li>Cayma hakkı kapsamındaki iade talepleri, bildirimin yapıldığı tarihten itibaren 14 gün içinde işleme alınır.</li>
        <li>Kullanılan ders saatleri için orantılı kesinti uygulanır.</li>
        <li>İade, ödemenin yapıldığı yöntemle gerçekleştirilir.</li>
      </ul>

      <h2>8. Garanti ve Sorumluluk</h2>
      <p>
        Platform, ders hizmetlerinin belirtilen içerikte sunulması için gerekli
        özeni gösterir. Teknik kesintiler durumunda etkilenen ders süresi
        telafi edilir veya iade edilir.
      </p>

      <h2>9. Uyuşmazlık Çözümü</h2>
      <p>
        Tüketici şikayetlerinizi Tüketici Hakem Heyeti&apos;ne veya Tüketici
        Mahkemesi&apos;ne iletebilirsiniz. Samsun İli sınırları içindeki
        merciler yetkilidir.
      </p>

      <h2>10. Yürürlük</h2>
      <p>
        Bu sözleşme, Alıcı&apos;nın &quot;Satın Al&quot; butonuna tıklayarak siparişi
        onaylamasıyla yürürlüğe girer.
      </p>
    </article>
  );
}
