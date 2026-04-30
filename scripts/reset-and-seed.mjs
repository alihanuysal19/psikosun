/**
 * Tum hesaplari (auth.users + Profile + bagli tum kayitlar) sifirlar ve
 * 3 demo hesap olusturur:
 *   - superadmin@psikosun.com  (ADMIN / Super Admin)
 *   - ogretmen@psikosun.com    (TEACHER)
 *   - ogrenci@psikosun.com     (STUDENT, ogretmene atanmis)
 *
 * Sifre: psikosun123 (her uc hesap icin ayni)
 *
 * Calistirma:
 *   node --env-file=.env.production scripts/reset-and-seed.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Eksik env: NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

console.log(`[reset-and-seed] Hedef Supabase URL: ${SUPABASE_URL}`);
console.log("[reset-and-seed] 4 saniye icinde Ctrl+C basmazsaniz devam edilecek...\n");
await new Promise((r) => setTimeout(r, 4000));

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const prisma = new PrismaClient();

const PASSWORD = "psikosun123";
const USERS = [
  { email: "superadmin@psikosun.com", full_name: "Süper Admin", role: "ADMIN" },
  { email: "ogretmen@psikosun.com", full_name: "Demo Öğretmen", role: "TEACHER" },
  { email: "ogrenci@psikosun.com", full_name: "Demo Öğrenci", role: "STUDENT" },
];

async function main() {
  console.log("[1/3] Veritabani satirlari temizleniyor (paketler korunuyor)...");

  // Cocuk tablolardan parent'a dogru sirayla
  const cleanupSteps = [
    ["notification", () => prisma.notification.deleteMany({})],
    ["discoveryLike", () => prisma.discoveryLike.deleteMany({})],
    ["discoveryComment", () => prisma.discoveryComment.deleteMany({})],
    ["discoveryPost", () => prisma.discoveryPost.deleteMany({})],
    ["message", () => prisma.message.deleteMany({})],
    ["note", () => prisma.note.deleteMany({})],
    ["lesson", () => prisma.lesson.deleteMany({})],
    ["userPackage", () => prisma.userPackage.deleteMany({})],
    ["purchaseHistory", () => prisma.purchaseHistory.deleteMany({})],
    ["profile", () => prisma.profile.deleteMany({})],
  ];

  for (const [name, fn] of cleanupSteps) {
    const r = await fn();
    console.log(`  - ${name.padEnd(18)} -> ${r.count} satir silindi`);
  }

  console.log("\n[2/3] Supabase auth.users temizleniyor...");
  let totalDeleted = 0;
  let totalFailed = 0;
  // Supabase listUsers paginated; deleteUser cagrilarini paralel batch yapalim
  // ama aniden patlamasin diye chunk'larda 5'erli ilerle
  while (true) {
    const list = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (list.error) throw list.error;
    const users = list.data.users || [];
    if (!users.length) break;

    for (let i = 0; i < users.length; i += 5) {
      const chunk = users.slice(i, i + 5);
      const results = await Promise.allSettled(
        chunk.map((u) => admin.auth.admin.deleteUser(u.id)),
      );
      results.forEach((res, idx) => {
        const u = chunk[idx];
        if (res.status === "fulfilled" && !res.value.error) {
          totalDeleted++;
        } else {
          totalFailed++;
          const msg =
            res.status === "rejected"
              ? res.reason?.message ?? res.reason
              : res.value.error?.message;
          console.warn(`  ! ${u.email ?? u.id} silinemedi: ${msg}`);
        }
      });
    }

    // Supabase listUsers her seferinde ilk sayfayi dondurdugu icin loop
    // bitmez sanilabilir; silinmis olanlar listeden cikar -> bos liste = exit
  }
  console.log(`  - ${totalDeleted} auth user silindi (basarisiz: ${totalFailed})`);

  console.log("\n[3/3] 3 demo hesap olusturuluyor...");
  const created = {};
  for (const u of USERS) {
    const res = await admin.auth.admin.createUser({
      email: u.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: u.full_name },
    });
    if (res.error) throw new Error(`auth create ${u.email}: ${res.error.message}`);
    const authId = res.data.user.id;

    const profile = await prisma.profile.create({
      data: {
        id: authId,
        email: u.email,
        full_name: u.full_name,
        role: u.role,
        is_active: true,
      },
    });
    created[u.role] = profile;
    console.log(`  + ${u.email.padEnd(28)} (${u.role}) id=${authId.slice(0, 8)}...`);
  }

  // Ogrenciyi ogretmene ata (demo akislari kolaylastirir)
  if (created.STUDENT && created.TEACHER) {
    await prisma.profile.update({
      where: { id: created.STUDENT.id },
      data: { assigned_teacher_id: created.TEACHER.id },
    });
    console.log(`  ~ Ogrenci ogretmene atandi (assigned_teacher_id)`);
  }

  console.log("\n[OK] Tamamlandi.");
  console.log(`  Sifre (3 hesap icin ayni): ${PASSWORD}`);
  console.log(`  - superadmin@psikosun.com  (ADMIN)`);
  console.log(`  - ogretmen@psikosun.com    (TEACHER)`);
  console.log(`  - ogrenci@psikosun.com     (STUDENT, ogretmene atanmis)`);
}

try {
  await main();
} catch (e) {
  console.error("HATA:", e?.message ?? e);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
