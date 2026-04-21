import { prisma } from "@/utils/prisma";
import { serializePrisma } from "@/utils/serialize";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

function generatePassword(length = 10): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  const bytes = new Uint8Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < length; i++) out += chars[bytes[i] % chars.length];
  return out;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      caller_id,
      email,
      full_name,
      password,
      phone,
      birth_date,
      education_level,
      city,
      assigned_teacher_id,
    } = body;

    if (!caller_id || !email || !full_name) {
      return NextResponse.json(
        { error: "caller_id, email ve full_name zorunlu" },
        { status: 400 },
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return NextResponse.json({ error: "Geçersiz e-posta" }, { status: 400 });
    }

    const caller = await prisma.profile.findUnique({
      where: { id: caller_id },
      select: { role: true, id: true },
    });
    if (!caller) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    if (caller.role !== "ADMIN" && caller.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Öğrenci oluşturma yetkiniz yok" },
        { status: 403 },
      );
    }

    const normEmail = String(email).trim().toLowerCase();

    const existing = await prisma.profile.findUnique({
      where: { email: normEmail },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Bu e-posta zaten kayıtlı" },
        { status: 409 },
      );
    }

    // Öğretmen çağırıyorsa öğrenci otomatik kendisine atanır.
    // Admin çağırıyorsa body'deki assigned_teacher_id kullanılır (opsiyonel).
    let finalTeacherId: string | null = null;
    if (caller.role === "TEACHER") {
      finalTeacherId = caller.id;
    } else if (assigned_teacher_id) {
      const t = await prisma.profile.findUnique({
        where: { id: assigned_teacher_id },
        select: { role: true },
      });
      if (!t || t.role !== "TEACHER") {
        return NextResponse.json(
          { error: "Geçersiz öğretmen" },
          { status: 400 },
        );
      }
      finalTeacherId = assigned_teacher_id;
    }

    const finalPassword =
      typeof password === "string" && password.length >= 6
        ? password
        : generatePassword(10);

    const admin = getAdmin();

    const { data: authData, error: authErr } = await admin.auth.admin.createUser({
      email: normEmail,
      password: finalPassword,
      email_confirm: true,
      user_metadata: { full_name: String(full_name).trim() },
    });

    if (authErr || !authData?.user?.id) {
      const msg = authErr?.message ?? "Supabase auth kullanıcısı oluşturulamadı";
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    const newUserId = authData.user.id;

    const optionalFields: Record<string, any> = {};
    if (phone) optionalFields.phone = String(phone).trim();
    if (city) optionalFields.city = String(city).trim();
    if (education_level) optionalFields.education_level = education_level;
    if (birth_date) {
      const d = new Date(birth_date);
      if (!isNaN(d.getTime())) optionalFields.birth_date = d;
    }

    try {
      const profile = await prisma.profile.create({
        data: {
          id: newUserId,
          email: normEmail,
          full_name: String(full_name).trim(),
          role: "STUDENT",
          assigned_teacher_id: finalTeacherId,
          ...optionalFields,
        },
      });

      return NextResponse.json(
        {
          data: {
            profile: serializePrisma(profile),
            temp_password: finalPassword,
            password_source: password ? "provided" : "generated",
          },
        },
        { status: 201 },
      );
    } catch (profileErr: any) {
      // Profile yaratılamadıysa orphan auth user kalmasın — geri al
      await admin.auth.admin.deleteUser(newUserId).catch(() => {});
      console.error("profile create failed, auth user rolled back:", profileErr);
      return NextResponse.json(
        { error: "Profil kaydı oluşturulamadı", detail: profileErr?.message },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error?.message ?? "Sunucu hatası" },
      { status: 500 },
    );
  }
}
