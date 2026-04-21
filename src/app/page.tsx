"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function LandingPage() {
  useEffect(() => {
    if (!document.getElementById("landing-stylesheet")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/landing/prism-flux.css";
      link.id = "landing-stylesheet";
      document.head.appendChild(link);
    }

    document.getElementById("landing-script")?.remove();
    const script = document.createElement("script");
    script.src = `/landing/prism-scripts.js?v=${Date.now()}`;
    script.id = "landing-script";
    document.body.appendChild(script);

    return () => {
      document.getElementById("landing-stylesheet")?.remove();
      document.getElementById("landing-script")?.remove();
    };
  }, []);

  return (
    <>
      {/* Loading Screen */}
      <div className="loader" id="loader">
        <div className="loader-content">
          <div className="loader-prism">
            <div className="prism-face"></div>
            <div className="prism-face"></div>
            <div className="prism-face"></div>
          </div>
          <div
            style={{
              color: "var(--accent-purple)",
              fontSize: 18,
              textTransform: "uppercase",
              letterSpacing: 3,
            }}
          >
            Psıkosun Danışmanlık
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="header" id="header">
        <nav className="nav-container">
          <a href="#home" className="logo">
            <div className="logo-icon">
              <div className="logo-prism">
                <div className="prism-shape"></div>
                <img
                  src="/landing/images/logo.png"
                  alt="Psikosun Logo"
                  className="logo-center"
                  width={48}
                  height={48}
                  fetchPriority="high"
                />
              </div>
            </div>
            <span className="logo-text">
              <span className="prism">PSIKOSUN</span>
              <span className="flux"></span>
            </span>
          </a>

          <ul className="nav-menu" id="navMenu">
            <li>
              <a href="#home" className="nav-link active">
                Ana Sayfa
              </a>
            </li>
            <li>
              <a href="#about" className="nav-link">
                Hakkımızda
              </a>
            </li>
            <li>
              <a href="#stats" className="nav-link">
                Müşteri İlişkileri
              </a>
            </li>
            <li>
              <a href="#packages" className="nav-link">
                Paketler
              </a>
            </li>
            <li>
              <a href="#contact" className="nav-link">
                İletişim
              </a>
            </li>
            <li>
              <Link href="/auth/login" className="nav-link">
                Giriş
              </Link>
            </li>
            <li>
              <Link href="/auth/register" className="nav-link">
                Kayıt Ol
              </Link>
            </li>
          </ul>

          <div className="menu-toggle" id="menuToggle">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </nav>
      </header>

      {/* Hero Section with 3D Carousel */}
      <section className="hero" id="home">
        <div className="carousel-container">
          <div className="carousel" id="carousel"></div>
          <div className="carousel-controls">
            <button className="carousel-btn" id="prevBtn">
              ‹
            </button>
            <button className="carousel-btn" id="nextBtn">
              ›
            </button>
          </div>
          <div className="carousel-indicators" id="indicators"></div>
        </div>
      </section>

      {/* Philosophy / About */}
      <section className="philosophy-section" id="about">
        <div className="philosophy-container">
          <div className="prism-line"></div>
          <h2 className="philosophy-headline">
            PSIKOSUN
            <br />
            HAKKINDA ?
          </h2>
          <p className="philosophy-subheading">
            Eğitim ve kariyer yolculuğu, yalnızca akademik planlamadan ibaret değildir. Bu süreç;
            öğrencinin psikolojik dayanıklılığı, motivasyonu, kaygı düzeyi, hedef bilinci ve
            kendini tanıma kapasitesiyle doğrudan ilişkilidir. Biz, tam da bu noktadan yola
            çıkarak; rehberlik ve psikolojik danışmanlık alanında uzmanlık, etik ve bütüncül
            yaklaşımı merkeze alan bir online danışmanlık platformu olarak kuruldu. Sektörde,
            rehberlik ve danışmanlık hizmetlerinin çoğu zaman alan dışı kişiler tarafından,
            yalnızca program ve ödev takibiyle sınırlandırıldığını; öğrencinin duygusal süreci,
            kaygısı ve psikolojik sağlamlığının ise göz ardı edildiğini gözlemledik. Oysa etkili
            bir rehberlik süreci, öğrenciyi yalnızca akademik olarak değil; zihinsel, duygusal ve
            motivasyonel olarak da desteklemelidir.
          </p>
          <h3 className="philosophy-headline">MİSYONUMUZ</h3>
          <p>
            Alanında uzman PDR danışmanlarıyla, öğrencilerin akademik ve psikolojik ihtiyaçlarını
            bütüncül bir yaklaşımla ele alarak; erişilebilir, etik ve nitelikli online rehberlik
            hizmeti sunmak.
          </p>
          <h3 className="philosophy-headline">VİZYONUMUZ</h3>
          <p>
            Türkiye genelinde erişilebilir bir dijital rehberlik platformu olmak, uzman danışman
            kadromuzu sürekli geliştirmek ve online rehberlik alanında güvenilir bir referans
            marka haline gelmek. Öğrencinin yalnızca bugününü değil, geleceğini de önemseyen; onu
            tek başına değil, birlikte güçlendiren bir rehberlik anlayışıyla çalışıyoruz.
          </p>
          <br />
          <div className="philosophy-pillars">
            <div className="pillar">
              <div className="pillar-icon">💎</div>
              <h3 className="pillar-title">🎯 Bütüncül Yaklaşım</h3>
              <p className="pillar-description">
                Akademik başarıyı yalnızca dersle değil, öğrencinin psikolojik ve duygusal
                ihtiyaçlarıyla birlikte ele alan rehberlik anlayışı.
              </p>
            </div>
            <div className="pillar">
              <div className="pillar-icon">🔬</div>
              <h3 className="pillar-title">🧠 Bilimsel ve Etik Çalışma</h3>
              <p className="pillar-description">
                Psikolojik Danışmanlık ve Rehberlik ilkelerine dayalı, etik sınırlar içinde
                yürütülen planlı ve güvenilir destek süreci.
              </p>
            </div>
            <div className="pillar">
              <div className="pillar-icon">♾️</div>
              <h3 className="pillar-title">📈 Sürekli Gelişim</h3>
              <p className="pillar-description">
                Öğrencinin değişen ihtiyaçlarına göre güncellenen, süreç odaklı ve sürdürülebilir
                rehberlik modeli.
              </p>
            </div>
          </div>
          <div className="philosophy-particles" id="particles"></div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section" id="stats">
        <div className="section-header">
          <h2 className="section-title">Güven ve Deneyim Göstergeleri</h2>
          <p className="section-subtitle">
            Rehberlik sürecimizi şeffaf, ölçülebilir ve sürdürülebilir şekilde yürüten temel
            veriler
          </p>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎓</div>
            <div className="stat-number" data-target="150">
              0
            </div>
            <div className="stat-label">Danışmanlık Süreci</div>
            <p className="stat-description">
              Farklı yaş ve sınıf düzeylerinden öğrencilerle yürütülmüş bireysel rehberlik ve
              takip süreçleri.
            </p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🧠</div>
            <div className="stat-number" data-target="99">
              0
            </div>
            <div className="stat-label">Memnuniyet Oranı (%)</div>
            <p className="stat-description">
              Öğrenci ve velilerden alınan geri bildirimler doğrultusunda ölçülen yüksek
              memnuniyet düzeyi.
            </p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-number" data-target="25">
              0
            </div>
            <div className="stat-label">Aktif Süreç</div>
            <p className="stat-description">
              Aynı anda yürütülen, planlı ve düzenli şekilde takip edilen rehberlik ve danışmanlık
              süreçleri.
            </p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔒</div>
            <div className="stat-number" data-target="500">
              0
            </div>
            <div className="stat-label">Güvenli Görüşme</div>
            <p className="stat-description">
              Gizlilik ve etik ilkeler çerçevesinde gerçekleştirilen çevrimiçi birebir danışmanlık
              görüşmeleri.
            </p>
          </div>
        </div>
      </section>

      {/* Paketler */}
      <section className="stats-section" id="packages">
        <div className="section-header">
          <h2 className="section-title">📦 Paketler</h2>
          <p className="section-subtitle">
            İhtiyacına göre seç: hızlı başlangıçtan tam kapsamlı sürece kadar
          </p>
        </div>
        <div className="stats-grid">
          <div className="stat-card package-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-number">
              600 <br />
              TL
            </div>
            <div className="stat-label">Hızlı Başlangıç Paketi</div>
            <p className="stat-description">
              🗓️ Haftada 1 birebir görüşme
              <br />
              🎯 Başlangıç hedef analizi
              <br />
              🧭 Temel yönlendirme ve yol haritası
              <br />
              ✨ Rehberlik sürecine sağlam giriş
            </p>
            <br />
            <Link href="/auth/register" className="submit-btn package-btn">
              🛒 Satın Al
            </Link>
          </div>
          <div className="stat-card package-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-number">1.000 TL</div>
            <div className="stat-label">Akademik Destek Paketi</div>
            <p className="stat-description">
              🗓️ Haftada 2 birebir görüşme
              <br />
              📌 Düzenli akademik takip
              <br />
              📊 Geri bildirim ve gelişim analizi
              <br />
              🔥 Disiplin ve sürdürülebilir motivasyon
            </p>
            <br />
            <Link href="/auth/register" className="submit-btn package-btn">
              🛒 Satın Al
            </Link>
          </div>
          <div className="stat-card package-card">
            <div className="stat-icon">🧭</div>
            <div className="stat-number">2.000 TL</div>
            <div className="stat-label">Süreç Odaklı Plan</div>
            <p className="stat-description">
              🗓️ Ayda 4 birebir görüşme
              <br />
              🗂️ Kişiye özel çalışma programı
              <br />
              📈 Süreç takibi ve motivasyon desteği
              <br />
              🧠 Kaygı ve performans yönetimi
            </p>
            <br />
            <br />
            <Link href="/auth/register" className="submit-btn package-btn">
              🛒 Satın Al
            </Link>
          </div>
          <div className="stat-card package-card">
            <div className="stat-icon">💎</div>
            <div className="stat-number">3.500 TL</div>
            <div className="stat-label">Tam Kapsamlı Dönüşüm</div>
            <p className="stat-description">
              🗓️ Ayda 8 yoğun birebir görüşme
              <br />
              🔥 Kaygı, motivasyon ve performans yönetimi
              <br />
              🏆 Hedefe odaklı profesyonel rehberlik
            </p>
            <br />
            <Link href="/auth/register" className="submit-btn package-btn">
              🛒 Satın Al
            </Link>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="skills-section" id="skills">
        <div className="skills-container">
          <div className="section-header">
            <h2 className="section-title">Uzmanlık Alanlarımız</h2>
            <p className="section-subtitle">
              Öğrencinin akademik hedeflerini ve psikolojik ihtiyaçlarını birlikte destekleyen
              başlıklar
            </p>
          </div>
          <div className="skill-categories">
            <div className="category-tab active" data-category="all">
              Tümü
            </div>
            <div className="category-tab" data-category="sinav">
              Sınav Süreçleri
            </div>
            <div className="category-tab" data-category="surec">
              Süreç Takibi
            </div>
            <div className="category-tab" data-category="psikoloji">
              Psikolojik Destek
            </div>
            <div className="category-tab" data-category="iletisim">
              İletişim
            </div>
          </div>
          <div className="skills-hexagon-grid" id="skillsGrid"></div>
        </div>
      </section>

      {/* Contact */}
      <section className="contact-section" id="contact">
        <div className="section-header">
          <h2 className="section-title">İletişime Geçin</h2>
          <p className="section-subtitle">
            Sorularınız için bize yazın; en kısa sürede dönüş sağlayalım.
          </p>
        </div>
        <div className="contact-container">
          <div className="contact-info">
            <a
              href="https://maps.google.com/?q=G%C3%B6k%C3%A7ea%C4%9Fa%C3%A7%20Mh.%20Merkez%20Sk.%20No%3A51%20Bafra%20Samsun"
              target="_blank"
              rel="noreferrer"
              className="info-item"
            >
              <div className="info-icon">📍</div>
              <div className="info-text">
                <h4>Adres</h4>
                <p>Gökçeağaç Mh. Merkez Sk. No:51, Bafra / Samsun</p>
              </div>
            </a>
            <a href="mailto:psikosun@gmail.com" className="info-item">
              <div className="info-icon">📧</div>
              <div className="info-text">
                <h4>E-posta</h4>
                <p>psikosun@gmail.com</p>
              </div>
            </a>
            <a href="tel:+905395769930" className="info-item">
              <div className="info-icon">📱</div>
              <div className="info-text">
                <h4>Telefon</h4>
                <p>0539 576 99 30</p>
              </div>
            </a>
            <a href="tel:+905462453797" className="info-item">
              <div className="info-icon">☎️</div>
              <div className="info-text">
                <h4>Telefon (2)</h4>
                <p>0546 245 37 97</p>
              </div>
            </a>
            <Link href="/auth/register" className="info-item">
              <div className="info-icon">📅</div>
              <div className="info-text">
                <h4>Randevu Oluştur</h4>
                <p>Paketleri inceleyin ve görüşme planlayın</p>
              </div>
            </Link>
          </div>

          <form className="contact-form" id="contactForm">
            <div className="form-group">
              <label htmlFor="name">Ad Soyad</label>
              <input type="text" id="name" name="name" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">E-posta</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Konu</label>
              <input type="text" id="subject" name="subject" required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Mesaj</label>
              <textarea
                id="message"
                name="message"
                required
                placeholder="Kısaca ihtiyacınızı yazın (örn: LGS/YKS, motivasyon, kaygı, çalışma planı...)"
              ></textarea>
            </div>
            <button type="submit" className="submit-btn">
              Mesajı Gönder
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon">
                <div className="logo-prism">
                  <div className="prism-shape"></div>
                </div>
              </div>
              <span className="logo-text">
                <span className="prism">PSIKOSUN</span>
                <span className="flux"></span>
              </span>
            </div>
            <p className="footer-description">
              PDR temelli online rehberlik ile öğrencinin akademik hedeflerini ve psikolojik
              dayanıklılığını birlikte destekleyen, etik ve güven odaklı danışmanlık platformu.
            </p>
            <div className="footer-social">
              <a href="mailto:psikosun@gmail.com" className="social-icon" aria-label="E-posta">
                ✉️
              </a>
              <a href="tel:+905395769930" className="social-icon" aria-label="Telefon">
                📞
              </a>
              <a
                href="https://maps.google.com/?q=G%C3%B6k%C3%A7ea%C4%9Fa%C3%A7%20Mh.%20Merkez%20Sk.%20No%3A51%20Bafra%20Samsun"
                target="_blank"
                rel="noreferrer"
                className="social-icon"
                aria-label="Konum"
              >
                📍
              </a>
              <a href="#contact" className="social-icon" aria-label="İletişim Formu">
                💬
              </a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Hizmetler</h4>
            <div className="footer-links">
              <a href="#skills">Uzmanlık Alanları</a>
              <a href="#skills">LGS Danışmanlığı</a>
              <a href="#skills">YKS Danışmanlığı</a>
              <a href="#contact">Online Görüşme</a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Kurumsal</h4>
            <div className="footer-links">
              <a href="#about">Hakkımızda</a>
              <a href="#stats">Dersler</a>
              <a href="#contact">İletişim</a>
              <a href="mailto:psikosun@gmail.com">Destek</a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Yasal</h4>
            <div className="footer-links">
              <a href="#kvkk">KVKK Aydınlatma Metni</a>
              <a href="#gizlilik">Gizlilik &amp; Çerez Politikası</a>
              <a href="#uyelik">Üyelik Sözleşmesi</a>
              <a href="#mesafeli">Mesafeli Satış Sözleşmesi</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="copyright">© 2026 PSIKOSUN. Tüm hakları saklıdır.</div>
          <div className="footer-credits">
            <span>Adres: Gökçeağaç Mh. Merkez Sk. No:51, Bafra / Samsun</span>
            <span style={{ marginLeft: 10 }}>•</span>
            <a href="mailto:psikosun@gmail.com" rel="nofollow">
              psikosun@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
