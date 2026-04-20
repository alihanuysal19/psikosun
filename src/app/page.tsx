"use client";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-dark/80 backdrop-blur border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Icon icon="tabler:brain" className="text-white" width={18} />
            </div>
            <span className="text-lg font-bold text-dark dark:text-white">psikosun</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
              Giriş Yap
            </Link>
            <Link href="/auth/register"
              className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primaryemphasis transition-colors">
              Kayıt Ol
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <Icon icon="tabler:sparkles" width={14} />
          Online Psikoloji Eğitimi
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-dark dark:text-white mb-6 leading-tight">
          Uzman eşliğinde<br />
          <span className="text-primary">kişisel gelişim</span> yolculuğu
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">
          Alanında uzman psikologlarla birebir online seanslar. Kendi hızınızda, kendi programınızda ilerleyin.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/auth/register"
            className="bg-primary text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-primaryemphasis transition-colors text-sm">
            Hemen Başla
          </Link>
          <Link href="/auth/login"
            className="border border-gray-200 dark:border-gray-700 text-dark dark:text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
            Giriş Yap
          </Link>
        </div>
      </section>

      {/* Özellikler */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "tabler:video", title: "Online Seanslar", desc: "Zoom üzerinden konforlu ortamınızda seans yapın." },
            { icon: "tabler:package", title: "Esnek Paketler", desc: "İhtiyacınıza göre ders paketi seçin, dilediğiniz zaman kullanın." },
            { icon: "tabler:notes", title: "Seans Notları", desc: "Terapistiniz her seans için notlar tutar, ilerlemenizi takip edersiniz." },
          ].map((f) => (
            <div key={f.title} className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon icon={f.icon} className="text-primary" width={24} />
              </div>
              <h3 className="font-semibold text-dark dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Paketler */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-dark dark:text-white mb-3">Paketlerimiz</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10">İhtiyacınıza en uygun paketi seçin</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Başlangıç", sessions: 4, price: "1.200", popular: false },
              { name: "Standart", sessions: 8, price: "2.200", popular: true },
              { name: "Premium", sessions: 12, price: "3.000", popular: false },
            ].map((p) => (
              <div key={p.name} className={`bg-white dark:bg-dark rounded-2xl p-6 border-2 ${
                p.popular ? "border-primary shadow-lg shadow-primary/10" : "border-gray-100 dark:border-gray-800"
              }`}>
                {p.popular && (
                  <div className="text-xs bg-primary text-white px-3 py-1 rounded-full inline-block mb-3 font-medium">
                    En Popüler
                  </div>
                )}
                <h3 className="text-xl font-bold text-dark dark:text-white mb-1">{p.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{p.sessions} seans</p>
                <p className="text-3xl font-bold text-dark dark:text-white mb-6">
                  {p.price} <span className="text-base font-normal text-gray-500">₺</span>
                </p>
                <Link href="/auth/register"
                  className={`block text-center text-sm font-semibold py-3 rounded-xl transition-colors ${
                    p.popular
                      ? "bg-primary text-white hover:bg-primaryemphasis"
                      : "border border-gray-200 dark:border-gray-700 text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}>
                  Paketi Seç
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Icon icon="tabler:brain" className="text-white" width={13} />
            </div>
            <span>psikosun</span>
          </div>
          <p>© {new Date().getFullYear()} psikosun. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
