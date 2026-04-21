import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const teacherId = req.nextUrl.searchParams.get("teacherId");

  try {
    const where: any = { role: "STUDENT", is_active: true };
    if (teacherId) where.assigned_teacher_id = teacherId;

    const students = await prisma.profile.findMany({
      where,
      include: {
        assigned_teacher: { select: { id: true, full_name: true } },
        user_packages: {
          include: { package: true },
          orderBy: { purchased_at: "desc" },
          take: 1,
        },
        student_lessons: {
          where: { status: "SCHEDULED" },
          orderBy: { scheduled_at: "asc" },
          take: 1,
        },
      },
      orderBy: { full_name: "asc" },
    });
    return NextResponse.json({ data: students });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { student_id, teacher_id } = body;
    if (!student_id) return NextResponse.json({ error: "student_id gerekli" }, { status: 400 });

    if (teacher_id) {
      const teacher = await prisma.profile.findUnique({
        where: { id: teacher_id },
        select: { role: true },
      });
      if (!teacher || teacher.role !== "TEACHER") {
        return NextResponse.json({ error: "Geçersiz öğretmen" }, { status: 400 });
      }
    }

    const student = await prisma.profile.update({
      where: { id: student_id },
      data: { assigned_teacher_id: teacher_id ?? null },
    });
    return NextResponse.json({ data: student });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
