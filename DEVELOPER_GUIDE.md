# psikosun — Geliştirici Rehberi

Bu dosyadaki kurallar projede katkıda bulunan **herkes** için bağlayıcıdır.

---

## Proje Mimarisi

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Veritabanı**: Supabase (PostgreSQL) + Prisma ORM
- **Stil**: Tailwind CSS 4 + Flowbite React
- **State**: Redux Toolkit
- **Auth**: Supabase Auth
- **HTTP**: Axios (`src/utils/axios.ts`)
- **i18n**: i18next (`src/utils/i18n.ts`)
- **Port (dev)**: `next dev` → `http://localhost:3000`
- **Ana giriş**: `src/app/(DashboardLayout)/layout.tsx`

### Klasör yapısı
```
src/
  app/
    (DashboardLayout)/   # auth sonrası tüm sayfalar
    api/                 # Next.js Route Handlers (backend)
    auth/                # login, register, forgot-password
  utils/
    prisma.ts            # Prisma singleton
    axios.ts             # Axios instance
    i18n.ts              # i18next config
prisma/
  schema.prisma          # DB şeması
  migrations/            # migration dosyaları
```

---

## Kodlama Kuralları

### Genel
1. **Türkçe UI**: Kullanıcıya görünen tüm yazılar Türkçe ve doğru Türkçe karakterlerle (ç, ğ, ı, ö, ş, ü). ASCII fallback ("Giris") kabul edilmez.
2. **Kod İngilizce**: Değişken, fonksiyon, dosya adları İngilizce. Sadece UI string'leri Türkçe.
3. **Commit her zaman**: Tamamlanan değişiklik → commit + push. Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
4. **Belirsizlik varsa sor**: Varsayımla ilerleme.
5. **Runtime artifact commit yok**: `node_modules/`, `.next/`, `*.log`, `.env*` Git'e girmez.

### TypeScript / Next.js
6. **Strict TypeScript**: `any` kullanma. Tip belirt veya `unknown` kullan.
7. **Server / Client ayrımı**: `"use client"` sadece gerçekten client state/event gereken component'lere. API çağrıları mümkünse Server Component veya Route Handler'da.
8. **Route Handler hata yönetimi**: Her handler `try/catch` ile sarılı. Hata → `NextResponse.json({ error: "..." }, { status: 500 })`.
9. **Validation**: Gelen `req.json()` body'si tip kontrolünden geçirilir; eksik alan → 400.
10. **Loading state**: Her async işlem spinner veya disabled buton ile.

### Veritabanı (Prisma + Supabase)
11. **Prisma singleton**: `src/utils/prisma.ts`'teki `prisma` instance'ını kullan, yeni `PrismaClient()` açma.
12. **Migration isimlendirme**: `npx prisma migrate dev --name add_tablo_alan` — açıklayıcı isim.
13. **N+1 sorgudan kaçın**: İlişkili veri için `include` veya `select` ile eager-load.
14. **Prod migration**: `npx prisma migrate deploy` (sadece pending migration'lar).

### Auth (Supabase)
15. **Supabase Auth kullan**: Şifre hash ve session yönetimi için Supabase SDK'ya güven, manuel bcrypt/JWT yazma.
16. **Row Level Security (RLS)**: Supabase'de yeni tablo eklenince RLS politikası tanımla.
17. **env'den al**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` hard-code edilmez.

### Güvenlik
18. **Secret commit yok**: `.env.local` asla commit edilmez. `.env.example` versiyon kontrolünde.
19. **Service role key**: Sadece server-side kodu (`api/` route'ları) kullanabilir, client'a asla açılmaz.
20. **Kullanıcı input sanitize**: XSS önlemi — React zaten escape eder ama `dangerouslySetInnerHTML` yasak.

---

## Geliştirme Kurulumu

### Gereksinimler
- Node.js ≥ 18
- Supabase hesabı + proje (veya local Supabase CLI)
- Git

### İlk kurulum
```bash
cd psikosun
cp .env.example .env.local   # düzenle: Supabase URL ve key'ler
npm install
npx prisma generate
npx prisma migrate deploy    # ya da: npx prisma db push (Supabase'e direkt)
npm run dev                  # http://localhost:3000
```

### .env.local zorunlu değişkenler
```env
DATABASE_URL=postgresql://postgres:[şifre]@db.[proje-id].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[şifre]@db.[proje-id].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[proje-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

---

## GitHub Workflow

### Branch stratejisi
- `main` — production, korumalı
- `feat/<özellik>` — yeni özellik
- `fix/<bug>` — bug düzeltmesi
- `chore/<iş>` — bağımlılık, config

### Güvenlik kontrol listesi (push öncesi)
- `git status` — `.env.local` veya secret dosyası stage'de mi? → çıkar
- Yeni tablo → RLS politikası yazıldı mı?
- Service role key client bundle'a giriyor mu? → `NEXT_PUBLIC_` prefix'i olmamalı

---

## Sık Hatalar

- **Prisma "shadow DB" hatası**: Supabase'de `DIRECT_URL` ayarlandı mı?
- **Supabase RLS bloğu**: 403/empty response → ilgili tablo için RLS policy eksik.
- **`"use client"` eksik**: Redux veya event handler kullanan component server'da render edilmeye çalışılıyor → başa `"use client"` ekle.
- **Flowbite patch**: `postinstall` script'i `flowbite-react patch` çalıştırır — `npm install` sonrası otomatik.
