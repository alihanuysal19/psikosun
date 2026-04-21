import { prisma } from "@/utils/prisma";
import { serializePrisma } from "@/utils/serialize";
import { NextRequest, NextResponse } from "next/server";

const EDITABLE_FIELDS = [
  "full_name",
  "phone",
  "parent_phone",
  "city",
  "district",
  "school",
  "education_level",
  "birth_date",
  "avatar_url",
  "assigned_teacher_id",
] as const;

const DATE_FIELDS = new Set(["birth_date"]);

function coerceValue(key: string, val: unknown) {
  if (val === "" || val === null || val === undefined) return null;
  if (DATE_FIELDS.has(key)) {
    const d = new Date(String(val));
    return isNaN(d.getTime()) ? null : d;
  }
  return val;
}

const LEGACY_PROFILE_SELECT = {
  id: true,
  email: true,
  full_name: true,
  role: true,
  avatar_url: true,
  phone: true,
  parent_phone: true,
  city: true,
  district: true,
  school: true,
  education_level: true,
  assigned_teacher_id: true,
  is_active: true,
  created_at: true,
} as const;

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("id");
  if (!userId) return NextResponse.json({ error: "Kullanıcı ID gerekli" }, { status: 400 });

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      include: {
        assigned_teacher: { select: { id: true, full_name: true, email: true } },
        user_packages: { include: { package: true }, orderBy: { purchased_at: "desc" } },
        purchases: { include: { package: true }, orderBy: { created_at: "desc" } },
      },
    });
    if (!profile) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });
    return NextResponse.json({ data: serializePrisma(profile) });
  } catch (error: any) {
    // Schema yeni alan ekledi (örn. birth_date) ama DB migration
    // çalıştırılmadıysa Prisma `column does not exist` atar. Legacy
    // SELECT ile crashi engelle, kullanıcı panele girebilsin.
    const msg = String(error?.message ?? "");
    if (msg.includes("does not exist")) {
      try {
        const legacy = await prisma.profile.findUnique({
          where: { id: userId },
          select: {
            ...LEGACY_PROFILE_SELECT,
            assigned_teacher: { select: { id: true, full_name: true, email: true } },
            user_packages: { include: { package: true }, orderBy: { purchased_at: "desc" } },
            purchases: { include: { package: true }, orderBy: { created_at: "desc" } },
          } as any,
        });
        if (!legacy)
          return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });
        return NextResponse.json({ data: serializePrisma(legacy) });
      } catch (fallbackErr) {
        console.error("profile legacy fallback failed:", fallbackErr);
      }
    }
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, email, full_name, role, ...rest } = body;
    if (!id || !email || !full_name)
      return NextResponse.json({ error: "Eksik alan" }, { status: 400 });

    const optional: Record<string, any> = {};
    for (const key of EDITABLE_FIELDS) {
      if (key === "full_name" || key === "assigned_teacher_id") continue;
      if (key in rest) {
        const v = coerceValue(key, rest[key]);
        if (v !== null) optional[key] = v;
      }
    }

    // birth_date kolonu henüz eklenmemişse (migration gecikti) extras'ı
    // optimistik temizle ki core user create'i crash etmesin
    const filterMissing = async (op: () => Promise<any>) => {
      try {
        return await op();
      } catch (err: any) {
        const msg = String(err?.message ?? "");
        if (msg.includes("does not exist") && "birth_date" in optional) {
          const copy = { ...optional };
          delete copy.birth_date;
          return await prisma.profile.upsert({
            where: { id },
            update: copy,
            create: { id, email, full_name, role: role ?? "STUDENT", ...copy },
            select: LEGACY_PROFILE_SELECT,
          });
        }
        throw err;
      }
    };

    const profile = await filterMissing(() =>
      prisma.profile.upsert({
        where: { id },
        update: optional,
        create: { id, email, full_name, role: role ?? "STUDENT", ...optional },
      }),
    );
    return NextResponse.json({ data: serializePrisma(profile) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ error: "Kullanıcı ID gerekli" }, { status: 400 });

    const data: Record<string, any> = {};
    for (const key of EDITABLE_FIELDS) {
      if (key in rest) data[key] = coerceValue(key, rest[key]);
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Güncellenecek alan yok" }, { status: 400 });
    }

    if (data.assigned_teacher_id) {
      const teacher = await prisma.profile.findUnique({
        where: { id: data.assigned_teacher_id },
        select: { role: true },
      });
      if (!teacher || teacher.role !== "TEACHER") {
        return NextResponse.json({ error: "Geçersiz öğretmen" }, { status: 400 });
      }
    }

    const profile = await prisma.profile.update({
      where: { id },
      data,
      include: { assigned_teacher: { select: { id: true, full_name: true } } },
    });
    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
