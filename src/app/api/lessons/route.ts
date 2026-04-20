import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const role = req.nextUrl.searchParams.get("role");

  if (!userId || !role) return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });

  try {
    const where = role === "TEACHER" ? { teacher_id: userId } : { student_id: userId };
    const lessons = await prisma.lesson.findMany({
      where,
      include: {
        student: { select: { id: true, full_name: true, email: true, avatar_url: true } },
        teacher: { select: { id: true, full_name: true, email: true, avatar_url: true } },
        user_package: { include: { package: true } },
        notes: true,
      },
      orderBy: { scheduled_at: "desc" },
    });
    return NextResponse.json({ data: lessons });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { student_id, teacher_id, user_package_id, scheduled_at, platform_link } = body;
    if (!student_id || !teacher_id || !scheduled_at)
      return NextResponse.json({ error: "Eksik alan" }, { status: 400 });

    const lesson = await prisma.lesson.create({
      data: { student_id, teacher_id, user_package_id, scheduled_at: new Date(scheduled_at), platform_link },
      include: {
        student: { select: { id: true, full_name: true, email: true } },
        teacher: { select: { id: true, full_name: true, email: true } },
      },
    });
    return NextResponse.json({ data: lesson }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
