import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const role = req.nextUrl.searchParams.get("role");
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");

  if (!userId || !role) return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });

  try {
    const where: any = role === "TEACHER" ? { teacher_id: userId } : { student_id: userId };
    if (from || to) {
      where.scheduled_at = {};
      if (from) where.scheduled_at.gte = new Date(from);
      if (to) where.scheduled_at.lte = new Date(to);
    }

    const lessons = await prisma.lesson.findMany({
      where,
      include: {
        student: { select: { id: true, full_name: true, email: true, avatar_url: true } },
        teacher: { select: { id: true, full_name: true, email: true, avatar_url: true } },
        user_package: { include: { package: true } },
        notes: true,
      },
      orderBy: { scheduled_at: "asc" },
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
    const { student_id, teacher_id, title, description, scheduled_at, ends_at, platform_link } = body;

    if (!student_id || !teacher_id || !title || !scheduled_at || !ends_at) {
      return NextResponse.json({ error: "Eksik alan" }, { status: 400 });
    }

    const start = new Date(scheduled_at);
    const end = new Date(ends_at);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: "Geçersiz tarih" }, { status: 400 });
    }
    if (end <= start) {
      return NextResponse.json({ error: "Bitiş saati başlangıçtan sonra olmalı" }, { status: 400 });
    }
    if (start < new Date()) {
      return NextResponse.json({ error: "Geçmiş bir saate ders oluşturulamaz" }, { status: 400 });
    }

    const [teacher, student] = await Promise.all([
      prisma.profile.findUnique({ where: { id: teacher_id }, select: { role: true } }),
      prisma.profile.findUnique({
        where: { id: student_id },
        select: { role: true, assigned_teacher_id: true },
      }),
    ]);

    if (!teacher || teacher.role !== "TEACHER") {
      return NextResponse.json({ error: "Geçersiz öğretmen" }, { status: 400 });
    }
    if (!student || student.role !== "STUDENT") {
      return NextResponse.json({ error: "Geçersiz öğrenci" }, { status: 400 });
    }
    if (student.assigned_teacher_id && student.assigned_teacher_id !== teacher_id) {
      return NextResponse.json(
        { error: "Bu öğrenci başka bir öğretmene atanmış" },
        { status: 403 },
      );
    }

    const conflict = await prisma.lesson.findFirst({
      where: {
        status: { not: "CANCELLED" },
        OR: [{ teacher_id }, { student_id }],
        scheduled_at: { lt: end },
        ends_at: { gt: start },
      },
      select: { id: true, teacher_id: true, student_id: true, scheduled_at: true, ends_at: true },
    });
    if (conflict) {
      const sameTeacher = conflict.teacher_id === teacher_id;
      return NextResponse.json(
        {
          error: sameTeacher
            ? "Bu saatte başka bir dersiniz var"
            : "Öğrencinin bu saatte başka bir dersi var",
        },
        { status: 409 },
      );
    }

    const activePackage = await prisma.userPackage.findFirst({
      where: { user_id: student_id, remaining: { gt: 0 } },
      orderBy: { purchased_at: "asc" },
      select: { id: true },
    });

    const lesson = await prisma.lesson.create({
      data: {
        student_id,
        teacher_id,
        user_package_id: activePackage?.id,
        title,
        description: description ?? null,
        scheduled_at: start,
        ends_at: end,
        platform_link: platform_link ?? null,
      },
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
