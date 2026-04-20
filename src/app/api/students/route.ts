import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const teacherId = req.nextUrl.searchParams.get("teacherId");

  try {
    const where: any = { role: "STUDENT" };
    if (teacherId) where.assigned_teacher_id = teacherId;

    const students = await prisma.profile.findMany({
      where,
      include: {
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
    if (!student_id || !teacher_id) return NextResponse.json({ error: "Eksik alan" }, { status: 400 });

    const student = await prisma.profile.update({
      where: { id: student_id },
      data: { assigned_teacher_id: teacher_id },
    });
    return NextResponse.json({ data: student });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
