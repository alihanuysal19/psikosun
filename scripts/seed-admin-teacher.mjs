import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Eksik env: NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const prisma = new PrismaClient();

const USERS = [
  {
    email: "superadmin@psikosun.com",
    password: "super123",
    full_name: "Süper Admin",
    role: "ADMIN",
  },
  {
    email: "ogretmen@psikosun.com",
    password: "ogretmen123",
    full_name: "Demo Öğretmen",
    role: "TEACHER",
  },
];

async function ensureUser({ email, password, full_name, role }) {
  // Eğer daha önce oluşturulmuşsa mevcut ID'yi bul
  const list = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (list.error) throw list.error;
  let authUser = list.data.users.find((u) => u.email === email);

  if (!authUser) {
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });
    if (created.error) throw created.error;
    authUser = created.data.user;
    console.log(`  • Auth user yaratıldı (${email})`);
  } else {
    // Şifreyi sync et (script tekrar çalışırsa bilinen parola olsun)
    const updated = await admin.auth.admin.updateUserById(authUser.id, {
      password,
      user_metadata: { full_name },
      email_confirm: true,
    });
    if (updated.error) throw updated.error;
    console.log(`  • Auth user güncellendi (${email})`);
  }

  const profile = await prisma.profile.upsert({
    where: { id: authUser.id },
    update: { email, full_name, role, is_active: true },
    create: { id: authUser.id, email, full_name, role, is_active: true },
  });
  console.log(`  • Profile ${profile.role} olarak hazır`);
}

(async () => {
  for (const u of USERS) {
    console.log(`\n→ ${u.email} (${u.role})`);
    try {
      await ensureUser(u);
    } catch (e) {
      console.error("  ✗", e.message ?? e);
      process.exitCode = 1;
    }
  }
  await prisma.$disconnect();
  console.log("\nBitti.");
})();
