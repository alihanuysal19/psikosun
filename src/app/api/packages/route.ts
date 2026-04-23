import { prisma } from "@/utils/prisma";
import { serializePrisma } from "@/utils/serialize";
import { NextRequest, NextResponse } from "next/server";

async function isAdmin(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;
  const u = await prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return u?.role === "ADMIN";
}

export async function GET(req: NextRequest) {
  const includeInactive = req.nextUrl.searchParams.get("includeInactive") === "1";
  const adminId = req.nextUrl.searchParams.get("adminId");

  if (includeInactive && !(await isAdmin(adminId))) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  try {
    const packages = await prisma.package.findMany({
      where: includeInactive ? undefined : { is_active: true },
      orderBy: { price: "asc" },
    });
    return NextResponse.json({ data: serializePrisma(packages) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { caller_id, name, description, lesson_count, price } = body;

    if (!(await isAdmin(caller_id))) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    if (!name || !lesson_count || !price)
      return NextResponse.json({ error: "Eksik alan" }, { status: 400 });

    const pkg = await prisma.package.create({
      data: {
        name,
        description,
        lesson_count: parseInt(lesson_count),
        price: parseFloat(price),
      },
    });
    return NextResponse.json({ data: serializePrisma(pkg) }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
