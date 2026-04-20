import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("id");
  if (!userId) return NextResponse.json({ error: "Kullanıcı ID gerekli" }, { status: 400 });

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      include: {
        user_packages: { include: { package: true }, orderBy: { purchased_at: "desc" } },
        purchases: { include: { package: true }, orderBy: { created_at: "desc" } },
      },
    });
    if (!profile) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });
    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, email, full_name, role } = body;
    if (!id || !email || !full_name) return NextResponse.json({ error: "Eksik alan" }, { status: 400 });

    const profile = await prisma.profile.upsert({
      where: { id },
      update: {},
      create: { id, email, full_name, role: role ?? "STUDENT" },
    });
    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
