"use client";
import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthContext from "@/app/context/AuthContext";
import { formatMoney } from "@/utils/format";

interface PublicPackage {
  id: number;
  name: string;
  description: string | null;
  lesson_count: number;
  price: string | number;
}

const PACKAGE_ICONS = ["⚡", "🎯", "🧭", "💎", "🌟", "🚀", "✨", "🔥"];

function packageLines(description: string | null, lessonCount: number): string[] {
  if (description && description.trim()) {
    return description
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [`🗓️ ${lessonCount} birebir görüşme hakkı`];
}

export default function LandingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, logout } = useContext(
    AuthContext,
  ) as any;

  const [packages, setPackages] = useState<PublicPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/packages")
      .then((r) => r.json())
      .then(({ data }) => {
        if (!cancelled) setPackages(data || []);
      })
      .catch(() => {
        if (!cancelled) setPackages([]);
      })
      .finally(() => {
        if (!cancelled) setPackagesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.refresh();
    }
  };

  useEffect(() => {
    // Style cache-buster — script'le aynı stratejı, asset değişikliklerinin
    // ziyaretçiye anında yansıması için
    document.getElementById("landing-stylesheet")?.remove();
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `/landing/prism-flux.css?v=${Date.now()}`;
    link.id = "landing-stylesheet";
    document.head.appendChild(link);

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
          <a href="#home" className="logo logo-brand" aria-label="PSIKOSUN ana sayfa">
            <img
              src="/branding/psikosun-wordmark-480.png"
              srcSet="/branding/psikosun-wordmark-320.png 320w, /branding/psikosun-wordmark-480.png 480w, /branding/psikosun-wordmark-800.png 800w"
              sizes="(max-width: 480px) 140px, (max-width: 768px) 160px, 200px"
              alt="PSIKOSUN"
              className="logo-wordmark"
              width={200}
              height={58}
              fetchPriority="high"
              decoding="async"
            />
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
              <Link href="/kesfet" className="nav-link">
                Keşfet
              </Link>
            </li>
            <li>
              <a href="#contact" className="nav-link">
                İletişim
              </a>
            </li>
            {isInitialized && isAuthenticated && user ? (
              <>
                <li>
                  <Link
                    href="/panel"
                    className="nav-link nav-cta"
                    style={{
                      background:
                        "linear-gradient(135deg,#7c3aed,#00bcd4)",
                      color: "#fff",
                      padding: "8px 18px",
                      borderRadius: "999px",
                      fontWeight: 600,
                    }}
                  >
                    Yönetim Paneli
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="nav-link"
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(124,58,237,0.35)",
                      color: "#7c3aed",
                      padding: "8px 16px",
                      borderRadius: "999px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: "inherit",
                    }}
                  >
                    Çıkış
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/auth/login"
                    className="nav-link"
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(124,58,237,0.35)",
                      color: "#7c3aed",
                      padding: "8px 18px",
                      borderRadius: "999px",
                      fontWeight: 600,
                    }}
                  >
                    Giriş
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/register"
                    className="nav-link nav-cta"
                    style={{
                      background: "linear-gradient(135deg,#7c3aed,#00bcd4)",
                      color: "#fff",
                      padding: "8px 18px",
                      borderRadius: "999px",
                      fontWeight: 600,
                    }}
                  >
                    Kayıt Ol
                  </Link>
                </li>
              </>
            )}
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
          <h2 className="section-title">
            <span className="title-emoji">📦</span> Paketler
          </h2>
          <p className="section-subtitle">
            İhtiyacına göre seç: hızlı başlangıçtan tam kapsamlı sürece kadar
          </p>
        </div>
        <div className="stats-grid">
          {packagesLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="stat-card package-card" style={{ opacity: 0.5 }}>
                <div
                  className="stat-icon"
                  style={{ background: "rgba(124,58,237,0.15)" }}
                />
                <div className="stat-number" style={{ height: 40 }} />
                <div
                  className="stat-label"
                  style={{
                    height: 14,
                    background: "rgba(124,58,237,0.1)",
                    borderRadius: 6,
                    margin: "8px auto",
                    width: "60%",
                  }}
                />
              </div>
            ))
          ) : packages.length === 0 ? (
            <div
              className="stat-card package-card"
              style={{ gridColumn: "1 / -1", textAlign: "center" }}
            >
              <div className="stat-icon">📭</div>
              <div className="stat-label">Henüz aktif paket yok</div>
              <p className="stat-description">
                Yakında yeni paketler tanımlanacak. Bu sırada bizimle iletişime
                geçebilirsiniz.
              </p>
              <br />
              <a href="#contact" className="submit-btn package-btn">
                İletişim
              </a>
            </div>
          ) : (
            packages.map((pkg, idx) => {
              const lines = packageLines(pkg.description, pkg.lesson_count);
              const icon = PACKAGE_ICONS[idx % PACKAGE_ICONS.length];
              return (
                <div key={pkg.id} className="stat-card package-card">
                  <div className="stat-icon">{icon}</div>
                  <div className="stat-number">{formatMoney(pkg.price)}</div>
                  <div className="stat-label">{pkg.name}</div>
                  <p className="stat-description">
                    {lines.map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < lines.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                  <br />
                  <Link href="/auth/register" className="submit-btn package-btn">
                    🛒 Satın Al
                  </Link>
                </div>
              );
            })
          )}
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
            <a href="mailto:info@psikosun.com" className="info-item">
              <div className="info-icon">📧</div>
              <div className="info-text">
                <h4>E-posta</h4>
                <p>info@psikosun.com</p>
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
            <a
              href="https://www.instagram.com/psikosun"
              target="_blank"
              rel="noopener noreferrer"
              className="info-item"
            >
              <div className="info-icon">📷</div>
              <div className="info-text">
                <h4>Instagram</h4>
                <p>@psikosun</p>
              </div>
            </a>
            <a
              href="https://www.facebook.com/people/Psikosun-%C3%96%C4%9Frenci-Ko%C3%A7lu%C4%9Fu-PDR/61588719912235/"
              target="_blank"
              rel="noopener noreferrer"
              className="info-item"
            >
              <div className="info-icon">📘</div>
              <div className="info-text">
                <h4>Facebook</h4>
                <p>PSIKOSUN sayfamız</p>
              </div>
            </a>
            <a
              href="https://www.tiktok.com/@psikosun"
              target="_blank"
              rel="noopener noreferrer"
              className="info-item"
            >
              <div className="info-icon">🎵</div>
              <div className="info-text">
                <h4>TikTok</h4>
                <p>@psikosun</p>
              </div>
            </a>
            <a
              href="https://www.linkedin.com/company/psikosun/"
              target="_blank"
              rel="noopener noreferrer"
              className="info-item"
            >
              <div className="info-icon">💼</div>
              <div className="info-text">
                <h4>LinkedIn</h4>
                <p>PSIKOSUN şirket sayfası</p>
              </div>
            </a>
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
              <img
                src="/branding/psikosun-mark-128.png"
                srcSet="/branding/psikosun-mark-64.png 64w, /branding/psikosun-mark-128.png 128w, /branding/psikosun-mark-256.png 256w"
                sizes="56px"
                alt=""
                aria-hidden="true"
                className="footer-mark"
                width={56}
                height={56}
                loading="lazy"
                decoding="async"
              />
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
              <a
                href="https://www.instagram.com/psikosun"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Instagram"
                title="Instagram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.34 4.14.63c-.79.3-1.46.71-2.13 1.38C1.34 2.68.93 3.35.63 4.14.34 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.27 2.15.56 2.91.3.79.71 1.46 1.38 2.13.67.67 1.34 1.08 2.13 1.38.76.29 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.27 2.91-.56.79-.3 1.46-.71 2.13-1.38.67-.67 1.08-1.34 1.38-2.13.29-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.27-2.15-.56-2.91-.3-.79-.71-1.46-1.38-2.13C21.32 1.34 20.65.93 19.86.63c-.76-.29-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zm0 10.16a4 4 0 110-8 4 4 0 010 8zm6.41-11.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/people/Psikosun-%C3%96%C4%9Frenci-Ko%C3%A7lu%C4%9Fu-PDR/61588719912235/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Facebook"
                title="Facebook"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@psikosun"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="TikTok"
                title="TikTok"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43V8.66a8.16 8.16 0 004.77 1.52V6.73a4.85 4.85 0 01-1.84-.04z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/psikosun/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29zM5.34 7.43a2.06 2.06 0 11.04-4.12 2.06 2.06 0 01-.04 4.12zM3.56 20.45h3.56V9H3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
                </svg>
              </a>
              <a
                href="mailto:info@psikosun.com"
                className="social-icon"
                aria-label="E-posta"
                title="E-posta"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
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
              <Link href="/kesfet">Keşfet</Link>
              <a href="#stats">Dersler</a>
              <a href="#contact">İletişim</a>
              <a href="mailto:info@psikosun.com">Destek</a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Yasal</h4>
            <div className="footer-links">
              <Link href="/kvkk">KVKK Aydınlatma Metni</Link>
              <Link href="/gizlilik">Gizlilik &amp; Çerez Politikası</Link>
              <Link href="/uyelik">Üyelik Sözleşmesi</Link>
              <Link href="/mesafeli">Mesafeli Satış Sözleşmesi</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="copyright">© 2026 PSIKOSUN. Tüm hakları saklıdır.</div>
          <div className="footer-credits">
            <span>Adres: Gökçeağaç Mh. Merkez Sk. No:51, Bafra / Samsun</span>
            <span style={{ marginLeft: 10 }}>•</span>
            <a href="mailto:info@psikosun.com" rel="nofollow">
              info@psikosun.com
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
